export default function FullScreenLoader() {
  return (
    <div className='absolute inset-0 bg-white z-[9999] flex items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        {/* Spinner */}
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800' />

        {/* Texto */}
        <p className='text-gray-600 font-medium'>Cargando...</p>
      </div>
    </div>
  )
}
