# Database Configuration Guide

## PostgreSQL Setup Required

This project uses PostgreSQL with Prisma ORM. You need to configure your database connection string.

### Option 1: Cloud Database (Recommended for Quick Start)

#### Using Neon.tech (Free Tier)
1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@ep-name.region.aws.neon.tech/neondb?sslmode=require`)
4. Create a `.env` file in the project root
5. Add: `DATABASE_URL="your-connection-string-here"`

#### Using Supabase (Free Tier)
1. Go to https://supabase.com and sign up
2. Create a new project
3. Go to Project Settings > Database
4. Copy the "Connection string" under "Connection Pooling"
5. Create a `.env` file in the project root
6. Add: `DATABASE_URL="your-connection-string-here"`

### Option 2: Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create a `.env` file in the project root
2. Add: `DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/saas_quizk?schema=public"`
3. Replace `yourpassword` with your PostgreSQL password
4. Create the database: `createdb saas_quizk`

## After Setting Up Your Database

Run these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# View database in Prisma Studio (optional)
npx prisma studio
```

## Your Database Schema Includes:

- **User**: Authentication and funnel ownership
- **Funnel**: Main quiz/funnel container
- **FunnelStep**: Individual pages/slides
- **FunnelComponent**: UI elements (buttons, inputs, etc.)
- **VisitorSession**: Track unique visitors with UTM params
- **Event**: Granular interaction logging

The system is designed to store component data as JSON, giving you maximum flexibility for the drag-and-drop builder.
