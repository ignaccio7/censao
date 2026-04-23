'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/app/services/client'
import CustomDataTable from '@/app/components/ui/dataTable'
import Modal from '@/app/components/ui/modal/modal'
import useModal from '@/hooks/useModal'
import FormEditPaciente from './components/FormEditPaciente'
import ConfirmDeletePaciente from './components/ConfirmDeletePaciente'
import Link from 'next/link'

export default function PacientesPage() {
  const { modal, openModal, closeModal } = useModal()
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['atencion-pacientes'],
    queryFn: () =>
      apiClient.get('atencion/pacientes').then(res => res.data.data)
  })

  const columnas = [
    { campo: 'CI' },
    { campo: 'Nombre Completo' },
    { campo: 'Teléfono' },
    { campo: 'Sexo' },
    { campo: 'Fichas' },
    { campo: 'Acciones' }
  ]

  const contenidoTabla =
    data?.map((paciente: any) => [
      paciente.paciente_id,
      `${paciente.personas.paterno} ${paciente.personas.materno || ''} ${paciente.personas.nombres}`.trim(),
      paciente.personas.telefono || '-',
      paciente.sexo || '-',
      <span
        key={paciente.paciente_id}
        className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold'
      >
        {paciente._count?.fichas || 0}
      </span>,
      <div
        key={`actions-${paciente.paciente_id}`}
        className='flex gap-2 items-center flex-wrap'
      >
        <button
          onClick={() => {
            setPacienteSeleccionado({
              pacienteId: paciente.paciente_id,
              ci: paciente.personas.ci,
              nombres: paciente.personas.nombres,
              paterno: paciente.personas.paterno,
              materno: paciente.personas.materno,
              telefono: paciente.personas.telefono,
              correo: paciente.personas.correo,
              direccion: paciente.personas.direccion,
              sexo: paciente.sexo,
              grupoSanguineo: paciente.grupo_sanguineo
            })
            setModalType('edit')
            openModal()
          }}
          className='px-3 py-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium shadow-sm'
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => {
            setPacienteSeleccionado({
              pacienteId: paciente.paciente_id,
              nombreCompleto: `${paciente.personas.nombres} ${paciente.personas.paterno}`
            })
            setModalType('delete')
            openModal()
          }}
          className='px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium shadow-sm'
        >
          🗑️ Eliminar
        </button>
        <Link href={`/dashboard/atencion/pacientes/${paciente.paciente_id}`}>
          <button className='px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm'>
            📋 Ver Fichas
          </button>
        </Link>
      </div>
    ]) || []

  return (
    <div className='flex flex-col gap-6 animate-fade-in pb-8'>
      <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-2'>
        <h1 className='text-2xl font-bold text-gray-800 mb-2'>
          Pacientes Registrados
        </h1>
        <p className='text-gray-600'>
          Gestiona los pacientes que has registrado en el centro de salud.
          Puedes editar sus datos, eliminarlos o revisar su historial de
          atenciones.
        </p>
      </div>

      <CustomDataTable
        cargando={isLoading}
        error={isError}
        columnas={columnas}
        contenidoTabla={contenidoTabla}
        numeracion={true}
        contenidoCuandoVacio='No hay pacientes registrados por ti.'
      />

      <Modal
        isOpen={modal}
        onClose={closeModal}
        title={
          modalType === 'edit' ? 'Editar Paciente' : 'Confirmar Eliminación'
        }
        maxWidth='lg'
      >
        {modalType === 'edit' && pacienteSeleccionado && (
          <FormEditPaciente {...pacienteSeleccionado} />
        )}
        {modalType === 'delete' && pacienteSeleccionado && (
          <ConfirmDeletePaciente {...pacienteSeleccionado} />
        )}
      </Modal>
    </div>
  )
}
