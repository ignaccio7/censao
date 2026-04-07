'use client'
import { useState } from 'react'
import CustomDataTable from '@/app/components/ui/dataTable'
import { IconDotsVertical, IconHistory } from '@/app/components/icons/icons'
import { StatusBadge } from './statusBadge'

interface FichasStatusTableProps {
  title: string
  fichas: any[]
  noDataMessage: string
  onRevertToQueue?: (data: {
    fichaId: string
    cedula: string
    nombre: string
  }) => void
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
  onRevertToQueue
}: FichasStatusTableProps) {
  const [activeTab, setActiveTab] = useState('all')

  const specialities: string[] = Array.from(
    new Set(
      fichas.map((ficha: any) => ficha?.especialidad_nombre).filter(Boolean)
    )
  )

  const filteredFichas =
    activeTab !== 'all'
      ? fichas.filter((f: any) => f.especialidad_nombre === activeTab)
      : fichas

  const tableContent = filteredFichas.map((ficha: any, index: number) => {
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
      <div className='flex items-center gap-2' key={`action-${index}`}>
        <IconDotsVertical />
        {ficha.estado === 'CANCELADA' && onRevertToQueue && (
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
            <IconHistory size='20' />
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
