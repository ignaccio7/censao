'use client'
import { useState } from 'react'

const MIN_LENGTH = 0

export default function AnimatedInput({
  label = 'Introduce algo aqui',
  type = 'text',
  required = true,
  name = 'name',
  width = 'w-80'
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = (event: any) => {
    setIsFocused(false)
    setHasValue(event.target.value.length > MIN_LENGTH)
  }

  const handleChange = (event: any) => {
    setHasValue(event.target.value.length > MIN_LENGTH)
  }

  const isLabelUp = isFocused || hasValue

  return (
    <div className={`relative ${width} text-base bg-white rounded-lg`}>
      <input
        type={type}
        required={required}
        className='text-step-1 leading-none p-4 block w-full h-full border border-gray-700 rounded-lg outline-none focus:border-blue-500 transition-colors duration-300'
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
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
    </div>
  )
}
