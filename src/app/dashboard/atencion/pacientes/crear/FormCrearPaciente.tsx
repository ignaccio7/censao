'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { usePacientes } from '@/app/services/pacientes'
import { crearPacienteSchema, type CrearPacienteFormData } from '../schemas'
import { IconChevronLeft, IconUserCheck } from '@/app/components/icons/icons'
import Link from 'next/link'
import { FieldInput } from '@/app/components/ui/form/field-input'
import { FieldSelect } from '@/app/components/ui/form/field-select'

const SEXO_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' }
]

const GRUPO_SANGUINEO_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
]

export default function FormCrearPaciente() {
  const router = useRouter()
  const { createPaciente } = usePacientes()

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
      grupo_sanguineo: undefined,
      nro_historia_clinica: ''
    },
    mode: 'onTouched'
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
          <FieldInput
            label='Cédula de Identidad'
            id='ci'
            type='text'
            form={form}
            placeholder='Ej: 12345678'
            required
          />
          <FieldInput
            label='Nombres'
            id='nombres'
            type='text'
            form={form}
            placeholder='Ej: Ana Sofía'
            required
          />
          <FieldInput
            label='Apellido Paterno'
            id='paterno'
            type='text'
            form={form}
            placeholder='Ej: Rojas'
            required
          />
          <FieldInput
            label='Apellido Materno'
            id='materno'
            type='text'
            form={form}
            placeholder='Ej: Torres'
          />
        </div>

        {/* ── Datos de contacto ── */}
        <h3 className='text-base font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <span className='w-6 h-6 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center font-bold'>
            2
          </span>
          Datos de Contacto
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <FieldInput
            label='Teléfono'
            id='telefono'
            type='text'
            form={form}
            placeholder='Ej: 71234567'
          />
          <FieldInput
            label='Correo electrónico'
            id='correo'
            type='email'
            form={form}
            placeholder='Ej: paciente@email.com'
          />
          <FieldInput
            label='Dirección'
            id='direccion'
            type='text'
            form={form}
            placeholder='Ej: Calle Bolívar #123, Zona Sur'
            className='md:col-span-2'
          />
        </div>

        {/* ── Datos clínicos ── */}
        <h3 className='text-base font-bold text-gray-800 mb-4 flex items-center gap-2'>
          <span className='w-6 h-6 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center font-bold'>
            3
          </span>
          Datos Clínicos
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          <FieldInput
            label='Fecha de Nacimiento'
            id='fecha_nacimiento'
            type='date'
            form={form}
            required
          />
          <FieldSelect
            label='Sexo'
            id='sexo'
            form={form}
            options={SEXO_OPTIONS}
          />
          <FieldSelect
            label='Grupo Sanguíneo'
            id='grupo_sanguineo'
            form={form}
            options={GRUPO_SANGUINEO_OPTIONS}
          />
          <FieldInput
            label='Nro. Historia Clínica'
            id='nro_historia_clinica'
            type='text'
            form={form}
            placeholder='Ej: HC-00123'
            className='md:col-span-3'
          />
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
