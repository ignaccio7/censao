import Icons from '@/app/components/icons'
import { getColorByNotification } from '../utils'

interface CardNotificationProps {
  icon: string
  title: string
  description?: string
  dateNotification?: string
  isAside?: boolean
}

export default function CardNotification({
  icon,
  title,
  description,
  dateNotification,
  isAside = false
}: CardNotificationProps) {
  const IconComponent = Icons[icon]

  const color = getColorByNotification(icon)

  return (
    <div
      className={`card-notification flex flex-row gap-2 items-center border border-dashed border-${color} p-2 rounded-md hover:bg-gray-200 text-step-0`}
    >
      <div className='image-notification relative'>
        <IconComponent
          size={`${!isAside ? '24' : '20'}`}
          className={`bg-${color} rounded-full text-white p-1`}
        />
      </div>
      <div className='content-notification w-full'>
        <h2
          className={`flex gap-1 justify-between flex-wrap ${!isAside ? 'font-bold' : 'font-normal'}`}
        >
          {title}
          {!isAside && (
            <small className='font-semibold'>{dateNotification}</small>
          )}
        </h2>
        {!isAside && <p>{description}</p>}
      </div>
    </div>
  )
}
