'use client'

import CustomDataTable from '@/app/components/ui/dataTable'
import Link from 'next/link'
import { IconEye } from '@/app/components/icons/icons'

export type ConsultationListItem = {
  id: string
  motivo: string
  fecha: Date
  estado: string
  especialidadId: string
}

interface Props {
  consultas: ConsultationListItem[]
  especialidadNombre: string
}

const columnas = [
  { campo: 'Motivo' },
  { campo: 'Fecha' },
  { campo: 'Estado' },
  { campo: 'Acciones' }
]

export default function ConsultationsList({
  consultas,
  especialidadNombre
}: Props) {
  const contenidoTabla = consultas.map(c => {
    const fechaFormat = c.fecha.toLocaleDateString('es-BO', {
      timeZone: 'America/La_Paz'
    })

    const badgeColor = c.estado === 'ACTIVA' ? 'bg-emerald-600' : 'bg-gray-500'

    return [
      <span key={`motivo-${c.id}`} className='font-semibold'>
        {c.motivo}
      </span>,
      <span key={`fecha-${c.id}`}>{fechaFormat}</span>,
      <div
        key={`estado-${c.id}`}
        className={`chip ${badgeColor} text-white text-step-0 px-2 py-1 rounded-full w-fit font-semibold capitalize`}
      >
        {c.estado}
      </div>,
      <div className='actions' key={`acciones-${c.id}`}>
        <Link
          href={`/dashboard/paciente/consultas/${c.especialidadId}/detalle/${c.id}`}
        >
          <IconEye
            size='28'
            className='p-1 bg-gray-600 hover:bg-gray-500 rounded-md text-white'
          />
        </Link>
      </div>
    ]
  })

  return (
    <section>
      <div className='bg-sky-50 border border-sky-100 p-4 rounded-lg mb-6'>
        <p className='font-semibold text-sky-800 text-lg mb-1'>
          Consultas registradas en {especialidadNombre}
        </p>
        <p className='text-sky-700 text-sm'>
          {consultas.length} consulta(s) registrada(s)
        </p>
      </div>

      <CustomDataTable
        columnas={columnas}
        contenidoTabla={contenidoTabla}
        numeracion
      />

      <p className='text-xs text-gray-500 mt-4 text-center'>
        <strong>Nota:</strong> Cada consulta aquí listada es un motivo de
        atención independiente (un nuevo caso clínico).
      </p>
    </section>
  )
}
