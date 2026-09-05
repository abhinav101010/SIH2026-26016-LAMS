const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <div
        className={`${sizeMap[size]} border-3 border-primary border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-text-secondary">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
