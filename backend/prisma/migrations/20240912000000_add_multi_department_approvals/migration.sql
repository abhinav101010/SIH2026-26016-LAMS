-- Add PENDING to ApprovalAction enum
ALTER TABLE approvals MODIFY COLUMN action ENUM('PENDING','APPROVED','REJECTED','CHANGES_REQUESTED') NOT NULL DEFAULT 'PENDING';

-- Add approvalRound to proposals
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS approvalRound INT NOT NULL DEFAULT 1 AFTER progress;

-- Add departmentId and round to approvals
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS departmentId VARCHAR(36) NOT NULL AFTER proposalId;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS round INT NOT NULL DEFAULT 1 AFTER departmentId;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) AFTER createdAt;

-- Add indexes
CREATE INDEX approvals_departmentId_idx ON approvals(departmentId);
CREATE UNIQUE INDEX approvals_proposalId_departmentId_round_idx ON approvals(proposalId, departmentId, round);

-- Add foreign keys
ALTER TABLE approvals ADD CONSTRAINT approvals_departmentId_fkey FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE;
