import { useMapEvents } from 'react-leaflet'

const MapClickHandler = ({ onClick, enabled }) => {
  useMapEvents({
    click: (e) => {
      if (enabled) onClick(e)
    },
  })
  return null
}

export default MapClickHandler
