import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Configure Cloudinary
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

export async function POST(request: NextRequest) {
    if (!isCloudinaryConfigured) {
        return NextResponse.json({
            error: 'Cloudinary not configured',
            details: 'Missing environment variables on server.'
        }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const funnelId = formData.get('funnelId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');

        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: funnelId ? `kuiz-uploads/${funnelId}` : 'kuiz-uploads',
                    resource_type: 'auto',
                    // Incoming transformations (resize only, format happens at delivery)
                    transformation: isVideo ? [
                        { width: 1280, height: 720, crop: 'limit' }, // HD max for speed
                    ] : isAudio ? [
                        // No specific incoming transformation for audio needed, maybe bitrate limit if desired
                    ] : [
                        { width: 1920, height: 1080, crop: 'limit' }, // Max dimensions for images
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(buffer);
        });

        // Generate optimized URL with f_auto,q_auto
        const optimizedUrl = cloudinary.url(result.public_id, {
            resource_type: result.resource_type,
            secure: true,
            transformation: [
                { width: isVideo ? 1280 : (isAudio ? undefined : 1920), crop: isAudio ? undefined : 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        return NextResponse.json({
            url: optimizedUrl, // Return the optimized URL
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Also support URL-based upload (paste image URL)
export async function PUT(request: NextRequest) {
    if (!isCloudinaryConfigured) {
        return NextResponse.json({
            error: 'Cloudinary not configured',
            details: 'Missing environment variables on server.'
        }, { status: 500 });
    }

    try {
        const { url, funnelId } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

        // Upload from URL to Cloudinary
        const result = await cloudinary.uploader.upload(url, {
            folder: funnelId ? `kuiz-uploads/${funnelId}` : 'kuiz-uploads',
            transformation: [
                { width: 1920, height: 1080, crop: 'limit' },
            ],
        });

        // Generate optimized URL with f_auto,q_auto
        const optimizedUrl = cloudinary.url(result.public_id, {
            resource_type: result.resource_type,
            secure: true,
            transformation: [
                { width: 1920, height: 1080, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        return NextResponse.json({
            url: optimizedUrl,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        });
    } catch (error) {
        console.error('Upload from URL error:', error);
        return NextResponse.json(
            { error: 'Upload from URL failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
