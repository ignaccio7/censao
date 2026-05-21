'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import 'react-day-picker/dist/style.css'
import {
  IconArrowDown,
  IconPencil,
  IconTrash
} from '@/app/components/icons/icons'
import Modal from '@/app/components/ui/modal/modal'
import { useCitas } from '@/app/services/citas'
import { useTratamientos } from '@/app/services/tratamientos'
import CitaForm from './citaForm'

// ── Types ─────────────────────────────────────────────────────────────────────
type Cita = {
  id: string
  fecha_programada: string
  tipo: string
  estado: string
  observaciones: string | null
}

type Tratamiento = {
  id: string
  estado: string
  observaciones: string | null
  fecha_aplicacion: string
  esquema_dosis: {
    numero: number
    intervalo_dias: number
    vacunas: { nombre: string }
  }
  citas: Cita[]
}

// Qué modal está abierto y con qué datos
type ModalState =
  | { type: 'none' }
  | { type: 'editTratamiento' }
  | { type: 'editCita'; cita: Cita }
  | { type: 'cancelCita'; cita: Cita }
  | { type: 'newCita' }

const ESTADO_TRATAMIENTO: Record<string, { label: string; color: string }> = {
  EN_CURSO: {
    label: 'En curso',
    color: 'border-blue-500 bg-blue-500/10 text-blue-700'
  },
  COMPLETADA: {
    label: 'Completado',
    color: 'border-green-500 bg-green-500/10 text-green-700'
  },
  INCOMPLETA: {
    label: 'Incompleto',
    color: 'border-amber-500 bg-amber-500/10 text-amber-700'
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'border-red-500 bg-red-500/10 text-red-700'
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-BO', {
    timeZone: 'America/La_Paz',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

// ── Main Component ────────────────────────────────────────────────────────────
export default function TratamientoAccordion({
  tratamiento,
  pacienteId
}: {
  tratamiento: Tratamiento
  pacienteId: string
}) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState<ModalState>({ type: 'none' })

  // Estado del formulario — compartido entre "editar cita" y "nueva cita"
  const [citaTipo, setCitaTipo] = useState<'VACUNA' | 'CONTROL' | 'CONSULTA'>(
    'VACUNA'
  )
  const [citaObs, setCitaObs] = useState('')
  const [citaFecha, setCitaFecha] = useState<Date | undefined>()
  // Estado del formulario — editar tratamiento
  const [editObs, setEditObs] = useState(tratamiento.observaciones || '')

  // Lista de citas con actualización optimista (refleja cambios sin recargar)
  const [localCitas, setLocalCitas] = useState<Cita[]>(tratamiento.citas)

  const { createCita, updateCita, cancelCita } = useCitas(pacienteId)
  const { updateTratamiento } = useTratamientos()

  const configEstado = ESTADO_TRATAMIENTO[tratamiento.estado] ?? {
    label: tratamiento.estado,
    color: 'border-gray-500 bg-gray-500/10 text-gray-700'
  }

  const closeModal = () => setModal({ type: 'none' })

  // ── Abrir modales ──────────────────────────────────────────────────────────
  const openEditTratamiento = () => {
    setEditObs(tratamiento.observaciones || '')
    setModal({ type: 'editTratamiento' })
  }

  const openEditCita = (cita: Cita) => {
    setCitaTipo((cita.tipo as 'VACUNA' | 'CONTROL' | 'CONSULTA') ?? 'VACUNA')
    setCitaObs(cita.observaciones || '')
    const d = new Date(cita.fecha_programada)
    d.setHours(0, 0, 0, 0)
    setCitaFecha(d)
    setModal({ type: 'editCita', cita })
  }

  const openNewCita = () => {
    setCitaTipo('VACUNA')
    setCitaObs('')
    setCitaFecha(undefined)
    setModal({ type: 'newCita' })
  }

  // ── Validación fecha ───────────────────────────────────────────────────────
  const validateFecha = (fecha: Date | undefined): boolean => {
    if (!fecha) {
      toast.error('Debes seleccionar una fecha')
      return false
    }
    const d = new Date(fecha)
    d.setHours(0, 0, 0, 0)
    if (d < TODAY) {
      toast.error('No puedes agendar citas en el pasado')
      return false
    }
    if (d.getDay() === 0 || d.getDay() === 6) {
      toast.error('Solo Lunes a Viernes')
      return false
    }
    return true
  }

  const buildIso = (fecha: Date) => {
    const d = new Date(fecha)
    d.setHours(8, 0, 0, 0)
    return d.toISOString()
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveTratamiento = async () => {
    try {
      await updateTratamiento.mutateAsync({
        id: tratamiento.id,
        data: { observaciones: editObs.trim() || null }
      })
      tratamiento.observaciones = editObs.trim() || null
      toast.success('Observaciones actualizadas')
    } catch {
      toast.error('Error al actualizar')
    } finally {
      closeModal()
    }
  }

  const handleSaveEditCita = async () => {
    if (!validateFecha(citaFecha) || modal.type !== 'editCita') return
    try {
      const result = await updateCita.mutateAsync({
        id: modal.cita.id,
        data: {
          fechaProgramada: buildIso(citaFecha!),
          tipo: citaTipo,
          observaciones: citaObs.trim() || null
        }
      })
      if (result.success) {
        setLocalCitas(prev =>
          prev.map(c => (c.id === modal.cita.id ? { ...c, ...result.data } : c))
        )
        toast.success('Cita actualizada')
        closeModal()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Error al actualizar la cita')
    }
  }

  const handleCancelCita = async () => {
    if (modal.type !== 'cancelCita') return
    try {
      const result = await cancelCita.mutateAsync(modal.cita.id)
      if (result.success) {
        setLocalCitas(prev =>
          prev.map(c =>
            c.id === modal.cita.id ? { ...c, estado: 'CANCELADA' } : c
          )
        )
        toast.success('Cita cancelada')
        closeModal()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Error al cancelar la cita')
    }
  }

  const handleCreateCita = async () => {
    if (!validateFecha(citaFecha)) return
    try {
      const result = await createCita.mutateAsync({
        tratamientoId: tratamiento.id,
        fechaProgramada: buildIso(citaFecha!),
        tipo: citaTipo,
        observaciones: citaObs.trim() || undefined
      })
      if (result.success) {
        setLocalCitas(prev => [...prev, result.data as Cita])
        toast.success(
          `Cita programada para el ${formatDateLong(result.data.fecha_programada)}`
        )
        closeModal()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Error al programar la cita')
    }
  }

  console.log(tratamiento)

  return (
    <>
      {/* ── ACORDEÓN ─────────────────────────────────────────────────────── */}
      <div className='rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200'>
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 sm:p-5 transition-colors ${open ? 'bg-gray-50/80 border-b border-gray-200' : 'bg-white hover:bg-gray-50'}`}
        >
          {/* Toggle (solo el lado izquierdo es clickeable para abrir/cerrar) */}
          <button
            onClick={() => setOpen(!open)}
            className='flex items-center gap-4 flex-1 text-left cursor-pointer'
          >
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-bold transition-colors ${open ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              <IconArrowDown
                className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
              />
            </span>
            <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 min-w-0'>
              <div>
                <p className='text-base sm:text-lg font-bold text-gray-900'>
                  Dosis #{tratamiento.esquema_dosis?.numero}
                </p>
                <p className='text-xs sm:text-sm text-gray-500 font-medium mt-0.5'>
                  Aplicada el {formatDate(tratamiento.fecha_aplicacion)}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${configEstado.color}`}
              >
                {configEstado.label}
              </span>
            </div>
          </button>

          {/* Acciones del lado derecho — NO abren el acordeón */}
          <div className='flex items-center gap-3 ml-3 shrink-0'>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full hidden sm:block ${localCitas.length > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {localCitas.length} {localCitas.length === 1 ? 'cita' : 'citas'}
            </span>
            <button
              onClick={openEditTratamiento}
              title='Editar observaciones'
              className='flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 text-gray-500 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer'
            >
              <IconPencil className='w-3.5 h-3.5' />
              <span className='hidden sm:inline'>Obs.</span>
            </button>
          </div>
        </div>

        {/* Body animado */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className='overflow-hidden'>
            {/* Observaciones del tratamiento */}
            {tratamiento.observaciones && (
              <div className='px-5 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-800'>
                <span className='font-semibold'>Nota clínica: </span>
                {tratamiento.observaciones}
              </div>
            )}

            {/* Cabecera tabla */}
            <div className='bg-gray-50 px-4 py-2 sm:px-6 grid grid-cols-4 gap-4 border-b border-gray-100'>
              {['Fecha', 'Tipo', 'Estado', 'Acciones'].map(h => (
                <span
                  key={h}
                  className='text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider'
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Filas */}
            <div className='flex flex-col'>
              {localCitas.length === 0 ? (
                <p className='p-6 text-center text-gray-500 text-sm'>
                  No hay citas programadas para esta dosis.
                </p>
              ) : (
                localCitas.map(cita => (
                  <div
                    key={cita.id}
                    className={`grid grid-cols-4 gap-4 items-center px-4 py-3 sm:px-6 border-b border-gray-50 transition-colors ${cita.estado === 'CANCELADA' ? 'bg-red-50/30 opacity-60' : 'bg-white hover:bg-gray-50/50'}`}
                  >
                    <span
                      className={`text-sm font-semibold ${cita.estado === 'CANCELADA' ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                    >
                      {formatDate(cita.fecha_programada)}
                    </span>
                    <span className='text-sm text-gray-600 font-medium'>
                      {cita.tipo}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border w-fit ${
                        cita.estado === 'PENDIENTE'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : cita.estado === 'CANCELADA'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {cita.estado}
                    </span>
                    <div className='flex items-center gap-1.5'>
                      {cita.estado !== 'CANCELADA' ? (
                        <>
                          <button
                            onClick={() => openEditCita(cita)}
                            disabled={updateCita.isPending}
                            title='Editar'
                            className='inline-flex items-center p-1.5 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 border border-blue-100 cursor-pointer disabled:opacity-50 transition-colors'
                          >
                            <IconPencil className='w-3.5 h-3.5 sm:mr-1.5' />
                            <span className='hidden sm:inline text-xs font-bold'>
                              Editar
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              setModal({ type: 'cancelCita', cita })
                            }
                            disabled={cancelCita.isPending}
                            title='Cancelar'
                            className='inline-flex items-center p-1.5 sm:px-3 sm:py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 border border-red-100 cursor-pointer disabled:opacity-50 transition-colors'
                          >
                            <IconTrash className='w-3.5 h-3.5 sm:mr-1.5' />
                            <span className='hidden sm:inline text-xs font-bold'>
                              Cancelar cita
                            </span>
                          </button>
                        </>
                      ) : (
                        <span className='text-[10px] text-gray-400 italic'>
                          Sin acciones
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className='p-3 sm:p-4 bg-gray-50/50 flex justify-end'>
              <button
                onClick={openNewCita}
                className='inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer'
              >
                <svg
                  className='w-3.5 h-3.5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2.5'
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                Programar Nueva Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: Editar observaciones del tratamiento ─────────────────── */}
      <Modal
        isOpen={modal.type === 'editTratamiento'}
        onClose={closeModal}
        title='Editar Observaciones'
      >
        <div className='space-y-4'>
          <textarea
            value={editObs}
            onChange={e => setEditObs(e.target.value)}
            placeholder='Notas sobre la aplicación de esta dosis...'
            maxLength={1000}
            rows={4}
            className='w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary-500 resize-none'
          />
          <p className='text-[11px] text-gray-400 text-right'>
            {editObs.length}/1000
          </p>
          <div className='flex gap-3'>
            <button
              onClick={closeModal}
              className='flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer'
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveTratamiento}
              disabled={updateTratamiento.isPending}
              className='flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 cursor-pointer'
            >
              {updateTratamiento.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Editar cita ──────────────────────────────────────────── */}
      <Modal
        isOpen={modal.type === 'editCita'}
        onClose={closeModal}
        title='Editar Cita Programada'
        maxWidth='lg'
      >
        <CitaForm
          tipo={citaTipo}
          observaciones={citaObs}
          fecha={citaFecha}
          onTipoChange={setCitaTipo}
          onObsChange={setCitaObs}
          onFechaChange={setCitaFecha}
          onCancel={closeModal}
          onSubmit={handleSaveEditCita}
          isPending={updateCita.isPending}
          submitLabel='Guardar cambios'
          today={TODAY}
        />
      </Modal>

      {/* ── MODAL: Nueva cita ───────────────────────────────────────────── */}
      <Modal
        isOpen={modal.type === 'newCita'}
        onClose={closeModal}
        title='Programar Nueva Cita'
        maxWidth='lg'
      >
        <CitaForm
          tipo={citaTipo}
          observaciones={citaObs}
          fecha={citaFecha}
          onTipoChange={setCitaTipo}
          onObsChange={setCitaObs}
          onFechaChange={setCitaFecha}
          onCancel={closeModal}
          onSubmit={handleCreateCita}
          isPending={createCita.isPending}
          submitLabel='Programar cita'
          submitColor='bg-emerald-600 hover:bg-emerald-700'
          today={TODAY}
        />
      </Modal>

      {/* ── MODAL: Confirmar cancelación ────────────────────────────────── */}
      <Modal
        isOpen={modal.type === 'cancelCita'}
        onClose={closeModal}
        title='Cancelar Cita'
      >
        {modal.type === 'cancelCita' && (
          <div className='space-y-4'>
            <div className='bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-800'>
              <p className='font-semibold mb-2'>¿Cancelar esta cita?</p>
              <p>
                Fecha:{' '}
                <span className='font-bold'>
                  {formatDateLong(modal.cita.fecha_programada)}
                </span>
              </p>
              <p>
                Tipo: <span className='font-bold'>{modal.cita.tipo}</span>
              </p>
              {modal.cita.observaciones && (
                <p className='mt-1 italic'>{modal.cita.observaciones}</p>
              )}
              <p className='mt-2 text-red-500 text-xs'>
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={closeModal}
                className='flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer'
              >
                Volver
              </button>
              <button
                onClick={handleCancelCita}
                disabled={cancelCita.isPending}
                className='flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer'
              >
                {cancelCita.isPending ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
