const prisma = require('../config/db')
const { proposalSchema, proposalUpdateSchema, approvalSchema, paginationSchema } = require('../validators')
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

const calculateProposalStatus = async (tx, proposalId, round) => {
  const approvals = await tx.approval.findMany({
    where: { proposalId, round },
    select: { action: true },
  })

  if (approvals.some((a) => a.action === 'REJECTED')) {
    return 'REJECTED'
  }
  if (approvals.length > 0 && approvals.every((a) => a.action === 'APPROVED')) {
    return 'APPROVED'
  }
  return 'UNDER_REVIEW'
}

const calculateApprovalProgress = async (tx, proposalId, round) => {
  const approvals = await tx.approval.findMany({
    where: { proposalId, round },
    select: { action: true },
  })

  if (approvals.length === 0) return 0
  const approved = approvals.filter((a) => a.action === 'APPROVED').length
  return Math.round((approved / approvals.length) * 100)
}

const ensureApprovalRecord = async (tx, proposalId, departmentId, round, reviewerId) => {
  const existing = await tx.approval.findFirst({
    where: { proposalId, departmentId, round },
  })
  if (!existing) {
    await tx.approval.create({
      data: {
        proposalId,
        departmentId,
        round,
        reviewerId,
        action: 'PENDING',
      },
    })
  }
  return existing
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
      const ownerCondition = { departmentId: req.user.departmentId }
      const approverCondition = {
        AND: [
          { approvingDepartments: { not: null } },
        ],
      }
      where.AND = [where.AND || {}, { OR: [ownerCondition, approverCondition] }]
    }

    let data, total
    if (req.user.role !== 'SUPER_ADMIN') {
      const deptId = req.user.departmentId
      const baseWhere = { ...where }
      delete baseWhere.AND
      
      const [ownerData, ownerTotal] = await Promise.all([
        prisma.proposal.findMany({
          where: { ...baseWhere, departmentId: deptId },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            createdBy: { select: { name: true, email: true } },
            departmentRef: { select: { id: true, name: true, code: true } },
            parcels: true,
          },
        }),
        prisma.proposal.count({ where: { ...baseWhere, departmentId: deptId } }),
      ])
      
      const [approverData, approverTotal] = await Promise.all([
        prisma.proposal.findMany({
          where: { ...baseWhere, approvingDepartments: { not: null } },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            createdBy: { select: { name: true, email: true } },
            departmentRef: { select: { id: true, name: true, code: true } },
            parcels: true,
          },
        }),
        prisma.proposal.count({ where: { ...baseWhere, approvingDepartments: { not: null } } }),
      ])
      
      const ownerIds = new Set(ownerData.map(p => p.id))
      const combined = [...ownerData, ...approverData.filter(p => !ownerIds.has(p.id))]
      const seen = new Set()
      data = combined.filter(item => {
        const key = item.id
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      total = ownerTotal + approverTotal
    } else {
      const [ownerData, ownerTotal] = await Promise.all([
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
      data = ownerData
      total = ownerTotal
    }

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
        approvals: {
          include: { reviewer: { select: { name: true, email: true } }, department: { select: { id: true, name: true, code: true } } },
          orderBy: { createdAt: 'asc' },
        },
        documents: {
          include: {
            uploadedBy: { select: { name: true, email: true } },
            verifiedBy: { select: { name: true, email: true } },
          },
        },
      },
    })

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      const isOwner = proposal.departmentId === req.user.departmentId
      const isApprover = Array.isArray(proposal.approvingDepartments) && proposal.approvingDepartments.includes(req.user.departmentId)
      if (!isOwner && !isApprover) {
        return errorResponse(res, 'Access denied', 403)
      }
    }

    return successResponse(res, proposal)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch proposal', 500)
  }
}

