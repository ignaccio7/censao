'use client'
import { useEffect } from 'react'
import useAside from '@/hooks/useAside'
import { IconNotification } from '../../icons/icons'
import Aside from '../aside/aside'
import CardNotification from '@/app/dashboard/notificaciones/components/cardNotification'
import { useNotificaciones } from '@/app/services/notificaciones'
import useUser from '@/hooks/useUser'
import { Roles } from '@/app/api/lib/constants'

export default function Notifications() {
  const { aside, openAside, closeAside } = useAside()
  const { user } = useUser()
  const { notificaciones, noLeidas, isLoading, marcarLeidas } =
    useNotificaciones()

  const handleClick = () => {
    if (aside) {
      closeAside()
    } else {
      openAside()
    }
  }

  // Marcar como leídas al abrir el aside
  useEffect(() => {
    if (aside && noLeidas > 0) {
      marcarLeidas.mutate()
    }
    // oxlint-disable-next-line exhaustive-deps
  }, [aside])

  // La campana solo es visible para PACIENTE
  if (user?.role !== Roles.PACIENTE) return null

  const subtitleText = isLoading
    ? 'Cargando...'
    : noLeidas > 0
      ? `${noLeidas} nueva${noLeidas > 1 ? 's' : ''}`
      : 'Sin notificaciones nuevas'

  return (
    <>
      <button
        className='text-gray-800 cursor-pointer p-1 hover:bg-gray-300 rounded-lg relative'
        onClick={handleClick}
        aria-label='Abrir notificaciones'
      >
        <IconNotification />
        {noLeidas > 0 && (
          <span className='absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold leading-4 text-center'>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      <Aside title='Notificaciones' subtitle={subtitleText}>
        {isLoading && (
          <div className='flex flex-col gap-2'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='h-10 rounded-md bg-gray-200 animate-pulse'
              />
            ))}
          </div>
        )}

        {!isLoading && notificaciones.length === 0 && (
          <p className='text-gray-400 text-step--1 text-center py-4'>
            No tienes notificaciones
          </p>
        )}

        {!isLoading &&
          notificaciones.map(notification => (
            <CardNotification
              key={notification.id}
              icon={notification.medio}
              title={notification.titulo}
              leido={notification.leido}
              isAside
            />
          ))}
      </Aside>
    </>
  )
}
