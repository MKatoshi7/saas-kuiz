import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address: npx tsx scripts/make-admin.ts <email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'admin' },
        });
        console.log(`User ${user.email} is now an admin.`);
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
