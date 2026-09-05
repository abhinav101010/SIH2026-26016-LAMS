import { useEffect } from 'react'
import { useMap, Marker, Popup, Polygon } from 'react-leaflet'
import { icon } from 'leaflet'

export const MapMarker = ({ position, popup, onClick, color = 'primary' }) => {
  const getColor = () => {
    const colorMap = {
      primary: '#4F46E5',
      secondary: '#0D9488',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      violet: '#8B5CF6',
      saffron: '#D97706',
    }
    return colorMap[color] || colorMap.primary
  }

  const markerIcon = icon({
    html: `
      <div style="
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${getColor()};
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: scale(1);
      "></div>
    `,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 20],
  })

  return (
    <Marker position={position} icon={markerIcon} eventHandlers={{ click: onClick }}>
      {popup && (
        <Popup className="clay-popup" maxWidth={320}>
          {popup}
        </Popup>
      )}
    </Marker>
  )
}

export const MapPolygon = ({ positions, color = 'primary', fillOpacity = 0.3, stroke = true, popup, onClick, interactive = true }) => {
  const getColor = () => {
    const colorMap = {
      primary: '#4F46E5',
      secondary: '#0D9488',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      violet: '#8B5CF6',
      saffron: '#D97706',
      acquired: '#10B981',
      pending: '#F59E0B',
      disputed: '#EF4444',
      notification: '#3B82F6',
      award: '#D97706',
    }
    return colorMap[color] || colorMap.primary
  }

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: stroke ? getColor() : 'transparent',
        fillColor: getColor(),
        fillOpacity: fillOpacity,
        weight: 2,
        smoothFactor: 1,
        opacity: 0.9,
      }}
      eventHandlers={interactive ? { click: onClick } : undefined}
    >
      {popup && <Popup>{popup}</Popup>}
    </Polygon>
  )
}

export const MapControls = ({ _onControlClick }) => {
  const map = useMap()

  const handleZoomIn = () => map.zoomIn()
  const handleZoomOut = () => map.zoomOut()
  const handleFullscreen = () => {
    const container = map.getContainer()
    if (container.requestFullscreen) {
      container.requestFullscreen()
    }
  }

  return (
    <div className="absolute top-4 right-4 z-500 flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-surface transition-all shadow-clay-sm"
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-surface transition-all shadow-clay-sm"
      >
        −
      </button>
      <button
        onClick={handleFullscreen}
        className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-surface transition-all shadow-clay-sm"
      >
        ⛶
      </button>
    </div>
  )
}

export const LocationMarker = ({ position, _onMove }) => {
  const map = useMap()
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true })
  }, [position, map])
  return null
}
