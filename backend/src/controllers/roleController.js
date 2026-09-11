const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { paginationSchema, createRoleSchema, updateRoleSchema } = require('../validators')
const { createAuditLog } = require('./auditController')

const DEFAULT_PERMISSIONS = [
  { name: 'DASHBOARD_VIEW', category: 'Dashboard', description: 'View dashboard and analytics' },
  { name: 'DASHBOARD_STATS', category: 'Dashboard', description: 'View detailed statistics' },
  { name: 'PROPOSALS_VIEW', category: 'Proposals', description: 'View proposals list and details' },
  { name: 'PROPOSALS_CREATE', category: 'Proposals', description: 'Create new proposals' },
  { name: 'PROPOSALS_EDIT', category: 'Proposals', description: 'Edit proposals' },
  { name: 'PROPOSALS_SUBMIT', category: 'Proposals', description: 'Submit proposals for review' },
  { name: 'PROPOSALS_APPROVE', category: 'Proposals', description: 'Approve proposals' },
  { name: 'PROPOSALS_REJECT', category: 'Proposals', description: 'Reject proposals' },
  { name: 'PROPOSALS_DELETE', category: 'Proposals', description: 'Delete proposals' },
  { name: 'USERS_VIEW', category: 'Users', description: 'View users list' },
  { name: 'USERS_CREATE', category: 'Users', description: 'Create new users' },
  { name: 'USERS_EDIT', category: 'Users', description: 'Edit existing users' },
  { name: 'USERS_DELETE', category: 'Users', description: 'Delete users' },
  { name: 'USERS_CHANGE_ROLE', category: 'Users', description: 'Change user roles' },
  { name: 'USERS_RESET_PASSWORD', category: 'Users', description: 'Reset user passwords' },
  { name: 'ROLES_VIEW', category: 'Roles', description: 'View roles and permissions' },
  { name: 'ROLES_CREATE', category: 'Roles', description: 'Create new roles' },
  { name: 'ROLES_EDIT', category: 'Roles', description: 'Edit role permissions' },
  { name: 'ROLES_DELETE', category: 'Roles', description: 'Delete roles' },
  { name: 'GIS_VIEW', category: 'GIS', description: 'View GIS map' },
  { name: 'GIS_EDIT', category: 'GIS', description: 'Edit map layers' },
  { name: 'GIS_EXPORT', category: 'GIS', description: 'Export GIS data' },
  { name: 'UPDATE_PARCELS', category: 'Land Parcels', description: 'Update land parcel information' },
  { name: 'DOCUMENTS_VIEW', category: 'Documents', description: 'View documents' },
  { name: 'DOCUMENTS_UPLOAD', category: 'Documents', description: 'Upload documents' },
  { name: 'DOCUMENTS_VERIFY', category: 'Documents', description: 'Verify documents' },
  { name: 'REPORTS_VIEW', category: 'Reports', description: 'View reports' },
  { name: 'REPORTS_EXPORT', category: 'Reports', description: 'Export reports' },
  { name: 'NOTIFICATIONS_VIEW', category: 'Notifications', description: 'View notifications' },
  { name: 'NOTIFICATIONS_MANAGE', category: 'Notifications', description: 'Manage notification settings' },
  { name: 'SETTINGS_VIEW', category: 'Settings', description: 'View settings' },
  { name: 'SETTINGS_EDIT', category: 'Settings', description: 'Edit settings' },
  { name: 'AUDIT_VIEW', category: 'Audit', description: 'View audit logs' },
  { name: 'AUDIT_EXPORT', category: 'Audit', description: 'Export audit logs' },
  { name: 'MANAGE_COMPENSATION', category: 'Compensation', description: 'Manage compensation disbursement' },
  { name: 'MANAGE_POSSESSION', category: 'Possession', description: 'Manage physical possession' },
]

const ROLE_DESCRIPTIONS = {
  SUPER_ADMIN: 'Full system access with all administrative privileges',
  PROPOSAL_OFFICER: 'Can create and manage land acquisition proposals',
  REVIEWING_AUTHORITY: 'Can review and approve or reject proposals',
  FIELD_OFFICER: 'Can update field verification and land parcel data',
}

const seedPermissions = async () => {
  for (const perm of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { category: perm.category, description: perm.description },
      create: perm,
    })
  }
}

