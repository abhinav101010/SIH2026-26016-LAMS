-- Add population estimation fields to proposals table
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "affectedAreaType" TEXT;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "affectedAreaKm2" DOUBLE PRECISION;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "estimatedPopulation" INTEGER;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "populationDensity" DOUBLE PRECISION;
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "populationDataSource" TEXT;