const createProposal = async (req, res) => {
  try {
    const data = proposalSchema.parse(req.body)

    let proposalNumber = data.proposalNumber
    if (!proposalNumber) {
      const lastProposal = await prisma.proposal.findFirst({
        orderBy: { proposalNumber: 'desc' },
        select: { proposalNumber: true },
      })
      const lastNum = lastProposal
        ? parseInt(lastProposal.proposalNumber.split('-').pop(), 10)
        : 110
      proposalNumber = `NLAMS-2026-${String(lastNum + 1).padStart(5, '0')}`
    } else {
      const existing = await prisma.proposal.findFirst({ where: { proposalNumber } })
      if (existing) {
        const lastProposal = await prisma.proposal.findFirst({
          orderBy: { proposalNumber: 'desc' },
          select: { proposalNumber: true },
        })
        const lastNum = lastProposal
          ? parseInt(lastProposal.proposalNumber.split('-').pop(), 10)
          : 110
        proposalNumber = `NLAMS-2026-${String(lastNum + 1).padStart(5, '0')}`
      }
    }

    const allowedFields = [
      'proposalNumber','projectName','projectType','department','ministry','state','district',
      'purpose','estimatedCost','totalLandRequired','numberOfParcels','landType',
      'affectedFamilies','affectedArea','affectedAreaType','affectedAreaKm2','estimatedPopulation',
      'populationDensity','populationDataSource','displacedFamilies','priority','description',
      'approvingDepartments'
    ]
    const proposalFields = {}
    for (const key of allowedFields) {
      if (data[key] !== undefined) proposalFields[key] = data[key]
    }
    proposalFields.targetCompletion = data.targetCompletion ? new Date(data.targetCompletion).toISOString() : undefined

    const normalizedParcels = (data.parcels || [])
      .filter((p) => p.geometry || p.area)
      .map((p) => ({
        parcelNumber: p.parcelNumber || `PARC-${String(Math.random()).slice(2, 8)}`,
        area: typeof p.area === 'number' ? p.area : 0,
        landType: p.landType || data.landType,
        status: p.status || 'pending',
        surveyNo: p.surveyNo || null,
        village: p.village || null,
        owner: p.owner || null,
        geometry: p.geometry || null,
      }))

    const createData = {
      ...proposalFields,
      proposalNumber,
      createdById: req.user.id,
      submittedBy: req.user.name,
      departmentId: req.user.departmentId,
      ...(normalizedParcels.length > 0 ? { parcels: { create: normalizedParcels } } : {}),
    }

    const proposal = await prisma.proposal.create({
      data: createData,
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
    const data = proposalUpdateSchema.parse(req.body)

    const existing = await prisma.proposal.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN' && existing.departmentId !== req.user.departmentId) {
      return errorResponse(res, 'Access denied', 403)
    }

    if (existing.status !== 'DRAFT' && existing.status !== 'CHANGES_REQUESTED' && existing.status !== 'REJECTED') {
      return errorResponse(res, 'Only draft, change-requested, or rejected proposals can be modified', 409)
    }

    const { status: _status, parcels: _parcels, ...rest } = data

    const allowedUpdateFields = [
      'projectName','projectType','department','ministry','state','district',
      'purpose','estimatedCost','totalLandRequired','numberOfParcels','landType',
      'affectedFamilies','affectedArea','affectedAreaType','affectedAreaKm2','estimatedPopulation',
      'populationDensity','populationDataSource','displacedFamilies','priority','description',
      'approvingDepartments'
    ]
    const updateFields = {}
    for (const key of allowedUpdateFields) {
      if (rest[key] !== undefined) updateFields[key] = rest[key]
    }

    const normalizedParcels = (_parcels || [])
      .filter((p) => p.geometry || p.area)
      .map((p) => ({
        parcelNumber: p.parcelNumber || `PARC-${String(Math.random()).slice(2, 8)}`,
        area: typeof p.area === 'number' ? p.area : 0,
        landType: p.landType || updateFields.landType || existing.landType,
        status: p.status || 'pending',
        surveyNo: p.surveyNo || null,
        village: p.village || null,
        owner: p.owner || null,
        geometry: p.geometry || null,
      }))

    const updateData = {
      ...updateFields,
      updatedById: req.user.id,
      ...(normalizedParcels.length > 0 ? { parcels: { deleteMany: {}, create: normalizedParcels } } : {}),
    }

    if (updateData.targetCompletion) {
      updateData.targetCompletion = new Date(updateData.targetCompletion).toISOString()
    }

    const proposal = await prisma.proposal.update({
      where: { id },
      data: updateData,
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

    const isDraft = existing.status === 'DRAFT'
    const isRejected = existing.status === 'REJECTED'
    const canDelete = isDraft || isRejected || req.user.role === 'SUPER_ADMIN'

    if (!canDelete) {
      return errorResponse(res, 'Only draft or rejected proposals can be deleted', 409)
    }

    if (!isDraft && req.user.role === 'SUPER_ADMIN' && req.query.confirm !== 'true') {
      return errorResponse(res, 'Deleting a non-draft proposal requires confirmation. Append ?confirm=true to proceed.', 409)
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
    const { approvingDepartments } = req.body

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { approvals: true },
    })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      const isOwner = proposal.departmentId === req.user.departmentId
      const isApprover = Array.isArray(proposal.approvingDepartments) && proposal.approvingDepartments.includes(req.user.departmentId)
      if (!isOwner && !isApprover) {
        return errorResponse(res, 'Access denied', 403)
      }
    }

    if (proposal.status !== 'DRAFT' && proposal.status !== 'CHANGES_REQUESTED' && proposal.status !== 'REJECTED') {
      return errorResponse(res, 'Proposal can only be submitted from DRAFT, CHANGES_REQUESTED, or REJECTED status', 400)
    }

    const departmentIds = approvingDepartments || proposal.approvingDepartments
    if (!departmentIds || departmentIds.length === 0) {
      return errorResponse(res, 'At least one approving department is required', 400)
    }

    const uniqueIds = [...new Set(departmentIds)]
    const departments = await prisma.department.findMany({
      where: { id: { in: uniqueIds }, isActive: true },
      select: { id: true },
    })
    if (departments.length !== uniqueIds.length) {
      return errorResponse(res, 'One or more selected departments are invalid or inactive', 400)
    }

    const nextRound = proposal.approvalRound + 1
    const status = await calculateProposalStatus(prisma, id, proposal.approvalRound)

    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedDate: new Date(),
        updatedById: req.user.id,
        approvingDepartments: uniqueIds,
        approvalRound: nextRound,
      },
    })

    await prisma.approval.createMany({
      data: uniqueIds.map((deptId) => ({
        proposalId: id,
        departmentId: deptId,
        round: nextRound,
        reviewerId: req.user.id,
        action: 'PENDING',
      })),
    })

    const reviewers = await prisma.user.findMany({
      where: {
        departmentId: { in: uniqueIds },
        role: 'REVIEWING_AUTHORITY',
        isActive: true,
      },
      select: { id: true, departmentId: true },
    })

    const notifications = reviewers.map((reviewer) => ({
      userId: reviewer.id,
      title: 'New Proposal for Review',
      message: `Proposal ${proposal.proposalNumber} has been submitted and requires your department's approval`,
      type: 'approval',
      category: 'Proposal updates',
      priority: 'high',
      action: 'Review now',
      link: `/proposals/${id}`,
    }))

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications })
    }

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

    if (req.user.role !== 'SUPER_ADMIN') {
      const isOwner = proposal.departmentId === req.user.departmentId
      const isApprover = Array.isArray(proposal.approvingDepartments) && proposal.approvingDepartments.includes(req.user.departmentId)
      if (!isOwner && !isApprover) {
        return errorResponse(res, 'Access denied', 403)
      }
    }

    if (proposal.status !== 'FIELD_VERIFICATION') {
      return errorResponse(res, 'Proposal must complete field verification before review', 400)
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

const startFieldVerification = async (req, res) => {
  try {
    const { id } = req.params

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      const isOwner = proposal.departmentId === req.user.departmentId
      const isApprover = Array.isArray(proposal.approvingDepartments) && proposal.approvingDepartments.includes(req.user.departmentId)
      if (!isOwner && !isApprover) {
        return errorResponse(res, 'Access denied', 403)
      }
    }

    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'FIELD_OFFICER') {
      return errorResponse(res, 'Only Field Officer can start field verification', 403)
    }

    if (proposal.status !== 'SUBMITTED') {
      return errorResponse(res, 'Proposal must be SUBMITTED to start field verification', 400)
    }

    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        status: 'FIELD_VERIFICATION',
        currentStage: 'Field Verification',
        progress: 15,
        updatedById: req.user.id,
      },
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'FIELD_VERIFICATION_STARTED', proposal, updated, null, proposal.departmentId)

    return successResponse(res, updated)
  } catch (error) {
    return errorResponse(res, 'Failed to start field verification', 500)
  }
}

