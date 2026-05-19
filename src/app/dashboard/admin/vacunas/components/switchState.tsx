'use client'

import { useState, useTransition } from 'react'
import { ToggleSwitch } from '@/app/components/ui/toggle-switch'
import { toast } from 'sonner'
import { toggleVacuna } from '@/actions/vacunas/toggle-vacunas'

interface EstadoSwitchProps {
  activo: boolean
  vacunaId: string
}

export function SwitchState({ activo, vacunaId }: EstadoSwitchProps) {
  const [isPending, startTransition] = useTransition()
  const [statusLocal, setStatusLocal] = useState(activo)

  const handleToggle = (newState: boolean) => {
    // Optimistic update (actualizar UI inmediatamente)
    setStatusLocal(newState)

    startTransition(async () => {
      try {
        const result = await toggleVacuna(vacunaId, newState)

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
        toast.error('Error al inactivar la vacuna')
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
