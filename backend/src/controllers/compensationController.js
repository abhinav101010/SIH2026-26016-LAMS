const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { paginationSchema } = require('../validators')

const getCompensations = async (req, res) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const { proposalId } = req.query

    const where = {}
    if (proposalId) where.proposalId = proposalId

    const [data, total] = await Promise.all([
      prisma.compensation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          proposal: { select: { proposalNumber: true, projectName: true } },
          family: { select: { headOfFamily: true } },
        },
      }),
      prisma.compensation.count({ where }),
    ])

    return paginatedResponse(res, data, { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch compensations', 500)
  }
}

const createCompensation = async (req, res) => {
  try {
    const data = req.body

    const compensation = await prisma.compensation.create({
      data,
    })

    return successResponse(res, compensation, 201)
  } catch (error) {
    return errorResponse(res, 'Failed to create compensation', 500)
  }
}

const updateCompensation = async (req, res) => {
  try {
    const { id } = req.params

    const compensation = await prisma.compensation.update({
      where: { id },
      data: req.body,
    })

    return successResponse(res, compensation)
  } catch (error) {
    return errorResponse(res, 'Failed to update compensation', 500)
  }
}

module.exports = {
  getCompensations,
  createCompensation,
  updateCompensation,
}
