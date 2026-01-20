// oxlint-disable jsx-key
'use client'
import { useState } from 'react'
import {
  IconDotsVertical,
  IconMonitor,
  IconPlus,
  IconTeam
} from '@/app/components/icons/icons'
import Modal from '@/app/components/ui/modal/modal'
import Title from '@/app/components/ui/title'
import useModal from '@/hooks/useModal'
import FormRegister from './components/formRegister'
import CustomDataTable from '@/app/components/ui/dataTable'
import { useFichas } from '@/app/services/fichas'
import { StatusBadge } from './components/statusBadge'
import useProfileRoutes from '@/hooks/useProfileRoutes'

export default function PageFichas() {
  const {
    read,
    create
    // update, delete: deleteFicha
  } = useProfileRoutes()
  const { modal, closeModal, openModal } = useModal()
  const [activeTab, setActiveTab] = useState('all')

  console.log(read)
  console.log(create)

  const { fichas } = useFichas()
  console.log('La data es:')
  console.log(fichas)

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
      campo: ''
    }
  ]

  const specialities: any[] = Array.from(
    new Set(fichas.map((ficha: any) => ficha?.especialidad_nombre))
  )

  const filteredFichas =
    activeTab !== 'all'
      ? fichas.filter((ficha: any) => ficha.especialidad_nombre === activeTab)
      : fichas

  console.log(filteredFichas)

  // TODO: ver como agregar la interface en este punto
  const contenidoTabla = filteredFichas.map((ficha: any, index: number) => {
    return [
      <span className='font-semibold text-primary-700 text-step-1'>
        # {index + 1}
      </span>,
      ficha?.paciente_nombres,
      ficha?.especialidad_nombre,
      ficha?.doctor_nombre,
      <StatusBadge status={ficha.estado} />,
      <IconDotsVertical />
    ]
  })

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

      {/* ACTIONS */}
      <div className='actions flex gap-2 justify-start items-center my-4'>
        <button
          className='flex gap-2 items-center bg-primary-700 text-white py-2 px-4 text-step-1 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer'
          onClick={openModal}
        >
          <IconPlus />
          Registrar nueva ficha
        </button>
      </div>

      {/* TABS */}
      <div className='bg-white my-4 rounded-md'>
        <div className='border-b border-gray-200 flex flex-wrap'>
          <button
            className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
              activeTab === 'all'
                ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                : 'text-gray-600 hover:text-primary-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            Lista de pacientes
          </button>
          {specialities.map((speciality: string, index: number) => (
            <button
              key={index}
              className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
                activeTab === speciality
                  ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-700'
              }`}
              onClick={() => setActiveTab(speciality)}
            >
              {speciality}
            </button>
          ))}
        </div>

        <div className='px-4'>
          <div className='w-full'>
            <CustomDataTable
              columnas={columnas}
              contenidoTabla={contenidoTabla}
            />
          </div>
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
