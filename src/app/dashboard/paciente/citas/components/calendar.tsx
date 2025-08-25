// oxlint-disable no-magic-numbers
'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import esLocale from '@fullcalendar/core/locales/es'
import { useRouter } from 'next/navigation'

const today = new Date()

const reservationsForUser = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Vacuna COVID-19',
    start: (() => {
      const date = new Date(today)
      date.setDate(today.getDate() + 1)
      date.setHours(9, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date(today)
      date.setDate(today.getDate() + 1)
      date.setHours(9, 30, 0, 0)
      return date
    })()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Vacuna Influenza',
    start: (() => {
      const date = new Date(today)
      date.setDate(today.getDate() + 2)
      date.setHours(10, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date(today)
      date.setDate(today.getDate() + 2)
      date.setHours(10, 30, 0, 0)
      return date
    })()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Vacuna COVID-19',
    start: (() => {
      const date = new Date(today)
      date.setDate(today.getDate() + 7)
      date.setHours(14, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date(today)
      date.setDate(today.getDate() + 7)
      date.setHours(14, 30, 0, 0)
      return date
    })()
  }
]

export default function Calendar() {
  const router = useRouter()

  const goToTreatment = (info: any) => {
    console.log('info')
    console.log(info.event)
    router.replace(`/dashboard/paciente/tratamientos/${info.event.id}`)
  }

  return (
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
      events={reservationsForUser}
      eventClick={goToTreatment}
    />
  )
}
