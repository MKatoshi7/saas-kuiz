import "dotenv/config"
import prisma from "../src/lib/prisma"

async function seed() {
    console.log("🌱 Seeding database...")

    try {
        // 1. Create User
        const user = await prisma.user.upsert({
            where: { email: "demo@example.com" },
            update: {},
            create: {
                email: "demo@example.com",
                name: "Demo User",
                password: "password123", // Added dummy password
            },
        })
        console.log("✅ User created:", user.id)

        // 2. Create Funnel
        const funnel = await prisma.funnel.upsert({
            where: { slug: "demo-funnel" },
            update: {},
            create: {
                title: "Demo Quiz Funnel",
                slug: "demo-funnel",
                userId: user.id,
                status: "published",
            },
        })
        console.log("✅ Funnel created:", funnel.id)

        console.log("🎉 Seeding completed!")
    } catch (error) {
        console.error("❌ Error seeding:", error)
        process.exit(1)
    }
}

seed()
