'use client'
import { signin } from '@/actions/auth/signin'
import { IconHeart } from '@/app/components/icons/icons'
import AnimatedInput from '@/app/components/ui/form/custom-input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignIn() {
  const [error, setError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(false)

    const formData = new FormData(event.currentTarget)
    console.log(`formData: ${Object.fromEntries(formData)}`)

    try {
      const response = await signin(formData)
      if (response) {
        router.replace('/dashboard')
      } else {
        setError(true)
      }
    } catch (error) {
      console.log(error)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='w-full max-w-3xl h-auto mx-8 min-h-96 flex flex-row bg-white shadow-md rounded-md overflow-hidden primary-font'>
      <div className='logo bg-primary-700 w-full hidden md:flex items-center justify-center'>
        <div className='logo font-semibold flex gap-0 items-center text-step-4 text-white cursor-pointer'>
          CENSA
          <IconHeart
            size='40'
            className='p-1 border border-white rounded-full text-white bg-primary-700'
          />
        </div>
      </div>

      <div className='w-full min-h-96 border border-gray-100'>
        <div className='flex flex-col gap-8 justify-center h-full px-4'>
          <form
            onSubmit={handleSubmit}
            className='login flex flex-col gap-6 py-8'
          >
            <h1 className='text-center text-2xl font-bold text-primary-600'>
              Iniciar sesión
            </h1>

            <AnimatedInput
              label='Introduzca su usuario'
              type='text'
              width='w-full'
              name='username'
            />

            <AnimatedInput
              label='Introduzca su contraseña'
              type='password'
              width='w-full'
              name='password'
            />

            <div className='mt-2 flex flex-col items-center justify-between gap-2'>
              <button
                className='w-full text-center flex justify-center items-center gap-2 px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                type='submit'
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className='animate-spin h-4 w-4 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Cargando...
                  </>
                ) : (
                  'Inicia sesión'
                )}
              </button>

              {error && (
                <div className='mt-2'>
                  <span className='text-sm text-red-600'>
                    Credenciales incorrectas
                  </span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
