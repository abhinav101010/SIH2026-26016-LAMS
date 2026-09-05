-- Create AppRole model table
CREATE TABLE "roles" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "isSystemRole" boolean NOT NULL DEFAULT false,
    "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

ALTER TABLE "roles" ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

ALTER TABLE "role_permissions" ADD COLUMN IF NOT EXISTS "appRoleId" text;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_appRoleId_fkey" FOREIGN KEY ("appRoleId") REFERENCES "roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;
