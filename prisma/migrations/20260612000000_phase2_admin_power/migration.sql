-- Fase 2: Admin Power
-- Adiciona modelos AdminNote, FunnelNote, Coupon, CouponRedemption, Broadcast
-- e índices faltantes

-- AdminAction (já pode existir de migration anterior; idempotente)
CREATE TABLE IF NOT EXISTS "admin_actions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetFunnelId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_actions_adminId_idx" ON "admin_actions"("adminId");
CREATE INDEX IF NOT EXISTS "admin_actions_action_idx" ON "admin_actions"("action");
CREATE INDEX IF NOT EXISTS "admin_actions_createdAt_idx" ON "admin_actions"("createdAt" DESC);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_actions_adminId_fkey') THEN
        ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_adminId_fkey"
            FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_actions_targetUserId_fkey') THEN
        ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_targetUserId_fkey"
            FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- AdminNote
CREATE TABLE IF NOT EXISTS "admin_notes" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admin_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_notes_targetUserId_createdAt_idx" ON "admin_notes"("targetUserId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "admin_notes_authorId_idx" ON "admin_notes"("authorId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_notes_authorId_fkey') THEN
        ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_authorId_fkey"
            FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_notes_targetUserId_fkey') THEN
        ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_targetUserId_fkey"
            FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- FunnelNote
CREATE TABLE IF NOT EXISTS "funnel_notes" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "funnelId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "funnel_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "funnel_notes_funnelId_createdAt_idx" ON "funnel_notes"("funnelId", "createdAt" DESC);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'funnel_notes_funnelId_fkey') THEN
        ALTER TABLE "funnel_notes" ADD CONSTRAINT "funnel_notes_funnelId_fkey"
            FOREIGN KEY ("funnelId") REFERENCES "funnels"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Coupon
CREATE TABLE IF NOT EXISTS "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "applicablePlans" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_key" ON "coupons"("code");
CREATE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons"("code");
CREATE INDEX IF NOT EXISTS "coupons_isActive_validUntil_idx" ON "coupons"("isActive", "validUntil");

-- CouponRedemption
CREATE TABLE IF NOT EXISTS "coupon_redemptions" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "coupon_redemptions_couponId_userId_key" ON "coupon_redemptions"("couponId", "userId");
CREATE INDEX IF NOT EXISTS "coupon_redemptions_userId_idx" ON "coupon_redemptions"("userId");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'coupon_redemptions_couponId_fkey') THEN
        ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_couponId_fkey"
            FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'coupon_redemptions_userId_fkey') THEN
        ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Broadcast
CREATE TABLE IF NOT EXISTS "broadcasts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "segmentRole" TEXT,
    "segmentPlan" TEXT,
    "segmentStatus" TEXT,
    "totalTargeted" INTEGER NOT NULL DEFAULT 0,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "broadcasts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "broadcasts_authorId_idx" ON "broadcasts"("authorId");
CREATE INDEX IF NOT EXISTS "broadcasts_createdAt_idx" ON "broadcasts"("createdAt" DESC);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'broadcasts_authorId_fkey') THEN
        ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_authorId_fkey"
            FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Índices adicionais em tabelas existentes
CREATE INDEX IF NOT EXISTS "funnels_status_createdAt_idx" ON "funnels"("status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "funnels_isBanned_idx" ON "funnels"("isBanned");
CREATE INDEX IF NOT EXISTS "visitor_sessions_startedAt_idx" ON "visitor_sessions"("startedAt" DESC);
CREATE INDEX IF NOT EXISTS "events_createdAt_idx" ON "events"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "subscription_transactions_createdAt_idx" ON "subscription_transactions"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "webhook_logs_createdAt_idx" ON "webhook_logs"("createdAt" DESC);
