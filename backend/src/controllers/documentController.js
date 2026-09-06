const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { documentSchema, paginationSchema } = require('../validators')
const { createAuditLog } = require('../controllers/auditController')
const path = require('path')
const fs = require('fs')

const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const uploadDocument = async (req, res) => {
  try {
    const { proposalId } = req.params

    const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    const { name, fileType, fileSize } = documentSchema.parse(req.body)

    let storagePath = ''
    if (req.file) {
      storagePath = path.join(uploadDir, `${Date.now()}-${req.file.originalname}`)
      fs.renameSync(req.file.path, storagePath)
    } else if (req.body.storagePath) {
      storagePath = req.body.storagePath
    } else {
      return errorResponse(res, 'File is required', 400)
    }

    const document = await prisma.document.create({
      data: {
        proposalId,
        name,
        fileName: req.file?.originalname || name,
        fileType,
        fileSize: fileSize || (req.file?.size || 0),
        storagePath,
        uploadedById: req.user.id,
      },
    })

    return successResponse(res, document, 201)
  } catch (error) {
    return errorResponse(res, 'Failed to upload document', 500)
  }
}

const getDocuments = async (req, res) => {
  try {
    const { proposalId } = req.params
    const { page, limit } = paginationSchema.parse(req.query)

    const [data, total] = await Promise.all([
      prisma.document.findMany({
        where: { proposalId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { name: true, email: true } },
          verifiedBy: { select: { name: true, email: true } },
        },
      }),
      prisma.document.count({ where: { proposalId } }),
    ])

    return paginatedResponse(res, data, { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch documents', 500)
  }
}

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { name: true, email: true } },
        verifiedBy: { select: { name: true, email: true } },
        proposal: { select: { proposalNumber: true, projectName: true, departmentId: true } },
      },
    })

    if (!document) {
      return errorResponse(res, 'Document not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      if (document.proposal?.departmentId && document.proposal.departmentId !== req.user.departmentId) {
        return errorResponse(res, 'Access denied', 403)
      }
    }

    return successResponse(res, document)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch document', 500)
  }
}

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params

    const document = await prisma.document.findUnique({
      where: { id },
      include: { proposal: { select: { departmentId: true } } },
    })
    if (!document) {
      return errorResponse(res, 'Document not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      if (document.proposal?.departmentId && document.proposal.departmentId !== req.user.departmentId) {
        return errorResponse(res, 'Access denied', 403)
      }
    }

    if (fs.existsSync(document.storagePath)) {
      fs.unlinkSync(document.storagePath)
    }

    await prisma.document.delete({ where: { id } })

    return successResponse(res, { message: 'Document deleted successfully' })
  } catch (error) {
    return errorResponse(res, 'Failed to delete document', 500)
  }
}

const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params
    const { remarks } = req.body

    const document = await prisma.document.findUnique({
      where: { id },
      include: { proposal: { select: { departmentId: true, status: true } } },
    })

    if (!document) {
      return errorResponse(res, 'Document not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && document.proposal?.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedById: req.user.id,
        verifiedAt: new Date(),
        verificationRemarks: remarks || null,
      },
      include: {
        uploadedBy: { select: { name: true, email: true } },
        verifiedBy: { select: { name: true, email: true } },
      },
    })

    await prisma.proposal.updateMany({
      where: { id: document.proposalId, status: 'SUBMITTED' },
      data: { status: 'FIELD_VERIFICATION' },
    })

    await createAuditLog(req.user.id, 'Document', id, 'DOCUMENT_VERIFIED', { verificationStatus: 'PENDING' }, { verificationStatus: 'VERIFIED' }, { documentName: document.name }, document.proposal?.departmentId)

    return successResponse(res, updated)
  } catch (error) {
    return errorResponse(res, 'Failed to verify document', 500)
  }
}

const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params
    const { remarks } = req.body

    if (!remarks || !remarks.trim()) {
      return errorResponse(res, 'Rejection reason is required', 400)
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: { proposal: { select: { departmentId: true } } },
    })

    if (!document) {
      return errorResponse(res, 'Document not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && document.proposal?.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        verificationStatus: 'REJECTED',
        verifiedById: req.user.id,
        verifiedAt: new Date(),
        verificationRemarks: remarks,
      },
      include: {
        uploadedBy: { select: { name: true, email: true } },
        verifiedBy: { select: { name: true, email: true } },
      },
    })

    await createAuditLog(req.user.id, 'Document', id, 'DOCUMENT_REJECTED', { verificationStatus: 'PENDING' }, { verificationStatus: 'REJECTED', reason: remarks }, { documentName: document.name }, document.proposal?.departmentId)

    return successResponse(res, updated)
  } catch (error) {
    return errorResponse(res, 'Failed to reject document', 500)
  }
}

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  verifyDocument,
  rejectDocument,
}
