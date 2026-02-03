import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function main() {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'admin' },
            select: { email: true, name: true, id: true }
        });

        if (admins.length === 0) {
            console.log('No admin users found.');
        } else {
            console.log('Admin users found:');
            admins.forEach(admin => {
                console.log(`- Email: ${admin.email}, Name: ${admin.name}, ID: ${admin.id}`);
            });
        }
    } catch (error) {
        console.error('Error fetching admins:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
