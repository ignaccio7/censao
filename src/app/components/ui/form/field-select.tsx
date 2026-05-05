import { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { IconAlertCircle } from '../../icons/icons'

interface FieldSelectProps<T extends FieldValues> {
  id: Path<T>
  label: string
  options: { value: string | number; label: string }[]
  placeholder?: string
  required?: boolean
  icon?: React.ReactNode
  form: UseFormReturn<T>
  className?: string
}

export function FieldSelect<T extends FieldValues>({
  id,
  label,
  options,
  placeholder = 'Seleccionar...',
  required,
  icon,
  form,
  className = ''
}: FieldSelectProps<T>) {
  const error = form.formState.errors[id]

  return (
    <label
      htmlFor={id}
      className={`text-step-0 w-full flex flex-col gap-1 ${className}`}
    >
      <span className='font-semibold flex gap-1 items-center text-gray-700 text-sm'>
        {icon}
        {label}
        {required && <span className='text-red-500 ml-0.5'>*</span>}
        {!required && (
          <span className='text-xs font-normal text-gray-400 ml-1'>
            (opcional)
          </span>
        )}
      </span>
      <select
        {...form.register(id)}
        id={id as string}
        className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors text-step-0 bg-white ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50'
            : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600'
        }`}
      >
        <option value=''>{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className='text-red-500 text-xs flex items-center gap-1'>
          <IconAlertCircle size='18' />
          {error.message as string}
        </span>
      )}
    </label>
  )
}
