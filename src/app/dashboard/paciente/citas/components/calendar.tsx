// oxlint-disable no-magic-numbers
'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import esLocale from '@fullcalendar/core/locales/es'
import { useState } from 'react'
import Modal from '@/app/components/ui/modal/modal'

export default function Calendar({ events = [] }: { events?: any[] }) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const handleEventClick = (info: any) => {
    setSelectedEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      ...info.event.extendedProps
    })
  }

  const closeModal = () => setSelectedEvent(null)

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView='dayGridMonth'
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridDay,timeGridWeek'
        }}
        height='auto'
        locale={esLocale}
        weekends={false}
        slotDuration='00:30:00'
        slotMinTime='07:00:00'
        slotMaxTime='21:00:00'
        events={events}
        eventClick={handleEventClick}
      />

      <Modal
        isOpen={!!selectedEvent}
        onClose={closeModal}
        title='Detalles de la Cita'
        maxWidth='sm'
      >
        {selectedEvent && (
          <div className='flex flex-col gap-4 text-sm font-secondary'>
            <div className='flex justify-between items-center border-b pb-2'>
              <span className='font-bold text-gray-500 uppercase text-xs tracking-wider'>
                Asunto
              </span>
              <span className='text-gray-900 font-semibold'>
                {selectedEvent.title}
              </span>
            </div>

            <div className='flex justify-between items-center border-b pb-2'>
              <span className='font-bold text-gray-500 uppercase text-xs tracking-wider'>
                Fecha
              </span>
              <span className='text-gray-900'>
                {selectedEvent.start?.toLocaleString('es-BO', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })}
              </span>
            </div>

            <div className='flex justify-between items-center border-b pb-2'>
              <span className='font-bold text-gray-500 uppercase text-xs tracking-wider'>
                Médico
              </span>
              <span className='text-gray-900'>{selectedEvent.doctor}</span>
            </div>

            <div className='flex justify-between items-center border-b pb-2'>
              <span className='font-bold text-gray-500 uppercase text-xs tracking-wider'>
                Estado
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                  selectedEvent.estado === 'PENDIENTE'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : selectedEvent.estado === 'CANCELADA'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : selectedEvent.estado === 'ABSORBIDA'
                        ? 'bg-violet-50 text-violet-700 border-violet-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {selectedEvent.estado}
              </span>
            </div>

            <div className='flex flex-col gap-1.5 mt-2'>
              <span className='font-bold text-gray-500 uppercase text-xs tracking-wider'>
                Observaciones
              </span>
              <p className='text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px] text-pretty'>
                {selectedEvent.observaciones ||
                  'No se registraron observaciones.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
