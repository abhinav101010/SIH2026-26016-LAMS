const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { paginationSchema } = require('../validators')

const getAllProjects = async (req, res) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count(),
    ])

    return paginatedResponse(res, data, { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch projects', 500)
  }
}

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({
      where: { id },
      include: { proposals: true },
    })

    if (!project) {
      return errorResponse(res, 'Project not found', 404)
    }

    return successResponse(res, project)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch project', 500)
  }
}

const createProject = async (req, res) => {
  try {
    const project = await prisma.project.create({
      data: req.body,
    })

    return successResponse(res, project, 201)
  } catch (error) {
    return errorResponse(res, 'Failed to create project', 500)
  }
}

const updateProject = async (req, res) => {
  try {
    const { id } = req.params

    const project = await prisma.project.update({
      where: { id },
      data: req.body,
    })

    return successResponse(res, project)
  } catch (error) {
    return errorResponse(res, 'Failed to update project', 500)
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
}
