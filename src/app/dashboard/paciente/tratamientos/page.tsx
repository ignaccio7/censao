// oxlint-disable jsx-key
import CustomDataTable from '@/app/components/ui/dataTable'
import Title from '@/app/components/ui/title'
import { getColorByStatus } from '../utils'
import Link from 'next/link'
import { IconEye } from '@/app/components/icons/icons'

const treatments = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nombre: 'Vacuna COVID-19',
    estado: 'pendiente'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Vacuna Influenza Estacional',
    estado: 'completado'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre: 'Vacuna Hepatitis B',
    estado: 'pendiente'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    nombre: 'Vacuna Tétanos',
    estado: 'rechazado'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    nombre: 'Vacuna Varicela',
    estado: 'en proceso'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    nombre: 'Vacuna Fiebre Amarilla',
    estado: 'pendiente'
  }
]

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

export default function Page() {
  const contenidoTabla = treatments.map(treatment => {
    const color = getColorByStatus(treatment.estado)

    return [
      treatment.nombre,
      <div
        className={`chip ${color} text-white text-step-0 px-2 py-1 rounded-full w-fit font-semibold`}
      >
        {treatment.estado}
      </div>,
      <div className='actions'>
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
