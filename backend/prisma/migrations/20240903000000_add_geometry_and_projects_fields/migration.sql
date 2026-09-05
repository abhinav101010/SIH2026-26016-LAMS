-- Add geometry column to land_parcels
ALTER TABLE "land_parcels" ADD COLUMN IF NOT EXISTS "geometry" text;

-- Add projects table columns (if any were added)
