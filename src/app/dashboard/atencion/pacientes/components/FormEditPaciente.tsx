'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import useModal from '@/hooks/useModal'
import { useRouter } from 'next/navigation'
import { editarPacienteSchema, EditarPacienteFormData } from '../schemas'
import { usePacientes } from '@/app/services/pacientes'
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
  fechaNacimiento: string | null
}

export default function FormEditPaciente(props: FormEditPacienteProps) {
  const { closeModal } = useModal()
  const router = useRouter()
  const { updatePaciente } = usePacientes()

  console.log(props)

  const form = useForm<EditarPacienteFormData>({
    resolver: zodResolver(editarPacienteSchema),
    defaultValues: {
      ci: props.ci,
      nombres: props.nombres,
      paterno: props.paterno,
      materno: props.materno || '',
      telefono: props.telefono || '',
      correo: props.correo || '',
      direccion: props.direccion || '',
      fecha_nacimiento: props.fechaNacimiento || '',
      sexo: (props.sexo as 'M' | 'F' | 'O') || undefined,
      grupo_sanguineo: props.grupoSanguineo || ''
    }
  })

  useEffect(() => {
    form.reset({
      ci: props.ci,
      nombres: props.nombres,
      paterno: props.paterno,
      materno: props.materno || '',
      telefono: props.telefono || '',
      correo: props.correo || '',
      direccion: props.direccion || '',
      fecha_nacimiento: props.fechaNacimiento || '',
      sexo: (props.sexo as 'M' | 'F' | 'O') || undefined,
      grupo_sanguineo: props.grupoSanguineo || ''
    })
  }, [props, form])

  const onSubmit = (data: EditarPacienteFormData) => {
    updatePaciente.mutate(
      { pacienteId: props.pacienteId, data },
      {
        onSuccess: () => {
          toast.success('Paciente actualizado exitosamente')
          closeModal()
          router.refresh()
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || 'Error al actualizar el paciente'
          )
        }
      }
    )
  }

  return (
    <div className='form-edit-paciente'>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='grid grid-cols-1 md:grid-cols-2 gap-4'
      >
        <FieldInput
          id='ci'
          label='CI'
          placeholder='Ej. 12345678'
          form={form}
          required
        />
        <FieldInput
          id='nombres'
          label='Nombres'
          placeholder='Ej. Juan'
          form={form}
          required
        />
        <FieldInput
          id='paterno'
          label='Apellido Paterno'
          placeholder='Ej. Perez'
          form={form}
          required
        />
        <FieldInput
          id='materno'
          label='Apellido Materno'
          placeholder='Ej. Gomez'
          form={form}
        />
        <FieldInput
          id='telefono'
          label='Teléfono'
          placeholder='Ej. 71234567'
          form={form}
        />
        <FieldInput
          id='correo'
          label='Correo Electrónico'
          type='email'
          placeholder='Ej. correo@ejemplo.com'
          form={form}
        />
        <FieldInput
          id='fecha_nacimiento'
          label='Fecha de Nacimiento'
          type='date'
          form={form}
        />
        <FieldInput
          id='direccion'
          label='Dirección'
          placeholder='Ej. Zona Sur, Calle 1'
          form={form}
        />
        <FieldSelect
          id='sexo'
          label='Sexo'
          options={SEXO_OPTIONS}
          form={form}
        />
        <FieldSelect
          id='grupo_sanguineo'
          label='Grupo Sanguíneo'
          options={GRUPO_SANGUINEO_OPTIONS}
          form={form}
        />

        {/* Submit Button */}
        <div className='md:col-span-2 mt-4'>
          <button
            type='submit'
            disabled={form.formState.isSubmitting || updatePaciente.isPending}
            className='w-full bg-primary-700 text-white py-2 px-4 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {updatePaciente.isPending ? (
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
