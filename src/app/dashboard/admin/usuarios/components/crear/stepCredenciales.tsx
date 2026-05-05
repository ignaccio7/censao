'use client'

import { UseFormReturn } from 'react-hook-form'
import { CreateUsuarioFormData } from '../../schemas'
import { IconAlertCircle, IconUser } from '@/app/components/icons/icons'
import {
  FieldPassword,
  PasswordStrength
} from '@/app/components/ui/form/field-password'
import { FieldInput } from '@/app/components/ui/form/field-input'

interface StepCredencialesProps {
  form: UseFormReturn<CreateUsuarioFormData>
}

export default function StepCredenciales({ form }: StepCredencialesProps) {
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
      <div className='flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs'>
        <IconAlertCircle size='18' />
        <span>
          La contraseña será encriptada al guardarse. El usuario podrá cambiarla
          cuando inicie sesión.
        </span>
      </div>
    </div>
  )
}
