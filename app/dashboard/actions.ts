'use server';

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createFunnel(formData: FormData) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title) {
        throw new Error('Title is required');
    }

    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newFunnel = await prisma.funnel.create({
        data: {
            title,
            description,
            slug: `${slug}-${Date.now()}`, // Ensure uniqueness
            userId: session.userId,
            status: 'draft',
            steps: {
                create: [
                    {
                        title: 'Início',
                        slug: 'inicio',
                        order: 0,
                        components: { create: [] } // Empty components for now
                    }
                ]
            }
        }
    });


    revalidatePath('/dashboard');
    redirect(`/dashboard/${newFunnel.id}/builder`);
}
