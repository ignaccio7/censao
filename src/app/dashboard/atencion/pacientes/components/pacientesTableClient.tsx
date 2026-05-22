'use client'

import { useState } from 'react'
import CustomDataTable from '@/app/components/ui/dataTable'
import Modal from '@/app/components/ui/modal/modal'
import useModal from '@/hooks/useModal'
import FormEditPaciente from './FormEditPaciente'
import ConfirmDeletePaciente from './ConfirmDeletePaciente'
import {
  IconHistory,
  IconPencil
  // IconTrash,
} from '@/app/components/icons/icons'
import Link from 'next/link'
import { Roles } from '@/lib/constants'

export default function PacientesTableClient({
  pacientes,
  userRole
}: {
  pacientes: any[]
  userRole?: string
}) {
  const { modal, openModal, closeModal } = useModal()
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null)

  //TODOHOY: ver como refactorizar esto
  const columnasRegistrados = [
    { campo: 'CI' },
    { campo: 'Nombre Completo' },
    { campo: 'Teléfono' },
    { campo: 'Sexo' },
    { campo: 'Fichas' },
    { campo: 'Acciones' }
  ]

  const contenidoRegistrados =
    pacientes?.map((paciente: any) => {
      // Si es DOCTOR_GENERAL mostramos solo el resumen de consultas (sin editar)
      if (userRole === Roles.DOCTOR_GENERAL) {
        return [
          <span
            key={`ci-${paciente.paciente_id}`}
            className='font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200'
          >
            {paciente.paciente_id}
          </span>,
          `${paciente.personas.paterno} ${paciente.personas.materno || ''} ${paciente.personas.nombres}`.trim(),
          paciente.personas.telefono || '-',
          paciente.sexo || '-',
          <span
            key={`fichas-${paciente.paciente_id}`}
            className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold'
          >
            {paciente._count?.fichas || 0}
          </span>,
          <div
            key={`actions-${paciente.paciente_id}`}
            className='flex gap-2 items-center'
          >
            <Link
              href={`/dashboard/consultas/paciente/${paciente.paciente_id}`}
            >
              <button
                className='px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm cursor-pointer'
                title='Ver resumen de consultas'
              >
                <IconHistory />
              </button>
            </Link>
          </div>
        ]
      }

      return [
        <span
          key={`ci-${paciente.paciente_id}`}
          className='font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200'
        >
          {paciente.paciente_id}
        </span>,
        `${paciente.personas.paterno} ${paciente.personas.materno || ''} ${paciente.personas.nombres}`.trim(),
        paciente.personas.telefono || '-',
        paciente.sexo || '-',
        <span
          key={`fichas-${paciente.paciente_id}`}
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
            className='px-3 py-1.5 bg-amber-400 text-white rounded-md hover:bg-amber-500 transition-colors text-sm font-medium shadow-sm cursor-pointer'
            title='Editar'
          >
            <IconPencil />
          </button>
          {/* TODO: ver como usar esta funcionalidad para eliminar pacientes si esque sirve o no  */}
          {/* <button
            onClick={() => {
              setPacienteSeleccionado({
                pacienteId: paciente.paciente_id,
                nombreCompleto: `${paciente.personas.nombres} ${paciente.personas.paterno}`
              })
              setModalType('delete')
              openModal()
            }}
            className='px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium shadow-sm cursor-pointer'
            title='Eliminar'
          >
            <IconTrash />
          </button> */}
          <Link href={`/dashboard/atencion/pacientes/${paciente.paciente_id}`}>
            <button
              className='px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm cursor-pointer'
              title='Ver detalle'
            >
              <IconHistory />
            </button>
          </Link>
        </div>
      ]
    }) || []

  return (
    <>
      <CustomDataTable
        columnas={columnasRegistrados}
        contenidoTabla={contenidoRegistrados}
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
    </>
  )
}
