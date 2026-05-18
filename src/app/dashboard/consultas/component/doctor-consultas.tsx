'use client'

import CustomDataTable from '@/app/components/ui/dataTable'
import Title from '@/app/components/ui/title'
import { IconCheckupList } from '@/app/components/icons/icons'
import { useConsultas } from '@/app/services/consultas'

const RETORNO_CONFIG: Record<string, { label: string; color: string }> = {
  true: {
    label: 'Sí',
    color: 'border-amber-500 bg-amber-500/20 text-amber-700'
  },
  false: {
    label: 'No',
    color: 'border-gray-400 bg-gray-400/20 text-gray-600'
  }
}

function RetornoBadge({ requiere }: { requiere: boolean }) {
  const config = RETORNO_CONFIG[String(requiere)]

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${config.color}`}
    >
      {config.label}
    </span>
  )
}

export default function DoctorConsultas() {
  const { consultas, isLoading, isError } = useConsultas()

  const columnas = [
    { campo: 'Paciente' },
    { campo: 'CI' },
    { campo: 'Motivo' },
    { campo: 'Fecha' },
    { campo: 'Especialidad' },
    { campo: '¿Retorno?' },
    { campo: 'Citas' }
  ]

  const contenidoTabla = consultas.map((c: any) => [
    <span key={`pac-${c.id}`} className='font-medium text-gray-800'>
      {c.paciente_nombre}
    </span>,
    <span key={`ci-${c.id}`} className='text-gray-600 font-mono text-step--1'>
      {c.paciente_ci}
    </span>,
    <span key={`mot-${c.id}`} className='flex items-center gap-1.5'>
      <IconCheckupList className='text-primary-600 shrink-0' size='16' />
      <span className='truncate max-w-[200px]' title={c.motivo_consulta}>
        {c.motivo_consulta}
      </span>
    </span>,
    <span key={`fecha-${c.id}`} className='text-gray-600'>
      {c.fecha_consulta}
    </span>,
    <span key={`esp-${c.id}`} className='text-gray-600'>
      {c.especialidad}
    </span>,
    <RetornoBadge key={`ret-${c.id}`} requiere={c.requiere_retorno} />,
    <span key={`cit-${c.id}`} className='text-gray-600'>
      {c.citas?.length > 0 ? (
        <span className='inline-flex items-center rounded-md border border-blue-500 bg-blue-500/20 text-blue-700 px-2.5 py-0.5 text-xs font-semibold'>
          📅 {c.citas.length}
        </span>
      ) : (
        <span className='text-gray-400 text-step--2'>—</span>
      )}
    </span>
  ])

  return (
    <section className='font-secondary'>
      <Title subtitle='Historial de consultas médicas registradas'>
        Mis Consultas
      </Title>

      <div className='bg-white rounded-md my-4 px-4'>
        <CustomDataTable
          columnas={columnas}
          contenidoTabla={contenidoTabla}
          cargando={isLoading}
          error={isError}
          numeracion
          contenidoCuandoVacio={
            <div className='flex flex-col items-center gap-2 py-4 text-gray-500'>
              <IconCheckupList size='40' className='text-gray-300' />
              <p>No has registrado consultas aún</p>
              <p className='text-step--1'>
                Las consultas aparecerán aquí cuando las registres desde una
                ficha
              </p>
            </div>
          }
        />
      </div>
    </section>
  )
}