const completeVerification = async (req, res) => {
  try {
    const { id } = req.params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { documents: true },
    })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      const isOwner = proposal.departmentId === req.user.departmentId
      const isApprover = Array.isArray(proposal.approvingDepartments) && proposal.approvingDepartments.includes(req.user.departmentId)
      if (!isOwner && !isApprover) {
        return errorResponse(res, 'Access denied', 403)
      }
    }

    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'FIELD_OFFICER') {
      return errorResponse(res, 'Only Field Officer can complete verification', 403)
    }

    if (proposal.status !== 'FIELD_VERIFICATION') {
      return errorResponse(res, 'Proposal is not in field verification status', 400)
    }

    const pendingDocuments = proposal.documents.filter((d) => d.verificationStatus === 'PENDING')
    if (pendingDocuments.length > 0) {
      return errorResponse(res, 'All documents must be verified before completing field verification', 400)
    }

    const rejectedDocuments = proposal.documents.filter((d) => d.verificationStatus === 'REJECTED')
    if (rejectedDocuments.length > 0) {
      return errorResponse(res, 'Proposal has rejected documents and cannot proceed', 400)
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

    await createAuditLog(req.user.id, 'Proposal', id, 'VERIFICATION_COMPLETED', proposal, updated, null, proposal.departmentId)

    return successResponse(res, updated)
  } catch (error) {
    return errorResponse(res, 'Failed to complete verification', 500)
  }
}

