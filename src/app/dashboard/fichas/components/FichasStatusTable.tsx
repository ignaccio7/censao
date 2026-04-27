'use client'
import { useState } from 'react'
import CustomDataTable from '@/app/components/ui/dataTable'
import {
  IconMedicineBox,
  IconStethoscope,
  IconUserCheck,
  IconCheckupList
} from '@/app/components/icons/icons'
import { StatusBadge } from './statusBadge'
import { StateRecord } from '@/lib/constants'

type FichaActionData = {
  fichaId: string
  cedula: string
  nombre: string
}

interface FichasStatusTableProps {
  title: string
  fichas: any[]
  noDataMessage: string
  waitingMode?: boolean
  // acciones por estado
  onAssignDoctor?: (data: FichaActionData) => void // ENFERMERIA → EN_ESPERA (abre FormAssign)
  onRevertToQueue?: (data: FichaActionData) => void // CANCELADA → reasignar (abre FormReassign)
  onCallTriage?: (data: FichaActionData) => void // ADMISION → ENFERMERIA (PATCH directo)
  onCallPatient?: (data: FichaActionData) => void // EN_ESPERA → ATENDIENDO
  onFinishAttention?: (data: FichaActionData) => void // ATENDIENDO → ATENDIDA
  onRegisterTreatment?: (fichaId: string) => void // navega a tratamientos
  onCancel?: (data: FichaActionData) => void // → CANCELADA
}

const columnas = [
  { campo: '# Ficha' },
  { campo: 'Paciente' },
  { campo: 'Especialidad' },
  { campo: 'Doctor Asignado' },
  { campo: 'Estado' },
  { campo: '' }
]

/** Devuelve la clase CSS para resaltar la fila según el estado */
const getRowStyle = (estado: string): string => {
  switch (estado) {
    case StateRecord.ENFERMERIA:
      return 'bg-green-50 !border-l-4 !border-l-green-400'
    case StateRecord.EN_ESPERA:
      return 'bg-blue-50 !border-l-4 !border-l-blue-400'
    case StateRecord.ATENDIENDO:
      return 'bg-purple-50 !border-l-4 !border-l-purple-500'
    default:
      return ''
  }
}

