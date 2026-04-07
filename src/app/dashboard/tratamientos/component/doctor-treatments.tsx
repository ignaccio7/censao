'use client'

import CustomDataTable from '@/app/components/ui/dataTable'
import Title from '@/app/components/ui/title'
import { IconVaccine } from '@/app/components/icons/icons'
import { useTratamientos } from '@/app/services/tratamientos'

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  EN_CURSO: {
    label: 'En curso',
    color: 'border-blue-500 bg-blue-500/20 text-blue-700'
  },
  COMPLETADO: {
    label: 'Completado',
    color: 'border-green-500 bg-green-500/20 text-green-700'
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'border-red-500 bg-red-500/20 text-red-700'
  }
}

function EstadoBadge({ estado }: { estado: string }) {
  const config = ESTADO_CONFIG[estado] || {
    label: estado,
    color: 'border-gray-500 bg-gray-500/20 text-gray-700'
  }

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${config.color}`}
    >
      {config.label}
    </span>
  )
}

export default function DoctorTreatments() {
  const { tratamientos, isLoading, isError } = useTratamientos()

  const columnas = [
    { campo: 'Paciente' },
    { campo: 'CI' },
    { campo: 'Vacuna' },
    { campo: 'Dosis' },
    { campo: 'Fecha Aplicación' },
    { campo: 'Especialidad' },
    { campo: 'Estado' }
  ]

  const contenidoTabla = tratamientos.map((t: any) => [
    <span key={`pac-${t.id}`} className='font-medium text-gray-800'>
      {t.paciente_nombre}
    </span>,
    <span key={`ci-${t.id}`} className='text-gray-600 font-mono text-step--1'>
      {t.paciente_ci}
    </span>,
    <span key={`vac-${t.id}`} className='flex items-center gap-1.5'>
      <IconVaccine className='text-primary-600 shrink-0' size='16' />
      <span>{t.vacuna_nombre}</span>
    </span>,
    <span key={`dos-${t.id}`} className='font-semibold text-primary-700'>
      Dosis #{t.dosis_numero}
      {t.dosis_notas && (
        <span className='block text-step--2 font-normal text-gray-500'>
          {t.dosis_notas}
        </span>
      )}
    </span>,
    <span key={`fecha-${t.id}`} className='text-gray-600'>
      {t.fecha_aplicacion}
    </span>,
    <span key={`esp-${t.id}`} className='text-gray-600'>
      {t.especialidad}
    </span>,
    <EstadoBadge key={`est-${t.id}`} estado={t.estado} />
  ])

  return (
    <section className='font-secondary'>
      <Title subtitle='Historial de tratamientos registrados por ti'>
        Mis Tratamientos
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
              <IconVaccine size='40' className='text-gray-300' />
              <p>No has registrado tratamientos aún</p>
              <p className='text-step--1'>
                Los tratamientos aparecerán aquí cuando los registres desde una
                ficha
              </p>
            </div>
          }
        />
      </div>
    </section>
  )
}
