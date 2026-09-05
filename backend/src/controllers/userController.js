const bcrypt = require('bcrypt')
const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { paginationSchema, createUserSchema, updateUserSchema, updateUserStatusSchema, updateUserRoleSchema, resetPasswordSchema } = require('../validators')
const { createAuditLog } = require('./auditController')

const getUsers = async (req, res) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const { search, role, status, department } = req.query

    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (role) where.role = role
    if (status !== undefined) {
      where.isActive = status === 'ACTIVE'
    }
    if (department) where.department = { contains: department, mode: 'insensitive' }

    if (req.user.role !== 'SUPER_ADMIN') {
      where.departmentId = req.user.departmentId
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
          department: true,
          departmentRef: { select: { id: true, name: true, code: true } },
          phone: true,
          employeeId: true,
          joinedDate: true,
          lastLogin: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return paginatedResponse(res, data, { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch users', 500)
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: true,
        departmentRef: { select: { id: true, name: true, code: true } },
        phone: true,
        employeeId: true,
        joinedDate: true,
        lastLogin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    return successResponse(res, user)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch user', 500)
  }
}

const createUser = async (req, res) => {
  try {
    const data = createUserSchema.parse(req.body)

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return errorResponse(res, 'Email already registered', 409)
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        departmentId: data.departmentId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: true,
        departmentRef: { select: { id: true, name: true, code: true } },
        phone: true,
        employeeId: true,
        joinedDate: true,
        lastLogin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await createAuditLog(req.user.id, 'User', user.id, 'USER_CREATED', null, { name: user.name, email: user.email, role: user.role }, null, user.departmentId)

    return successResponse(res, user, 201)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Failed to create user', 500)
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const data = updateUserSchema.parse(req.body)

    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id } },
      })

      if (existingUser) {
        return errorResponse(res, 'Email already in use', 409)
      }
    }

    const oldUser = await prisma.user.findUnique({ where: { id } })

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        departmentId: data.departmentId !== undefined ? data.departmentId : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: true,
        departmentRef: { select: { id: true, name: true, code: true } },
        phone: true,
        employeeId: true,
        joinedDate: true,
        lastLogin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await createAuditLog(req.user.id, 'User', user.id, 'USER_UPDATED', oldUser, user, null, user.departmentId)

    return successResponse(res, user)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Failed to update user', 500)
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    if (user.id === req.user.id) {
      return errorResponse(res, 'Cannot delete your own account', 400)
    }

    await prisma.user.delete({ where: { id } })

    await createAuditLog(req.user.id, 'User', id, 'USER_DELETED', { name: user.name, email: user.email }, null, null, user.departmentId)

    return successResponse(res, { message: 'User deleted successfully' })
  } catch (error) {
    return errorResponse(res, 'Failed to delete user', 500)
  }
}

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = updateUserStatusSchema.parse(req.body)

    const oldUser = await prisma.user.findUnique({ where: { id } })

    if (!oldUser) {
      return errorResponse(res, 'User not found', 404)
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        employeeId: true,
        joinedDate: true,
        lastLogin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await createAuditLog(req.user.id, 'User', user.id, isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', { isActive: oldUser.isActive }, { isActive: user.isActive }, null, user.departmentId)

    return successResponse(res, user)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Failed to update user status', 500)
  }
}

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = updateUserRoleSchema.parse(req.body)

    const oldUser = await prisma.user.findUnique({ where: { id } })

    if (!oldUser) {
      return errorResponse(res, 'User not found', 404)
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
        employeeId: true,
        joinedDate: true,
        lastLogin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await createAuditLog(req.user.id, 'User', user.id, 'USER_ROLE_CHANGED', { role: oldUser.role }, { role: user.role }, null, user.departmentId)

    return successResponse(res, user)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Failed to update user role', 500)
  }
}

const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { password } = resetPasswordSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return errorResponse(res, 'User not found', 404)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    await createAuditLog(req.user.id, 'User', id, 'USER_PASSWORD_RESET', null, null, null, user.departmentId)

    return successResponse(res, { message: 'Password reset successfully' })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Failed to reset password', 500)
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
}
