import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
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
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: funnelId ? `kuiz-uploads/${funnelId}` : 'kuiz-uploads',
                    resource_type: 'auto',
                    transformation: [
                        { width: 1920, height: 1080, crop: 'limit' }, // Max dimensions
                        { quality: 'auto:good' }, // Auto quality optimization
                        { fetch_format: 'auto' }, // Auto format (WebP when supported)
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(buffer);
        });

        return NextResponse.json({
            url: result.secure_url,
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
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
            ],
        });

        return NextResponse.json({
            url: result.secure_url,
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
