'use client'
import { useState } from 'react'
import { IconMonitor, IconTeam } from '@/app/components/icons/icons'
import Modal from '@/app/components/ui/modal/modal'
import FormReassign from '../../components/FormReassign'
import useModal from '@/hooks/useModal'
import FichasStatCard from '../../components/FichasStatCard'
import FichasStatusTable from '../../components/FichasStatusTable'
import { useFichas } from '@/app/services/fichas'
import { StateRecord } from '@/lib/constants'
import FormAssign from '../../components/FormAssign'

export default function DashboardDoctorEnfermeria({ fichas }: { fichas: any }) {
  // const { create } = useProfileRoutes() TODO
  const { modal, closeModal, openModal } = useModal()

  const [refetchInterval, setRefetchInterval] = useState<number | false>(false)
  useFichas(refetchInterval)

  const [reassignData, setReassignData] = useState<{
    fichaId: string
    cedula: string
    nombre: string
  } | null>(null)

  const [assignData, setAssignData] = useState<{
    fichaId: string
    cedula: string
    nombre: string
  } | null>(null)

  const handleRevertToQueue = (data: {
    fichaId: string
    cedula: string
    nombre: string
  }) => {
    setReassignData(data)
    openModal()
  }

  // TODO: const handleOpenNewFicha = () => {
  //   setReassignData(null)
  //   openModal()
  // }

  const globalWaiting = fichas.filter(
    (f: any) =>
      f.estado === StateRecord.ADMISION || f.estado === StateRecord.ENFERMERIA
  )
  const globalAttended = fichas.filter(
    (f: any) => f.estado === StateRecord.ATENDIDA
  )
  const globalCancelled = fichas.filter(
    (f: any) => f.estado === StateRecord.CANCELADA
  )

  return (
    <section className='fichas font-secondary'>
      {/* TARJETAS DE FICHAS GLOBALES */}
      <div className='cards-information grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4'>
        <FichasStatCard
          title='Pacientes en espera'
          count={globalWaiting.length}
          icon={<IconTeam size='26' />}
          textColorClass='text-primary-700'
        />
        <FichasStatCard
          title='Pacientes atendidos'
          count={globalAttended.length}
          icon={<IconMonitor size='26' />}
          textColorClass='text-secondary-600'
        />
        <FichasStatCard
          title='Cancelados'
          count={globalCancelled.length}
          icon={<IconTeam size='26' />}
          textColorClass='text-quaternary-500'
        />
      </div>

      {/* ACTIONS Y POLLING */}
      <div className='actions flex flex-wrap gap-4 justify-end items-center my-4'>
        <div className='flex items-center gap-2'>
          <label
            htmlFor='polling'
            className='text-sm text-gray-600 font-medium'
          >
            Actualizar datos:
          </label>
          <select
            id='polling'
            className={`border rounded-md px-2 py-1 text-sm focus:outline-none cursor-pointer transition-colors duration-300 shadow-sm ${
              refetchInterval !== false
                ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold focus:ring-2 focus:ring-primary-600'
                : 'border-gray-300 text-gray-700 bg-white focus:ring-2 focus:ring-primary-500 hover:border-primary-400'
            }`}
            value={
              refetchInterval === false ? 'false' : String(refetchInterval)
            }
            onChange={e => {
              const val = e.target.value
              setRefetchInterval(val === 'false' ? false : Number(val))
            }}
          >
            <option value='false'>Manual (Desactivado)</option>
            <option value='1000'>Tiempo real (1s)</option>
            <option value='5000'>Cada 5s</option>
            <option value='30000'>Cada 30s</option>
            <option value='60000'>Cada 1 min</option>
            <option value='1800000'>Cada 30 min</option>
          </select>
        </div>
      </div>

      <FichasStatusTable
        title='Pacientes en espera'
        fichas={globalWaiting}
        noDataMessage='No hay pacientes en espera para esta especialidad.'
        onAssignDoctor={data => {
          setAssignData(data)
          openModal()
        }}
      />
      <FichasStatusTable
        title='Pacientes atendidos'
        fichas={globalAttended}
        noDataMessage='No hay pacientes atendidos para esta especialidad.'
      />
      <FichasStatusTable
        title='Pacientes cancelados'
        fichas={globalCancelled}
        noDataMessage='No hay pacientes cancelados para esta especialidad.'
        onRevertToQueue={handleRevertToQueue}
      />

      <Modal
        title={reassignData ? 'Reasignar paciente' : 'Asignar ficha'}
        isOpen={modal}
        onClose={() => {
          setReassignData(null)
          setAssignData(null)
          closeModal()
        }}
        maxWidth='xl'
      >
        {reassignData && (
          <FormReassign
            fichaId={reassignData.fichaId}
            pacienteCedula={reassignData.cedula}
            pacienteNombres={reassignData.nombre}
          />
        )}
        {assignData && (
          <FormAssign
            fichaId={assignData.fichaId}
            cedula={assignData.cedula}
            nombre={assignData.nombre}
          />
        )}
      </Modal>
    </section>
  )
}
