'use client'

import CustomDataTable from '@/app/components/ui/dataTable'
import Title from '@/app/components/ui/title'
import Link from 'next/link'
import { IconEye } from '@/app/components/icons/icons'

export type SpecialtyConsultationsProps = {
  id: string
  nombre: string
  totalConsultas: number
  ultimaConsulta: Date
}

interface Props {
  especialidades: SpecialtyConsultationsProps[]
}

const columnas = [
  { campo: 'Especialidad' },
  { campo: 'Total Consultas' },
  { campo: 'Última consulta' },
  { campo: 'Acciones' }
]

export default function PatientConsultations({ especialidades }: Props) {
  const contenidoTabla = especialidades.map(esp => {
    const fechaFormat = esp.ultimaConsulta.toLocaleDateString('es-BO', {
      timeZone: 'America/La_Paz'
    })

    return [
      <span key={`nombre-${esp.id}`} className='font-semibold'>
        {esp.nombre}
      </span>,
      <span key={`total-${esp.id}`}>
        {esp.totalConsultas}{' '}
        {esp.totalConsultas === 1 ? 'consulta' : 'consultas'}
      </span>,
      <span key={`fecha-${esp.id}`}>{fechaFormat}</span>,
      <div className='actions' key={`acciones-${esp.id}`}>
        <Link href={`/dashboard/paciente/consultas/${esp.id}`}>
          <IconEye
            size='28'
            className='p-1 bg-gray-600 hover:bg-gray-500 rounded-md text-white'
          />
        </Link>
      </div>
    ]
  })

  return (
    <section className='treatments font-secondary'>
      <Title>Mis Consultas Médicas</Title>
      <div className='mb-6 mt-2'>
        <p className='text-gray-600'>
          Selecciona una especialidad médica para ver el historial de tus
          atenciones y seguimientos.
        </p>
      </div>

      <CustomDataTable
        columnas={columnas}
        contenidoTabla={contenidoTabla}
        numeracion
      />
    </section>
  )
}
