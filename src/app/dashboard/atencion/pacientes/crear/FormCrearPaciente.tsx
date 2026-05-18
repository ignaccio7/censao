'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/app/services/client'
import { crearPacienteSchema, type CrearPacienteFormData } from '../schemas'
import { IconChevronLeft, IconUserCheck } from '@/app/components/icons/icons'
import Link from 'next/link'

const SEXO_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' }
]

const GRUPO_SANGUINEO_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-'
]

export default function FormCrearPaciente() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<CrearPacienteFormData>({
    resolver: zodResolver(crearPacienteSchema),
    defaultValues: {
      ci: '',
      nombres: '',
      paterno: '',
      materno: '',
      telefono: '',
      correo: '',
      direccion: '',
      fecha_nacimiento: '',
      sexo: undefined,
      grupo_sanguineo: undefined
    },
    mode: 'onTouched'
  })

  const createPaciente = useMutation({
    mutationFn: async (data: CrearPacienteFormData) => {
      const response = await apiClient.post('/atencion/pacientes', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atencion-pacientes'] })
    }
  })

  const onSubmit = async (data: CrearPacienteFormData) => {
    try {
      const result = await createPaciente.mutateAsync(data)
      if (result.success) {
        toast.success(result.message ?? 'Paciente creado exitosamente')
        toast.info(
          `Se creó una cuenta. Usuario: ${data.ci} | Contraseña: ${data.ci}`,
          { duration: 8000 }
        )
        router.push('/dashboard/atencion/pacientes')
      } else {
        toast.error(result.message ?? 'Error al crear paciente')
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Error interno del servidor'
      toast.error(msg)
    }
  }

  const {
    register,
    formState: { errors }
  } = form

  const fieldClass =
    'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors'
  const errorClass = 'text-red-500 text-xs mt-1'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6'>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* ── Datos de identificación ── */}
        <h3 className='text-base font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <span className='w-6 h-6 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center font-bold'>
            1
          </span>
          Datos de Identificación
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div>
            <label htmlFor='ci' className={labelClass}>
              Cédula de Identidad *
            </label>
            <input
              id='ci'
              {...register('ci')}
              placeholder='Ej: 12345678'
              className={`${fieldClass} ${errors.ci ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.ci && <p className={errorClass}>{errors.ci.message}</p>}
          </div>

          <div>
            <label htmlFor='nombres' className={labelClass}>
              Nombres *
            </label>
            <input
              id='nombres'
              {...register('nombres')}
              placeholder='Ej: Ana Sofía'
              className={`${fieldClass} ${errors.nombres ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.nombres && (
              <p className={errorClass}>{errors.nombres.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='paterno' className={labelClass}>
              Apellido Paterno *
            </label>
            <input
              id='paterno'
              {...register('paterno')}
              placeholder='Ej: Rojas'
              className={`${fieldClass} ${errors.paterno ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.paterno && (
              <p className={errorClass}>{errors.paterno.message}</p>
            )}
          </div>

          <div>
            <label htmlFor='materno' className={labelClass}>
              Apellido Materno
            </label>
            <input
              id='materno'
              {...register('materno')}
              placeholder='Ej: Torres'
              className={`${fieldClass} border-gray-300`}
            />
          </div>
        </div>

        {/* ── Datos de contacto ── */}
        <h3 className='text-base font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <span className='w-6 h-6 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center font-bold'>
            2
          </span>
          Datos de Contacto
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div>
            <label htmlFor='telefono' className={labelClass}>
              Teléfono
            </label>
            <input
              id='telefono'
              {...register('telefono')}
              placeholder='Ej: 71234567'
              className={`${fieldClass} border-gray-300`}
            />
          </div>

          <div>
            <label htmlFor='correo' className={labelClass}>
              Correo electrónico
            </label>
            <input
              id='correo'
              type='email'
              {...register('correo')}
              placeholder='Ej: paciente@email.com'
              className={`${fieldClass} ${errors.correo ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.correo && (
              <p className={errorClass}>{errors.correo.message}</p>
            )}
          </div>

          <div className='md:col-span-2'>
            <label htmlFor='direccion' className={labelClass}>
              Dirección
            </label>
            <input
              id='direccion'
              {...register('direccion')}
              placeholder='Ej: Calle Bolívar #123, Zona Sur'
              className={`${fieldClass} border-gray-300`}
            />
          </div>
        </div>

        {/* ── Datos clínicos ── */}
        <h3 className='text-base font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <span className='w-6 h-6 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center font-bold'>
            3
          </span>
          Datos Clínicos
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          <div>
            <label htmlFor='fecha_nacimiento' className={labelClass}>
              Fecha de Nacimiento
            </label>
            <input
              id='fecha_nacimiento'
              type='date'
              {...register('fecha_nacimiento')}
              className={`${fieldClass} border-gray-300`}
            />
          </div>

          <div>
            <label htmlFor='sexo' className={labelClass}>
              Sexo
            </label>
            <select
              id='sexo'
              {...register('sexo')}
              className={`${fieldClass} border-gray-300`}
            >
              <option value=''>Seleccionar...</option>
              {SEXO_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor='grupo_sanguineo' className={labelClass}>
              Grupo Sanguíneo
            </label>
            <select
              id='grupo_sanguineo'
              {...register('grupo_sanguineo')}
              className={`${fieldClass} border-gray-300`}
            >
              <option value=''>Seleccionar...</option>
              {GRUPO_SANGUINEO_OPTIONS.map(gs => (
                <option key={gs} value={gs}>
                  {gs}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Info sobre credenciales auto-generadas ── */}
        <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 mb-6'>
          <strong>ℹ️ Credenciales automáticas:</strong> Al crear el paciente, se
          generará automáticamente una cuenta con el CI como usuario y
          contraseña.
        </div>

        {/* ── Navegación ── */}
        <div className='flex justify-between items-center pt-5 border-t border-gray-100'>
          <Link
            href='/dashboard/atencion/pacientes'
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer'
          >
            <IconChevronLeft />
            Volver
          </Link>

          <button
            type='submit'
            disabled={createPaciente.isPending}
            className='flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer'
          >
            {createPaciente.isPending ? (
              <>
                <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
                Registrando...
              </>
            ) : (
              <>
                <IconUserCheck />
                Registrar Paciente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
