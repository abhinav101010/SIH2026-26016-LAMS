-- Add approvingDepartments to proposals
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS approvingDepartments JSON NULL AFTER description;
