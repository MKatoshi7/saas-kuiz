import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';

async function createTestUser() {
    try {
        console.log('🔧 Criando usuário de teste...');

        const email = 'videomakeriabr@gmail.com';
        const password = 'senha123'; // Senha de teste

        // Verificar se usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('✅ Usuário já existe:', email);
            return;
        }

        // Criar usuário
        const hashedPassword = await hashPassword(password);

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

    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
