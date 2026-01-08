
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    const funnelId = 'cmjcbu9gq005ybouyai4cbfe3';
    console.log('Checking data for funnel:', funnelId);

    try {
        const count = await prisma.visitorSession.count({
            where: { funnelId }
        });
        console.log('Total VisitorSessions:', count);

        const sessions = await prisma.visitorSession.findMany({
            where: { funnelId },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        console.log('Recent Sessions:', JSON.stringify(sessions, null, 2));

    } catch (e) {
        console.error('Error querying database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
