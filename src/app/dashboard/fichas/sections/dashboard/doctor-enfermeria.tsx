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

type FichaActionData = {
  fichaId: string
  cedula: string
  nombre: string
}

export default function DashboardDoctorEnfermeria({ fichas }: { fichas: any }) {
  // const { create } = useProfileRoutes() TODO
  const { modal, closeModal, openModal } = useModal()

  const [refetchInterval, setRefetchInterval] = useState<number | false>(false)
  const { updateFicha } = useFichas(refetchInterval)

  const [reassignData, setReassignData] = useState<FichaActionData | null>(null)
  const [assignData, setAssignData] = useState<FichaActionData | null>(null)

  // ADMISION → ENFERMERIA: PATCH directo, sin modal
  const handleCallTriage = async (data: FichaActionData) => {
    await updateFicha.mutateAsync({
      id: data.fichaId,
      status: StateRecord.ENFERMERIA
    })
  }

  // ENFERMERIA → EN_ESPERA: abre FormAssign
  const handleAssignDoctor = (data: FichaActionData) => {
    setReassignData(null)
    setAssignData(data)
    openModal()
  }

  // CANCELADA → reasignar: abre FormReassign
  const handleRevertToQueue = (data: FichaActionData) => {
    setAssignData(null)
    setReassignData(data)
    openModal()
  }

  // Fichas activas (en cualquier estado no terminal)
  const globalActive = fichas.filter(
    (f: any) =>
      f.estado === StateRecord.ADMISION ||
      f.estado === StateRecord.ENFERMERIA ||
      f.estado === StateRecord.EN_ESPERA
  )
  // Fichas específicamente en triage (para tarjeta)
  const globalInTriage = fichas.filter(
    (f: any) => f.estado === StateRecord.ENFERMERIA
  )
  const globalAssigned = fichas.filter(
    (f: any) => f.estado === StateRecord.EN_ESPERA
  )
  const globalAttended = fichas.filter(
    (f: any) => f.estado === StateRecord.ATENDIDA
  )
  const globalCancelled = fichas.filter(
    (f: any) => f.estado === StateRecord.CANCELADA
  )

  return (
    <section className='fichas font-secondary'>
      {/* TARJETAS DE RESUMEN */}
      <div className='cards-information grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4'>
        <FichasStatCard
          title='En cola (sin llamar)'
          count={
            fichas.filter((f: any) => f.estado === StateRecord.ADMISION).length
          }
          icon={<IconTeam size='26' />}
          textColorClass='text-slate-600'
        />
        <FichasStatCard
          title='En triage ahora'
          count={globalInTriage.length}
          icon={<IconTeam size='26' />}
          textColorClass='text-green-600'
        />
        <FichasStatCard
          title='Asignados (sala de espera)'
          count={globalAssigned.length}
          icon={<IconMonitor size='26' />}
          textColorClass='text-blue-600'
        />
        <FichasStatCard
          title='Atendidos hoy'
          count={globalAttended.length}
          icon={<IconMonitor size='26' />}
          textColorClass='text-secondary-600'
        />
      </div>

      {/* POLLING */}
      <div className='actions flex flex-wrap gap-4 justify-end items-center my-4'>
        <div className='flex items-center gap-2'>
          <label
            htmlFor='polling-enf'
            className='text-sm text-gray-600 font-medium'
          >
            Actualizar datos:
          </label>
          <select
            id='polling-enf'
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
        title='Pacientes activos'
        fichas={globalActive}
        noDataMessage='No hay pacientes activos en este turno.'
        waitingMode={true}
        onCallTriage={handleCallTriage}
        onAssignDoctor={handleAssignDoctor}
        onRevertToQueue={handleRevertToQueue}
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
        title={reassignData ? 'Reasignar paciente' : 'Asignar ficha a médico'}
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