const approveProposal = async (req, res) => {
  try {
    const { id } = req.params
    const { remarks } = approvalSchema.parse(req.body)

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { documents: true },
    })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      const isOwnerDepartment = proposal.departmentId === req.user.departmentId
      const isApprovingDepartment = Array.isArray(proposal.approvingDepartments) && proposal.approvingDepartments.includes(req.user.departmentId)
      if (!isOwnerDepartment && !isApprovingDepartment) {
        return errorResponse(res, 'Access denied', 403)
      }
    }

    if (req.user.role !== 'REVIEWING_AUTHORITY') {
      return errorResponse(res, 'Only Reviewing Authority can approve proposals', 403)
    }

    if (!req.user.departmentId) {
      return errorResponse(res, 'User department is not assigned', 403)
    }

    const currentRound = proposal.approvalRound || 1
    const approval = await prisma.approval.findFirst({
      where: {
        proposalId: id,
        departmentId: req.user.departmentId,
        round: currentRound,
      },
    })

    if (!approval) {
      return errorResponse(res, 'No approval record found for your department on this proposal', 403)
    }

    if (approval.action !== 'PENDING') {
      return errorResponse(res, 'This department has already acted on this proposal', 400)
    }

    if (proposal.status !== 'UNDER_REVIEW') {
      return errorResponse(res, 'Proposal must be UNDER_REVIEW to be approved', 400)
    }

    const hasVerifiedDocuments = proposal.documents.length > 0 && proposal.documents.every((d) => d.verificationStatus === 'VERIFIED')
    if (!hasVerifiedDocuments && proposal.documents.length > 0) {
      return errorResponse(res, 'Proposal cannot be approved until all documents are verified', 400)
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.approval.update({
        where: { id: approval.id },
        data: {
          action: 'APPROVED',
          reviewerId: req.user.id,
          remarks: remarks || '',
        },
        include: {
          reviewer: { select: { name: true, email: true } },
          department: { select: { id: true, name: true, code: true } },
        },
      })

      const newStatus = await calculateProposalStatus(tx, id, currentRound)
      const newProgress = await calculateApprovalProgress(tx, id, currentRound)

      const updated = await tx.proposal.update({
        where: { id },
        data: {
          status: newStatus,
          progress: newProgress,
          updatedById: req.user.id,
        },
      })

      if (newStatus === 'APPROVED' && proposal.createdById) {
        await tx.notification.create({
          data: {
            userId: proposal.createdById,
            title: 'Proposal Fully Approved',
            message: `Proposal ${proposal.proposalNumber} has been approved by all departments`,
            type: 'approval',
            category: 'Proposal updates',
            priority: 'high',
            action: 'View proposal',
            link: `/proposals/${id}`,
          },
        })
      }

      return { proposal: updated, approval: updatedApproval }
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'PROPOSAL_DEPARTMENT_APPROVED', proposal, result.proposal, null, proposal.departmentId)

    return successResponse(res, result.proposal)
  } catch (error) {
    return errorResponse(res, 'Failed to approve proposal', 500)
  }
}

