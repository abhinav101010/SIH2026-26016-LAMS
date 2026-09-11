const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { paginationSchema } = require('../validators')

const PUBLIC_PROPOSAL_FIELDS = {
  id: true,
  proposalNumber: true,
  projectName: true,
  projectType: true,
  department: true,
  ministry: true,
  state: true,
  district: true,
  purpose: true,
  estimatedCost: true,
  totalLandRequired: true,
  landType: true,
  affectedFamilies: true,
  affectedArea: true,
  displacedFamilies: true,
  status: true,
  priority: true,
  description: true,
  progress: true,
  targetCompletion: true,
  currentStage: true,
  submittedDate: true,
  createdAt: true,
  updatedAt: true,
  parcels: {
    select: {
      id: true,
      parcelNumber: true,
      area: true,
      landType: true,
      status: true,
      geometry: true,
    },
  },
}

const getPublicProposals = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, state, district, department } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}

    if (search) {
      where.OR = [
        { projectName: { contains: search, mode: 'insensitive' } },
        { proposalNumber: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }
    if (state) {
      where.state = { contains: state, mode: 'insensitive' }
    }
    if (district) {
      where.district = { contains: district, mode: 'insensitive' }
    }
    if (department) {
      where.department = { contains: department, mode: 'insensitive' }
    }

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        select: PUBLIC_PROPOSAL_FIELDS,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.proposal.count({ where }),
    ])

    const totalPages = Math.ceil(total / parseInt(limit))

    return paginatedResponse(res, proposals, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
    })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch proposals', 500)
  }
}

const getPublicProposalById = async (req, res) => {
  try {
    const { id } = req.params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: PUBLIC_PROPOSAL_FIELDS,
    })

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    return successResponse(res, proposal)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch proposal', 500)
  }
}

const getPublicFilters = async (req, res) => {
  try {
    const [statuses, states, districts, departments] = await Promise.all([
      prisma.proposal.findMany({ select: { status: true }, distinct: ['status'] }),
      prisma.proposal.findMany({ select: { state: true }, distinct: ['state'] }),
      prisma.proposal.findMany({ select: { district: true }, distinct: ['district'] }),
      prisma.proposal.findMany({ select: { department: true }, distinct: ['department'] }),
    ])

    return successResponse(res, {
      statuses: statuses.map(s => s.status),
      states: states.map(s => s.state).filter(Boolean),
      districts: districts.map(d => d.district).filter(Boolean),
      departments: departments.map(d => d.department).filter(Boolean),
    })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch filters', 500)
  }
}

module.exports = {
  getPublicProposals,
  getPublicProposalById,
  getPublicFilters,
}
