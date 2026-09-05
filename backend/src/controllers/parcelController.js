const prisma = require('../config/db')
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response')
const { paginationSchema } = require('../validators')

const getParcels = async (req, res) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query)
    const { status, state, district, proposalId, bbox } = req.query

    const where = {}

    if (proposalId) {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        select: { id: true },
      })
      if (proposal) {
        where.proposalId = proposal.id
      }
    }

    if (status) where.status = status

    const [data, total] = await Promise.all([
      prisma.landParcel.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          proposal: {
            select: {
              id: true,
              proposalNumber: true,
              projectName: true,
              state: true,
              district: true,
              status: true,
            },
          },
        },
      }),
      prisma.landParcel.count({ where }),
    ])

    const geoJsonFeatures = data.map((parcel) => {
      const feature = {
        type: 'Feature',
        properties: {
          id: parcel.id,
          parcelNumber: parcel.parcelNumber,
          area: parcel.area,
          landType: parcel.landType,
          status: parcel.status,
          surveyNo: parcel.surveyNo,
          village: parcel.village,
          owner: parcel.owner,
          acquiredDate: parcel.acquiredDate,
          proposalId: parcel.proposalId,
          proposalNumber: parcel.proposal?.proposalNumber,
          projectName: parcel.proposal?.projectName,
          state: parcel.proposal?.state,
          district: parcel.proposal?.district,
        },
      }

      if (parcel.geometry) {
        try {
          feature.geometry = JSON.parse(parcel.geometry)
        } catch {
          feature.geometry = null
        }
      }

      return feature
    })

    const isGeoJson = req.query.format === 'geojson'

    if (isGeoJson) {
      return res.json({
        success: true,
        type: 'FeatureCollection',
        features: geoJsonFeatures,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    }

    return paginatedResponse(res, data, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch parcels', 500)
  }
}

const getParcelById = async (req, res) => {
  try {
    const { id } = req.params

    const parcel = await prisma.landParcel.findUnique({
      where: { id },
      include: {
        proposal: {
          select: {
            id: true,
            proposalNumber: true,
            projectName: true,
            state: true,
            district: true,
            status: true,
          },
        },
      },
    })

    if (!parcel) {
      return errorResponse(res, 'Parcel not found', 404)
    }

    return successResponse(res, parcel)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch parcel', 500)
  }
}

const getParcelsByProposal = async (req, res) => {
  try {
    const { proposalId } = req.params

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { id: true },
    })

    if (!proposal) {
      return errorResponse(res, 'Proposal not found', 404)
    }

    const parcels = await prisma.landParcel.findMany({
      where: { proposalId },
      include: {
        proposal: {
          select: {
            id: true,
            proposalNumber: true,
            projectName: true,
            state: true,
            district: true,
            status: true,
          },
        },
      },
    })

    return successResponse(res, parcels)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch parcels', 500)
  }
}

module.exports = {
  getParcels,
  getParcelById,
  getParcelsByProposal,
}
