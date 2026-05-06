'use client'

import { useState, useTransition } from 'react'
import { ToggleSwitch } from '@/app/components/ui/toggle-switch'
import { toggleUsuario } from '@/actions/usuarios/toggle-usuario'
import { toast } from 'sonner'

interface EstadoSwitchProps {
  activo: boolean
  usuarioId: string
}

export function SwitchState({ activo, usuarioId }: EstadoSwitchProps) {
  const [isPending, startTransition] = useTransition()
  const [statusLocal, setStatusLocal] = useState(activo)

  const handleToggle = (newState: boolean) => {
    // Optimistic update (actualizar UI inmediatamente)
    setStatusLocal(newState)

    startTransition(async () => {
      try {
        const result = await toggleUsuario(usuarioId, newState)

        if (result.success) {
          toast.success(result.message)
        } else {
          // Revertir si hay error
          setStatusLocal(!newState)
          toast.error(result.message)
        }
      } catch (error) {
        // Revertir en caso de error
        console.log(error)
        setStatusLocal(!newState)
        toast.error('Error al cambiar el estado')
      }
    })
  }

  return (
    <ToggleSwitch
      active={statusLocal}
      onChange={handleToggle}
      disabled={isPending}
      size='sm'
      label={{
        on: '',
        off: ''
      }}
    />
  )
}
