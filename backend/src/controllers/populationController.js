const { successResponse, errorResponse } = require('../utils/response')
const turf = require('@turf/turf')

const calculatePolygonAreaKm2 = (geometry) => {
  if (!geometry || !geometry.coordinates || geometry.coordinates.length < 3) return 0
  const ring = geometry.coordinates.map(([lat, lng]) => [lng, lat])
  if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
    ring.push(ring[0])
  }
  const polygon = turf.polygon([ring])
  const areaM2 = turf.area(polygon)
  return areaM2 / 1000000
}

const calculateCircleAreaKm2 = (center, radiusMeters) => {
  if (!center || !radiusMeters) return 0
  const areaM2 = Math.PI * radiusMeters * radiusMeters
  return areaM2 / 1000000
}

const getAffectedPopulation = async (req, res) => {
  try {
    const { geometry } = req.body

    if (!geometry || !geometry.type) {
      return errorResponse(res, 'Geometry is required', 400)
    }

    let areaKm2 = 0
    if (geometry.type === 'Polygon') {
      if (!geometry.coordinates || geometry.coordinates.length < 3) {
        return errorResponse(res, 'Invalid polygon coordinates: need at least 3 points', 400)
      }
      areaKm2 = calculatePolygonAreaKm2(geometry)
    } else if (geometry.type === 'Circle') {
      if (!geometry.center || !geometry.radius) {
        return errorResponse(res, 'Circle requires center and radius', 400)
      }
      areaKm2 = calculateCircleAreaKm2(geometry.center, geometry.radius)
    } else {
      return errorResponse(res, 'Unsupported geometry type. Use Polygon or Circle.', 400)
    }

    if (areaKm2 <= 0) {
      return errorResponse(res, 'Invalid area calculated from geometry', 400)
    }

    const averageDensity = 5000
    const population = Math.round(areaKm2 * averageDensity)
    const averageHouseholdSize = 4.2
    const affectedFamilies = Math.round(population / averageHouseholdSize)
    const populationDensity = Math.round(population / areaKm2)

    return successResponse(res, {
      areaKm2: Math.round(areaKm2 * 100) / 100,
      population,
      populationDensity,
      affectedFamilies,
      dataSource: 'estimated',
    })
  } catch (error) {
    console.error('Population calculation error:', error)
    return errorResponse(res, 'Failed to calculate population', 500)
  }
}

module.exports = {
  getAffectedPopulation,
}
