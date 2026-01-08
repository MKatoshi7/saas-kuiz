import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, setSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        // Only admins can impersonate
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Set session as target user
        // This overwrites the current admin session cookie
        await setSession(targetUser.id, targetUser.email);

        console.log(`Admin ${session.email} impersonating user ${targetUser.email}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Impersonation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
