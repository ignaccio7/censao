'use client'
import { useState } from 'react'
import CustomDataTable from '@/app/components/ui/dataTable'
import { IconHistory, IconMedicineBox } from '@/app/components/icons/icons'
import { StatusBadge } from './statusBadge'
import { StateRecord } from '@/lib/constants'

interface FichasStatusTableProps {
  title: string
  fichas: any[]
  noDataMessage: string
  onAssignDoctor?: (data: {
    fichaId: string
    cedula: string
    nombre: string
  }) => void
  onRevertToQueue?: (data: {
    fichaId: string
    cedula: string
    nombre: string
  }) => void
  waitingMode?: boolean
}

const columnas = [
  { campo: '# Ficha' },
  { campo: 'Paciente' },
  { campo: 'Especialidad' },
  { campo: 'Doctor Asignado' },
  { campo: 'Estado' },
  { campo: '' }
]

export default function FichasStatusTable({
  title,
  fichas,
  noDataMessage,
  onAssignDoctor,
  onRevertToQueue,
  waitingMode
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
        return f.estado === StateRecord.ADMISION
      return f.especialidad_nombre === activeTab
    }
    if (activeTab === 'all') return true
    return f.especialidad_nombre === activeTab
  })

  const tableContent = filteredFichas.map((ficha: any, index: number) => {
    return [
      <span
        className='font-semibold text-primary-700 text-step-1'
        key={`id-${index}`}
      >
        # {index + 1}
      </span>,
      ficha?.paciente_nombres,
      ficha?.especialidad_nombre || 'Sin asignar',
      ficha?.doctor_nombre || 'Sin asignar',
      <StatusBadge status={ficha.estado} key={`status-${index}`} />,
      <div className='flex items-center gap-2' key={`action-${index}`}>
        {
          // Para asignar doctor
          ficha.estado === StateRecord.ADMISION && onAssignDoctor && (
            <button
              onClick={() =>
                onAssignDoctor({
                  fichaId: ficha.ficha_id,
                  cedula: ficha.paciente_id,
                  nombre: ficha.paciente_nombres
                })
              }
              title='Asignar paciente'
              className='text-primary-600 hover:text-primary-800 transition-colors cursor-pointer'
            >
              <IconHistory size='20' />
            </button>
          )
        }
        {/* // Para reasignar y que vuelva a la fila */}
        {ficha.estado === StateRecord.CANCELADA && onRevertToQueue && (
          <button
            onClick={() =>
              onRevertToQueue({
                fichaId: ficha.ficha_id,
                cedula: ficha.paciente_id,
                nombre: ficha.paciente_nombres
              })
            }
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
              Sin asignar
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
            />
          ) : (
            <p className='text-gray-500 italic'>{noDataMessage}</p>
          )}
        </div>
      </div>
    </>
  )
}
