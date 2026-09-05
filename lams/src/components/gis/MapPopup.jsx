import { formatArea, formatCurrency, calculateProgress } from '../../utils/formatters'

const MapPopup = ({ project }) => {
  const progress = calculateProgress(project.acquired || project.area * 0.5, project.area)

  return (
    <div className="w-64">
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-foreground text-sm">{project.name}</h4>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: 'hsla(34, 100%, 52%, 0.1)',
            color: 'hsl(25, 81%, 58%)',
          }}
        >
          {project.statusText}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div>
          <span className="text-text-secondary">State</span>
          <span className="block font-medium text-foreground">{project.state}</span>
        </div>
        <div>
          <span className="text-text-secondary">District</span>
          <span className="block font-medium text-foreground">{project.district}</span>
        </div>
        <div>
          <span className="text-text-secondary">Area</span>
          <span className="block font-medium text-foreground">{formatArea(project.area)}</span>
        </div>
        <div>
          <span className="text-text-secondary">Progress</span>
          <span className="block font-medium text-foreground">{progress}%</span>
        </div>
        <div>
          <span className="text-text-secondary">Budget</span>
          <span className="block font-medium text-foreground">{formatCurrency(project.budget)}</span>
        </div>
        <div>
          <span className="text-text-secondary">Target</span>
          <span className="block font-medium text-foreground">{project.target}</span>
        </div>
      </div>

      <div className="mt-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: progress >= 75 ? '#10B981' : progress >= 40 ? '#F59E0B' : '#EF4444',
          }}
        />
      </div>

      <button className="mt-3 w-full px-3 py-1.5 text-xs font-medium text-center text-white bg-primary rounded-lg hover:bg-primary-hover transition-all">
        View Details →
      </button>
    </div>
  )
}

export default MapPopup
