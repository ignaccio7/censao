import { IconCalendar, IconVaccine } from '@/app/components/icons/icons'
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
    tipo: 'cita',
    nro: '1'
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
    motivo: 'Chequeo general',
    tipo: 'cita',
    nro: '2'
  },
  {
    fecha: '2025-01-01',
    turno: 'Diurno',
    motivo: 'Fin del tratamiento de la vacuna para tratamiento del COVID-19',
    tipo: 'cita',
    nro: '3'
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

  if (!treatment) {
    return notFound()
  }

  return (
    <section className='tratamiento font-secondary pb-10'>
      <Title className='mb-2'>Tratamiento {treatment.nombre}</Title>
      <div className='flex flex-col gap-4 md:gap-0'>
        {treatmentHistoryUser.map((appointment, index) => {
          const isAppointment = appointment.tipo === 'cita'
          const firstTitle = isAppointment
            ? `Cita #${appointment.nro}`
            : appointment.nombre
          const secondTitle = isAppointment
            ? `Turno: ${appointment.turno}`
            : `Estado: ${appointment.estado}`
          const description = isAppointment
            ? appointment.motivo
            : appointment.descripcion

          return (
            <section
              className='grid grid-cols-1 md:grid-cols-[45%_10%_45%]'
              key={`${appointment.fecha}-${index}`}
            >
              <article
                className={`card-treatment-cite bg-white rounded-md overflow-hidden shadow-md text-step-1 my-0 md:my-2 ${isAppointment ? 'order-1' : 'order-3'}`}
              >
                <h2
                  className={`flex gap-1 items-center text-white justify-between p-2 font-semibold
                  ${isAppointment ? 'bg-green-900' : 'bg-amber-600'}`}
                >
                  <span className='flex gap-1 items-center'>
                    {isAppointment ? (
                      <IconCalendar className='block md:hidden' />
                    ) : (
                      <IconVaccine className='block md:hidden' />
                    )}
                    {firstTitle}
                  </span>
                  <small>
                    {secondTitle} | Fecha: {appointment.fecha}
                  </small>
                </h2>
                <p className='p-2 text-pretty'>{description}</p>
              </article>
              <div className='hidden md:flex justify-center items-center order-2'>
                {isAppointment ? (
                  <IconCalendar
                    className={`absolute z-10 p-2 rounded-full border text-white ${isAppointment ? 'bg-green-800' : 'bg-amber-600'}`}
                    size='44'
                  />
                ) : (
                  <IconVaccine
                    className={`absolute z-10 p-2 rounded-full border text-white ${isAppointment ? 'bg-green-800' : 'bg-amber-600'}`}
                    size='44'
                  />
                )}
                <div className='h-full border-2 border-gray-500 w-0' />
              </div>
              <div
                className={`hidden md:block ${isAppointment ? 'order-3' : 'order-1'}`}
              />
            </section>
          )
        })}
      </div>
    </section>
  )
}
