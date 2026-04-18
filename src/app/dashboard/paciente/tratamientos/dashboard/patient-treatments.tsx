'use client'

import CustomDataTable from '@/app/components/ui/dataTable'
import Title from '@/app/components/ui/title'
import { getColorStatusBadgeTreatment } from '../../utils'
import Link from 'next/link'
import { IconEye } from '@/app/components/icons/icons'

export type PatientTreatmentProps = {
  id: string
  nombre: string
  estado: string
}

interface Props {
  treatments: PatientTreatmentProps[]
}

const columnas = [
  {
    campo: 'Nombre'
  },
  {
    campo: 'Estado'
  },
  {
    campo: 'Acciones'
  }
]

export default function PatientTreatments({ treatments }: Props) {
  const contenidoTabla = treatments.map(treatment => {
    const color = getColorStatusBadgeTreatment(treatment.estado)
    console.log(treatment)
    console.log(color)

    return [
      <span key={`nombre-${treatment.id}`}>{treatment.nombre}</span>,
      <div
        key={`estado-${treatment.id}`}
        className={`chip ${color} text-white text-step-0 px-2 py-1 rounded-full w-fit font-semibold capitalize`}
      >
        {treatment.estado}
      </div>,
      <div className='actions' key={`acciones-${treatment.id}`}>
        <Link href={`/dashboard/paciente/tratamientos/${treatment.id}`}>
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
      <Title>Mis tratamientos</Title>
      <CustomDataTable
        columnas={columnas}
        contenidoTabla={contenidoTabla}
        numeracion
      />
    </section>
  )
}
