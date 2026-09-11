import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet'
import MapClickHandler from './MapClickHandler'
import { polygon, area } from '@turf/turf'
import 'leaflet/dist/leaflet.css'

const AFFEcted_AREA_CENTER = [20.5937, 78.9629]

const toGeoJSONPolygon = (coordinates) => {
  const ring = coordinates.map(([lat, lng]) => [lng, lat])
  if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
    ring.push(ring[0])
  }
  return JSON.stringify({ type: 'Polygon', coordinates: [ring] })
}

const createGeoJSONPolygon = (coordinates) => {
  const ring = coordinates.map(([lat, lng]) => [lng, lat])
  if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
    ring.push(ring[0])
  }
  return { type: 'Polygon', coordinates: [ring] }
}

const calculatePolygonArea = (coords) => {
  if (coords.length < 3) return 0
  const geoJSON = createGeoJSONPolygon(coords)
  const poly = polygon(geoJSON.coordinates)
  const areaM2 = area(poly)
  return areaM2 / 10000 // hectares
}

const calculateCircleArea = (radiusMeters) => {
  if (!radiusMeters) return 0
  const areaM2 = Math.PI * radiusMeters * radiusMeters
  return areaM2 / 10000 // hectares
}

const MapController = ({ onReady }) => {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)
    onReady(map)
    return () => clearTimeout(timer)
  }, [map, onReady])
  return null
}

