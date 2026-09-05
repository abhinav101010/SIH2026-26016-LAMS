const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { createAuditLog } = require('./auditController')

const departmentSchema = {
  name: 'string',
  code: 'string',
  description: 'string?.optional',
  isActive: 'boolean.optional',
}

const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    })
    return successResponse(res, departments)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch departments', 500)
  }
}

const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, isActive: true },
        },
        proposals: {
          select: { id: true, proposalNumber: true, projectName: true, status: true },
        },
      },
    })

    if (!department) {
      return errorResponse(res, 'Department not found', 404)
    }

    return successResponse(res, department)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch department', 500)
  }
}

const createDepartment = async (req, res) => {
  try {
    const data = req.body

    if (!data.name || !data.code) {
      return errorResponse(res, 'Department name and code are required', 400)
    }

    const existing = await prisma.department.findFirst({
      where: {
        OR: [{ name: data.name }, { code: data.code }],
      },
    })

    if (existing) {
      return errorResponse(res, 'Department with this name or code already exists', 409)
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description || null,
        isActive: data.isActive ?? true,
      },
    })

    await createAuditLog(req.user.id, 'Department', department.id, 'DEPARTMENT_CREATED', null, department, null, department.id)

    return successResponse(res, department, 'Department created successfully')
  } catch (error) {
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
      return errorResponse(res, 'Department with this name or code already exists', 409)
    }
    return errorResponse(res, 'Failed to create department', 500)
  }
}

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    const existing = await prisma.department.findUnique({
      where: { id },
    })

    if (!existing) {
      return errorResponse(res, 'Department not found', 404)
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.department.findFirst({
        where: { name: data.name, id: { not: id } },
      })
      if (duplicate) {
        return errorResponse(res, 'Department with this name already exists', 409)
      }
    }

    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.department.findFirst({
        where: { code: data.code, id: { not: id } },
      })
      if (duplicate) {
        return errorResponse(res, 'Department with this code already exists', 409)
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        code: data.code ?? existing.code,
        description: data.description !== undefined ? data.description : existing.description,
        isActive: data.isActive ?? existing.isActive,
      },
    })

    await createAuditLog(req.user.id, 'Department', id, 'DEPARTMENT_UPDATED', existing, updated, null, id)

    return successResponse(res, updated, 'Department updated successfully')
  } catch (error) {
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
      return errorResponse(res, 'Department with this name or code already exists', 409)
    }
    return errorResponse(res, 'Failed to update department', 500)
  }
}

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true } },
        proposals: { select: { id: true, proposalNumber: true } },
      },
    })

    if (!department) {
      return errorResponse(res, 'Department not found', 404)
    }

    if (department.users.length > 0) {
      return errorResponse(res, 'Cannot delete department because users are assigned to it. Reassign users first.', 409)
    }

    if (department.proposals.length > 0) {
      return errorResponse(res, 'Cannot delete department because proposals are assigned to it. Reassign proposals first.', 409)
    }

    await prisma.department.delete({ where: { id } })

    await createAuditLog(req.user.id, 'Department', id, 'DEPARTMENT_DELETED', department, null, null, id)

    return successResponse(res, { message: 'Department deleted successfully' })
  } catch (error) {
    return errorResponse(res, 'Failed to delete department', 500)
  }
}

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
}
