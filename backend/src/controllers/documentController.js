const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { documentSchema, paginationSchema } = require('../validators')
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
        proposal: { select: { proposalNumber: true, projectName: true } },
      },
    })

    if (!document) {
      return errorResponse(res, 'Document not found', 404)
    }

    return successResponse(res, document)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch document', 500)
  }
}

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params

    const document = await prisma.document.findUnique({ where: { id } })
    if (!document) {
      return errorResponse(res, 'Document not found', 404)
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

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
}
