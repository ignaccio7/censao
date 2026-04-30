// app/dashboard/admin/usuarios/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Error al cargar el recurso</h2>
      <p>
        Ocurrió un problema con el servidor. Si persiste, contacta a soporte.
      </p>
      <button onClick={reset}>Reintentar</button>
    </div>
  )
}
