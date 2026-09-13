const express = require('express')
const router = express.Router()
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/', authenticate, requirePermission('USERS_VIEW', 'PROPOSALS_CREATE'), getAllDepartments)
router.get('/:id', authenticate, requirePermission('USERS_VIEW', 'PROPOSALS_CREATE'), getDepartmentById)
router.post('/', authenticate, requirePermission('USERS_CREATE'), createDepartment)
router.put('/:id', authenticate, requirePermission('USERS_EDIT'), updateDepartment)
router.delete('/:id', authenticate, requirePermission('USERS_DELETE'), deleteDepartment)

module.exports = router
