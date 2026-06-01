'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { updatePerfil } from '@/actions/perfil/updatePerfil'
import {
  updatePerfilSchema,
  type UpdatePerfilFormData
} from '@/app/dashboard/perfil/schemas'
import dictionaryProfile from '../utils/dictionaryProfile'
import CustomInputProfile from './customInputProfile'

interface FormProfileDataProps {
  ci?: string | null
  nombres: string
  paterno?: string
  materno?: string
  correo?: string
  direccion?: string
}

export default function FormProfileData({
  ci,
  nombres,
  paterno,
  materno,
  correo: initialCorreo,
  direccion: initialDireccion
}: FormProfileDataProps) {
  const [editMode, setEditMode] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Valores mostrados en modo lectura (se actualizan tras un guardado exitoso)
  const [displayCorreo, setDisplayCorreo] = useState(initialCorreo ?? '')
  const [displayDireccion, setDisplayDireccion] = useState(
    initialDireccion ?? ''
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UpdatePerfilFormData>({
    resolver: zodResolver(updatePerfilSchema),
    defaultValues: {
      correo: initialCorreo ?? '',
      direccion: initialDireccion ?? '',
      nueva_password: '',
      confirmar_password: ''
    }
  })

  const handleEnterEditMode = () => {
    // Resetear el form con los valores actuales en pantalla
    reset({
      correo: displayCorreo,
      direccion: displayDireccion,
      nueva_password: '',
      confirmar_password: ''
    })
    setEditMode(true)
  }

  const handleCancel = () => {
    setEditMode(false)
    reset({
      correo: displayCorreo,
      direccion: displayDireccion,
      nueva_password: '',
      confirmar_password: ''
    })
  }

  const onSubmit = (data: UpdatePerfilFormData) => {
    startTransition(async () => {
      const result = await updatePerfil(data)

      if (result.success) {
        toast.success('Perfil actualizado correctamente')
        // Actualizar valores mostrados en modo lectura
        setDisplayCorreo(data.correo)
        setDisplayDireccion(data.direccion)
        setEditMode(false)
      } else {
        if (result.fieldErrors) {
          const firstError = Object.values(result.fieldErrors).flat()[0]
          toast.error(firstError ?? result.error ?? 'Error al actualizar')
        } else {
          toast.error(result.error ?? 'Error al actualizar el perfil')
        }
      }
    })
  }

  // Campos siempre de solo lectura
  const readOnlyFields = [
    {
      key: 'ci',
      label: dictionaryProfile.ci ?? 'Cédula de Identidad',
      value: ci ?? '—'
    },
    {
      key: 'nombres',
      label: dictionaryProfile.nombres ?? 'Nombres',
      value: nombres
    },
    {
      key: 'paterno',
      label: dictionaryProfile.paterno ?? 'Apellido paterno',
      value: paterno ?? '—'
    },
    {
      key: 'materno',
      label: dictionaryProfile.materno ?? 'Apellido materno',
      value: materno ?? '—'
    }
  ]

  // ── Vista de solo lectura ─────────────────────────────────────────────────
  if (!editMode) {
    return (
      <div className='flex flex-col gap-3'>
        {readOnlyFields.map(({ key, label, value }) => (
          <CustomInputProfile
            key={key}
            label={label}
            initialValue={value}
            onSave={() => {}}
            readOnly
          />
        ))}

        <CustomInputProfile
          label={dictionaryProfile.correo ?? 'Correo electrónico'}
          initialValue={displayCorreo}
          onSave={() => {}}
          readOnly
        />

        <CustomInputProfile
          label={dictionaryProfile.direccion ?? 'Dirección'}
          initialValue={displayDireccion}
          onSave={() => {}}
          readOnly
        />

        <div className='mt-2'>
          <button
            type='button'
            onClick={handleEnterEditMode}
            className='px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer'
          >
            Editar perfil
          </button>
        </div>
      </div>
    )
  }

  // ── Vista de edición ──────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className='flex flex-col gap-3'>
        {/* Campos de solo lectura */}
        {readOnlyFields.map(({ key, label, value }) => (
          <CustomInputProfile
            key={key}
            label={label}
            initialValue={value}
            onSave={() => {}}
            readOnly
          />
        ))}

        {/* ── Correo — controlado por RHF ── */}
        <div className='flex flex-col gap-1'>
          <label htmlFor='correo' className='font-semibold'>
            {dictionaryProfile.correo ?? 'Correo electrónico'}
          </label>
          <input
            id='correo'
            type='email'
            className='border rounded px-2 py-1 text-sm w-full md:max-w-xs'
            {...register('correo')}
          />
          {errors.correo && (
            <p className='text-xs text-red-500'>{errors.correo.message}</p>
          )}
        </div>

        {/* ── Dirección — controlado por RHF ── */}
        <div className='flex flex-col gap-1'>
          <label htmlFor='direccion' className='font-semibold'>
            {dictionaryProfile.direccion ?? 'Dirección'}
          </label>
          <input
            id='direccion'
            type='text'
            className='border rounded px-2 py-1 text-sm w-full md:max-w-xs'
            {...register('direccion')}
          />
          {errors.direccion && (
            <p className='text-xs text-red-500'>{errors.direccion.message}</p>
          )}
        </div>

        {/* ── Cambiar contraseña ── */}
        <div className='flex flex-col gap-3 border-t pt-4 mt-1'>
          <h4 className='font-semibold text-sm text-gray-600'>
            Cambiar contraseña{' '}
            <span className='font-normal text-gray-400'>(opcional)</span>
          </h4>

          <div className='flex flex-col gap-1'>
            <label htmlFor='nueva_password' className='text-sm font-semibold'>
              Nueva contraseña
            </label>
            <input
              id='nueva_password'
              type='password'
              placeholder='Mín. 8 caracteres, 1 mayúscula y 1 número'
              className='border rounded px-2 py-1 text-sm w-full md:max-w-xs'
              {...register('nueva_password')}
            />
            {errors.nueva_password && (
              <p className='text-xs text-red-500'>
                {errors.nueva_password.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-1'>
            <label
              htmlFor='confirmar_password'
              className='text-sm font-semibold'
            >
              Confirmar contraseña
            </label>
            <input
              id='confirmar_password'
              type='password'
              placeholder='Repite la nueva contraseña'
              className='border rounded px-2 py-1 text-sm w-full md:max-w-xs'
              {...register('confirmar_password')}
            />
            {errors.confirmar_password && (
              <p className='text-xs text-red-500'>
                {errors.confirmar_password.message}
              </p>
            )}
          </div>
        </div>

        {/* ── Botones ── */}
        <div className='flex items-center gap-3 mt-2'>
          <button
            type='submit'
            disabled={isPending}
            className='px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60 cursor-pointer'
          >
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type='button'
            onClick={handleCancel}
            disabled={isPending}
            className='px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-60 cursor-pointer'
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  )
}
