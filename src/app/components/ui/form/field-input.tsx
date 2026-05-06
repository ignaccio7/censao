import { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { IconAlertCircle } from '../../icons/icons'

interface FieldProps<T extends FieldValues> {
  id: Path<T>
  label: string
  placeholder: string
  required?: boolean
  icon?: React.ReactNode
  type?: string
  form: UseFormReturn<T>
  className?: string
  disabled?: boolean
}

export function FieldInput<T extends FieldValues>({
  id,
  label,
  placeholder,
  required,
  icon,
  type = 'text',
  form,
  className = '',
  disabled = false
}: FieldProps<T>) {
  const error = form.formState.errors[id]

  return (
    <label
      htmlFor={id}
      className={`text-step-0 w-full flex flex-col gap-1 ${className}`}
    >
      <span className='font-semibold flex gap-1 items-center text-gray-700'>
        {icon}
        {label}
        {required && <span className='text-red-500 ml-0.5'>*</span>}
        {!required && (
          <span className='text-xs font-normal text-gray-400 ml-1'>
            (opcional)
          </span>
        )}
      </span>
      <input
        {...form.register(id)}
        id={id as string}
        type={type}
        placeholder={placeholder}
        className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors text-step-0 bg-white ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50'
            : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600'
        }
        ${disabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}
        `}
        disabled={disabled}
      />
      {error && (
        <span className='text-red-500 text-xs flex items-center gap-1'>
          <IconAlertCircle size='18' />
          {error.message as string}
        </span>
      )}
    </label>
  )
}
