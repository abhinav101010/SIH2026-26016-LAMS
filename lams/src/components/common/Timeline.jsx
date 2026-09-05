import { Check, Circle } from 'lucide-react'

const Timeline = ({ stages, currentStage, className = '' }) => {
  const currentIndex = stages.findIndex((s) => s.id === currentStage)

  const getStatus = (index) => {
    if (index < currentIndex) return 'complete'
    if (index === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className={'relative py-8 ' + className}>
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-0">
        {stages.map((stage, index) => {
          const status = getStatus(index)

          return (
            <div key={stage.id} className="relative mb-6 last:mb-0">
              <div
                className={`
                  absolute left-[-12px] top-0 z-10 flex items-center justify-center
                  w-6 h-6 rounded-full border-2 transition-all duration-300
                  ${status === 'complete'
                    ? 'bg-primary border-primary text-white'
                    : status === 'current'
                      ? 'bg-white dark:bg-neutral-800 border-primary text-primary'
                      : 'bg-white dark:bg-neutral-800 border-border text-text-tertiary'}
                `}
              >
                {status === 'complete' ? (
                  <Check size={12} />
                ) : status === 'current' ? (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                ) : (
                  <Circle size={8} />
                )}
              </div>

              <div className="ml-12">
                <div
                  className={`
                    clay-card p-4 transition-all duration-300
                    ${status === 'complete'
                      ? 'bg-primary/5 border border-primary/20'
                      : status === 'current'
                        ? 'border-2 border-primary/30 bg-card'
                        : 'border border-border bg-card'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4
                        className={`
                          text-sm font-medium
                          ${status === 'complete' ? 'text-foreground' : status === 'current' ? 'text-primary' : 'text-text-secondary'}
                        `}
                      >
                        {stage.label}
                        {status === 'current' && (
                          <span className="ml-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </h4>
                      {stage.description && (
                        <p className="text-xs text-text-tertiary mt-1.5">{stage.description}</p>
                      )}
                    </div>

                    <div className="text-right">
                      {status === 'complete' && (
                        <span className="text-xs text-success-600 font-medium">✓ Completed</span>
                      )}
                      {status === 'current' && (
                        <span className="text-xs text-primary font-medium">In Progress</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
