import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const funnelId = formData.get('funnelId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!funnelId) {
            return NextResponse.json({ error: 'No funnelId provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Create directory if it doesn't exist
        // We save to public/uploads/[funnelId] so it's accessible via URL
        const uploadDir = join(process.cwd(), 'public', 'uploads', funnelId);
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const filename = `${uuidv4()}.webp`;
        const filepath = join(uploadDir, filename);

        // Optimize image
        await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true }) // Limit max width
            .webp({ quality: 80 }) // Convert to WebP with 80% quality
            .toFile(filepath);

        // Return the public URL
        const publicUrl = `/uploads/${funnelId}/${filename}`;

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json({ error: 'Error uploading image' }, { status: 500 });
    }
}
