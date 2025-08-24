import Title from '@/app/components/ui/title'
import { notFound } from 'next/navigation'

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

const treatmentHistoryUser = [
  {
    fecha: '2025-01-01',
    turno: 'Diurno',
    motivo: 'Inicio de vacuna para tratamiento del COVID-19',
    tipo: 'cita'
  },
  {
    fecha: '2025-01-01',
    estado: 'en proceso',
    nombre: 'Sinopharm',
    descripcion:
      'Es una vacuna de primer nivel del pais de Colombia para evitar el contagio grave contra el covid.',
    fabricante: 'Sinopharm',
    tipo: 'tratamiento'
  },
  {
    fecha: '2025-01-01',
    turno: 'Diurno',
    motivo: 'Inicio de vacuna para tratamiento del COVID-19',
    tipo: 'cita'
  },
  {
    fecha: '2025-01-01',
    turno: 'Diurno',
    motivo: 'Inicio de vacuna para tratamiento del COVID-19',
    tipo: 'cita'
  },
  {
    fecha: '2025-01-01',
    estado: 'en proceso',
    nombre: 'Sinopharm',
    descripcion:
      'Es una vacuna de primer nivel del pais de Colombia para evitar el contagio grave contra el covid.',
    fabricante: 'Sinopharm',
    tipo: 'tratamiento'
  }
]

// interface TratamientoProps {
//   uuuid: string
// }

export default async function Tratamiento({
  params
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = await params

  const treatment = treatments.find(treat => treat.id === uuid)

  console.log(treatmentHistoryUser)

  if (!treatment) {
    return notFound()
  }

  return (
    <section className='tratamiento font-secondary'>
      <Title>Tratamiento {treatment.nombre}</Title>
      <div className='card-treatment-cite'>
        <h2>
          Cita #1
          <small>Turno: Diurno</small>
        </h2>
        <p>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsa eum,
          architecto rerum eos molestias nihil sed eligendi similique,
          exercitationem, incidunt aut voluptatibus minus. Odio cupiditate
          dolore doloremque dolorum quo nulla!
        </p>
      </div>
      <div className='card-treatment-vaccine'></div>
    </section>
  )
}
