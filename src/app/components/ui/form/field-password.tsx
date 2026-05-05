import { useState } from 'react'
import { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import {
  IconLock,
  IconEyeOff,
  IconEye,
  IconAlertCircle,
  IconCircleCheck,
  IconCircleX
} from '../../icons/icons'

interface FieldProps<T extends FieldValues> {
  id: Path<T>
  label: string
  placeholder: string
  required?: boolean
  icon?: React.ReactNode
  type?: string
  form: UseFormReturn<T>
  className?: string
}

export function FieldPassword<T extends FieldValues>({
  id,
  label,
  placeholder,
  form
}: FieldProps<T>) {
  const [show, setShow] = useState(false)
  const error = form.formState.errors[id]

  return (
    <label htmlFor={id} className='w-full flex flex-col gap-1 text-step-0'>
      <span className='font-semibold flex gap-1 items-center text-gray-700'>
        <IconLock size={'18'} />
        {label}
        <span className='text-red-500 ml-0.5'>*</span>
      </span>
      <div className='relative'>
        <input
          {...form.register(id)}
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className={`w-full p-2 pr-10 border rounded-md focus:outline-none focus:ring-1 transition-colors text-step-0 bg-white ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50'
              : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600'
          }`}
        />
        <button
          type='button'
          onClick={() => setShow(v => !v)}
          className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
        >
          {show ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {error && (
        <span className='text-red-500 text-xs flex items-center gap-1'>
          <IconAlertCircle size='18' />
          {error.message as string}
        </span>
      )}
    </label>
  )
}

// Indicador de fortaleza de contraseña
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const checks = [
    { label: 'Mínimo 8 caracteres', pass: password.length >= 8 },
    { label: 'Letras mayúsculas', pass: /[A-Z]/.test(password) },
    { label: 'Letras minúsculas', pass: /[a-z]/.test(password) },
    { label: 'Números', pass: /\d/.test(password) }
  ]

  const score = checks.filter(c => c.pass).length

  const strengthLabel =
    score <= 1
      ? 'Muy débil'
      : score === 2
        ? 'Débil'
        : score === 3
          ? 'Buena'
          : 'Fuerte'
  const strengthColor =
    score <= 1
      ? 'bg-red-500'
      : score === 2
        ? 'bg-orange-400'
        : score === 3
          ? 'bg-yellow-400'
          : 'bg-green-500'

  return (
    <div className='mt-1 space-y-2'>
      <div className='flex gap-1 items-center'>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? strengthColor : 'bg-gray-200'
            }`}
          />
        ))}
        <span className='text-xs text-gray-500 ml-1 w-16 shrink-0'>
          {strengthLabel}
        </span>
      </div>
      <div className='grid grid-cols-2 gap-x-4 gap-y-1'>
        {checks.map(check => (
          <span
            key={check.label}
            className={`text-xs flex items-center gap-1 ${check.pass ? 'text-green-600' : 'text-gray-400'}`}
          >
            {check.pass ? (
              <IconCircleCheck size='18' />
            ) : (
              <IconCircleX size='18' />
            )}
            {check.label}
          </span>
        ))}
      </div>
    </div>
  )
}
