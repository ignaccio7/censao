'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { vacunaSchema, VacunaFormData } from '../schemas'
import { FieldInput } from '@/app/components/ui/form/field-input'
import {
  IconPlus,
  IconTrash,
  // IconSyringe,
  // IconDeviceFloppy,
  IconAlertCircle,
  IconVaccineBottle,
  IconMedicineBox,
  IconClipboardText
} from '@/app/components/icons/icons'

interface Props {
  vacunaId?: string // si viene → edición, si no → creación
  defaultValues?: VacunaFormData
}

const DEFAULT_ESQUEMA = {
  numero: 1,
  intervalo_dias: 0,
  edad_min_meses: null,
  notas: ''
}

export default function FormVacuna({ vacunaId, defaultValues }: Props) {
  const router = useRouter()
  const modoEdicion = !!vacunaId

  const form = useForm<VacunaFormData>({
    resolver: zodResolver(vacunaSchema),
    defaultValues: defaultValues ?? {
      nombre: '',
      descripcion: '',
      fabricante: '',
      esquemas: [DEFAULT_ESQUEMA]
    },
    mode: 'onTouched'
  })

  // useFieldArray para el array dinámico de esquemas
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'esquemas'
  })

  const onSubmit = async (data: VacunaFormData) => {
    // Recalcular numero secuencial antes de enviar (por si borró alguno intermedio)
    const payload = {
      ...data,
      esquemas: data.esquemas.map((e, i) => ({ ...e, numero: i + 1 }))
    }

    console.log(payload)

    try {
      const url = modoEdicion
        ? `/api/admin/vacunas/${vacunaId}`
        : '/api/admin/vacunas'
      const method = modoEdicion ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await res.json()

      if (result.success) {
        toast.success(
          result.message ??
            (modoEdicion ? 'Vacuna actualizada' : 'Vacuna creada')
        )
        router.push('/dashboard/admin/vacunas')
      } else {
        toast.error(result.message ?? 'Error al guardar')
      }
    } catch {
      toast.error('Error de conexión')
    }
  }

  const agregarDosis = () => {
    append({
      numero: fields.length + 1,
      intervalo_dias: 0,
      edad_min_meses: null,
      notas: ''
    })
  }

  const isPending = form.formState.isSubmitting

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
      {/* ── Sección 1: Datos de la vacuna ── */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5'>
        <div>
          <h2 className='text-lg font-bold text-gray-800'>
            Datos de la vacuna
          </h2>
          <p className='text-sm text-gray-500 mt-0.5'>
            Información general de la vacuna.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FieldInput
            id='nombre'
            label='Nombre'
            placeholder='Ej. Tétanos'
            required
            icon={<IconVaccineBottle />}
            form={form}
          />
          <FieldInput
            id='fabricante'
            label='Fabricante'
            placeholder='Ej. Sanofi Pasteur'
            icon={<IconMedicineBox />}
            // icon={<IconSyringe />}
            form={form}
          />
          <FieldInput
            id='descripcion'
            label='Descripción'
            placeholder='Ej. Vacuna contra el tétanos (toxoide tetánico)'
            icon={<IconClipboardText />}
            form={form}
            className='md:col-span-2'
          />
        </div>
      </div>

      {/* ── Sección 2: Esquemas de dosis ── */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4'>
        <div className='flex items-start justify-between'>
          <div>
            <h2 className='text-lg font-bold text-gray-800'>
              Esquema de dosis
            </h2>
            <p className='text-sm text-gray-500 mt-0.5'>
              Define cuántas dosis tiene esta vacuna y en qué intervalos.
            </p>
          </div>
          <button
            type='button'
            onClick={agregarDosis}
            className='flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer'
          >
            <IconPlus />
            Agregar dosis
          </button>
        </div>

        {/* Error global del array */}
        {form.formState.errors.esquemas?.root && (
          <p className='text-red-500 text-xs flex items-center gap-1'>
            <IconAlertCircle size='16' />
            {form.formState.errors.esquemas.root.message}
          </p>
        )}

        <div className='space-y-3'>
          {fields.map((field, index) => (
            <DosisCard
              key={field.id}
              index={index}
              form={form}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
            />
          ))}
        </div>
      </div>

      {/* ── Botones ── */}
      <div className='flex justify-between items-center'>
        <button
          type='button'
          onClick={() => router.push('/dashboard/admin/vacunas')}
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
            <>
              {/* <IconDeviceFloppy /> */}
              {modoEdicion ? 'Guardar cambios' : 'Crear vacuna'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// ── Subcomponente: tarjeta de una dosis ───────────────────────────────────────
function DosisCard({
  index,
  form,
  onRemove,
  canRemove
}: {
  index: number
  form: any
  onRemove: () => void
  canRemove: boolean
}) {
  const errors = form.formState.errors?.esquemas?.[index]

  return (
    <div className='p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3'>
      {/* Header de la dosis */}
      <div className='flex items-center justify-between'>
        <span className='text-sm font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full'>
          Dosis {index + 1}
        </span>
        {canRemove && (
          <button
            type='button'
            onClick={onRemove}
            className='text-red-400 hover:text-red-600 transition-colors cursor-pointer p-1 rounded'
            title='Eliminar dosis'
          >
            <IconTrash size='16' />
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        {/* Intervalo en días */}
        <div className='flex flex-col gap-1'>
          <label className='text-xs font-semibold text-gray-700'>
            Intervalo desde dosis anterior (días)
            {index === 0 && (
              <span className='text-gray-400 font-normal ml-1'>
                (primera dosis = 0)
              </span>
            )}
          </label>
          <input
            type='number'
            min={0}
            {...form.register(`esquemas.${index}.intervalo_dias`, {
              valueAsNumber: true
            })}
            disabled={index === 0}
            placeholder='0'
            className={`p-2 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
              index === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                : errors?.intervalo_dias
                  ? 'border-red-400 focus:ring-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600 bg-white'
            }`}
          />
          {errors?.intervalo_dias && (
            <span className='text-red-500 text-xs'>
              {errors.intervalo_dias.message}
            </span>
          )}
        </div>

        {/* Edad mínima */}
        <div className='flex flex-col gap-1'>
          <label
            className='text-xs font-semibold text-gray-700'
            htmlFor={`esquemas.${index}.edad_min_meses`}
          >
            Edad mínima (meses)
            <span className='text-gray-400 font-normal ml-1'>(opcional)</span>
          </label>
          <input
            id={`esquemas.${index}.edad_min_meses`}
            type='number'
            min={0}
            {...form.register(`esquemas.${index}.edad_min_meses`, {
              setValueAs: (v: string) => (v === '' ? null : Number(v))
            })}
            placeholder='Sin límite'
            className='p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:border-primary-600 focus:ring-primary-600 bg-white'
          />
        </div>

        {/* Notas */}
        <div className='flex flex-col gap-1'>
          <label
            className='text-xs font-semibold text-gray-700'
            htmlFor={`esquemas.${index}.notas`}
          >
            Notas
            <span className='text-gray-400 font-normal ml-1'>(opcional)</span>
          </label>
          <input
            id={`esquemas.${index}.notas`}
            type='text'
            {...form.register(`esquemas.${index}.notas`)}
            placeholder='Ej. Refuerzo al mes'
            className='p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:border-primary-600 focus:ring-primary-600 bg-white'
          />
        </div>
      </div>
    </div>
  )
}