const seedRolePermissions = async () => {
  const rolePermissions = {
    SUPER_ADMIN: [
      'DASHBOARD_VIEW', 'DASHBOARD_STATS',
      'PROPOSALS_VIEW', 'PROPOSALS_CREATE', 'PROPOSALS_EDIT', 'PROPOSALS_SUBMIT', 'PROPOSALS_APPROVE', 'PROPOSALS_REJECT', 'PROPOSALS_DELETE',
      'USERS_VIEW', 'USERS_CREATE', 'USERS_EDIT', 'USERS_DELETE', 'USERS_CHANGE_ROLE', 'USERS_RESET_PASSWORD',
      'ROLES_VIEW', 'ROLES_CREATE', 'ROLES_EDIT', 'ROLES_DELETE',
      'GIS_VIEW', 'GIS_EDIT', 'GIS_EXPORT',
      'UPDATE_PARCELS',
      'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD', 'DOCUMENTS_VERIFY',
      'REPORTS_VIEW', 'REPORTS_EXPORT',
      'NOTIFICATIONS_VIEW', 'NOTIFICATIONS_MANAGE',
      'SETTINGS_VIEW', 'SETTINGS_EDIT',
      'AUDIT_VIEW', 'AUDIT_EXPORT',
      'MANAGE_COMPENSATION', 'MANAGE_POSSESSION',
    ],
    PROPOSAL_OFFICER: [
      'DASHBOARD_VIEW', 'DASHBOARD_STATS',
      'PROPOSALS_VIEW', 'PROPOSALS_CREATE', 'PROPOSALS_EDIT', 'PROPOSALS_SUBMIT',
      'GIS_VIEW',
      'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD',
      'NOTIFICATIONS_VIEW',
      'SETTINGS_VIEW',
      'AUDIT_VIEW',
    ],
    REVIEWING_AUTHORITY: [
      'DASHBOARD_VIEW', 'DASHBOARD_STATS',
      'PROPOSALS_VIEW', 'PROPOSALS_APPROVE', 'PROPOSALS_REJECT',
      'GIS_VIEW',
      'DOCUMENTS_VIEW',
      'NOTIFICATIONS_VIEW',
      'SETTINGS_VIEW',
      'AUDIT_VIEW',
    ],
    FIELD_OFFICER: [
      'DASHBOARD_VIEW',
      'PROPOSALS_VIEW',
      'GIS_VIEW',
      'UPDATE_PARCELS',
      'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD', 'DOCUMENTS_VERIFY',
      'NOTIFICATIONS_VIEW',
      'AUDIT_VIEW',
      'MANAGE_POSSESSION',
    ],
  }

  for (const [role, permissions] of Object.entries(rolePermissions)) {
    let appRole = await prisma.appRole.findUnique({
      where: { name: role },
    })

    if (!appRole) {
      appRole = await prisma.appRole.create({
        data: { name: role, description: ROLE_DESCRIPTIONS[role] || '', isSystemRole: true },
      })
    }

    await prisma.rolePermission.deleteMany({
      where: { role, appRoleId: appRole.id },
    })
    await prisma.rolePermission.deleteMany({
      where: { role, appRoleId: null },
    })

    const permObjects = await prisma.permission.findMany({
      where: { name: { in: permissions } },
    })

    for (const perm of permObjects) {
      await prisma.rolePermission.create({
        data: { role, permissionId: perm.id, appRoleId: appRole.id },
      })
    }
  }
}

const getRoles = async (req, res) => {
  try {
    const appRoles = await prisma.appRole.findMany({
      orderBy: { name: 'asc' },
    })

    const rolesWithPermissions = await Promise.all(
      appRoles.map(async (appRole) => {
        const userCount = await prisma.user.count({ where: { role: appRole.name } })
        const rolePerms = await prisma.rolePermission.findMany({
          where: { appRoleId: appRole.id },
          include: { permission: true },
        })

        return {
          id: appRole.name,
          name: appRole.name,
          description: appRole.description || ROLE_DESCRIPTIONS[appRole.name] || '',
          userCount,
          permissions: rolePerms.map((rp) => ({
            id: rp.permission.id,
            name: rp.permission.name,
            category: rp.permission.category,
            description: rp.permission.description,
          })),
        }
      })
    )

    return successResponse(res, rolesWithPermissions)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch roles', 500)
  }
}

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params
    const roleName = decodeURIComponent(id)

    const appRole = await prisma.appRole.findUnique({
      where: { name: roleName },
    })

    if (!appRole) {
      return errorResponse(res, 'Role not found', 404)
    }

    const userCount = await prisma.user.count({ where: { role: roleName } })
    const rolePerms = await prisma.rolePermission.findMany({
      where: { appRoleId: appRole.id },
      include: { permission: true },
    })

    return successResponse(res, {
      id: appRole.name,
      name: appRole.name,
      description: appRole.description || ROLE_DESCRIPTIONS[appRole.name] || '',
      userCount,
      permissions: rolePerms.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        category: rp.permission.category,
        description: rp.permission.description,
      })),
    })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch role', 500)
  }
}

