import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, setSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

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

        await setSession(targetUser.id, targetUser.email);

        await logAdminAction({
            adminId: session.userId,
            action: 'impersonate_user',
            targetUserId: targetUser.id,
            details: { email: targetUser.email },
        })

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Impersonation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
