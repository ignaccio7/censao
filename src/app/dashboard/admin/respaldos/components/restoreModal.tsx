'use client'

import { useState } from 'react'
import Modal from '@/app/components/ui/modal/modal'
import { useRespaldos } from '@/app/services/respaldos'
import type { BackupFile, BackupEstadisticas } from '../interfaces'
import { IconAlertCircle, IconSpin } from '@/app/components/icons/icons'

interface RestoreModalProps {
  isOpen: boolean
  onClose: () => void
  backup: BackupFile | null
}

type ModalStep = 'preview' | 'confirm'

const PALABRA_CLAVE = 'RESTAURAR'

// ─── Formatea una fecha ISO UTC a formato legible en hora boliviana ───────────
function formatFechaBO(isoString: string): string {
  return new Date(isoString).toLocaleString('es-BO', {
    timeZone: 'America/La_Paz',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ─── Estadísticas resumidas ───────────────────────────────────────────────────
function EstadisticasGrid({ stats }: { stats: BackupEstadisticas }) {
  const items = [
    { label: 'Personas', valor: stats.personas, icono: '👤' },
    { label: 'Usuarios', valor: stats.usuarios, icono: '🔐' },
    { label: 'Pacientes', valor: stats.pacientes, icono: '🏥' },
    { label: 'Doctores', valor: stats.doctores, icono: '👨‍⚕️' },
    { label: 'Fichas', valor: stats.fichas, icono: '📋' },
    { label: 'Citas', valor: stats.citas, icono: '📅' },
    { label: 'Consultas', valor: stats.consultas, icono: '🩺' },
    { label: 'Tratamientos', valor: stats.tratamientos, icono: '💉' },
    { label: 'Vacunas', valor: stats.vacunas, icono: '🧪' },
    { label: 'Roles', valor: stats.roles, icono: '🛡️' }
  ]

  return (
    <div className='grid grid-cols-2 gap-2'>
      {items.map(({ label, valor, icono }) => (
        <div
          key={label}
          className='flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100'
        >
          <span className='text-xs text-gray-500 flex items-center gap-1'>
            <span>{icono}</span>
            {label}
          </span>
          <span className='text-sm font-semibold text-gray-800'>
            {valor.toLocaleString('es-BO')}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── RestoreModal ─────────────────────────────────────────────────────────────
export default function RestoreModal({
  isOpen,
  onClose,
  backup
}: RestoreModalProps) {
  const [step, setStep] = useState<ModalStep>('preview')
  const [palabraClave, setPalabraClave] = useState('')
  const { restaurarRespaldo } = useRespaldos()

  const confirmacionCorrecta = palabraClave === PALABRA_CLAVE

  // Reset al cerrar
  const handleClose = () => {
    setStep('preview')
    setPalabraClave('')
    onClose()
  }

  const handleRestaurar = async () => {
    if (!backup || !confirmacionCorrecta) return
    await restaurarRespaldo.mutateAsync(backup)
    // signOut() se ejecuta dentro del onSuccess del hook — no hace falta acá
  }

  if (!backup) return null

  const fechaFormateada = formatFechaBO(backup.metadata.fecha_generacion)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'preview'
          ? 'Vista Previa del Respaldo'
          : 'Confirmar Restauración'
      }
      maxWidth='lg'
      disableBackdropClick={restaurarRespaldo.isPending}
    >
      {/* ── PASO 1: Vista previa ─────────────────────────────────────────── */}
      {step === 'preview' && (
        <div className='flex flex-col gap-5'>
          {/* Metadata */}
          <div className='bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-3'>
            <h3 className='text-sm font-semibold text-blue-800 uppercase tracking-wide'>
              Información del Respaldo
            </h3>
            <div className='grid grid-cols-1 gap-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Fecha de creación</span>
                <span className='text-sm font-semibold text-gray-800'>
                  {fechaFormateada}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Generado por</span>
                <span className='text-sm font-semibold text-gray-800'>
                  {backup.metadata.generado_por}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Versión</span>
                <span className='text-sm font-semibold text-gray-800'>
                  v{backup.metadata.version}
                </span>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div>
            <h3 className='text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide'>
              Contenido del Respaldo
            </h3>
            <EstadisticasGrid
              stats={backup.metadata.estadisticas as BackupEstadisticas}
            />
          </div>

          {/* Acciones */}
          <div className='flex justify-end gap-3 pt-2 border-t border-gray-100'>
            <button
              onClick={handleClose}
              className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer'
            >
              Cancelar
            </button>
            <button
              onClick={() => setStep('confirm')}
              className='px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer font-medium'
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── PASO 2: Advertencia y confirmación ──────────────────────────── */}
      {step === 'confirm' && (
        <div className='flex flex-col gap-5'>
          {/* Bloque de advertencia */}
          <div className='bg-red-50 border-2 border-red-200 rounded-xl p-5 flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
              <span className='text-3xl'>
                <IconAlertCircle className='text-red-800' />
              </span>
              <h3 className='text-base font-bold text-red-800'>
                ADVERTENCIA — OPERACIÓN IRREVERSIBLE
              </h3>
            </div>

            <p className='text-sm text-red-700 leading-relaxed'>
              Se restaurará el respaldo generado el{' '}
              <strong>{fechaFormateada}</strong>. Todos los datos registrados
              después de esa fecha serán eliminados permanentemente. La base de
              datos actual será reemplazada completamente por la información del
              respaldo seleccionado.
            </p>

            <ul className='text-sm text-red-700 flex flex-col gap-1 pl-1'>
              <li className='flex items-start gap-2'>
                <span className='text-red-500 mt-0.5'>•</span>
                <span>
                  Todos los datos actuales serán{' '}
                  <strong>eliminados permanentemente</strong>.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-red-500 mt-0.5'>•</span>
                <span>
                  La base de datos será{' '}
                  <strong>reemplazada completamente</strong>.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-red-500 mt-0.5'>•</span>
                <span>
                  La operación es <strong>irreversible</strong>. No podrá
                  deshacer esto.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-red-500 mt-0.5'>•</span>
                <span>Su sesión será cerrada automáticamente al terminar.</span>
              </li>
            </ul>
          </div>

          {/* Campo de confirmación por palabra clave */}
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='restore-confirm-input'
              className='text-sm font-medium text-gray-700'
            >
              Para confirmar, escriba{' '}
              <code className='bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono text-xs font-bold'>
                {PALABRA_CLAVE}
              </code>{' '}
              en el campo de abajo:
            </label>
            <input
              id='restore-confirm-input'
              type='text'
              value={palabraClave}
              onChange={e => setPalabraClave(e.target.value)}
              placeholder={`Escriba ${PALABRA_CLAVE}`}
              disabled={restaurarRespaldo.isPending}
              autoComplete='off'
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono transition-colors outline-none focus:ring-2 disabled:opacity-50 ${
                palabraClave === ''
                  ? 'border-gray-200 focus:border-red-400 focus:ring-red-100'
                  : confirmacionCorrecta
                    ? 'border-green-400 bg-green-50 focus:ring-green-100 text-green-800'
                    : 'border-red-300 bg-red-50 focus:ring-red-100 text-red-800'
              }`}
            />
            {palabraClave !== '' && !confirmacionCorrecta && (
              <p className='text-xs text-red-500'>
                Texto incorrecto. Escriba exactamente: {PALABRA_CLAVE}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className='flex justify-between gap-3 pt-2 border-t border-gray-100'>
            <button
              onClick={() => {
                setStep('preview')
                setPalabraClave('')
              }}
              disabled={restaurarRespaldo.isPending}
              className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50'
            >
              ← Volver
            </button>

            <button
              onClick={handleRestaurar}
              disabled={!confirmacionCorrecta || restaurarRespaldo.isPending}
              className={`flex items-center gap-2 px-5 py-2 text-sm rounded-lg font-semibold transition-all ${
                confirmacionCorrecta && !restaurarRespaldo.isPending
                  ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-sm hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {restaurarRespaldo.isPending ? (
                <>
                  <IconSpin className='animate-spin' />
                  Restaurando base de datos...
                </>
              ) : (
                <>
                  <IconAlertCircle className='' /> Restaurar Base de Datos
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
