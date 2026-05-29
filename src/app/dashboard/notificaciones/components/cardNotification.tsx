import Icons from '@/app/components/icons'
import { getColorByNotification } from '../utils'

interface CardNotificationProps {
  icon: string
  title: string
  description?: string
  dateNotification?: string
  isAside?: boolean
  leido?: boolean
}

export default function CardNotification({
  icon,
  title,
  description,
  dateNotification,
  isAside = false,
  leido = true
}: CardNotificationProps) {
  console.log({
    icon,
    title,
    description,
    dateNotification,
    isAside,
    leido
  })

  const IconComponent = Icons[icon]

  const color = getColorByNotification(icon)

  return (
    <div
      className={`card-notification flex flex-row gap-2 items-start border border-dashed ${color.border} p-2 rounded-md hover:bg-gray-200 text-step-0 transition-colors ${!leido ? 'bg-blue-50' : ''}`}
    >
      <div className='image-notification relative shrink-0 mt-0.5'>
        <IconComponent
          size={`${!isAside ? '24' : '20'}`}
          className={`${color.bg} rounded-full text-white p-1`}
        />
      </div>
      <div className='content-notification w-full min-w-0'>
        <div
          className={`flex gap-1 justify-between flex-wrap items-start ${!isAside ? 'font-bold' : 'font-normal'}`}
        >
          <span className='truncate flex-1'>{title}</span>
          <div className='flex items-center gap-1 shrink-0'>
            {!leido && (
              <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white leading-none'>
                Nueva
              </span>
            )}
            {!isAside && dateNotification && (
              <small className='font-semibold text-gray-500 whitespace-nowrap'>
                {dateNotification}
              </small>
            )}
          </div>
        </div>
        {!isAside && description && (
          <p className='mt-1 text-gray-600 text-step--1 leading-snug'>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
