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

async function createUser() {
    try {
        const email = 'videomakeriabr@gmail.com';
        const password = 'senha123';

        console.log('🔧 Criando usuário...');

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Usuário Teste',
                subscriptionStatus: 'active',
                subscriptionPlan: 'pro'
            }
        });

        console.log('✅ Usuário criado com sucesso!');
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);
        console.log('👤 ID:', user.id);

    } catch (error: any) {
        if (error.code === 'P2002') {
            console.log('✅ Usuário já existe!');
        } else {
            console.error('❌ Erro:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

createUser();
