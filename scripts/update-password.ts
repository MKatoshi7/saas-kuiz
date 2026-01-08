
import { PrismaClient } from '../app/generated/prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
        console.error('Usage: tsx scripts/update-password.ts <email> <new_password>');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        console.log(`Password updated successfully for user: ${user.email}`);
    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