const createRole = async (req, res) => {
  try {
    const data = createRoleSchema.parse(req.body)

    const existing = await prisma.appRole.findUnique({
      where: { name: data.name },
    })

    if (existing) {
      return errorResponse(res, 'Role with this name already exists', 400)
    }

    const appRole = await prisma.appRole.create({
      data: {
        name: data.name,
        description: data.description || '',
        isSystemRole: false,
      },
    })

    const permissions = await prisma.permission.findMany({
      where: { name: { in: data.permissions } },
    })

    const rolePermissions = []
    for (const perm of permissions) {
      const rp = await prisma.rolePermission.create({
        data: { role: data.name, permissionId: perm.id, appRoleId: appRole.id },
      })
      rolePermissions.push(rp)
    }

    await createAuditLog(req.user.id, 'Role', data.name, 'ROLE_CREATED', null, { name: data.name, permissions: data.permissions }, null, req.user.departmentId)

    return successResponse(res, {
      id: appRole.name,
      name: appRole.name,
      description: appRole.description || '',
      userCount: 0,
      permissions: permissions.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
      })),
    }, 201)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Failed to create role', 500)
  }
}

const updateRole = async (req, res) => {
  try {
    const { id } = req.params
    const data = updateRoleSchema.parse(req.body)
    const roleName = decodeURIComponent(id)

    const appRole = await prisma.appRole.findUnique({
      where: { name: roleName },
    })

    if (!appRole) {
      return errorResponse(res, 'Role not found', 404)
    }

    const oldPermissions = await prisma.rolePermission.findMany({
      where: { appRoleId: appRole.id },
      include: { permission: true },
    })

    await prisma.rolePermission.deleteMany({ where: { appRoleId: appRole.id } })

    if (data.permissions && data.permissions.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: { name: { in: data.permissions } },
      })

      for (const perm of permissions) {
        await prisma.rolePermission.create({
          data: { role: roleName, permissionId: perm.id, appRoleId: appRole.id },
        })
      }
    }

    const updateData = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description

    if (Object.keys(updateData).length > 0) {
      await prisma.appRole.update({
        where: { id: appRole.id },
        data: updateData,
      })
    }

    const newRoleName = data.name || roleName
    const newPermissions = await prisma.rolePermission.findMany({
      where: { role: newRoleName, appRoleId: appRole.id },
      include: { permission: true },
    })

    await createAuditLog(req.user.id, 'Role', roleName, 'ROLE_UPDATED', oldPermissions, newPermissions, null, req.user.departmentId)

    return successResponse(res, {
      id: newRoleName,
      name: newRoleName,
      description: data.description !== undefined ? data.description : appRole.description || '',
      permissions: newPermissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        category: rp.permission.category,
        description: rp.permission.description,
      })),
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Failed to update role', 500)
  }
}

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params
    const roleName = decodeURIComponent(id)

    const appRole = await prisma.appRole.findUnique({
      where: { name: roleName },
    })

    if (!appRole) {
      return errorResponse(res, 'Role not found', 404)
    }

    if (appRole.isSystemRole) {
      return errorResponse(res, `Cannot delete protected system role: ${roleName}`, 400)
    }

    const userCount = await prisma.user.count({ where: { role: roleName } })

    await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: { role: roleName },
        select: { id: true, name: true, email: true },
      })

      await tx.user.deleteMany({ where: { role: roleName } })

      await tx.rolePermission.deleteMany({ where: { appRoleId: appRole.id } })

      await tx.appRole.delete({ where: { id: appRole.id } })

      if (users.length > 0) {
        await createAuditLog(req.user.id, 'User', 'bulk', 'USERS_DELETED_BY_ROLE', {
          role: roleName,
          users: users.map((u) => ({ id: u.id, name: u.name, email: u.email })),
        }, null, null, req.user.departmentId)
      }

      await createAuditLog(req.user.id, 'Role', roleName, 'ROLE_DELETED', {
        name: roleName,
        description: appRole.description,
        userCount,
      }, null, null, req.user.departmentId)
    })

    return successResponse(res, {
      message: 'Role deleted successfully',
      deletedUsers: userCount,
    })
  } catch (error) {
    return errorResponse(res, 'Failed to delete role', 500)
  }
}

module.exports = {
  seedPermissions,
  seedRolePermissions,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
}
