const express = require('express')
const router = express.Router()
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/', authenticate, requirePermission('NOTIFICATIONS_VIEW'), getNotifications)
router.put('/:id/read', authenticate, requirePermission('NOTIFICATIONS_MANAGE'), markAsRead)
router.put('/read-all', authenticate, requirePermission('NOTIFICATIONS_MANAGE'), markAllAsRead)
router.delete('/:id', authenticate, requirePermission('NOTIFICATIONS_MANAGE'), deleteNotification)

module.exports = router
