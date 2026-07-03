-- Fase Webhooks: WebhookEvent + PlanMapping + WebhookConfig
-- Idempotente: pode rodar múltiplas vezes sem erro

-- WebhookEvent
CREATE TABLE IF NOT EXISTS "webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT,
    "externalId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'api',
    "rawPayload" JSONB NOT NULL,
    "headers" JSONB,
    "parsedData" JSONB,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "productId" TEXT,
    "productName" TEXT,
    "amount" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'BRL',
    "kuizPlan" TEXT,
    "periodDays" INTEGER DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "affectedUserId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "webhook_events_provider_eventType_idx" ON "webhook_events"("provider", "eventType");
CREATE INDEX IF NOT EXISTS "webhook_events_customerEmail_idx" ON "webhook_events"("customerEmail");
CREATE INDEX IF NOT EXISTS "webhook_events_externalId_idx" ON "webhook_events"("externalId");
CREATE INDEX IF NOT EXISTS "webhook_events_status_idx" ON "webhook_events"("status");
CREATE INDEX IF NOT EXISTS "webhook_events_receivedAt_idx" ON "webhook_events"("receivedAt" DESC);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'webhook_events_affectedUserId_fkey') THEN
        ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_affectedUserId_fkey"
            FOREIGN KEY ("affectedUserId") REFERENCES "users"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- PlanMapping
CREATE TABLE IF NOT EXISTS "plan_mappings" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalProductId" TEXT NOT NULL,
    "externalProductName" TEXT,
    "kuizPlan" TEXT NOT NULL,
    "periodDays" INTEGER NOT NULL DEFAULT 30,
    "amount" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'BRL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "plan_mappings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "plan_mappings_provider_externalProductId_key"
    ON "plan_mappings"("provider", "externalProductId");
CREATE INDEX IF NOT EXISTS "plan_mappings_kuizPlan_idx" ON "plan_mappings"("kuizPlan");

-- WebhookConfig
CREATE TABLE IF NOT EXISTS "webhook_configs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "secret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "acceptedEvents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "webhook_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "webhook_configs_provider_key" ON "webhook_configs"("provider");
