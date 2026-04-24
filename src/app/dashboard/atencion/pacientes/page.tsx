// src/app/dashboard/atencion/pacientes/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/app/services/client'
import CustomDataTable from '@/app/components/ui/dataTable'
import Modal from '@/app/components/ui/modal/modal'
import useModal from '@/hooks/useModal'
import FormEditPaciente from './components/FormEditPaciente'
import ConfirmDeletePaciente from './components/ConfirmDeletePaciente'
import Link from 'next/link'
import {
  IconHistory,
  IconPencil,
  IconTrash
} from '@/app/components/icons/icons'
import { toast } from 'sonner'

type Tab = 'registrados' | 'huerfanas'

export default function PacientesPage() {
  const { modal, openModal, closeModal } = useModal()
  const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null)
  const [tab, setTab] = useState<Tab>('registrados')

  const queryClient = useQueryClient()

  // Query principal — pacientes con fichas
  const {
    data: dataRegistrados,
    isLoading: loadingRegistrados,
    isError: errorRegistrados
  } = useQuery({
    queryKey: ['atencion-pacientes'],
    queryFn: () =>
      apiClient.get('atencion/pacientes').then(res => res.data.data)
  })

  // Query huérfanas
  const {
    data: dataHuerfanas,
    isLoading: loadingHuerfanas,
    isError: errorHuerfanas
  } = useQuery({
    queryKey: ['atencion-pacientes-huerfanas'],
    queryFn: () =>
      apiClient
        .get('atencion/pacientes?huerfanas=true')
        .then(res => res.data.data),
    enabled: tab === 'huerfanas' // solo carga cuando abre esa pestaña
  })

  // Mutation eliminar huérfana
  const eliminarHuerfana = useMutation({
    mutationFn: (pacienteId: string) =>
      apiClient
        .delete('atencion/pacientes', { data: { pacienteId } })
        .then(res => res.data),
    onSuccess: data => {
      toast.success(data.message)
      queryClient.invalidateQueries({
        queryKey: ['atencion-pacientes-huerfanas']
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar')
    }
  })

  // Columnas tabla principal
  const columnasRegistrados = [
    { campo: 'CI' },
    { campo: 'Nombre Completo' },
    { campo: 'Teléfono' },
    { campo: 'Sexo' },
    { campo: 'Fichas' },
    { campo: 'Acciones' }
  ]

  const contenidoRegistrados =
    dataRegistrados?.map((paciente: any) => [
      // CI ahora visible como badge
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
        <button
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
        </button>
        <Link href={`/dashboard/atencion/pacientes/${paciente.paciente_id}`}>
          <button
            className='px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm cursor-pointer'
            title='Ver Fichas'
          >
            <IconHistory />
          </button>
        </Link>
      </div>
    ]) || []

  // Columnas tabla huérfanas
  const columnasHuerfanas = [
    { campo: 'CI' },
    { campo: 'Nombre Completo' },
    { campo: 'Teléfono' },
    { campo: 'Registrado el' },
    { campo: 'Eliminar' }
  ]

  const contenidoHuerfanas =
    dataHuerfanas?.map((paciente: any) => [
      <span
        key={`ci-h-${paciente.paciente_id}`}
        className='font-mono text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md border border-red-200'
      >
        {paciente.paciente_id}
      </span>,
      `${paciente.personas.paterno} ${paciente.personas.materno || ''} ${paciente.personas.nombres}`.trim(),
      paciente.personas.telefono || '-',
      new Date(paciente.creado_en).toLocaleDateString('es-BO', {
        timeZone: 'America/La_Paz',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      <button
        key={`del-h-${paciente.paciente_id}`}
        onClick={() => eliminarHuerfana.mutate(paciente.paciente_id)}
        disabled={eliminarHuerfana.isPending}
        className='px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1'
        title='Eliminar registro huérfano'
      >
        <IconTrash />
        <span className='text-xs'>Eliminar</span>
      </button>
    ]) || []

  return (
    <div className='flex flex-col gap-6 animate-fade-in pb-8'>
      {/* Header */}
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

      {/* Tabs */}
      <div className='flex gap-2 border-b border-gray-200'>
        <button
          onClick={() => setTab('registrados')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
            tab === 'registrados'
              ? 'bg-white border border-b-white border-gray-200 text-primary-700 -mb-px'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Con fichas
        </button>
        <button
          onClick={() => setTab('huerfanas')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
            tab === 'huerfanas'
              ? 'bg-white border border-b-white border-gray-200 text-red-600 -mb-px'
              : 'text-gray-500 hover:text-red-500'
          }`}
        >
          Sin fichas
          {/* Badge con conteo si hay huérfanas cargadas */}
          {dataHuerfanas && dataHuerfanas.length > 0 && (
            <span className='bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold'>
              {dataHuerfanas.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido según tab */}
      {tab === 'registrados' && (
        <CustomDataTable
          cargando={loadingRegistrados}
          error={errorRegistrados}
          columnas={columnasRegistrados}
          contenidoTabla={contenidoRegistrados}
          numeracion={true}
          contenidoCuandoVacio='No hay pacientes registrados por ti.'
        />
      )}

      {tab === 'huerfanas' && (
        <div className='flex flex-col gap-3'>
          <div className='bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700'>
            <strong>⚠️ Registros sin fichas:</strong> Estos pacientes fueron
            creados pero no tienen ninguna ficha asociada. Probablemente son
            registros incorrectos. Puedes eliminarlos de forma segura.
          </div>
          <CustomDataTable
            cargando={loadingHuerfanas}
            error={errorHuerfanas}
            columnas={columnasHuerfanas}
            contenidoTabla={contenidoHuerfanas}
            numeracion={true}
            contenidoCuandoVacio='No hay registros huérfanos. ¡Todo limpio!'
          />
        </div>
      )}

      {/* Modal editar / eliminar (solo aplica a registrados) */}
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
