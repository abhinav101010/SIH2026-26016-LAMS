const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { paginationSchema } = require('../validators')

const createAuditLog = async (userId, entityType, entityId, action, oldValue = null, newValue = null, metadata = null, departmentId = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        entityType,
        entityId,
        action,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        departmentId,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

const getAuditLogs = async (req, res) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const { entityType, entityId, userId } = req.query

    const where = {}
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (userId) where.userId = userId

    if (req.user.role !== 'SUPER_ADMIN') {
      where.departmentId = req.user.departmentId
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ])

    return paginatedResponse(res, data, { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch audit logs', 500)
  }
}

const deleteAuditLog = async (req, res) => {
  try {
    const { id } = req.params

    const log = await prisma.auditLog.findUnique({ where: { id } })

    if (!log) {
      return errorResponse(res, 'Audit log not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      return errorResponse(res, 'Access denied', 403)
    }

    await prisma.auditLog.delete({ where: { id } })

    return successResponse(res, { message: 'Audit log deleted successfully' })
  } catch (error) {
    return errorResponse(res, 'Failed to delete audit log', 500)
  }
}

module.exports = {
  createAuditLog,
  getAuditLogs,
  deleteAuditLog,
}