const rejectProposal = async (req, res) => {
  try {
    const { id } = req.params
    const { remarks } = approvalSchema.parse(req.body)

    if (!remarks || remarks.trim().length === 0) {
      return errorResponse(res, 'Rejection feedback is required', 400)
    }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      const isOwnerDepartment = proposal.departmentId === req.user.departmentId
      const isApprovingDepartment = Array.isArray(proposal.approvingDepartments) && proposal.approvingDepartments.includes(req.user.departmentId)
      if (!isOwnerDepartment && !isApprovingDepartment) {
        return errorResponse(res, 'Access denied', 403)
      }
    }

    if (req.user.role !== 'REVIEWING_AUTHORITY') {
      return errorResponse(res, 'Only Reviewing Authority can reject proposals', 403)
    }

    if (!req.user.departmentId) {
      return errorResponse(res, 'User department is not assigned', 403)
    }

    const currentRound = proposal.approvalRound || 1
    const approval = await prisma.approval.findFirst({
      where: {
        proposalId: id,
        departmentId: req.user.departmentId,
        round: currentRound,
      },
    })

    if (!approval) {
      return errorResponse(res, 'No approval record found for your department on this proposal', 403)
    }

    if (approval.action !== 'PENDING') {
      return errorResponse(res, 'This department has already acted on this proposal', 400)
    }

    if (proposal.status !== 'UNDER_REVIEW') {
      return errorResponse(res, 'Proposal must be UNDER_REVIEW to be rejected', 400)
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.approval.update({
        where: { id: approval.id },
        data: {
          action: 'REJECTED',
          reviewerId: req.user.id,
          remarks,
        },
        include: {
          reviewer: { select: { name: true, email: true } },
          department: { select: { id: true, name: true, code: true } },
        },
      })

      const updated = await tx.proposal.update({
        where: { id },
        data: {
          status: 'REJECTED',
          progress: 0,
          updatedById: req.user.id,
        },
      })

      if (proposal.createdById) {
        await tx.notification.create({
          data: {
            userId: proposal.createdById,
            title: 'Proposal Rejected',
            message: `Proposal ${proposal.proposalNumber} has been rejected by ${updatedApproval.department?.name || 'a department'}. Reason: ${remarks}`,
            type: 'status',
            category: 'Proposal updates',
            priority: 'high',
            action: 'View proposal',
            link: `/proposals/${id}`,
          },
        })
      }

      return { proposal: updated, approval: updatedApproval }
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'PROPOSAL_DEPARTMENT_REJECTED', proposal, result.proposal, null, proposal.departmentId)

    return successResponse(res, result.proposal)
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

    if (req.user.role !== 'SUPER_ADMIN') {
      const isOwner = proposal.departmentId === req.user.departmentId
      const isApprover = Array.isArray(proposal.approvingDepartments) && proposal.approvingDepartments.includes(req.user.departmentId)
      if (!isOwner && !isApprover) {
        return errorResponse(res, 'Access denied', 403)
      }
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

const dropProposal = async (req, res) => {
  try {
    const { id } = req.params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { approvals: true },
    })
    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    if (req.user.role !== 'SUPER_ADMIN') {
      const isOwner = proposal.departmentId === req.user.departmentId
      const isApprover = Array.isArray(proposal.approvingDepartments) && proposal.approvingDepartments.includes(req.user.departmentId)
      if (!isOwner && !isApprover) {
        return errorResponse(res, 'Access denied', 403)
      }
    }

    if (proposal.status !== 'REJECTED') {
      return errorResponse(res, 'Only rejected proposals can be dropped', 400)
    }

    await prisma.$transaction(async (tx) => {
      await tx.approval.deleteMany({ where: { proposalId: id } })
      await tx.document.deleteMany({ where: { proposalId: id } })
      await tx.landParcel.deleteMany({ where: { proposalId: id } })
      await tx.proposal.delete({ where: { id } })
    })

    await createAuditLog(req.user.id, 'Proposal', id, 'PROPOSAL_DROPPED', proposal, null, null, proposal.departmentId)

    return successResponse(res, { message: 'Proposal dropped successfully' })
  } catch (error) {
    return errorResponse(res, 'Failed to drop proposal', 500)
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
  startFieldVerification,
  completeVerification,
  approveProposal,
  rejectProposal,
  requestChanges,
  dropProposal,
  calculateProposalStatus,
  calculateApprovalProgress,
}
