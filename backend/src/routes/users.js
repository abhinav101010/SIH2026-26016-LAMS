const express = require('express')
const router = express.Router()
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
} = require('../controllers/userController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/', authenticate, requirePermission('USERS_VIEW'), getUsers)
router.get('/:id', authenticate, requirePermission('USERS_VIEW'), getUserById)
router.post('/', authenticate, requirePermission('USERS_CREATE'), createUser)
router.put('/:id', authenticate, requirePermission('USERS_EDIT'), updateUser)
router.delete('/:id', authenticate, requirePermission('USERS_DELETE'), deleteUser)
router.patch('/:id/status', authenticate, requirePermission('USERS_EDIT'), updateUserStatus)
router.patch('/:id/role', authenticate, requirePermission('USERS_CHANGE_ROLE'), updateUserRole)
router.post('/:id/reset-password', authenticate, requirePermission('USERS_RESET_PASSWORD'), resetUserPassword)

module.exports = router
