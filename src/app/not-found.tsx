'use client'

export default function NotFound() {
  return (
    <div className='w-full min-h-screen grid place-content-center'>
      <h1 className='text-3xl font-bold'>Pagina no encontrada</h1>
      <button
        className='cursor-pointer text-primary-700 hover:text-primary-800 underline'
        onClick={() => {
          window.history.back()
        }}
      >
        Volver
      </button>
    </div>
  )
}
