'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defineStepper } from '@stepperize/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { createUsuarioSchema, CreateUsuarioFormData } from '../../schemas'
import { useUsuarios } from '@/app/services/usuarios'

import StepperIndicator from './stepperIndicator'
import StepPersona from './stepPersona'
import StepCredenciales from './stepCredenciales'
import StepRol from './stepRol'
import StepResumen from './stepResumen'
import {
  IconChevronLeft,
  IconChevronRight,
  IconUserCheck
} from '@/app/components/icons/icons'

// ── Definición de pasos ────────────────────────────────────────────────────
const { useStepper } = defineStepper(
  { id: 'persona', title: 'Datos Personales', description: 'Identificación' },
  {
    id: 'credenciales',
    title: 'Credenciales',
    description: 'Acceso al sistema'
  },
  { id: 'rol', title: 'Rol', description: 'Permisos' },
  { id: 'resumen', title: 'Confirmar', description: 'Revisión final' }
)

// Campos a validar por paso (para trigger parcial)
const STEP_FIELDS: Record<string, (keyof CreateUsuarioFormData)[]> = {
  persona: [
    'ci',
    'nombres',
    'paterno',
    'materno',
    'correo',
    'telefono',
    'direccion'
  ],
  credenciales: ['username', 'password', 'confirmar_password'],
  rol: ['rol_id'],
  resumen: []
}

interface FormCreateUserProps {
  roles: Array<{ id: string; nombre: string; descripcion?: string | null }>
}

// ── Componente principal ───────────────────────────────────────────────────
export default function FormCreateUser({ roles }: FormCreateUserProps) {
  const router = useRouter()
  const stepper = useStepper()
  const { createUsuario } = useUsuarios()

  const form = useForm<CreateUsuarioFormData>({
    resolver: zodResolver(createUsuarioSchema),
    defaultValues: {
      ci: '',
      nombres: '',
      paterno: '',
      materno: '',
      correo: '',
      telefono: '',
      direccion: '',
      username: '',
      password: '',
      confirmar_password: '',
      rol_id: '',
      matricula: '',
      fecha_nacimiento: '',
      sexo: undefined,
      grupo_sanguineo: undefined
    },
    mode: 'onTouched'
  })

  // Índice actual para el indicador visual
  const steps = [
    { id: 'persona', title: 'Datos Personales', description: 'Identificación' },
    {
      id: 'credenciales',
      title: 'Credenciales',
      description: 'Acceso al sistema'
    },
    { id: 'rol', title: 'Rol', description: 'Permisos' },
    { id: 'resumen', title: 'Confirmar', description: 'Revisión final' }
  ]

  const currentIndex = steps.findIndex(
    s => s.id === stepper.state.current.data.id
  )

  // ── Avanzar al siguiente paso (validando solo los campos del paso actual) ─
  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const fields = STEP_FIELDS[stepper.state.current.data.id]
    const valid = await form.trigger(fields)
    if (valid) stepper.navigation.next()
  }

  // ── Submit final ──────────────────────────────────────────────────────────
  const onSubmit = async (data: CreateUsuarioFormData) => {
    try {
      const result = await createUsuario.mutateAsync(data)
      if (result.success) {
        toast.success(result.message ?? 'Usuario creado exitosamente')
        router.push('/dashboard/admin/usuarios')
      } else {
        console.log('error aqui')

        toast.error(result.message ?? 'Error al crear el usuario')
      }
    } catch (error: any) {
      console.log('error aqui')
      const msg = error?.response?.data?.message ?? 'Error interno del servidor'
      toast.error(msg)
    }
  }

  // Obtener nombre del rol seleccionado para pasarlo al resumen
  const rolId = form.watch('rol_id')
  const rolNombre = roles.find(r => r.id === rolId)?.nombre || ''

  return (
    <div className='w-full '>
      {/* Indicador de progreso */}
      <StepperIndicator steps={steps} currentIndex={currentIndex} />

      {/* Contenido del paso actual */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6'>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {stepper.state.current.data.id === 'persona' && (
            <StepPersona form={form} />
          )}

          {stepper.state.current.data.id === 'credenciales' && (
            <StepCredenciales form={form} />
          )}

          {stepper.state.current.data.id === 'rol' && (
            <StepRol form={form} roles={roles} />
          )}

          {stepper.state.current.data.id === 'resumen' && (
            <StepResumen form={form} rolNombre={rolNombre} />
          )}

          {/* ── Navegación entre pasos ── */}
          <div className='flex justify-between items-center mt-8 pt-5 border-t border-gray-100'>
            {/* Botón Atrás */}
            <button
              type='button'
              onClick={() => stepper.navigation.prev()}
              disabled={stepper.state.isFirst}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
            >
              <IconChevronLeft />
              Atrás
            </button>

            {/* Botón Siguiente o Confirmar */}
            {stepper.state.isLast ? (
              <button
                type='submit'
                disabled={createUsuario.isPending}
                className='flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer'
              >
                {createUsuario.isPending ? (
                  <>
                    <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
                    Creando usuario...
                  </>
                ) : (
                  <>
                    <IconUserCheck />
                    Confirmar y crear usuario
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

      {/* Indicador de paso en texto para mobile */}
      <p className='text-center text-xs text-gray-400 mt-4'>
        Paso {currentIndex + 1} de {steps.length}
      </p>
    </div>
  )
}
