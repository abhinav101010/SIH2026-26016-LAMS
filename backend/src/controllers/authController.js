const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const prisma = require('../config/db')
const config = require('../config')
const { loginSchema, registerSchema, updateProfileSchema } = require('../validators')
const { successResponse, errorResponse } = require('../utils/response')

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
}

const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid credentials', 401)
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    const token = generateToken(user.id)

    const { password: _, ...userWithoutPassword } = user

    const permissions = await prisma.permission.findMany({
      where: {
        rolePermissions: {
          some: {
            role: user.role,
          },
        },
      },
      select: {
        name: true,
      },
    })

    return successResponse(res, {
      token,
      user: {
        ...userWithoutPassword,
        permissions: permissions.map((p) => p.name),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Login failed', 500)
  }
}

const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)

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
      },
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
      },
    })

    const token = generateToken(user.id)

    return successResponse(res, {
      token,
      user,
    }, 201)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Registration failed', 500)
  }
}

const getMe = async (req, res) => {
  try {
    return successResponse(res, { user: req.user })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch user', 500)
  }
}

const logout = async (req, res) => {
  try {
    return successResponse(res, { message: 'Logged out successfully' })
  } catch (error) {
    return errorResponse(res, 'Logout failed', 500)
  }
}

const updateProfile = async (req, res) => {
  try {
    const data = updateProfileSchema.parse(req.body)
    const userId = req.user.id

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
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
      },
    })

    return successResponse(res, { user: updatedUser })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Failed to update profile', 500)
  }
}

module.exports = {
  login,
  register,
  getMe,
  logout,
  updateProfile,
}
