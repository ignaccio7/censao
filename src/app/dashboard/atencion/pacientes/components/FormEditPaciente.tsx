'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import useModal from '@/hooks/useModal'
import { editarPacienteSchema, EditarPacienteFormData } from '../schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/app/services/client'

interface FormEditPacienteProps {
  pacienteId: string
  ci: string
  nombres: string
  paterno: string
  materno: string | null
  telefono: string | null
  correo: string | null
  direccion: string | null
  sexo: string | null
  grupoSanguineo: string | null
}

export default function FormEditPaciente(props: FormEditPacienteProps) {
  const { closeModal } = useModal()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<EditarPacienteFormData>({
    resolver: zodResolver(editarPacienteSchema),
    defaultValues: {
      ci: props.ci,
      nombres: props.nombres,
      paterno: props.paterno,
      materno: props.materno,
      telefono: props.telefono || '',
      correo: props.correo || '',
      direccion: props.direccion || '',
      sexo: (props.sexo as 'M' | 'F' | 'O') || undefined,
      grupo_sanguineo: props.grupoSanguineo || ''
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: EditarPacienteFormData) => {
      const response = await apiClient.patch(
        `atencion/pacientes/${props.pacienteId}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atencion-pacientes'] })
      toast.success('Paciente actualizado exitosamente')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Error al actualizar el paciente'
      )
    }
  })

  const onSubmit = (data: EditarPacienteFormData) => {
    mutation.mutate(data)
  }

  return (
    <div className='form-edit-paciente'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='grid grid-cols-1 md:grid-cols-2 gap-4'
      >
        {/* CI */}
        <label className='text-sm flex flex-col gap-1'>
          <span className='font-semibold text-gray-700'>CI</span>
          <input
            {...register('ci')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
              errors.ci
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600'
            }`}
          />
          {errors.ci && (
            <span className='text-xs text-red-500'>{errors.ci.message}</span>
          )}
        </label>

        {/* Nombres */}
        <label className='text-sm flex flex-col gap-1'>
          <span className='font-semibold text-gray-700'>Nombres</span>
          <input
            {...register('nombres')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
              errors.nombres
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600'
            }`}
          />
          {errors.nombres && (
            <span className='text-xs text-red-500'>
              {errors.nombres.message}
            </span>
          )}
        </label>

        {/* Paterno */}
        <label className='text-sm flex flex-col gap-1'>
          <span className='font-semibold text-gray-700'>Apellido Paterno</span>
          <input
            {...register('paterno')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
              errors.paterno
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600'
            }`}
          />
          {errors.paterno && (
            <span className='text-xs text-red-500'>
              {errors.paterno.message}
            </span>
          )}
        </label>

        {/* Materno */}
        <label className='text-sm flex flex-col gap-1'>
          <span className='font-semibold text-gray-700'>Apellido Materno</span>
          <input
            {...register('materno')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
              errors.materno
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600'
            }`}
          />
          {errors.materno && (
            <span className='text-xs text-red-500'>
              {errors.materno.message}
            </span>
          )}
        </label>

        {/* Teléfono */}
        <label className='text-sm flex flex-col gap-1'>
          <span className='font-semibold text-gray-700'>Teléfono</span>
          <input
            {...register('telefono')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
              errors.telefono
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600'
            }`}
          />
          {errors.telefono && (
            <span className='text-xs text-red-500'>
              {errors.telefono.message}
            </span>
          )}
        </label>

        {/* Correo */}
        <label className='text-sm flex flex-col gap-1'>
          <span className='font-semibold text-gray-700'>
            Correo Electrónico
          </span>
          <input
            type='email'
            {...register('correo')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
              errors.correo
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600'
            }`}
          />
          {errors.correo && (
            <span className='text-xs text-red-500'>
              {errors.correo.message}
            </span>
          )}
        </label>

        {/* Dirección */}
        <label className='text-sm flex flex-col gap-1 md:col-span-2'>
          <span className='font-semibold text-gray-700'>Dirección</span>
          <input
            {...register('direccion')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
              errors.direccion
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600'
            }`}
          />
          {errors.direccion && (
            <span className='text-xs text-red-500'>
              {errors.direccion.message}
            </span>
          )}
        </label>

        {/* Sexo */}
        <label className='text-sm flex flex-col gap-1'>
          <span className='font-semibold text-gray-700'>Sexo</span>
          <select
            {...register('sexo')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors bg-white ${
              errors.sexo
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600'
            }`}
          >
            <option value=''>Seleccione...</option>
            <option value='M'>Masculino</option>
            <option value='F'>Femenino</option>
            <option value='O'>Otro</option>
          </select>
          {errors.sexo && (
            <span className='text-xs text-red-500'>{errors.sexo.message}</span>
          )}
        </label>

        {/* Grupo Sanguíneo */}
        <label className='text-sm flex flex-col gap-1'>
          <span className='font-semibold text-gray-700'>Grupo Sanguíneo</span>
          <input
            {...register('grupo_sanguineo')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
              errors.grupo_sanguineo
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600'
            }`}
            placeholder='Ej. O+'
          />
          {errors.grupo_sanguineo && (
            <span className='text-xs text-red-500'>
              {errors.grupo_sanguineo.message}
            </span>
          )}
        </label>

        {/* Submit Button */}
        <div className='md:col-span-2 mt-4'>
          <button
            type='submit'
            disabled={isSubmitting || mutation.isPending}
            className='w-full bg-primary-700 text-white py-2 px-4 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {mutation.isPending ? (
              <>
                <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
                Actualizando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
