'use client'

import CustomDataTable from '@/app/components/ui/dataTable'
import { useRouter } from 'next/navigation'
import {
  IconHistory,
  IconCalendar,
  IconCheckupList,
  IconFileCheck
} from '@/app/components/icons/icons'

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVA: {
    label: 'Activa',
    color: 'border-emerald-500 bg-emerald-50 text-emerald-700'
  },
  CERRADA: {
    label: 'Cerrada',
    color: 'border-gray-300 bg-gray-50 text-gray-600'
  }
}

function EstadoBadge({ estado }: { estado: string }) {
  const config = ESTADO_CONFIG[estado] || ESTADO_CONFIG.CERRADA
  return (
    <span
      className={`inline-flex gap-1 items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${config.color}`}
    >
      {estado === 'ACTIVA' ? (
        <IconCheckupList size='18' />
      ) : (
        <IconFileCheck size='18' />
      )}
      {config.label}
    </span>
  )
}

interface ConsultasTableProps {
  consultas: any[]
  fichaId?: string
  pacienteCi?: string
}

export default function ConsultasTable({
  consultas,
  fichaId,
  pacienteCi
}: ConsultasTableProps) {
  const router = useRouter()

  const columnas = [
    { campo: 'Fecha' },
    { campo: 'Motivo' },
    { campo: 'Especialidad' },
    { campo: 'Estado' },
    { campo: 'Citas' },
    { campo: 'Seguimientos' },
    { campo: '' }
  ]

  const contenidoTabla = consultas.map((c: any) => [
    <span
      key={`fec-${c.id}`}
      className='text-gray-600 font-medium whitespace-nowrap'
    >
      {c.fecha_consulta}
    </span>,
    <span
      key={`mot-${c.id}`}
      className='font-medium text-gray-800 line-clamp-2 max-w-[200px]'
      title={c.motivo_consulta}
    >
      {c.motivo_consulta}
    </span>,
    <span key={`esp-${c.id}`} className='text-gray-600'>
      {c.especialidad || 'General'}
    </span>,
    <EstadoBadge key={`est-${c.id}`} estado={c.estado_calculado} />,
    <div key={`cit-${c.id}`} className='flex justify-center'>
      {c.cantidad_citas > 0 ? (
        <span className='inline-flex items-center gap-1 rounded-md bg-sky-50 text-sky-700 px-2 py-1 text-xs font-bold'>
          <IconCalendar size='14' /> {c.cantidad_citas}
        </span>
      ) : (
        <span className='text-gray-400'>—</span>
      )}
    </div>,
    <div key={`seg-${c.id}`} className='flex justify-center'>
      {c.cantidad_seguimientos > 0 ? (
        <span className='inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-700 px-2.5 py-0.5 text-xs font-semibold'>
          {c.cantidad_seguimientos}
        </span>
      ) : (
        <span className='text-gray-400'>—</span>
      )}
    </div>,
    <button
      key={`btn-${c.id}`}
      onClick={() => {
        if (pacienteCi) {
          router.push(
            `/dashboard/consultas/paciente/${pacienteCi}/consulta/${c.id}`
          )
        } else if (fichaId) {
          router.push(`/dashboard/consultas/${fichaId}/consulta/${c.id}`)
        }
      }}
      className='px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm font-medium rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer border border-transparent hover:border-primary-200'
    >
      <IconHistory size='16' />
      Ver Detalle
    </button>
  ])

  return (
    <CustomDataTable
      columnas={columnas}
      contenidoTabla={contenidoTabla}
      numeracion
      contenidoCuandoVacio={
        <div className='text-center py-8 text-gray-500'>
          <p>No se encontraron consultas registradas.</p>
        </div>
      }
    />
  )
}
