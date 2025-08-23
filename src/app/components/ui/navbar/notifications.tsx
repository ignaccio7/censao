import useAside from '@/hooks/useAside'
import { IconNotification } from '../../icons/icons'
import Aside from '../aside/aside'
import CardNotification from '@/app/dashboard/notificaciones/components/cardNotification'

const notifications = [
  {
    titulo: 'Cita para seguimiento Covid 19',
    mensaje:
      'Tu cita para el seguimiento del tratamiento Covid 19 esta programada para el dia 15 de septiembre de 2025',
    fecha_envio: '15 de septiembre de 2026',
    leido: false,
    medio: 'system'
  },
  {
    titulo: 'Cita para seguimiento Covid 19',
    mensaje:
      'Tu cita para el seguimiento del tratamiento Covid 19 esta programada para el dia 15 de septiembre de 2025',
    fecha_envio: '15 de septiembre de 2025',
    leido: false,
    medio: 'email'
  }
]

export default function Notifications() {
  const { aside, openAside, closeAside } = useAside()

  const handleClick = () => {
    if (aside) {
      closeAside()
    } else {
      openAside()
    }
  }

  return (
    <>
      <button
        className='text-gray-800 cursor-pointer p-1 hover:bg-gray-300 rounded-lg'
        onClick={handleClick}
      >
        <IconNotification />
      </button>

      <Aside title='Notificaciones' subtitle='2 nuevas notificaciones'>
        {notifications.map(notification => (
          <CardNotification
            key={notification.fecha_envio}
            icon={notification.medio}
            title={notification.titulo}
            isAside
          />
        ))}
      </Aside>
    </>
  )
}
