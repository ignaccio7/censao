'use client'
import {
  IconDotsVertical,
  IconMonitor,
  IconPlus,
  IconTeam
} from '@/app/components/icons/icons'
import { StatusBadge } from '../../components/statusBadge'
import { useState } from 'react'
import Modal from '@/app/components/ui/modal/modal'
import FormRegister from '../../components/formRegister'
import useModal from '@/hooks/useModal'
import CustomDataTable from '@/app/components/ui/dataTable'
import useProfileRoutes from '@/hooks/useProfileRoutes'

export default function DashboardDoctorFichas({ fichas }: { fichas: any }) {
  const {
    create
    // delete: deleteFicha
  } = useProfileRoutes()

  const { modal, closeModal, openModal } = useModal()

  const [activeTabPending, setActiveTabPending] = useState('all')
  const [activeTabAttended, setActiveTabAttended] = useState('all')
  const [activeTabCancelled, setActiveTabCancelled] = useState('all')

  //tabla
  const columnas = [
    { campo: '# Ficha' },
    { campo: 'Paciente' },
    { campo: 'Especialidad' },
    { campo: 'Doctor Asignado' },
    { campo: 'Estado' },
    { campo: '' }
  ]

  const globalPending = fichas.filter((f: any) => f.estado === 'PENDIENTE')
  const globalAttended = fichas.filter((f: any) => f.estado === 'ATENDIDA')
  const globalCancelled = fichas.filter((f: any) => f.estado === 'CANCELADA')

  const pendingSpecialities: string[] = Array.from(
    new Set(
      globalPending
        .map((ficha: any) => ficha?.especialidad_nombre)
        .filter(Boolean)
    )
  )
  const attendedSpecialities: string[] = Array.from(
    new Set(
      globalAttended
        .map((ficha: any) => ficha?.especialidad_nombre)
        .filter(Boolean)
    )
  )
  const cancelledSpecialities: string[] = Array.from(
    new Set(
      globalCancelled
        .map((ficha: any) => ficha?.especialidad_nombre)
        .filter(Boolean)
    )
  )

  const pendingFichas =
    activeTabPending !== 'all'
      ? globalPending.filter(
          (f: any) => f.especialidad_nombre === activeTabPending
        )
      : globalPending

  const attendedFichas =
    activeTabAttended !== 'all'
      ? globalAttended.filter(
          (f: any) => f.especialidad_nombre === activeTabAttended
        )
      : globalAttended

  const cancelledFichas =
    activeTabCancelled !== 'all'
      ? globalCancelled.filter(
          (f: any) => f.especialidad_nombre === activeTabCancelled
        )
      : globalCancelled

  const generateTableContent = (fichasList: any[]) =>
    fichasList.map((ficha: any, index: number) => {
      return [
        <span
          className='font-semibold text-primary-700 text-step-1'
          key={`id-${index}`}
        >
          # {index + 1}
        </span>,
        ficha?.paciente_nombres,
        ficha?.especialidad_nombre,
        ficha?.doctor_nombre,
        <StatusBadge status={ficha.estado} key={`status-${index}`} />,
        <IconDotsVertical key={`action-${index}`} />
      ]
    })

  const pendientesContent = generateTableContent(pendingFichas)
  const atendidosContent = generateTableContent(attendedFichas)
  const canceladosContent = generateTableContent(cancelledFichas)

  return (
    <section className='fichas font-secondary'>
      {/* TARJETAS DE FICHAS GLOBALES */}
      <div className='cards-information grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4'>
        <div className='card-patients flex justify-between gap-1 p-2 sm:flex-col w-full sm:p-4 border border-gray-300 bg-white rounded-xl'>
          <h3 className='flex justify-between gap-2 items-center font-bold text-gray-700 text-step-1'>
            Pacientes en espera
            <small>
              <IconTeam className='text-primary-700' size='26' />
            </small>
          </h3>
          <p className='number text-step-4 font-bold text-primary-700'>
            {globalPending.length}
          </p>
        </div>
        <div className='card-patients flex justify-between gap-1 p-2 sm:flex-col w-full sm:p-4 border border-gray-300 bg-white rounded-xl'>
          <h3 className='flex justify-between gap-2 items-center font-bold text-gray-700 text-step-1'>
            Pacientes atendidos
            <small>
              <IconMonitor className='text-secondary-600' size='26' />
            </small>
          </h3>
          <p className='number text-step-4 font-bold text-secondary-600'>
            {globalAttended.length}
          </p>
        </div>
        <div className='card-patients flex justify-between gap-1 p-2 sm:flex-col w-full sm:p-4 border border-gray-300 bg-white rounded-xl'>
          <h3 className='flex justify-between gap-2 items-center font-bold text-gray-700 text-step-1'>
            Cancelados
            <small>
              <IconTeam className='text-quaternary-500' size='26' />
            </small>
          </h3>
          <p className='number text-step-4 font-bold text-quaternary-500'>
            {globalCancelled.length}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className='actions flex gap-2 justify-start items-center my-4'>
        {create && (
          <button
            className='flex gap-2 items-center bg-primary-700 text-white py-2 px-4 text-step-1 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer'
            onClick={openModal}
          >
            <IconPlus />
            Registrar nueva ficha
          </button>
        )}
      </div>

      {/* TABLA: PENDIENTES */}
      <h3 className='text-step-2 font-bold text-gray-700 mb-2 mt-6'>
        Pacientes en espera
      </h3>
      <div className='bg-white mb-6 rounded-md'>
        <div className='border-b border-gray-200 flex flex-wrap'>
          <button
            className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
              activeTabPending === 'all'
                ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                : 'text-gray-600 hover:text-primary-700'
            }`}
            onClick={() => setActiveTabPending('all')}
          >
            Lista de pacientes
          </button>
          {pendingSpecialities.map((speciality: string, index: number) => (
            <button
              key={index}
              className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
                activeTabPending === speciality
                  ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-700'
              }`}
              onClick={() => setActiveTabPending(speciality)}
            >
              {speciality}
            </button>
          ))}
        </div>
        <div className='p-4'>
          {pendientesContent.length > 0 ? (
            <CustomDataTable
              columnas={columnas}
              contenidoTabla={pendientesContent}
            />
          ) : (
            <p className='text-gray-500 italic'>
              No hay pacientes en espera para esta especialidad.
            </p>
          )}
        </div>
      </div>

      {/* TABLA: ATENDIDOS */}
      <h3 className='text-step-2 font-bold text-gray-700 mb-2 mt-6'>
        Pacientes atendidos
      </h3>
      <div className='bg-white mb-6 rounded-md'>
        <div className='border-b border-gray-200 flex flex-wrap'>
          <button
            className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
              activeTabAttended === 'all'
                ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                : 'text-gray-600 hover:text-primary-700'
            }`}
            onClick={() => setActiveTabAttended('all')}
          >
            Lista de pacientes
          </button>
          {attendedSpecialities.map((speciality: string, index: number) => (
            <button
              key={index}
              className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
                activeTabAttended === speciality
                  ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-700'
              }`}
              onClick={() => setActiveTabAttended(speciality)}
            >
              {speciality}
            </button>
          ))}
        </div>
        <div className='p-4'>
          {atendidosContent.length > 0 ? (
            <CustomDataTable
              columnas={columnas}
              contenidoTabla={atendidosContent}
            />
          ) : (
            <p className='text-gray-500 italic'>
              No hay pacientes atendidos para esta especialidad.
            </p>
          )}
        </div>
      </div>

      {/* TABLA: CANCELADOS */}
      <h3 className='text-step-2 font-bold text-gray-700 mb-2 mt-6'>
        Pacientes cancelados
      </h3>
      <div className='bg-white mb-6 rounded-md'>
        <div className='border-b border-gray-200 flex flex-wrap'>
          <button
            className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
              activeTabCancelled === 'all'
                ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                : 'text-gray-600 hover:text-primary-700'
            }`}
            onClick={() => setActiveTabCancelled('all')}
          >
            Lista de pacientes
          </button>
          {cancelledSpecialities.map((speciality: string, index: number) => (
            <button
              key={index}
              className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
                activeTabCancelled === speciality
                  ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-700'
              }`}
              onClick={() => setActiveTabCancelled(speciality)}
            >
              {speciality}
            </button>
          ))}
        </div>
        <div className='p-4'>
          {canceladosContent.length > 0 ? (
            <CustomDataTable
              columnas={columnas}
              contenidoTabla={canceladosContent}
            />
          ) : (
            <p className='text-gray-500 italic'>
              No hay pacientes cancelados para esta especialidad.
            </p>
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
