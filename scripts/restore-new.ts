
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

async function restore() {
    console.log("📤 Iniciando restauração no banco NOVO (Supabase)...");

    const prisma = new PrismaClient(); // Usa o .env atual (Supabase)

    try {
        if (!fs.existsSync('backup_data.json')) {
            throw new Error("Arquivo backup_data.json não encontrado!");
        }

        const raw = fs.readFileSync('backup_data.json', 'utf-8');
        const data = JSON.parse(raw);

        console.log(`📦 Dados lidos: ${data.users.length} users, ${data.funnels.length} funnels`);

        // Users
        for (const user of data.users) {
            const exists = await prisma.user.findUnique({ where: { id: user.id } });
            if (!exists) {
                await prisma.user.create({ data: user });
                console.log(`  ✅ User: ${user.email}`);
            }
        }

        // Funnels
        for (const funnel of data.funnels) {
            const exists = await prisma.funnel.findUnique({ where: { id: funnel.id } });
            if (!exists) {
                await prisma.funnel.create({ data: funnel as any });
                console.log(`  ✅ Funnel: ${funnel.title}`);
            }
        }

        // Steps
        for (const step of data.steps) {
            const exists = await prisma.funnelStep.findUnique({ where: { id: step.id } });
            if (!exists) {
                await prisma.funnelStep.create({ data: step as any });
            }
        }

        // Components
        for (const comp of data.components) {
            const exists = await prisma.funnelComponent.findUnique({ where: { id: comp.id } });
            if (!exists) {
                await prisma.funnelComponent.create({ data: comp as any });
            }
        }
        console.log("🎉 Restauração concluída!");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

restore();
