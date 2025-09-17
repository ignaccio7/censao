// oxlint-disable jsx-key
'use client'
import { useState } from 'react'
import {
  IconAlertTriangle,
  IconClock,
  IconDotsVertical,
  IconMonitor,
  IconPlus,
  IconStethoscope,
  IconTeam
} from '@/app/components/icons/icons'
import Modal from '@/app/components/ui/modal/modal'
import Title from '@/app/components/ui/title'
import useModal from '@/hooks/useModal'
import FormRegister from '../components/formRegister'
import CustomDataTable from '@/app/components/ui/dataTable'
import { useFichas } from '@/app/api/services/fichas'

export default function PageFichas() {
  const { modal, closeModal, openModal } = useModal()
  const [activeTab, setActiveTab] = useState('pacientes')

  const { data } = useFichas()
  console.log('La data es:')
  console.log(data)

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

  //tabla
  const columnas = [
    {
      campo: '# Ficha'
    },
    {
      campo: 'Paciente'
    },
    {
      campo: 'Especialidad'
    },
    {
      campo: 'Doctor Asignado'
    },
    {
      campo: 'Estado'
    },
    {
      campo: 'Tiempo'
    },
    {
      campo: ''
    }
  ]

  const contenidoTabla = [
    [
      <span className='font-semibold text-primary-700 text-step-1'>#001</span>,
      'Ana Rosa',
      'Odontologia',
      'Dr. Carlos Mendoza',
      <span className='inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-quaternary-500 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-quaternary-500/90 focus-visible:bg-quaternbary-500/20 bg-quaternary-500 text-white'>
        <IconAlertTriangle />
        Emergencia
      </span>,
      '10:30m',
      <IconDotsVertical />
    ],
    [
      <span className='font-semibold text-primary-700 text-step-1'>#002</span>,
      'Jose Lopez',
      'Consulta general',
      'Dr. Casto Navia',
      <span className='inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-primary-500 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-primary-500/90 focus-visible:bg-primary-500/20 bg-primary-500 text-white'>
        <IconStethoscope />
        Consulta general
      </span>,
      '10:30m',
      <IconDotsVertical />
    ],
    [
      <span className='font-semibold text-primary-700 text-step-1'>#003</span>,
      'Juan Perez',
      'Consulta general',
      'Dr. Casto Navia',
      <span className='inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-secondary-300 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-secondary-300/90 focus-visible:bg-secondary-300/20 bg-secondary-300 text-black'>
        <IconClock />
        Consulta general
      </span>,
      '10:30m',
      <IconDotsVertical />
    ],
    [
      <span className='font-semibold text-primary-700 text-step-1'>#004</span>,
      'Miguel Torres',
      'Consulta general',
      'Dr. Casto Navia',
      <span className='inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-secondary-300 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-secondary-300/90 focus-visible:bg-secondary-300/20 bg-secondary-300 text-black'>
        <IconClock />
        Consulta general
      </span>,
      '10:30m',
      <IconDotsVertical />
    ]
  ]

  return (
    <section className='fichas font-secondary'>
      <div className='w-full flex justify-between items-center gap-2 mb-4'>
        <Title
          className='w-fit'
          subtitle='Configura las fichas de los pacientes'
        >
          Gestión de fichas
        </Title>
        <span className='px-4 py-2 bg-primary-200 text-primary-700 font-semibold rounded-full text-step-0 border border-primary-300'>
          Turno: Mañana
        </span>
      </div>
      <pre>{`Fichas ${JSON.stringify(data, null, 2)}`}</pre>

      {/* TARJETAS DE FICHAS */}
      <div className='cards-information grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4'>
        <div className='card-patients flex justify-between gap-1 p-2 sm:flex-col  w-full sm:p-4 border border-gray-300 bg-white rounded-xl'>
          <h3 className='flex justify-between gap-2 items-center font-bold text-gray-700 text-step-1'>
            Pacientes en espera
            <small>
              <IconTeam className='text-primary-700' size='26' />
            </small>
          </h3>
          <p className='number text-step-4 font-bold text-primary-700'>13</p>
        </div>
        <div className='card-patients flex justify-between gap-1 p-2 sm:flex-col  w-full sm:p-4 border border-gray-300 bg-white rounded-xl'>
          <h3 className='flex justify-between gap-2 items-center font-bold text-gray-700 text-step-1'>
            Pacientes en consulta
            <small>
              <IconMonitor className='text-secondary-600' size='26' />
            </small>
          </h3>
          <p className='number text-step-4 font-bold text-secondary-600'>10</p>
        </div>
        <div className='card-patients flex justify-between gap-1 p-2 sm:flex-col  w-full sm:p-4 border border-gray-300 bg-white rounded-xl'>
          <h3 className='flex justify-between gap-2 items-center font-bold text-gray-700 text-step-1'>
            Emergencias
            <small>
              <IconTeam className='text-quaternary-500' size='26' />
            </small>
          </h3>
          <p className='number text-step-4 font-bold text-quaternary-500'>1</p>
        </div>
      </div>

      {/* TABS */}
      <div className='bg-white my-4 rounded-md'>
        <div className='flex border-b border-gray-200'>
          <button
            className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
              activeTab === 'pacientes'
                ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                : 'text-gray-600 hover:text-primary-700'
            }`}
            onClick={() => setActiveTab('pacientes')}
          >
            Lista de pacientes
          </button>
          <button
            className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
              activeTab === 'doctores'
                ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                : 'text-gray-600 hover:text-primary-700'
            }`}
            onClick={() => setActiveTab('doctores')}
          >
            Estado de doctores
          </button>
        </div>

        <div className='p-4'>
          {activeTab === 'pacientes' && (
            <div>
              <div className='actions flex gap-2 justify-start items-center mb-4'>
                <button
                  className='flex gap-2 items-center bg-primary-700 text-white py-2 px-4 text-step-1 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer'
                  onClick={openModal}
                >
                  <IconPlus />
                  Registrar nueva ficha
                </button>
              </div>
              <div className='w-full'>
                <CustomDataTable
                  columnas={columnas}
                  contenidoTabla={contenidoTabla}
                />
              </div>
            </div>
          )}

          {activeTab === 'doctores' && (
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
                          doctor.pacientesAsignados >=
                          doctor.capacidadMaxima * 0.8
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
          )}
        </div>
      </div>

      <Modal
        title='Registrar nueva ficha'
        isOpen={modal}
        onClose={closeModal}
        maxWidth='xl'
      >
        <FormRegister />
      </Modal>
    </section>
  )
}
