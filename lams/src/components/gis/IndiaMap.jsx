import { MapContainer, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { INDIA_CENTER } from './mapConstants'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.1/images/marker-shadow.png',
})

export const IndiaMap = ({
  center = INDIA_CENTER,
  zoom = 4.5,
  _markers = [],
  height = '500px',
  className = '',
  children,
  _onMarkerClick,
  _onPolygonClick,
}) => {
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl clay-inner ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: 'hsl(var(--color-surface))' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.openstreetmap.org/copyright">OpenTopoMap</a>'
          key="osm"
        />
        {children}
      </MapContainer>
    </div>
  )
}

export default IndiaMap
