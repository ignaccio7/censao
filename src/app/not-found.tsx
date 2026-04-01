'use client'

export default function NotFound() {
  return (
    <div className='w-full min-h-screen grid place-content-center'>
      <h1 className='text-3xl font-bold'>Pagina no encontrada</h1>
      <button
        onClick={() => {
          window.history.back()
        }}
      >
        Volver
      </button>
    </div>
  )
}
