'use client'

import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { CreateUsuarioFormData } from '../../schemas'

interface StepCredencialesProps {
  form: UseFormReturn<CreateUsuarioFormData>
}

function PasswordField({
  id,
  label,
  placeholder,
  form
}: {
  id: 'password' | 'confirmar_password'
  label: string
  placeholder: string
  form: UseFormReturn<CreateUsuarioFormData>
}) {
  const [show, setShow] = useState(false)
  const error = form.formState.errors[id]

  return (
    <label htmlFor={id} className='w-full flex flex-col gap-1 text-step-0'>
      <span className='font-semibold flex gap-1 items-center text-gray-700'>
        <svg
          className='w-4 h-4'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
          />
        </svg>
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
          {show ? (
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
              />
            </svg>
          ) : (
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <span className='text-red-500 text-xs flex items-center gap-1'>
          <svg
            className='w-3 h-3 shrink-0'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          {error.message as string}
        </span>
      )}
    </label>
  )
}

// Indicador de fortaleza de contraseña
function PasswordStrength({ password }: { password: string }) {
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
              <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            ) : (
              <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            )}
            {check.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function StepCredenciales({ form }: StepCredencialesProps) {
  const password = form.watch('password') ?? ''
  const usernameError = form.formState.errors.username

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
        <label
          htmlFor='username'
          className='w-full flex flex-col gap-1 text-step-0'
        >
          <span className='font-semibold flex gap-1 items-center text-gray-700'>
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
            Nombre de usuario
            <span className='text-red-500 ml-0.5'>*</span>
          </span>
          <input
            {...form.register('username')}
            id='username'
            type='text'
            placeholder='juan.perez'
            className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors text-step-0 bg-white ${
              usernameError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50'
                : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600'
            }`}
          />
          {usernameError ? (
            <span className='text-red-500 text-xs flex items-center gap-1'>
              <svg
                className='w-3 h-3 shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {usernameError.message}
            </span>
          ) : (
            <span className='text-xs text-gray-400'>
              Solo letras, números, puntos (.) y guiones (- _)
            </span>
          )}
        </label>

        {/* Password */}
        <div>
          <PasswordField
            id='password'
            label='Contraseña'
            placeholder='••••••••'
            form={form}
          />
          <PasswordStrength password={password} />
        </div>

        {/* Confirmar password */}
        <PasswordField
          id='confirmar_password'
          label='Confirmar contraseña'
          placeholder='••••••••'
          form={form}
        />
      </div>

      {/* Info box */}
      <div className='flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs'>
        <svg
          className='w-4 h-4 shrink-0 mt-0.5'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
            clipRule='evenodd'
          />
        </svg>
        <span>
          La contraseña será encriptada antes de guardarse. El usuario deberá
          cambiarla en su primer inicio de sesión.
        </span>
      </div>
    </div>
  )
}
