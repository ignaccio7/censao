'use client'
// oxlint-disable sort-keys
import { useEffect } from 'react'
import Title from '@/app/components/ui/title'
import CardNotification from './components/cardNotification'
import { useNotificaciones } from '@/app/services/notificaciones'
import { IconNotification } from '@/app/components/icons/icons'

function formatFechaEnvio(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export default function Page() {
  const { notificaciones, noLeidas, isLoading, marcarLeidas } =
    useNotificaciones()

  // Marcar todas como leídas al entrar a la página
  useEffect(() => {
    if (!isLoading && noLeidas > 0) {
      marcarLeidas.mutate()
    }
    // oxlint-disable-next-line exhaustive-deps
  }, [isLoading])

  return (
    <section className='notifications font-secondary'>
      <Title className='mb-2'>
        Tus notificaciones
        {noLeidas > 0 && (
          <span className='ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white'>
            {noLeidas} nuevas
          </span>
        )}
      </Title>

      {isLoading && (
        <div className='flex flex-col gap-2'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='h-14 rounded-md bg-gray-200 animate-pulse'
            />
          ))}
        </div>
      )}

      {!isLoading && notificaciones.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-gray-400 gap-2'>
          <span className='text-4xl'>
            <IconNotification size='48' />{' '}
          </span>
          <p className='text-step-0'>No tienes notificaciones aún</p>
        </div>
      )}

      {!isLoading && notificaciones.length > 0 && (
        <div className='content-notifications flex flex-col gap-2'>
          {notificaciones.map(notification => (
            <CardNotification
              key={notification.id}
              title={notification.titulo}
              description={notification.mensaje}
              dateNotification={formatFechaEnvio(notification.fecha_envio)}
              icon={notification.medio}
              leido={notification.leido}
            />
          ))}
        </div>
      )}
    </section>
  )
}