const AffectedAreaMap = ({ affectedArea, onAreaChange }) => {
  const [drawingMode, setDrawingMode] = useState(null)
  const [tempPoints, setTempPoints] = useState([])
  const [circleCenter, setCircleCenter] = useState(null)
  const [circleRadius, setCircleRadius] = useState(null)
  const [mapKey, setMapKey] = useState(0)
  const mapInstanceRef = useRef(null)
  const initializedRef = useRef(false)

  const parsedArea = useMemo(() => {
    if (!affectedArea) return null
    try {
      return typeof affectedArea === 'string' ? JSON.parse(affectedArea) : affectedArea
    } catch {
      return null
    }
  }, [affectedArea])

  const handleMapReady = useCallback((map) => {
    mapInstanceRef.current = map
    if (!initializedRef.current) {
      initializedRef.current = true
      const timer = setTimeout(() => {
        map.invalidateSize()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleMapClick = useCallback(
    (e) => {
      if (!drawingMode) return
      const { lat, lng } = e.latlng

      if (drawingMode === 'polygon') {
        setTempPoints((prev) => [...prev, [lat, lng]])
        return
      }

      if (drawingMode === 'circle') {
        if (!circleCenter) {
          setCircleCenter([lat, lng])
          setCircleRadius(null)
          return
        }
        const [cLat, cLng] = circleCenter
        const R = 6371000
        const dLat = (lat - cLat) * Math.PI / 180
        const dLng = (lng - cLng) * Math.PI / 180
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(cLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const radius = R * c
        setCircleRadius(radius)
        const area = calculateCircleArea(radius)
        onAreaChange({
          type: 'Circle',
          center: { lat: cLat, lng: cLng },
          radius,
          area,
        })
        setDrawingMode(null)
        setCircleCenter(null)
        setTempPoints([])
      }
    },
    [drawingMode, circleCenter, onAreaChange]
  )

  const finishPolygon = useCallback(() => {
    if (tempPoints.length >= 3) {
      const area = calculatePolygonArea(tempPoints)
      const geometry = toGeoJSONPolygon(tempPoints)
      onAreaChange({
        type: 'Polygon',
        coordinates: tempPoints,
        geometry,
        area,
      })
      setTempPoints([])
      setDrawingMode(null)
    }
  }, [tempPoints, onAreaChange])

  const clearArea = useCallback(() => {
    onAreaChange(null)
    setTempPoints([])
    setDrawingMode(null)
    setCircleCenter(null)
    setCircleRadius(null)
    initializedRef.current = false
    setMapKey((k) => k + 1)
  }, [onAreaChange])

  const polygonArea = useMemo(() => {
    if (tempPoints.length >= 3) return calculatePolygonArea(tempPoints)
    return null
  }, [tempPoints])

  const displayArea = useMemo(() => {
    if (parsedArea?.type === 'Polygon') {
      return parsedArea.area || 0
    }
    if (parsedArea?.type === 'Circle') {
      return calculateCircleArea(parsedArea.radius || 0)
    }
    return null
  }, [parsedArea])

  const circlePositions = useMemo(() => {
    if (!circleCenter || !circleRadius) return []
    const points = []
    const [lat, lng] = circleCenter
    const R = 6371000
    const earthRadius = R / 1000
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * 2 * Math.PI
      const dx = circleRadius / 1000 * Math.cos(angle)
      const dy = circleRadius / 1000 * Math.sin(angle)
      const latOffset = (dy / earthRadius) * (180 / Math.PI)
      const lngOffset = (dx / (earthRadius * Math.cos(lat * Math.PI / 180))) * (180 / Math.PI)
      points.push([lat + latOffset, lng + lngOffset])
    }
    return points
  }, [circleCenter, circleRadius])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => { setDrawingMode(drawingMode === 'polygon' ? null : 'polygon'); setCircleCenter(null); setCircleRadius(null); setTempPoints([]) }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${drawingMode === 'polygon' ? 'bg-primary text-white shadow-clay-btn' : 'bg-surface border border-border text-text-secondary hover:text-foreground'}`}
        >
          Draw Polygon
        </button>
        <button
          type="button"
          onClick={() => { setDrawingMode(drawingMode === 'circle' ? null : 'circle'); setTempPoints([]); setCircleCenter(null); setCircleRadius(null) }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${drawingMode === 'circle' ? 'bg-primary text-white shadow-clay-btn' : 'bg-surface border border-border text-text-secondary hover:text-foreground'}`}
        >
          Draw Circle
        </button>
        <button
          type="button"
          onClick={clearArea}
          disabled={!parsedArea && tempPoints.length === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-surface border border-border text-text-secondary hover:text-foreground disabled:opacity-50"
        >
          Clear Area
        </button>
      </div>

      {drawingMode === 'polygon' && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-text-secondary">
          <strong className="text-foreground">Polygon:</strong> Click points on the map to draw the affected area.
          {tempPoints.length > 0 && <span className="ml-2">({tempPoints.length} points)</span>}
          {tempPoints.length >= 3 && (
            <button type="button" onClick={finishPolygon} className="ml-3 px-2 py-1 bg-primary text-white rounded-lg text-xs">
              Finish Polygon
            </button>
          )}
        </div>
      )}

      {drawingMode === 'circle' && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-text-secondary">
          <strong className="text-foreground">Circle:</strong>
          {!circleCenter ? 'Click on the map to set the center.' : 'Click again to set the radius.'}
        </div>
      )}

      {(polygonArea !== null || displayArea !== null) && (
        <div className="p-3 bg-surface border border-border rounded-xl text-xs text-text-secondary">
          <span className="font-medium text-foreground">Affected Area: </span>
          {parsedArea?.type === 'Polygon' && `${parsedArea.area?.toFixed(2) || 0} ha`}
          {parsedArea?.type === 'Circle' && `${displayArea?.toFixed(2) || 0} ha`}
          {tempPoints.length >= 3 && !parsedArea && `${polygonArea.toFixed(2)} ha`}
          {parsedArea?.type === 'Circle' && (
            <span className="ml-2 text-text-tertiary">(Radius: {Math.round(parsedArea.radius || 0)} m)</span>
          )}
        </div>
      )}

      {parsedArea && (
        <div className="p-2 bg-success-500/10 border border-success-500/30 rounded-xl text-xs text-success-700">
          Affected area defined ({parsedArea.type})
        </div>
      )}

      <div className="h-[360px] w-full rounded-xl overflow-hidden relative">
        <MapContainer
          key={mapKey}
          center={AFFEcted_AREA_CENTER}
          zoom={5}
          style={{ height: '100%', width: '100%', background: 'hsl(var(--color-surface))' }}
          zoomControl
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <MapController onReady={handleMapReady} />
          <MapClickHandler onClick={handleMapClick} enabled={!!drawingMode} />

          {tempPoints.length >= 3 && (
            <Polygon
              positions={tempPoints}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.35,
                weight: 2,
              }}
            />
          )}

          {circlePositions.length > 0 && (
            <Polygon
              positions={circlePositions}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.35,
                weight: 2,
              }}
            />
          )}

          {circleCenter && (
            <Marker position={circleCenter}>
              <Popup>Center</Popup>
            </Marker>
          )}

          {parsedArea?.type === 'Polygon' && parsedArea.coordinates && (
            <Polygon
              positions={parsedArea.coordinates}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-semibold">Affected Area</p>
                  <p>Type: Polygon</p>
                  <p>Area: {parsedArea.area?.toFixed(2) || 0} ha</p>
                </div>
              </Popup>
            </Polygon>
          )}

          {parsedArea?.type === 'Circle' && parsedArea.center && (
            <Marker position={[parsedArea.center.lat, parsedArea.center.lng]}>
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-semibold">Affected Area</p>
                  <p>Type: Circle</p>
                  <p>Radius: {Math.round(parsedArea.radius || 0)} m</p>
                   <p>Area: {(parsedArea.area || 0).toFixed(2)} ha</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}

export default AffectedAreaMap
