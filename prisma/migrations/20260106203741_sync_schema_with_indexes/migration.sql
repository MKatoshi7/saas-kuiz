/*
  Warnings:

  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionPlan" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT DEFAULT 'free';

-- AlterTable
ALTER TABLE "visitor_sessions" ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE INDEX "events_sessionId_eventType_createdAt_idx" ON "events"("sessionId", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "funnels_userId_status_createdAt_idx" ON "funnels"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "visitor_sessions_funnelId_isLead_idx" ON "visitor_sessions"("funnelId", "isLead");

-- CreateIndex
CREATE INDEX "visitor_sessions_email_idx" ON "visitor_sessions"("email");

-- CreateIndex
CREATE INDEX "visitor_sessions_funnelId_startedAt_idx" ON "visitor_sessions"("funnelId", "startedAt" DESC);
