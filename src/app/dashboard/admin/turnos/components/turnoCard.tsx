'use client'

import { useState } from 'react'
import { IconClock, IconPencil } from '@/app/components/icons/icons'
import ModalEditarTurno from './modalEditarTurno'

interface TurnoCardProps {
  turno: {
    codigo: string
    nombre: string
    hora_inicio: string // ISO string — se parsea en el componente
    hora_fin: string
  }
}

// Extrae "HH:MM" de un ISO string que viene de un campo Time de Prisma
function isoToHHMM(iso: string): string {
  // Prisma serializa Time como "1970-01-01T07:00:00.000Z" o similar
  const date = new Date(iso)
  // Los datos están en UTC, necesitamos hora Bolivia (UTC-4)
  let boliviaHour = date.getUTCHours() - 4
  if (boliviaHour < 0) boliviaHour += 24

  const horas = String(boliviaHour).padStart(2, '0')
  const minutos = String(date.getUTCMinutes()).padStart(2, '0')
  return `${horas}:${minutos}`
}

export default function TurnoCard({ turno }: TurnoCardProps) {
  const [modalAbierto, setModalAbierto] = useState(false)

  const inicio = isoToHHMM(turno.hora_inicio)
  const fin = isoToHHMM(turno.hora_fin)

  return (
    <>
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
              {turno.codigo}
            </span>
            <h3 className='text-base font-bold text-gray-800 mt-0.5'>
              {turno.nombre}
            </h3>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className='p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer'
            title='Editar turno'
          >
            <IconPencil />
          </button>
        </div>

        {/* Horario */}
        <div className='flex items-center gap-2 text-gray-600'>
          <IconClock />
          <span className='text-sm font-medium'>
            {inicio} — {fin}
          </span>
        </div>

        {/* Barra visual del horario */}
        <HorarioBarra inicio={inicio} fin={fin} />
      </div>

      {/* Modal de edición */}
      {modalAbierto && (
        <ModalEditarTurno
          turno={{ ...turno, hora_inicio: inicio, hora_fin: fin }}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </>
  )
}

// Barra visual proporcional al horario dentro del día (0–24h)
function HorarioBarra({ inicio, fin }: { inicio: string; fin: string }) {
  const toMinutos = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number)
    return h * 60 + m
  }
  const totalDia = 24 * 60
  const minInicio = toMinutos(inicio)
  const minFin = toMinutos(fin)
  const left = (minInicio / totalDia) * 100
  const width = ((minFin - minInicio) / totalDia) * 100

  return (
    <div className='relative h-2 bg-gray-100 rounded-full overflow-hidden'>
      <div
        className='absolute h-full bg-primary-400 rounded-full'
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  )
}
