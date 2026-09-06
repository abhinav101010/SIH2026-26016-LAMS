const express = require('express')
const router = express.Router()
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  verifyDocument,
  rejectDocument,
} = require('../controllers/documentController')
const { authenticate, requirePermission } = require('../middleware/auth')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads'
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
})

router.post('/:proposalId/documents', authenticate, requirePermission('DOCUMENTS_UPLOAD'), upload.single('file'), uploadDocument)
router.get('/:proposalId/documents', authenticate, requirePermission('DOCUMENTS_VIEW'), getDocuments)
router.get('/:id', authenticate, requirePermission('DOCUMENTS_VIEW'), getDocumentById)
router.delete('/:id', authenticate, requirePermission('DOCUMENTS_UPLOAD'), deleteDocument)
router.post('/:id/verify', authenticate, requirePermission('DOCUMENTS_VERIFY'), verifyDocument)
router.post('/:id/reject', authenticate, requirePermission('DOCUMENTS_VERIFY'), rejectDocument)

module.exports = router
