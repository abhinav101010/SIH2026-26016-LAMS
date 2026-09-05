const prisma = require('../config/db')
const { proposalSchema, approvalSchema, paginationSchema } = require('../validators')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { createAuditLog } = require('./auditController')

const ALLOWED_TRANSITIONS = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW', 'CHANGES_REQUESTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'],
  CHANGES_REQUESTED: ['SUBMITTED'],
  APPROVED: ['NOTIFICATION_ISSUED'],
  NOTIFICATION_ISSUED: ['AWARD_DECLARED'],
  AWARD_DECLARED: ['COMPENSATION'],
  COMPENSATION: ['ACQUIRED'],
  ACQUIRED: ['POSSESSION'],
}

const getAllProposals = async (req, res) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const { status, state, district, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    const where = {}

    if (status) where.status = status
    if (state) where.state = state
    if (district) where.district = district
    if (search) {
      where.OR = [
        { proposalNumber: { contains: search, mode: 'insensitive' } },
        { projectName: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      where.departmentId = req.user.departmentId
    }

    const [data, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: { select: { name: true, email: true } },
          departmentRef: { select: { id: true, name: true, code: true } },
          parcels: true,
        },
      }),
      prisma.proposal.count({ where }),
    ])

    return paginatedResponse(res, data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch proposals', 500)
  }
}

const getProposalById = async (req, res) => {
  try {
    const { id } = req.params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true } },
        parcels: true,
        approvals: { include: { reviewer: { select: { name: true, email: true } } } },
        documents: true,
      },
    })

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && proposal.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

    return successResponse(res, proposal)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch proposal', 500)
  }
}

const createProposal = async (req, res) => {
  try {
    const data = proposalSchema.parse(req.body)

    const proposal = await prisma.proposal.create({
      data: {
        ...data,
        createdById: req.user.id,
        submittedBy: req.user.name,
        departmentId: req.user.departmentId,
        parcels: data.parcels
          ? {
              create: data.parcels.map((p) => ({
                parcelNumber: p.parcelNumber,
                area: p.area || 0,
                landType: p.landType || data.landType,
                status: p.status || 'pending',
                surveyNo: p.surveyNo,
                village: p.village,
                owner: p.owner,
                geometry: p.geometry,
              })),
            }
          : undefined,
      },
      include: {
        createdBy: { select: { name: true, email: true } },
        departmentRef: { select: { id: true, name: true, code: true } },
        parcels: true,
      },
    })

    await createAuditLog(req.user.id, 'Proposal', proposal.id, 'CREATED', null, proposal, null, proposal.departmentId)

    return successResponse(res, proposal, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('CREATE PROPOSAL ERROR:', message)
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Failed to create proposal', 500)
  }
}

const updateProposal = async (req, res) => {
  try {
    const { id } = req.params
    const data = proposalSchema.partial().parse(req.body)

    const existing = await prisma.proposal.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && existing.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

    if (existing.status !== 'DRAFT' && existing.status !== 'CHANGES_REQUESTED') {
      return errorResponse(res, 'Only draft or change-requested proposals can be modified', 409)
    }

    const { status: _status, parcels: _parcels, ...rest } = data

    const proposal = await prisma.proposal.update({
      where: { id },
      data: {
        ...rest,
        updatedById: req.user.id,
        parcels: _parcels
          ? {
              deleteMany: {},
              create: _parcels.map((p, idx) => ({
                parcelNumber: p.parcelNumber || `PARC-${String(idx + 1).padStart(3, '0')}`,
                area: p.area || 0,
                landType: p.landType || rest.landType || existing.landType,
                status: p.status || 'pending',
                surveyNo: p.surveyNo,
                village: p.village,
                owner: p.owner,
                geometry: p.geometry,
              })),
            }
          : undefined,
      },
      include: {
        parcels: true,
        createdBy: { select: { name: true, email: true } },
      },
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'PROPOSAL_UPDATED', existing, proposal, null, existing.departmentId)

    return successResponse(res, proposal)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(res, error.errors[0].message, 400)
    }
    return errorResponse(res, 'Failed to update proposal', 500)
  }
}

const deleteProposal = async (req, res) => {
  try {
    const { id } = req.params

    const existing = await prisma.proposal.findUnique({
      where: { id },
      include: {
        parcels: true,
        approvals: true,
        documents: true,
        compensations: true,
        families: true,
        possessions: true,
      },
    })

    if (!existing) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && existing.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

    if (existing.status !== 'DRAFT') {
      if (req.user.role !== 'SUPER_ADMIN') {
        return errorResponse(res, 'Only draft proposals can be deleted', 409)
      }
      if (req.query.confirm !== 'true') {
        return errorResponse(res, 'Deleting a non-draft proposal requires confirmation. Append ?confirm=true to proceed.', 409)
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.possession.deleteMany({ where: { proposalId: id } })
      await tx.compensation.deleteMany({ where: { proposalId: id } })
      await tx.document.deleteMany({ where: { proposalId: id } })
      await tx.approval.deleteMany({ where: { proposalId: id } })
      await tx.affectedFamily.deleteMany({ where: { proposalId: id } })
      await tx.rehabilitationRecord.deleteMany({ where: { proposalId: id } })
      await tx.landParcel.deleteMany({ where: { proposalId: id } })
      await tx.proposal.delete({ where: { id } })
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'PROPOSAL_DELETED', existing, null, null, existing.departmentId)

    return successResponse(res, { message: 'Proposal deleted successfully' })
  } catch (error) {
    return errorResponse(res, 'Failed to delete proposal', 500)
  }
}

const submitProposal = async (req, res) => {
  try {
    const { id } = req.params

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && proposal.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

    if (proposal.status !== 'DRAFT' && proposal.status !== 'CHANGES_REQUESTED') {
      return errorResponse(res, 'Proposal can only be submitted from DRAFT or CHANGES_REQUESTED status', 400)
    }

    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedDate: new Date(),
        updatedById: req.user.id,
      },
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'SUBMITTED', proposal, updated, null, proposal.departmentId)

    return successResponse(res, updated)
  } catch (error) {
    return errorResponse(res, 'Failed to submit proposal', 500)
  }
}

