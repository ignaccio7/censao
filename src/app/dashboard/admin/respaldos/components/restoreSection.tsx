'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { backupFileSchema } from '../schemas'
import RestoreModal from './restoreModal'
import type { BackupFile } from '../interfaces'
import {
  IconAlertTriangle,
  IconCornerRightUp,
  IconSpin
} from '@/app/components/icons/icons'

// ─── RestoreSection ───────────────────────────────────────────────────────────
// Sección para seleccionar un archivo JSON y restaurar la base de datos.
export default function RestoreSection() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [backupCargado, setBackupCargado] = useState<BackupFile | null>(null)
  const [leyendoArchivo, setLeyendoArchivo] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Procesa el archivo seleccionado ──────────────────────────────────────
  const handleArchivoSeleccionado = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    if (!archivo.name.endsWith('.json')) {
      toast.error('El archivo debe ser un JSON (.json)')
      return
    }

    setLeyendoArchivo(true)

    const reader = new FileReader()
    reader.onload = event => {
      try {
        const contenido = event.target?.result as string
        const json = JSON.parse(contenido)

        // Validar estructura con Zod antes de mostrar el modal
        const validacion = backupFileSchema.safeParse(json)

        if (!validacion.success) {
          toast.error(
            'El archivo no es un respaldo válido del sistema Censao. Verifique que sea un archivo generado por este sistema.'
          )
          console.error(
            '[RestoreSection] Validación Zod:',
            validacion.error.flatten()
          )
          setLeyendoArchivo(false)
          // Limpiar input para permitir seleccionar de nuevo
          if (inputRef.current) inputRef.current.value = ''
          return
        }

        setBackupCargado(validacion.data as unknown as BackupFile)
        setModalAbierto(true)
      } catch {
        toast.error(
          'No se pudo leer el archivo. Asegúrese de que sea un JSON válido.'
        )
      } finally {
        setLeyendoArchivo(false)
        // Limpiar input para permitir seleccionar el mismo archivo de nuevo
        if (inputRef.current) inputRef.current.value = ''
      }
    }
    reader.onerror = () => {
      toast.error('Error al leer el archivo.')
      setLeyendoArchivo(false)
    }
    reader.readAsText(archivo)
  }

  return (
    <>
      {/* Input oculto para seleccionar archivo */}
      <input
        ref={inputRef}
        id='restore-file-input'
        type='file'
        accept='.json,application/json'
        className='hidden'
        onChange={handleArchivoSeleccionado}
      />

      {/* Card */}
      <div className='bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col gap-4 max-w-3xl'>
        <div className='flex items-start gap-3'>
          <div className='w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0'>
            <IconCornerRightUp className='text-red-500' />
          </div>
          <div>
            <h2 className='text-xl font-bold text-gray-800'>
              Restaurar Base de Datos
            </h2>
            <p className='text-red-600 text-sm font-medium mt-0.5 flex items-center gap-2'>
              <IconAlertTriangle size='16' /> Operación de alto riesgo —
              Irreversible
            </p>
          </div>
        </div>

        <p className='text-gray-600 text-step-0'>
          Esta acción reemplazará <strong>completamente</strong> la base de
          datos actual con la información contenida en un archivo de respaldo
          previamente generado por este sistema. Todos los datos actuales serán{' '}
          <strong className='text-red-600'>eliminados permanentemente</strong>.
        </p>

        <p className='text-gray-600 text-step-0'>
          Antes de continuar, el sistema le mostrará una vista previa del
          respaldo seleccionado y le solicitará una confirmación explícita para
          proceder.
        </p>

        <div className='actions mt-2'>
          <button
            id='btn-seleccionar-respaldo'
            onClick={() => inputRef.current?.click()}
            disabled={leyendoArchivo}
            className={`flex gap-2 items-center border-2 py-2 px-4 text-step-1 rounded-lg transition-colors duration-200 cursor-pointer ${
              leyendoArchivo
                ? 'border-red-300 bg-red-50 text-red-400 cursor-not-allowed opacity-70'
                : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
            }`}
          >
            {leyendoArchivo ? (
              <>
                <IconSpin className='animate-spin' />
                Leyendo archivo...
              </>
            ) : (
              <>
                <IconAlertTriangle />
                Seleccionar archivo de respaldo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de 2 pasos */}
      <RestoreModal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false)
          setBackupCargado(null)
        }}
        backup={backupCargado}
      />
    </>
  )
}
