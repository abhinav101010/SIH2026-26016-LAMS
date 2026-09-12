-- Make approvingDepartments nullable
ALTER TABLE proposals MODIFY COLUMN approvingDepartments JSON NULL;
