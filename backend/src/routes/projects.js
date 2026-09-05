const express = require('express')
const router = express.Router()
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
} = require('../controllers/projectController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/', authenticate, requirePermission('PROPOSALS_VIEW'), getAllProjects)
router.get('/:id', authenticate, requirePermission('PROPOSALS_VIEW'), getProjectById)
router.post('/', authenticate, requirePermission('PROPOSALS_CREATE'), createProject)
router.put('/:id', authenticate, requirePermission('PROPOSALS_EDIT'), updateProject)

module.exports = router
