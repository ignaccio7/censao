'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { IconCircleX, IconClock } from '@/app/components/icons/icons'
import { useTurno } from '@/app/services/turnos'
import { turnoSchema, TurnoFormData } from '../schemas'
import Modal from '@/app/components/ui/modal/modal'

interface Props {
  turno: {
    codigo: string
    nombre: string
    hora_inicio: string // "HH:MM"
    hora_fin: string // "HH:MM"
  }
  onClose: () => void
}

export default function ModalEditarTurno({ turno, onClose }: Props) {
  const router = useRouter()
  const { updateTurno } = useTurno()
  const form = useForm<TurnoFormData>({
    resolver: zodResolver(turnoSchema),
    defaultValues: {
      nombre: turno.nombre,
      hora_inicio: turno.hora_inicio,
      hora_fin: turno.hora_fin
    }
  })
  useEffect(() => {
    return () => {}
  }, [])

  const onSubmit = async (data: TurnoFormData) => {
    try {
      const result = await updateTurno.mutateAsync({
        codigo: turno.codigo,
        ...data
      })
      if (result.success) {
        toast.success(result.message ?? 'Turno actualizado correctamente')
        router.refresh() // refresca el server component padre
        onClose()
      } else {
        toast.error(result.message ?? 'Error al actualizar')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Error de conexión')
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth='md'>
      <>
        {/* Header del modal */}
        <div className='flex items-center justify-between border-b border-gray-100 pb-4'>
          <div>
            <h2 className='text-base font-bold text-gray-800'>Editar turno</h2>
            <p className='text-xs text-gray-400 mt-0.5'>
              Código:{' '}
              <span className='font-semibold text-gray-600'>
                {turno.codigo}
              </span>
              · no modificable
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
          >
            <IconCircleX />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
          {/* Nombre */}
          <div className='flex flex-col gap-1'>
            <label
              className='text-sm font-semibold text-gray-700'
              htmlFor='turn'
            >
              Nombre del turno <span className='text-red-500'>*</span>
            </label>
            <input
              {...form.register('nombre')}
              placeholder='Ej. Turno Mañana'
              className={`p-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
                form.formState.errors.nombre
                  ? 'border-red-400 focus:ring-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600 bg-white'
              }`}
            />
            {form.formState.errors.nombre && (
              <span className='text-red-500 text-xs'>
                {form.formState.errors.nombre.message}
              </span>
            )}
          </div>

          {/* Horas — en fila */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1'>
              <label
                className='text-sm font-semibold text-gray-700 flex items-center gap-1'
                htmlFor='hora_inicio'
              >
                <IconClock size='14' />
                Hora inicio <span className='text-red-500'>*</span>
              </label>
              <input
                {...form.register('hora_inicio')}
                type='time'
                className={`p-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
                  form.formState.errors.hora_inicio
                    ? 'border-red-400 focus:ring-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600 bg-white'
                }`}
              />
              {form.formState.errors.hora_inicio && (
                <span className='text-red-500 text-xs'>
                  {form.formState.errors.hora_inicio.message}
                </span>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <label
                className='text-sm font-semibold text-gray-700 flex items-center gap-1'
                htmlFor='hora_fin'
              >
                <IconClock size='14' />
                Hora fin <span className='text-red-500'>*</span>
              </label>
              <input
                {...form.register('hora_fin')}
                type='time'
                className={`p-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
                  form.formState.errors.hora_fin
                    ? 'border-red-400 focus:ring-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600 bg-white'
                }`}
              />
              {form.formState.errors.hora_fin && (
                <span className='text-red-500 text-xs'>
                  {form.formState.errors.hora_fin.message}
                </span>
              )}
            </div>
          </div>

          {/* Error cruzado hora_inicio < hora_fin */}
          {form.formState.errors.hora_fin?.type === 'custom' && (
            <p className='text-red-500 text-xs flex items-center gap-1'>
              {form.formState.errors.hora_fin.message}
            </p>
          )}

          {/* Botones */}
          <div className='flex justify-end gap-2 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={updateTurno.isPending}
              className='flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            >
              {updateTurno.isPending ? (
                <>
                  <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
                  Guardando...
                </>
              ) : (
                <>
                  {/* <IconDeviceFloppy /> */}
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </>
    </Modal>
  )
}
