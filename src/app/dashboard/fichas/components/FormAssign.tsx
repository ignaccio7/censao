// oxlint-disable consistent-type-imports
import {
  IconCredential,
  IconSchedule,
  IconStethoscope,
  IconUser,
  IconUserPlus
} from '@/app/components/icons/icons'
import { useFichas } from '@/app/services/fichas'
import { useEspecialidades } from '@/app/services/disponibilidad/especialidades'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FichaAssignFormData, fichaAssignSchema } from '../schemas'
import { toast } from 'sonner'
import useModal from '@/hooks/useModal'
import { StateRecord } from '@/lib/constants'

export default function FormAssign({
  fichaId,
  cedula,
  nombre
}: {
  fichaId: string
  cedula: string
  nombre: string
}) {
  const { especialidades } = useEspecialidades()

  const { updateFicha } = useFichas()

  const { closeModal } = useModal()

  console.log({
    fichaId,
    cedula,
    nombre
  })

  console.log(especialidades)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<FichaAssignFormData>({
    resolver: zodResolver(fichaAssignSchema),
    defaultValues: {
      id: fichaId,
      status: StateRecord.EN_ESPERA
    }
  })

  const especialidadSeleccionada = watch('especialidad')

  // Obtener doctores de la especialidad seleccionada
  const doctoresDisponibles = especialidadSeleccionada
    ? especialidades.find(esp => esp.id === especialidadSeleccionada)
        ?.doctores || []
    : []

  const onSubmit = async (data: any) => {
    try {
      const result = await updateFicha.mutateAsync(data)

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
        id='form-assign-record'
        data-testid='form-assign-record'
      >
        {/* Cédula */}
        <label
          htmlFor='assign-cedula'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconCredential />
            Cédula
          </span>
          <input
            className='p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border-transparent'
            type='text'
            id='assign-cedula'
            value={cedula}
            disabled
          />
        </label>

        {/* Nombre */}
        <label
          htmlFor='assign-nombre'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconUser />
            Nombre Completo
          </span>
          <input
            className='p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border-transparent'
            type='text'
            id='assign-nombre'
            value={nombre}
            disabled
          />
        </label>

        {/* Especialidad - ✅ SOLO register, sin onChange manual */}
        <label
          htmlFor='especialidad'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconStethoscope />
            Especialidad Médica
          </span>
          <select
            {...register('especialidad')}
            id='especialidad'
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
              errors.especialidad
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-transparent focus:border-primary-600 focus:ring-primary-600'
            }`}
          >
            <option value=''>Seleccione una especialidad</option>
            {especialidades?.map(especialidad => (
              <option key={especialidad.id} value={especialidad.id}>
                {especialidad.nombre}
              </option>
            ))}
          </select>
          {errors.especialidad && (
            <span className='text-red-500 text-sm'>
              {errors.especialidad.message}
            </span>
          )}
        </label>

        {/* Doctor */}
        <label
          htmlFor='doctor'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconSchedule />
            Doctor disponible
          </span>
          <select
            {...register('doctor')}
            id='doctor'
            disabled={
              !especialidadSeleccionada || doctoresDisponibles.length === 0
            }
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.doctor
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-transparent focus:border-primary-600 focus:ring-primary-600'
            }`}
          >
            <option value=''>
              {!especialidadSeleccionada
                ? 'Primero seleccione una especialidad'
                : doctoresDisponibles.length === 0
                  ? 'No hay doctores disponibles'
                  : 'Seleccione un doctor'}
            </option>
            {doctoresDisponibles.map((doctor: any) => {
              return (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.nombre} • {doctor.capacidadActual}/
                  {doctor.capacidadMaxima} pacientes
                </option>
              )
            })}
          </select>
          {errors.doctor && (
            <span className='text-red-500 text-sm'>
              {errors.doctor.message}
            </span>
          )}
        </label>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={updateFicha.isPending}
          className='w-full bg-primary-700 text-white py-2 px-4 text-step-1 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer flex gap-2 items-center justify-center col-span-1 md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed'
          data-testid='btn-asignar-ficha'
        >
          {updateFicha.isPending ? (
            <>
              <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
              Registrando...
            </>
          ) : (
            <>
              <IconUserPlus />
              Asignar ficha
            </>
          )}
        </button>
      </form>
    </div>
  )
}
