'use client'
import { useState } from 'react'
import { IconEye, IconEyeOff } from '../../icons/icons'

const MIN_LENGTH = 0

export default function AnimatedInput({
  label = 'Introduce algo aqui',
  type = 'text',
  required = true,
  name = 'name',
  width = 'w-80',
  defaultValue = ''
}) {
  const [localType, setLocalType] = useState(type)
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = (event: any) => {
    setIsFocused(false)
    setHasValue(event.target.value.length > MIN_LENGTH)
  }

  const handleChange = (event: any) => {
    setHasValue(event.target.value.length > MIN_LENGTH)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
    setLocalType(showPassword ? 'password' : 'text')
  }

  const isLabelUp = isFocused || hasValue

  return (
    <div className={`relative ${width} text-base bg-white rounded-lg`}>
      <input
        type={localType}
        required={required}
        className='text-step-1 leading-none p-4 block w-full h-full border border-gray-700 rounded-lg outline-none focus:border-blue-500 transition-colors duration-300'
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        defaultValue={defaultValue}
        name={name}
      />
      <span
        className={`absolute pointer-events-none transition-all duration-300 ease-in-out px-1 ${
          isLabelUp
            ? 'top-0 left-4 -translate-y-1/2 bg-white text-sm text-gray-600'
            : 'top-1/2 left-4 -translate-y-1/2 text-base text-gray-500'
        }`}
      >
        {label}
      </span>
      {type === 'password' && (
        <button
          type='button'
          onClick={togglePasswordVisibility}
          className='absolute top-2 bottom-2 right-2 pl-2 z-20 bg-white cursor-pointer'
        >
          {showPassword ? <IconEyeOff /> : <IconEye />}
        </button>
      )}
    </div>
  )
}
