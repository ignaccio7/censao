'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defineStepper } from '@stepperize/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { updateUsuarioSchema, UpdateUsuarioFormData } from '../../schemas'
import { useUsuario } from '@/app/services/usuarios'

import StepperIndicator from '../multistep/stepperIndicator'
// ↓ Reutilizando los mismos steps de creación
import StepPersona from '../multistep/stepPersona'
import StepCredenciales from '../multistep/stepCredenciales'
import StepRol from '../multistep/stepRol'
import StepResumen from '../multistep/stepResumen'
import {
  IconChevronLeft,
  IconChevronRight
  // IconDeviceFloppy
} from '@/app/components/icons/icons'

const { useStepper } = defineStepper(
  { id: 'persona', title: 'Datos Personales', description: 'Identificación' },
  { id: 'credenciales', title: 'Contraseña', description: 'Cambio opcional' },
  { id: 'rol', title: 'Rol', description: 'Permisos' },
  { id: 'resumen', title: 'Confirmar', description: 'Revisión final' }
)

// En edición validamos los mismos campos, pero password es vacío = ok
const STEP_FIELDS: Record<string, (keyof UpdateUsuarioFormData)[]> = {
  persona: ['nombres', 'paterno', 'materno', 'correo', 'telefono', 'direccion'],
  credenciales: ['password', 'confirmar_password'],
  rol: ['rol_id'],
  resumen: []
}

interface FormEditUserProps {
  usuarioId: string
  defaultValues: UpdateUsuarioFormData
  ci: string
  username: string
  roles: Array<{ id: string; nombre: string; descripcion?: string | null }>
}

export default function FormEditUser({
  usuarioId,
  defaultValues,
  ci,
  username,
  roles
}: FormEditUserProps) {
  const router = useRouter()
  const stepper = useStepper()
  const { updateUsuario } = useUsuario(usuarioId)

  const steps = [
    { id: 'persona', title: 'Datos Personales', description: 'Identificación' },
    { id: 'credenciales', title: 'Contraseña', description: 'Cambio opcional' },
    { id: 'rol', title: 'Rol', description: 'Permisos' },
    { id: 'resumen', title: 'Confirmar', description: 'Revisión final' }
  ]

  const form = useForm<UpdateUsuarioFormData>({
    resolver: zodResolver(updateUsuarioSchema),
    defaultValues, // ← aquí se pre-pobla todo
    mode: 'onTouched'
  })

  const currentIndex = steps.findIndex(
    s => s.id === stepper.state.current.data.id
  )

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const fields = STEP_FIELDS[stepper.state.current.data.id]
    const valid = await form.trigger(fields)
    if (valid) stepper.navigation.next()
  }

  const onSubmit = async (data: UpdateUsuarioFormData) => {
    try {
      console.log('Estamos enviando')

      const result = await updateUsuario.mutateAsync(data)
      if (result.success) {
        toast.success(result.message ?? 'Usuario actualizado correctamente')
        router.push('/dashboard/admin/usuarios')
      } else {
        toast.error(result.message ?? 'Error al actualizar el usuario')
      }
    } catch (error: any) {
      console.log('Error catch')
      console.log(error)

      toast.error(
        error?.response?.data?.message ?? 'Error interno del servidor'
      )
    }
  }

  const rolId = form.watch('rol_id')
  const rolNombre = roles.find(r => r.id === rolId)?.nombre ?? ''

  return (
    <div className='w-full'>
      {/* Badge con datos no editables */}
      <div className='mb-4 flex flex-wrap gap-2'>
        <span className='px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600'>
          <span className='font-semibold'>CI:</span> {ci}
        </span>
        <span className='px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600'>
          <span className='font-semibold'>Usuario:</span> {username}
        </span>
      </div>

      <StepperIndicator steps={steps} currentIndex={currentIndex} />

      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6'>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Reutiliza StepPersona — CI deshabilitado */}
          {stepper.state.current.data.id === 'persona' && (
            <StepPersona form={form as any} isEdit />
          )}

          {/* Reutiliza StepCredenciales — username deshabilitado, password opcional */}
          {stepper.state.current.data.id === 'credenciales' && (
            <StepCredenciales form={form as any} isEdit />
          )}

          {/* Reutiliza StepRol — funciona igual, pre-seleccionado */}
          {stepper.state.current.data.id === 'rol' && (
            <StepRol form={form as any} roles={roles} />
          )}

          {/* Reutiliza StepResumen — funciona igual */}
          {stepper.state.current.data.id === 'resumen' && (
            <StepResumen form={form as any} rolNombre={rolNombre} />
          )}

          <div className='flex justify-between items-center mt-8 pt-5 border-t border-gray-100'>
            <button
              type='button'
              onClick={() => stepper.navigation.prev()}
              disabled={stepper.state.isFirst}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
            >
              <IconChevronLeft />
              Atrás
            </button>

            {stepper.state.isLast ? (
              <button
                type='submit'
                disabled={updateUsuario.isPending}
                className='flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer'
              >
                {updateUsuario.isPending ? (
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
            ) : (
              <button
                type='button'
                onClick={handleNext}
                className='flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm cursor-pointer'
              >
                Siguiente
                <IconChevronRight />
              </button>
            )}
          </div>
        </form>
      </div>

      <p className='text-center text-xs text-gray-400 mt-4'>
        Paso {currentIndex + 1} de {steps.length}
      </p>
    </div>
  )
}
