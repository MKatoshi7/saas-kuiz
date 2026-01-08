-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnels" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "theme" JSONB DEFAULT '{"primaryColor": "#2563EB", "bgColor": "#ffffff"}',
    "themeConfig" JSONB,
    "marketingConfig" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "funnels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_steps" (
    "id" TEXT NOT NULL,
    "funnelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "stepType" TEXT NOT NULL DEFAULT 'question',
    "order" INTEGER NOT NULL,
    "settings" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funnel_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_components" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funnel_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_sessions" (
    "id" TEXT NOT NULL,
    "funnelId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "visitorData" JSONB DEFAULT '{}',
    "answersSnapshot" JSONB,
    "isLead" BOOLEAN NOT NULL DEFAULT false,
    "isConverted" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "visitor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "stepId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "funnelId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "config" JSONB,
    "trigger" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funnels_slug_key" ON "funnels"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "funnel_steps_funnelId_slug_key" ON "funnel_steps"("funnelId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "funnel_steps_funnelId_order_key" ON "funnel_steps"("funnelId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_sessions_sessionId_key" ON "visitor_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "events_sessionId_idx" ON "events"("sessionId");

-- CreateIndex
CREATE INDEX "events_stepId_idx" ON "events"("stepId");

-- CreateIndex
CREATE INDEX "events_eventType_idx" ON "events"("eventType");

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_steps" ADD CONSTRAINT "funnel_steps_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "funnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_components" ADD CONSTRAINT "funnel_components_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "funnel_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_sessions" ADD CONSTRAINT "visitor_sessions_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "funnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "visitor_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "funnel_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "funnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
