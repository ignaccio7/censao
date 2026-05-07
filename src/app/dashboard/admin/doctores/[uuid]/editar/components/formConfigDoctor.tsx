'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  configDoctorSchema,
  ConfigDoctorFormData
} from '@/app/dashboard/admin/doctores/schemas'
import { FieldInput } from '@/app/components/ui/form/field-input'
import {
  IconPlus,
  IconTrash,
  IconAlertCircle
} from '@/app/components/icons/icons'

interface Especialidad {
  id: string
  nombre: string
}

interface Turno {
  codigo: string
  nombre: string
}

interface Props {
  doctorId: string
  nombreCompleto: string
  ci: string
  defaultValues: ConfigDoctorFormData
  especialidadesDisponibles: Especialidad[]
  turnosDisponibles: Turno[]
}

export default function FormConfigDoctor({
  doctorId,
  nombreCompleto,
  ci,
  defaultValues,
  especialidadesDisponibles,
  turnosDisponibles
}: Props) {
  const router = useRouter()

  const form = useForm<ConfigDoctorFormData>({
    resolver: zodResolver(configDoctorSchema),
    defaultValues,
    mode: 'onTouched'
  })

  const {
    fields: especialidadesFields,
    append: appendEspecialidad,
    remove: removeEspecialidad
  } = useFieldArray({
    control: form.control,
    name: 'especialidades'
  })

  // Especialidades ya asignadas (para filtrar el select de "agregar")
  const especialidadesAsignadas = form.watch('especialidades')
  const idsAsignados =
    especialidadesAsignadas?.map(e => e.especialidad_id) ?? []
  const especialidadesLibres = especialidadesDisponibles.filter(
    e => !idsAsignados.includes(e.id)
  )

  const onSubmit = async (data: ConfigDoctorFormData) => {
    try {
      const res = await fetch(`/api/admin/doctores/${doctorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()

      if (result.success) {
        toast.success(result.message ?? 'Configuración del doctor actualizada')
        router.push('/dashboard/admin/doctores')
        router.refresh()
      } else {
        toast.error(result.message ?? 'Error al guardar')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  const agregarEspecialidad = (especialidadId: string) => {
    if (!especialidadId) {
      return
    }
    appendEspecialidad({
      especialidad_id: especialidadId,
      disponibilidades: turnosDisponibles.map(t => ({
        turno_codigo: t.codigo,
        cupos: 0,
        estado: true
      }))
    })
  }

  const isPending = form.formState.isSubmitting

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
      {/* ── Sección 1: Datos Básicos ── */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5'>
        <div>
          <h2 className='text-lg font-bold text-gray-800'>Datos básicos</h2>
          <p className='text-sm text-gray-500 mt-0.5'>
            Información personal del doctor.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Nombre completo (readonly) */}
          <div className='flex flex-col gap-1'>
            <span className='font-semibold text-gray-700 text-sm'>
              Nombre completo
            </span>
            <div className='p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 text-sm'>
              {nombreCompleto}
            </div>
          </div>

          {/* CI (readonly) */}
          <div className='flex flex-col gap-1'>
            <span className='font-semibold text-gray-700 text-sm'>CI</span>
            <div className='p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 text-sm'>
              {ci}
            </div>
          </div>

          {/* Matrícula (editable) */}
          <FieldInput
            id='matricula'
            label='Matrícula'
            placeholder='Ej. MED-003-2025'
            form={form}
          />
        </div>
      </div>

      {/* ── Sección 2: Especialidades y Disponibilidades ── */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4'>
        <div className='flex items-start justify-between flex-wrap gap-2'>
          <div>
            <h2 className='text-lg font-bold text-gray-800'>
              Especialidades y disponibilidades
            </h2>
            <p className='text-sm text-gray-500 mt-0.5'>
              Asigna especialidades y configura los turnos en que atenderá.
            </p>
          </div>

          {/* Select para agregar nueva especialidad */}
          {especialidadesLibres.length > 0 && (
            <div className='flex items-center gap-2'>
              <select
                id='agregar-especialidad'
                onChange={e => {
                  agregarEspecialidad(e.target.value)
                  e.target.value = ''
                }}
                defaultValue=''
                className='p-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 cursor-pointer'
              >
                <option value='' disabled>
                  + Agregar especialidad
                </option>
                {especialidadesLibres.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error global del array */}
        {form.formState.errors.especialidades?.root && (
          <p className='text-red-500 text-xs flex items-center gap-1'>
            <IconAlertCircle size='16' />
            {form.formState.errors.especialidades.root.message}
          </p>
        )}

        {/* Lista de especialidades asignadas */}
        {especialidadesFields.length === 0 ? (
          <div className='text-center py-8 border border-dashed border-gray-300 rounded-xl'>
            <p className='text-gray-400 text-sm'>
              Este doctor no tiene especialidades asignadas.
            </p>
            <p className='text-gray-400 text-xs mt-1'>
              Usa el selector de arriba para agregar una.
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {especialidadesFields.map((field, index) => (
              <EspecialidadCard
                key={field.id}
                index={index}
                form={form}
                especialidadesDisponibles={especialidadesDisponibles}
                turnosDisponibles={turnosDisponibles}
                onRemove={() => removeEspecialidad(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Botones ── */}
      <div className='flex justify-between items-center'>
        <button
          type='button'
          onClick={() => router.push('/dashboard/admin/doctores')}
          className='px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer'
        >
          Cancelar
        </button>
        <button
          type='submit'
          disabled={isPending}
          className='flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer'
        >
          {isPending ? (
            <>
              <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </div>
    </form>
  )
}

// ── Subcomponente: tarjeta de una especialidad ────────────────────────────────
function EspecialidadCard({
  index,
  form,
  especialidadesDisponibles,
  turnosDisponibles,
  onRemove
}: {
  index: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  especialidadesDisponibles: Especialidad[]
  turnosDisponibles: Turno[]
  onRemove: () => void
}) {
  const especialidadId = form.watch(`especialidades.${index}.especialidad_id`)
  const especialidad = especialidadesDisponibles.find(
    e => e.id === especialidadId
  )
  const nombreEspecialidad = especialidad?.nombre ?? 'Especialidad'

  const disponibilidades: {
    turno_codigo: string
    cupos: number
    estado: boolean
  }[] = form.watch(`especialidades.${index}.disponibilidades`) ?? []

  const errors = form.formState.errors?.especialidades?.[index]

  return (
    <div className='p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <span className='text-sm font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full'>
          {nombreEspecialidad}
        </span>
        <button
          type='button'
          onClick={onRemove}
          className='text-red-400 hover:text-red-600 transition-colors cursor-pointer p-1 rounded flex items-center gap-1 text-xs'
          title='Quitar especialidad'
        >
          <IconTrash size='16' />
          <span className='hidden sm:inline'>Quitar</span>
        </button>
      </div>

      {/* Error del array de disponibilidades */}
      {errors?.disponibilidades?.root && (
        <p className='text-red-500 text-xs flex items-center gap-1'>
          <IconAlertCircle size='16' />
          {errors.disponibilidades.root.message}
        </p>
      )}

      {/* Turnos / Disponibilidades */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {disponibilidades.map((disp, dispIndex) => {
          const turno = turnosDisponibles.find(
            t => t.codigo === disp.turno_codigo
          )
          const turnoNombre = turno?.nombre ?? disp.turno_codigo
          const dispErrors = errors?.disponibilidades?.[dispIndex]

          return (
            <div
              key={`${index}-${disp.turno_codigo}`}
              className={`p-3 border rounded-lg ${
                disp.estado
                  ? 'border-primary-200 bg-white'
                  : 'border-gray-200 bg-gray-100 opacity-60'
              }`}
            >
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-semibold text-gray-700'>
                  Turno {turnoNombre}
                </span>

                {/* Toggle de estado activo/inactivo */}
                <label
                  htmlFor={`estado-${index}-${dispIndex}`}
                  className='flex items-center gap-1.5 cursor-pointer'
                >
                  <input
                    id={`estado-${index}-${dispIndex}`}
                    type='checkbox'
                    checked={disp.estado}
                    onChange={e => {
                      form.setValue(
                        `especialidades.${index}.disponibilidades.${dispIndex}.estado`,
                        e.target.checked
                      )
                    }}
                    className='w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer'
                  />
                  <span
                    className={`text-xs font-medium ${
                      disp.estado ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {disp.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>

              {/* Cupos */}
              <div className='flex flex-col gap-1'>
                <label
                  htmlFor={`cupos-${index}-${dispIndex}`}
                  className='text-xs font-semibold text-gray-600'
                >
                  Cupos disponibles
                </label>
                <input
                  id={`cupos-${index}-${dispIndex}`}
                  type='number'
                  min={0}
                  {...form.register(
                    `especialidades.${index}.disponibilidades.${dispIndex}.cupos`,
                    { valueAsNumber: true }
                  )}
                  disabled={!disp.estado}
                  className={`p-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
                    !disp.estado
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : dispErrors?.cupos
                        ? 'border-red-400 focus:ring-red-500 bg-red-50'
                        : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600 bg-white'
                  }`}
                />
                {dispErrors?.cupos && (
                  <span className='text-red-500 text-xs'>
                    {dispErrors.cupos.message}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Botón para agregar turno que no está aún */}
      {disponibilidades.length < turnosDisponibles.length && (
        <div>
          <button
            type='button'
            onClick={() => {
              const turnosAsignados = disponibilidades.map(d => d.turno_codigo)
              const turnoFaltante = turnosDisponibles.find(
                t => !turnosAsignados.includes(t.codigo)
              )
              if (turnoFaltante) {
                const currentDisps = form.getValues(
                  `especialidades.${index}.disponibilidades`
                )
                form.setValue(`especialidades.${index}.disponibilidades`, [
                  ...currentDisps,
                  {
                    turno_codigo: turnoFaltante.codigo,
                    cupos: 0,
                    estado: true
                  }
                ])
              }
            }}
            className='flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors cursor-pointer'
          >
            <IconPlus size='14' />
            Agregar turno
          </button>
        </div>
      )}

      {/* Input hidden para especialidad_id */}
      <input
        type='hidden'
        {...form.register(`especialidades.${index}.especialidad_id`)}
      />
    </div>
  )
}
