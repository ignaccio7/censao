'use client'

import { UseFormReturn } from 'react-hook-form'
import { CreateUsuarioFormData } from '../../schemas'
import { IconAlertCircle, IconUser } from '@/app/components/icons/icons'
import {
  FieldPassword,
  PasswordStrength
} from '@/app/components/ui/form/field-password'
import { FieldInput } from '@/app/components/ui/form/field-input'

// TODO ver si esto en los steps se mantiene con CreateUsuarioFormData ya que en edicion sera otra y ver si esta funcionando del todo o cambiar el nombre del schema en todo caso
interface StepCredencialesProps {
  form: UseFormReturn<CreateUsuarioFormData>
  isEdit?: boolean
}

export default function StepCredenciales({
  form,
  isEdit = false
}: StepCredencialesProps) {
  const password = form.watch('password') ?? ''

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-lg font-bold text-gray-800'>
          Credenciales de acceso
        </h2>
        <p className='text-sm text-gray-500 mt-0.5'>
          Estos datos se usarán para iniciar sesión en el sistema.
        </p>
      </div>

      <div className='space-y-4'>
        {/* Username */}
        <FieldInput
          id='username'
          label='Nombre de usuario'
          placeholder='juan.perez'
          required
          icon={<IconUser size='18' />}
          form={form}
          disabled={isEdit}
        />

        {/* Password */}
        <div>
          <FieldPassword
            id='password'
            label='Contraseña'
            placeholder='••••••••'
            form={form}
          />
          <PasswordStrength password={password} />
        </div>

        {/* Confirmar password */}
        <FieldPassword
          id='confirmar_password'
          label='Confirmar contraseña'
          placeholder='••••••••'
          form={form}
        />
      </div>

      {/* Info box */}
      <div
        className={`flex gap-2 p-3 rounded-lg text-sm ${!isEdit ? 'text-blue-700 bg-blue-50 border border-blue-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}
      >
        <IconAlertCircle size='20' />
        {!isEdit ? (
          <span>
            La contraseña será encriptada al guardarse. El usuario podrá
            cambiarla cuando inicie sesión.
          </span>
        ) : (
          <span>Deja en blanco si no deseas cambiar la contraseña.</span>
        )}
      </div>
    </div>
  )
}
