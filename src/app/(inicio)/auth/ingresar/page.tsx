'use client'
import AnimatedInput from '@/app/components/ui/form/custom-input'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const router = useRouter()

  const handleSubmit = (event: any) => {
    event.preventDefault()
    router.push('/dashboard')
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
        />
        <AnimatedInput
          label='Introduce tu constraseña'
          type='password'
          width='w-full'
        />
      </fieldset>

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
