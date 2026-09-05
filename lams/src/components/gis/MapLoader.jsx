
const MapLoader = ({ children, isLoading, error, retry }) => {
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-text-secondary mb-2">Failed to load map</p>
          {retry && (
            <button
              onClick={retry}
              className="px-4 py-2 text-sm rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-text-secondary">Loading interactive map...</p>
        </div>
      </div>
    )
  }

  return children
}

export default MapLoader