export default function FichasStatusTable({
  title,
  fichas,
  noDataMessage,
  waitingMode,
  onAssignDoctor,
  onRevertToQueue,
  onCallTriage,
  onCallPatient,
  onFinishAttention,
  onRegisterTreatment
  // onCancel
}: FichasStatusTableProps) {
  const [activeTab, setActiveTab] = useState(
    waitingMode ? StateRecord.ADMISION : 'all'
  )

  const specialities: string[] = Array.from(
    new Set(
      fichas.map((ficha: any) => ficha?.especialidad_nombre).filter(Boolean)
    )
  )

  const filteredFichas = fichas.filter((f: any) => {
    if (waitingMode) {
      if (activeTab === StateRecord.ADMISION)
        return (
          f.estado === StateRecord.ADMISION ||
          f.estado === StateRecord.ENFERMERIA
        )
      return f.especialidad_nombre === activeTab
    }
    if (activeTab === 'all') return true
    return f.especialidad_nombre === activeTab
  })

  const tableContent = filteredFichas.map((ficha: any, index: number) => {
    const d: FichaActionData = {
      fichaId: ficha.ficha_id,
      cedula: ficha.paciente_id,
      nombre: ficha.paciente_nombres
    }

    return [
      <span
        className='font-semibold text-primary-700 text-step-1'
        key={`id-${index}`}
      >
        # {index + 1}
      </span>,
      ficha?.paciente_nombres,
      ficha?.especialidad_nombre || (
        <span
          className='text-gray-400 italic text-xs'
          key={`especialidad-${index}`}
        >
          Sin asignar
        </span>
      ),
      ficha?.doctor_nombre || (
        <span className='text-gray-400 italic text-xs' key={`doctor-${index}`}>
          Sin asignar
        </span>
      ),
      <StatusBadge status={ficha.estado} key={`status-${index}`} />,
      <div className='flex items-center gap-1.5' key={`action-${index}`}>
        {/* ADMISION → Llamar para triage (PATCH directo sin modal) */}
        {ficha.estado === StateRecord.ADMISION && onCallTriage && (
          <button
            onClick={() => onCallTriage(d)}
            title='Llamar al paciente para triage'
            className='px-2 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors font-medium cursor-pointer flex items-center gap-1'
          >
            <IconStethoscope size='14' />
            Llamar
          </button>
        )}

        {/* ENFERMERIA → Asignar médico (abre FormAssign) */}
        {ficha.estado === StateRecord.ENFERMERIA && onAssignDoctor && (
          <button
            onClick={() => onAssignDoctor(d)}
            title='Asignar médico y especialidad'
            className='px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors font-medium cursor-pointer flex items-center gap-1'
          >
            <IconCheckupList size='14' />
            Asignar médico
          </button>
        )}

        {/* EN_ESPERA → Llamar al paciente (PATCH a ATENDIENDO) */}
        {ficha.estado === StateRecord.EN_ESPERA && onCallPatient && (
          <button
            onClick={() => onCallPatient(d)}
            title='Llamar al paciente al consultorio'
            className='px-2 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors font-medium cursor-pointer flex items-center gap-1'
          >
            <IconUserCheck size='14' />
            Llamar
          </button>
        )}

        {/* ATENDIENDO → Finalizar + Tratamiento */}
        {ficha.estado === StateRecord.ATENDIENDO && (
          <>
            {onFinishAttention && (
              <button
                onClick={() => onFinishAttention(d)}
                title='Marcar como atendido'
                className='px-2 py-1 bg-neutral-700 text-white text-xs rounded-md hover:bg-neutral-800 transition-colors font-medium cursor-pointer flex items-center gap-1'
              >
                <IconUserCheck size='14' />
                Atendido
              </button>
            )}
            {onRegisterTreatment && (
              <button
                onClick={() => onRegisterTreatment(ficha.ficha_id)}
                title='Registrar tratamiento de vacunación'
                className='px-2 py-1 bg-cyan-700 text-white text-xs rounded-md hover:bg-cyan-800 transition-colors font-medium cursor-pointer flex items-center gap-1'
              >
                <IconCheckupList size='14' />
                Tratamiento
              </button>
            )}
          </>
        )}

        {/* CANCELADA → Reasignar */}
        {ficha.estado === StateRecord.CANCELADA && onRevertToQueue && (
          <button
            onClick={() => onRevertToQueue(d)}
            title='Reasignar paciente'
            className='text-primary-600 hover:text-primary-800 transition-colors cursor-pointer'
          >
            <IconMedicineBox size='20' />
          </button>
        )}
      </div>
    ]
  })

  return (
    <>
      <h3 className='text-step-2 font-bold text-gray-700 mb-2 mt-6'>{title}</h3>
      <div className='bg-white mb-6 rounded-md'>
        <div className='border-b border-gray-200 flex flex-wrap'>
          {!waitingMode && (
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
          )}

          {waitingMode && (
            <button
              className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 ${
                activeTab === StateRecord.ADMISION
                  ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-700'
              }`}
              onClick={() => setActiveTab(StateRecord.ADMISION)}
            >
              Sin llamar
            </button>
          )}

          {specialities.map((speciality: string, index: number) => {
            return (
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
            )
          })}
        </div>
        <div className='p-4'>
          {tableContent.length > 0 ? (
            <CustomDataTable
              columnas={columnas}
              contenidoTabla={tableContent}
              estilosPersonalizadosFila={(index, _fila) =>
                getRowStyle(filteredFichas[index]?.estado ?? '')
              }
            />
          ) : (
            <p className='text-gray-500 italic'>{noDataMessage}</p>
          )}
        </div>
      </div>
    </>
  )
}
