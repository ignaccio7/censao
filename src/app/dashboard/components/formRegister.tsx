import { useState } from 'react'
import {
  IconCredential,
  IconSchedule,
  IconStethoscope,
  IconUser,
  IconUserPlus
} from '@/app/components/icons/icons'
import { useFichas } from '@/app/api/services/fichas'
import { useEspecialidades } from '@/app/api/services/disponibilidad/especialidades'

// Mock de datos
const mockData = {
  especialidades: [
    {
      id: '1',
      nombre: 'Consulta general',
      doctores: [
        {
          id: '1',
          nombre: 'Dr. Carlos Mendoza',
          capacidadActual: 8,
          capacidadMaxima: 15
        },
        {
          id: '2',
          nombre: 'Dra. Ana Rodriguez',
          capacidadActual: 12,
          capacidadMaxima: 20
        }
      ]
    },
    {
      id: '2',
      nombre: 'Odontologia',
      doctores: [
        {
          id: '3',
          nombre: 'Dr. Miguel Torres',
          capacidadActual: 5,
          capacidadMaxima: 10
        },
        {
          id: '4',
          nombre: 'Dra. Sofia Martinez',
          capacidadActual: 7,
          capacidadMaxima: 12
        }
      ]
    },
    {
      id: '3',
      nombre: 'Enfermeria',
      doctores: [
        {
          id: '5',
          nombre: 'Enf. Patricia Lopez',
          capacidadActual: 15,
          capacidadMaxima: 25
        },
        {
          id: '6',
          nombre: 'Enf. Roberto Gutierrez',
          capacidadActual: 18,
          capacidadMaxima: 30
        }
      ]
    },
    {
      id: '4',
      nombre: 'Laboratorio',
      doctores: [
        {
          id: '7',
          nombre: 'Tec. Maria Fernandez',
          capacidadActual: 3,
          capacidadMaxima: 8
        },
        {
          id: '8',
          nombre: 'Tec. Diego Ramirez',
          capacidadActual: 6,
          capacidadMaxima: 10
        }
      ]
    }
  ]
}

export default function FormRegister() {
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('')

  const { especialidadesQuery } = useEspecialidades()
  console.log(
    '----------------------------------------------------------------------'
  )
  console.log(especialidadesQuery.data)

  const { createFicha } = useFichas()

  // Obtener doctores de la especialidad seleccionada
  const doctoresDisponibles = especialidadSeleccionada
    ? mockData.especialidades.find(esp => esp.id === especialidadSeleccionada)
        ?.doctores || []
    : []

  const handleEspecialidadChange = (event: any) => {
    setEspecialidadSeleccionada(event.target.value)
  }

  const addRecord = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('Submiteando')
    const data = new FormData(event.target as HTMLFormElement)
    console.log(Object.fromEntries(data))
    try {
      const response = await createFicha.mutateAsync(Object.fromEntries(data))
      console.log(response)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='form-register'>
      <h3 className='text-step-0 text-gray-600'>
        Complete los datos del paciente para generar una nueva ficha médica
      </h3>
      <form
        className='my-2 md:my-4 grid grid-cols-1 md:grid-cols-2 gap-4'
        onSubmit={addRecord}
      >
        <label
          htmlFor='cedula'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconCredential />
            Cedula
          </span>
          <input
            className='p-2 border border-transparent rounded-md focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600'
            type='text'
            name='cedula'
            id='cedula'
            placeholder='1054876541'
          />
        </label>
        <label
          htmlFor='nombre'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconUser />
            Nombre Completo
          </span>
          <input
            className='p-2 border border-transparent rounded-md focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600'
            type='text'
            name='nombre'
            id='nombre'
            placeholder='Juan Perez Garcia'
          />
        </label>
        <label
          htmlFor='especialidad'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconStethoscope />
            Especialidad Médica
          </span>
          <select
            name='especialidad'
            id='especialidad'
            value={especialidadSeleccionada}
            onChange={handleEspecialidadChange}
            className='p-2 border border-transparent rounded-md focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600'
          >
            <option value=''>Seleccione una especialidad</option>
            {mockData.especialidades.map(especialidad => (
              <option key={especialidad.id} value={especialidad.id}>
                {especialidad.nombre}
              </option>
            ))}
          </select>
        </label>
        <label
          htmlFor='doctor'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconSchedule />
            Doctor disponible
          </span>
          <select
            name='doctor'
            id='doctor'
            disabled={!especialidadSeleccionada}
            className='p-2 border border-transparent rounded-md focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 disabled:bg-gray-100 disabled:cursor-not-allowed'
          >
            <option value=''>
              {especialidadSeleccionada
                ? 'Seleccione un doctor'
                : 'Primero seleccione una especialidad'}
            </option>
            {doctoresDisponibles.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.nombre} • {doctor.capacidadActual}/
                {doctor.capacidadMaxima} pacientes
              </option>
            ))}
          </select>
        </label>
        <button
          type='submit'
          className='w-full bg-primary-700 text-white py-2 px-4 text-step-1 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer flex gap-2 items-center justify-center col-span-1 md:col-span-2'
        >
          <IconUserPlus />
          Registrar nueva ficha
        </button>
      </form>
    </div>
  )
}
