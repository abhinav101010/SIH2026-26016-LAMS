-- Migrate existing Viewer users to Proposal Officer
UPDATE "users" SET "role" = 'PROPOSAL_OFFICER' WHERE "role" = 'VIEWER';

-- Update default role for new users
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'PROPOSAL_OFFICER';
