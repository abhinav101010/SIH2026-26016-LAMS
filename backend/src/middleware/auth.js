const jwt = require('jsonwebtoken')
const prisma = require('../config/db')
const config = require('../config')

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, config.jwtSecret)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        department: true,
        phone: true,
        employeeId: true,
        joinedDate: true,
        lastLogin: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' })
    }

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

    req.user = {
      ...user,
      permissions: permissions.map((p) => p.name),
    }
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      })
    }

    next()
  }
}

const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const userPermissions = req.user.permissions || []

    const hasPermission = permissions.every((perm) => userPermissions.includes(perm))

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permissions.join(', ')}`,
      })
    }

    next()
  }
}

module.exports = {
  authenticate,
  authorize,
  requirePermission,
}
