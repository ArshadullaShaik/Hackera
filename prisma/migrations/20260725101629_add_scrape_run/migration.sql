-- CreateTable
CREATE TABLE "ScrapeRun" (
    "id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "eventsCreated" INTEGER NOT NULL DEFAULT 0,
    "eventsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScrapeRun_platform_idx" ON "ScrapeRun"("platform");

-- CreateIndex
CREATE INDEX "ScrapeRun_createdAt_idx" ON "ScrapeRun"("createdAt");
