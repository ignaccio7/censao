'use client'

interface Step {
  id: string
  title: string
  description: string
}

interface StepperIndicatorProps {
  steps: Step[]
  currentIndex: number
}

export default function StepperIndicator({
  steps,
  currentIndex
}: StepperIndicatorProps) {
  return (
    <div className='w-full mb-8'>
      <div className='flex items-center justify-between relative'>
        {/* Línea de fondo */}
        <div className='absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0' />

        {/* Línea de progreso */}
        <div
          className='absolute top-5 left-0 h-0.5 bg-primary-600 z-0 transition-all duration-500 ease-in-out'
          style={{
            width:
              currentIndex === 0
                ? '0%'
                : `${(currentIndex / (steps.length - 1)) * 100}%`
          }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isPending = index > currentIndex

          // TODO ver esto flujo usuarios
          console.log(isPending)

          return (
            <div
              key={step.id}
              className='flex flex-col items-center gap-2 z-10'
            >
              {/* Círculo del paso */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                    : isCurrent
                      ? 'bg-white border-primary-600 text-primary-600 shadow-lg ring-4 ring-primary-100'
                      : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2.5}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Texto del paso */}
              <div className='text-center hidden sm:block'>
                <p
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isCurrent
                      ? 'text-primary-700'
                      : isCompleted
                        ? 'text-primary-500'
                        : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-xs transition-colors duration-300 ${
                    isCurrent ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Texto del paso actual en mobile */}
      <div className='sm:hidden mt-4 text-center'>
        <p className='text-sm font-semibold text-primary-700'>
          Paso {currentIndex + 1} de {steps.length}:{' '}
          {steps[currentIndex]?.title}
        </p>
        <p className='text-xs text-gray-500'>
          {steps[currentIndex]?.description}
        </p>
      </div>
    </div>
  )
}
