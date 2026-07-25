-- CreateTable
CREATE TABLE "Hackathon" (
    "id" UUID NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourcePlatform" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "locationType" TEXT NOT NULL,
    "locationName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "canonicalUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "rawSourcePayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hackathon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Hackathon_sourcePlatform_idx" ON "Hackathon"("sourcePlatform");

-- CreateIndex
CREATE INDEX "Hackathon_startsAt_idx" ON "Hackathon"("startsAt");

-- CreateIndex
CREATE INDEX "Hackathon_createdAt_idx" ON "Hackathon"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Hackathon_sourceId_sourcePlatform_key" ON "Hackathon"("sourceId", "sourcePlatform");
