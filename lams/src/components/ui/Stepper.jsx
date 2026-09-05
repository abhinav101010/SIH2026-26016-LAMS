import { motion } from 'framer-motion'

const Stepper = ({ steps, currentStep, onChange }) => {
  const handleStepClick = (stepNum) => {
    if (stepNum <= currentStep + 1 && onChange) {
      onChange(stepNum)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNum = index + 1
          const isActive = currentStep === stepNum
          const isCompleted = currentStep > stepNum

          return (
            <div key={stepNum} className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleStepClick(stepNum)}
                disabled={stepNum > currentStep + 1}
                className={`
                  relative z-10 flex items-center justify-center
                  w-10 h-10 rounded-full text-sm font-medium
                  transition-all duration-300
                  ${isCompleted
                    ? 'bg-primary text-white shadow-clay-btn'
                    : isActive
                      ? 'bg-primary text-white shadow-clay-btn'
                      : 'bg-surface text-text-tertiary border border-border'}
                  ${stepNum > currentStep + 1 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                `}
              >
                {step.icon && <step.icon size={18} />}
                {!step.icon && stepNum}
              </motion.button>

              <div className="flex flex-col ml-3">
                <span className={`text-sm font-medium ${isCompleted || isActive ? 'text-foreground' : 'text-text-tertiary'}`}>
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-xs text-text-tertiary mt-0.5 max-w-32 truncate">
                    {step.description}
                  </span>
                )}
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-border mx-4 relative">
                  <div
                    className={`absolute inset-0 h-px transition-all duration-500 ${isCompleted ? 'bg-primary' : 'bg-border'}`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Stepper
