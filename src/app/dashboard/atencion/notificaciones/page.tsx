'use client'

import Title from '@/app/components/ui/title'
import { IconSchedule, IconSpin } from '@/app/components/icons/icons'
import { useAdminNotificaciones } from '@/app/services/notificaciones'

export default function NotificacionesAdminPage() {
  const { enviarRecordatorios } = useAdminNotificaciones()

  return (
    <section className='admin-notificaciones font-secondary'>
      <Title className='mb-4'>Reenviar Notificaciones</Title>

      <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 max-w-3xl'>
        <h2 className='text-xl font-bold text-gray-800'>
          Recordatorio de Citas
        </h2>
        <p className='text-gray-600 text-step-0'>
          Esta acción buscará todas las citas en estado{' '}
          <strong>PENDIENTE</strong> para las próximas 24 horas y enviará
          notificaciones de recordatorio a cada paciente mediante el sistema.
        </p>
        <p className='text-gray-600 text-step-0'>
          Esta función también se ejecuta de forma automática cada noche a
          través de una tarea programada (cron job), pero puedes usar este botón
          para ejecutarla manualmente si es necesario.
        </p>

        <div className='actions mt-4'>
          <button
            className={`flex gap-2 items-center border-2 py-2 px-4 text-step-1 rounded-lg transition-colors duration-200 cursor-pointer ${
              enviarRecordatorios.isPending
                ? 'border-secondary-400 bg-secondary-50 text-secondary-500 cursor-not-allowed opacity-70'
                : 'border-secondary-600 text-secondary-600 hover:bg-secondary-600 hover:text-white'
            }`}
            onClick={() => enviarRecordatorios.mutate()}
            disabled={enviarRecordatorios.isPending}
            title='Enviar notificaciones de recordatorio para citas próximas'
          >
            {enviarRecordatorios.isPending ? (
              <IconSpin className='animate-spin ' />
            ) : (
              <IconSchedule />
            )}
            {enviarRecordatorios.isPending
              ? 'Enviando recordatorios...'
              : 'Enviar recordatorios de citas'}
          </button>
        </div>
      </div>
    </section>
  )
}
