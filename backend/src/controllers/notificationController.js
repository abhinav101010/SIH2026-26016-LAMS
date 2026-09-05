const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { paginationSchema } = require('../validators')

const getNotifications = async (req, res) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const userId = req.user.id

    const where = { userId }
    if (req.user.role === 'SUPER_ADMIN') {
      delete where.userId
    }

    const [data, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, unread: true } }),
    ])

    return paginatedResponse(res, data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch notifications', 500)
  }
}

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const where = { id }
    if (req.user.role !== 'SUPER_ADMIN') {
      where.userId = userId
    }

    const notification = await prisma.notification.findFirst({ where })

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404)
    }

    await prisma.notification.update({
      where: { id },
      data: { unread: false },
    })

    return successResponse(res, { message: 'Notification marked as read' })
  } catch (error) {
    return errorResponse(res, 'Failed to mark notification as read', 500)
  }
}

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    const where = { unread: true }
    if (req.user.role !== 'SUPER_ADMIN') {
      where.userId = userId
    }

    await prisma.notification.updateMany({
      where,
      data: { unread: false },
    })

    return successResponse(res, { message: 'All notifications marked as read' })
  } catch (error) {
    return errorResponse(res, 'Failed to mark all notifications as read', 500)
  }
}

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const where = { id }
    if (req.user.role !== 'SUPER_ADMIN') {
      where.userId = userId
    }

    const notification = await prisma.notification.findFirst({ where })

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404)
    }

    await prisma.notification.delete({ where: { id } })

    return successResponse(res, { message: 'Notification deleted successfully' })
  } catch (error) {
    return errorResponse(res, 'Failed to delete notification', 500)
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
}
