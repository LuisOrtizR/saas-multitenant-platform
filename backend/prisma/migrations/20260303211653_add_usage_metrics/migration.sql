-- CreateEnum
CREATE TYPE "UsageMetricType" AS ENUM ('USER_COUNT', 'API_REQUESTS', 'RESOURCE_CREATIONS');

-- CreateTable
CREATE TABLE "UsageMetric" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "metric" "UsageMetricType" NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsageMetric_organizationId_period_idx" ON "UsageMetric"("organizationId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "UsageMetric_organizationId_metric_period_key" ON "UsageMetric"("organizationId", "metric", "period");

-- AddForeignKey
ALTER TABLE "UsageMetric" ADD CONSTRAINT "UsageMetric_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
