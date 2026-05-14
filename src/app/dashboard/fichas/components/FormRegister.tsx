// oxlint-disable consistent-type-imports
import {
  IconCredential,
  IconUser,
  IconUserPlus
} from '@/app/components/icons/icons'
import { useFichas } from '@/app/services/fichas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FichaRegisterFormData, fichaRegisterSchema } from '../schemas'
import { toast } from 'sonner'
import useModal from '@/hooks/useModal'

export default function FormRegister() {
  const { createFicha } = useFichas()

  const { closeModal } = useModal()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FichaRegisterFormData>({
    resolver: zodResolver(fichaRegisterSchema)
  })

  const onSubmit = async (data: any) => {
    try {
      const result = await createFicha.mutateAsync(data)

      if (result.success) {
        // Notificación de éxito
        toast.success(result.message)
        reset() // Limpiar formulario
      } else {
        toast.error(result.message)
      }
    } catch (error: any) {
      // Manejar errores de validación o servidor
      if (error.response?.data?.errors) {
        // Errores de validación específicos
        const validationErrors = error.response.data.errors
        Object.keys(validationErrors).forEach(field => {
          toast.error(`${field}: ${validationErrors[field].join(', ')}`)
        })
      } else {
        toast.error(error.response?.data?.message || 'Error al crear la ficha')
      }
    } finally {
      closeModal()
    }
  }

  return (
    <div className='form-register'>
      <h3 className='text-step-0 text-gray-600'>
        Complete los datos del paciente para generar una nueva ficha médica
      </h3>

      <form
        className='my-2 md:my-4 grid grid-cols-1 md:grid-cols-2 gap-4'
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Cédula */}
        <label
          htmlFor='cedula'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconCredential />
            Cédula
          </span>
          <input
            {...register('cedula')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors text-step-1 ${
              errors.cedula
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-transparent focus:border-primary-600 focus:ring-primary-600'
            }`}
            type='text'
            id='cedula'
            placeholder='1054876541'
          />
          {errors.cedula && (
            <span className='text-red-500 text-sm'>
              {errors.cedula.message}
            </span>
          )}
        </label>

        {/* Nombre */}
        <label
          htmlFor='nombre'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconUser />
            Nombre Completo
          </span>
          <input
            {...register('nombre')}
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors text-step-1 ${
              errors.nombre
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-transparent focus:border-primary-600 focus:ring-primary-600'
            }`}
            type='text'
            id='nombre'
            placeholder='Juan Perez Garcia'
          />
          {errors.nombre && (
            <span className='text-red-500 text-sm'>
              {errors.nombre.message}
            </span>
          )}
        </label>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={createFicha.isPending}
          className='w-full bg-primary-700 text-white py-2 px-4 text-step-1 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer flex gap-2 items-center justify-center col-span-1 md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed'
          data-testid='btb-registrar-nueva-ficha'
        >
          {createFicha.isPending ? (
            <>
              <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
              Registrando...
            </>
          ) : (
            <>
              <IconUserPlus />
              Registrar nueva ficha
            </>
          )}
        </button>
      </form>
    </div>
  )
}
