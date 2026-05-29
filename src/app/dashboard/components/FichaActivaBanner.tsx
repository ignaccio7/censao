'use client'
import Link from 'next/link'
import { useFichaHoy } from '@/app/services/paciente-ficha'
import { StateRecord } from '@/lib/constants'

// Helper de color según estado
const getColorByEstado = (estado: string) => {
  switch (estado) {
    case StateRecord.ADMISION:
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-700',
        label: 'En admisión'
      }
    case StateRecord.ENFERMERIA:
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-400',
        text: 'text-amber-700',
        label: 'Pasar a enfermería'
      }
    case StateRecord.EN_ESPERA:
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-400',
        text: 'text-blue-700',
        label: 'En espera'
      }
    case StateRecord.ATENDIENDO:
      return {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-700',
        label: '¡Te están llamando al consultorio!'
      }
    case StateRecord.CANCELADA:
      return {
        bg: 'bg-red-50',
        border: 'border-red-400',
        text: 'text-red-700',
        label: 'Ficha cancelada'
      }
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        text: 'text-gray-600',
        label: estado
      }
  }
}

export default function FichaActivaBanner() {
  const { data: ficha, isLoading } = useFichaHoy()

  if (isLoading || !ficha) return null

  const color = getColorByEstado(ficha.estado)
  const nroLabel = ficha.es_programada
    ? `${ficha.nro_ficha} (c)`
    : `#${ficha.nro_ficha}`

  return (
    <div
      className={`mb-6 p-4 md:p-5 rounded-xl border-2 flex flex-col sm:flex-row items-center gap-4 ${color.bg} ${color.border} shadow-sm transition-all`}
    >
      {/* Icono / Número (pulsa cuando ATENDIENDO) */}
      <div
        className={`shrink-0 w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-sm font-black text-2xl ${color.text} ${ficha.estado === StateRecord.ATENDIENDO ? 'animate-pulse bg-green-200' : 'bg-white/60'}`}
      >
        {nroLabel}
      </div>

      <div className='flex-1 text-center sm:text-left'>
        <h3 className={`font-bold text-lg ${color.text}`}>
          Tu ficha de hoy — Turno {ficha.turno_label}
        </h3>

        <p className={`font-medium ${color.text} mt-1`}>
          Estado: <span className='font-bold'>{color.label}</span>
          {ficha.doctor_nombre && ` · ${ficha.doctor_nombre}`}
          {ficha.especialidad_nombre && ` (${ficha.especialidad_nombre})`}
        </p>

        {ficha.estado === StateRecord.CANCELADA && (
          <p className='text-sm mt-1 text-red-600'>
            Comunícate con recepción si crees que esto es un error.
          </p>
        )}
      </div>

      {ficha.estado !== StateRecord.CANCELADA && (
        <div className='shrink-0 w-full sm:w-auto mt-2 sm:mt-0'>
          <Link
            href='/atencion'
            className={`block w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-center transition-colors text-white ${ficha.estado === StateRecord.ATENDIENDO ? 'bg-green-600 hover:bg-green-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Ver pantalla pública
          </Link>
        </div>
      )}
    </div>
  )
}