const startReview = async (req, res) => {
  try {
    const { id } = req.params

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && proposal.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

    if (proposal.status !== 'SUBMITTED') {
      return errorResponse(res, 'Only submitted proposals can be sent for review', 400)
    }

    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        status: 'UNDER_REVIEW',
        currentStage: 'Administrative Review',
        progress: 25,
        updatedById: req.user.id,
      },
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'REVIEW_STARTED', proposal, updated, null, proposal.departmentId)

    return successResponse(res, updated)
  } catch (error) {
    return errorResponse(res, 'Failed to start review', 500)
  }
}

const approveProposal = async (req, res) => {
  try {
    const { id } = req.params
    const { remarks } = approvalSchema.parse(req.body)

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && proposal.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

  if (req.user.role !== 'REVIEWING_AUTHORITY') {
    return errorResponse(res, 'Only Reviewing Authority can approve proposals', 403)
  }

  if (proposal.status !== 'UNDER_REVIEW') {
    return errorResponse(res, 'Proposal must be UNDER_REVIEW to be approved', 400)
  }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.proposal.update({
        where: { id },
        data: {
          status: 'APPROVED',
          updatedById: req.user.id,
        },
      })

      await tx.approval.create({
        data: {
          proposalId: id,
          reviewerId: req.user.id,
          action: 'APPROVED',
          remarks: remarks || '',
        },
      })

      if (proposal.createdById) {
        await tx.notification.create({
          data: {
            userId: proposal.createdById,
            title: 'Proposal Approved',
            message: `Proposal ${proposal.proposalNumber} has been approved`,
            type: 'approval',
            category: 'Proposal updates',
            priority: 'high',
          },
        })
      }

      return updated
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'PROPOSAL_APPROVED', proposal, result, null, proposal.departmentId)

    return successResponse(res, result)
  } catch (error) {
    return errorResponse(res, 'Failed to approve proposal', 500)
  }
}

const rejectProposal = async (req, res) => {
  try {
    const { id } = req.params
    const { remarks } = approvalSchema.parse(req.body)

    if (!remarks || remarks.trim().length === 0) {
      return errorResponse(res, 'Rejection reason is required', 400)
    }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && proposal.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

    if (proposal.status !== 'UNDER_REVIEW') {
      return errorResponse(res, 'Proposal must be UNDER_REVIEW to be rejected', 400)
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.proposal.update({
        where: { id },
        data: {
          status: 'REJECTED',
          updatedById: req.user.id,
        },
      })

      await tx.approval.create({
        data: {
          proposalId: id,
          reviewerId: req.user.id,
          action: 'REJECTED',
          remarks,
        },
      })

      if (proposal.createdById) {
        await tx.notification.create({
          data: {
            userId: proposal.createdById,
            title: 'Proposal Rejected',
            message: `Proposal ${proposal.proposalNumber} has been rejected. Reason: ${remarks}`,
            type: 'status',
            category: 'Proposal updates',
            priority: 'high',
          },
        })
      }

      return updated
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'REJECTED', proposal, result, null, proposal.departmentId)

    return successResponse(res, result)
  } catch (error) {
    return errorResponse(res, 'Failed to reject proposal', 500)
  }
}

const requestChanges = async (req, res) => {
  try {
    const { id } = req.params
    const { remarks } = approvalSchema.parse(req.body)

    if (!remarks || remarks.trim().length === 0) {
      return errorResponse(res, 'Remarks are required when requesting changes', 400)
    }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && proposal.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

    if (proposal.status !== 'UNDER_REVIEW') {
      return errorResponse(res, 'Proposal must be UNDER_REVIEW to request changes', 400)
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.proposal.update({
        where: { id },
        data: {
          status: 'CHANGES_REQUESTED',
          updatedById: req.user.id,
        },
      })

      await tx.approval.create({
        data: {
          proposalId: id,
          reviewerId: req.user.id,
          action: 'CHANGES_REQUESTED',
          remarks,
        },
      })

      if (proposal.createdById) {
        await tx.notification.create({
          data: {
            userId: proposal.createdById,
            title: 'Changes Requested',
            message: `Changes requested for proposal ${proposal.proposalNumber}. Remarks: ${remarks}`,
            type: 'status',
            category: 'Proposal updates',
            priority: 'high',
          },
        })
      }

      return updated
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'CHANGES_REQUESTED', proposal, result, null, proposal.departmentId)

    return successResponse(res, result)
  } catch (error) {
    return errorResponse(res, 'Failed to request changes', 500)
  }
}

module.exports = {
  getAllProposals,
  getProposalById,
  createProposal,
  updateProposal,
  deleteProposal,
  submitProposal,
  startReview,
  approveProposal,
  rejectProposal,
  requestChanges,
}
