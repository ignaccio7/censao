// oxlint-disable sort-keys
import Title from '@/app/components/ui/title'
import CardNotification from './components/cardNotification'

export interface NotificacionProps {
  // id: string
  // paciente_id: string
  titulo: string
  mensaje: string
  fecha_envio: string
  leido: boolean
  medio: string
  // tratamiento_id: string
}

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

export default function Page() {
  return (
    <section className='notifications font-secondary'>
      <Title className='mb-2'>Tus notificaciones</Title>
      <div className='content-notifications flex flex-col gap-2'>
        {notifications.map(notification => {
          console.log('a')

          return (
            <CardNotification
              key={notification.fecha_envio}
              title={notification.titulo}
              description={notification.mensaje}
              dateNotification={notification.fecha_envio}
              icon={notification.medio}
            />
          )
        })}
      </div>
    </section>
  )
}
