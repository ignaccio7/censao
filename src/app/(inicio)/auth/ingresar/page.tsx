'use client'
import { signin } from '@/actions/auth/signin'
import AnimatedInput from '@/app/components/ui/form/custom-input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignIn() {
  const [error, setError] = useState<boolean>(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    console.log(`formData: ${Object.fromEntries(formData)}`)

    try {
      const response = await signin(formData)
      if (response) {
        router.replace('/dashboard')
      } else {
        setError(!response)
      }
    } catch (error) {
      console.log(error)
      alert('Error al ingresar')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='font-primary max-w-md w-full mx-4 rounded-lg overflow-hidden shadow-xl'
    >
      <legend className='px-4 py-6 bg-primary-700 text-white text-center text-step-2 font-semibold'>
        Inicia sesión
      </legend>

      <fieldset className='flex flex-col gap-6 px-4 my-6'>
        <AnimatedInput
          label='Introduce tu usuario'
          type='text'
          width='w-full'
          name='username'
        />
        <AnimatedInput
          label='Introduce tu constraseña'
          type='password'
          width='w-full'
          name='password'
        />
      </fieldset>

      {error && (
        <fieldset className='flex flex-col gap-6 px-4 my-6'>
          <span>Credenciales incorrectas</span>
        </fieldset>
      )}

      <fieldset className='px-4 pb-6 '>
        <button
          className='w-full px-4 py-2 rounded-lg text-white bg-quinary-600 cursor-pointer'
          type='submit'
        >
          Ingresar
        </button>
      </fieldset>
    </form>
  )
}
