import { IconStethoscope } from '@/app/components/icons/icons'
import Title from '@/app/components/ui/title'

export default function EstadoDoctores() {
  // Mock de doctores
  const doctores = [
    {
      id: '1',
      nombre: 'Dr. Carlos Mendoza',
      especialidad: 'Consulta general',
      pacientesAsignados: 8,
      capacidadMaxima: 15
    },
    {
      id: '2',
      nombre: 'Dra. Ana Rodriguez',
      especialidad: 'Consulta general',
      pacientesAsignados: 12,
      capacidadMaxima: 20
    },
    {
      id: '3',
      nombre: 'Dr. Miguel Torres',
      especialidad: 'Odontologia',
      pacientesAsignados: 5,
      capacidadMaxima: 10
    },
    {
      id: '4',
      nombre: 'Dra. Sofia Martinez',
      especialidad: 'Odontologia',
      pacientesAsignados: 7,
      capacidadMaxima: 12
    },
    {
      id: '5',
      nombre: 'Enf. Patricia Lopez',
      especialidad: 'Enfermeria',
      pacientesAsignados: 15,
      capacidadMaxima: 25
    },
    {
      id: '6',
      nombre: 'Tec. Maria Fernandez',
      especialidad: 'Laboratorio',
      pacientesAsignados: 3,
      capacidadMaxima: 8
    }
  ]

  return (
    <section className='estado-doctores'>
      <div className='w-full flex justify-between items-center gap-2 mb-4'>
        <Title
          className='w-fit'
          subtitle='Configura las fichas de los pacientes'
        >
          Estado de los doctores
        </Title>
      </div>
      <section>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {doctores.map(doctor => (
            <div
              key={doctor.id}
              className='border border-gray-200 rounded-lg p-4 bg-gray-50'
            >
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <h3 className='font-semibold text-gray-800 text-step-1'>
                    {doctor.nombre}
                  </h3>
                  <p className='text-gray-600 text-step-0'>
                    {doctor.especialidad}
                  </p>
                </div>
                <IconStethoscope className='text-primary-700' size='20' />
              </div>

              <div className='mb-3'>
                <div className='flex justify-between items-center mb-1'>
                  <span className='text-step-0 text-gray-600'>
                    Pacientes asignados
                  </span>
                  <span className='text-step-0 font-medium'>
                    {doctor.pacientesAsignados}/{doctor.capacidadMaxima}
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full ${
                      doctor.pacientesAsignados >= doctor.capacidadMaxima * 0.8
                        ? 'bg-red-500'
                        : doctor.pacientesAsignados >=
                            doctor.capacidadMaxima * 0.6
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${(doctor.pacientesAsignados / doctor.capacidadMaxima) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              <button className='w-full bg-primary-100 text-primary-700 py-2 px-3 text-step-0 rounded-md hover:bg-primary-200 transition-colors duration-200'>
                Reasignar pacientes
              </button>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}
