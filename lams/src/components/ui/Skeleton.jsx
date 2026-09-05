export const ClaySkeleton = ({ className = '', children, ...props }) => (
  <div
    className={`
      animate-pulse bg-neutral-200 rounded-xl
      ${children ? 'relative' : className}
    `}
    {...props}
  >
    {children}
  </div>
)

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-neutral-200 rounded animate-pulse"
        style={{ width: `${100 - i * 8}%` }}
      />
    ))}
  </div>
)

export const SkeletonCard = () => (
  <div className="bg-neutral-200 rounded-2xl p-6 animate-pulse">
    <div className="space-y-3">
      <div className="h-4 bg-neutral-300 rounded w-3/4" />
      <div className="h-6 bg-neutral-300 rounded w-1/2" />
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-neutral-300 rounded" />
        <div className="h-3 bg-neutral-300 rounded w-5/6" />
        <div className="h-3 bg-neutral-300 rounded w-4/6" />
      </div>
    </div>
  </div>
)

export const SkeletonChart = ({ className = '' }) => (
  <div className={`bg-neutral-200 rounded-2xl animate-pulse ${className}`}>
    <div className="h-64 w-full" />
  </div>
)

export const SkeletonMap = ({ className = '' }) => (
  <div className={`bg-neutral-200 rounded-2xl overflow-hidden animate-pulse relative ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-b from-neutral-200 to-neutral-300" />
  </div>
)

export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-5 gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 bg-neutral-200 rounded animate-pulse" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-5 gap-4">
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className={`h-10 bg-neutral-200 rounded animate-pulse`} />
        ))}
      </div>
    ))}
  </div>
)

export default ClaySkeleton
