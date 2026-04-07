'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Title from '@/app/components/ui/title'
import { IconVaccine, IconArrowDown } from '@/app/components/icons/icons'
import { useTratamientos } from '@/app/services/tratamientos'

type EsquemaDosis = {
  id: string
  numero: number
  intervalo_dias: number
  edad_min_meses: number | null
  notas: string | null
}

type Vacuna = {
  id: string
  nombre: string
  descripcion: string | null
  fabricante: string | null
  esquema_dosis: EsquemaDosis[]
}

interface CrearTratamientoFormProps {
  fichaId: string
  pacienteNombre: string
  pacienteCi: string
  especialidadNombre: string
  ordenTurno: number | null
  vacunas: Vacuna[]
}

export default function CrearTratamientoForm({
  fichaId,
  pacienteNombre,
  pacienteCi,
  especialidadNombre,
  ordenTurno,
  vacunas
}: CrearTratamientoFormProps) {
  const router = useRouter()
  const { createTratamiento } = useTratamientos()

  const [selectedVacunaId, setSelectedVacunaId] = useState('')
  const [selectedEsquemaId, setSelectedEsquemaId] = useState('')

  // Obtener esquemas de la vacuna seleccionada
  const selectedVacuna = vacunas.find(v => v.id === selectedVacunaId)
  const esquemas = selectedVacuna?.esquema_dosis || []

  // Obtener la dosis seleccionada
  const selectedEsquema = esquemas.find(e => e.id === selectedEsquemaId)

  const handleVacunaChange = (vacunaId: string) => {
    setSelectedVacunaId(vacunaId)
    setSelectedEsquemaId('') // Reset dosis al cambiar vacuna
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEsquemaId || !selectedEsquema) {
      toast.error('Selecciona una vacuna y una dosis')
      return
    }

    try {
      const result = await createTratamiento.mutateAsync({
        fichaOrigenId: fichaId,
        esquemaId: selectedEsquemaId,
        dosisNumero: selectedEsquema.numero
      })

      if (result.success) {
        toast.success(result.message)

        // Si se creó un usuario nuevo, mostrar notificación extra
        if (result.data?.usuario_creado) {
          toast.info(
            `Se creó una cuenta para el paciente. Usuario: ${pacienteCi} | Contraseña: ${pacienteCi}`,
            { duration: 8000 }
          )
        }

        router.push('/dashboard/fichas')
      } else {
        toast.error(result.message || 'Error al registrar el tratamiento')
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Error al registrar el tratamiento'
      toast.error(message)
    }
  }

  return (
    <section className='crear-tratamiento'>
      <Title subtitle={`Ficha #${ordenTurno || '—'} · ${especialidadNombre}`}>
        Registrar Tratamiento
      </Title>

      {/* Info del paciente */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6 max-w-2xl'>
        <div className='flex items-center gap-3 mb-1'>
          <div className='w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center'>
            <span className='text-primary-700 font-bold text-step-1'>
              {pacienteNombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className='font-semibold text-gray-800 text-step-1'>
              {pacienteNombre}
            </h3>
            <p className='text-gray-500 text-step--1'>CI: {pacienteCi}</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className='bg-white rounded-lg shadow-sm border border-gray-100 p-6 max-w-2xl'
      >
        <div className='flex items-center gap-2 mb-6'>
          <IconVaccine className='text-primary-600' size='28' />
          <h2 className='text-step-1 font-semibold text-gray-800'>
            Seleccionar Vacuna y Dosis
          </h2>
        </div>

        {/* Select de Vacuna */}
        <div className='flex flex-col gap-2 mb-5'>
          <label
            htmlFor='vacuna'
            className='font-semibold text-gray-700 text-step-0'
          >
            Tipo de Vacuna
          </label>
          <div className='relative'>
            <select
              id='vacuna'
              value={selectedVacunaId}
              onChange={e => handleVacunaChange(e.target.value)}
              className='w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none cursor-pointer transition-all duration-200 text-step-0'
              required
            >
              <option value=''>Seleccione una vacuna...</option>
              {vacunas.map(vacuna => (
                <option key={vacuna.id} value={vacuna.id}>
                  {vacuna.nombre}
                  {vacuna.fabricante ? ` — ${vacuna.fabricante}` : ''}
                </option>
              ))}
            </select>
            <IconArrowDown
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
              size='20'
            />
          </div>
          {selectedVacuna?.descripcion && (
            <p className='text-step--1 text-gray-500 ml-1'>
              {selectedVacuna.descripcion}
            </p>
          )}
        </div>

        {/* Select de Dosis (esquema) */}
        <div className='flex flex-col gap-2 mb-6'>
          <label
            htmlFor='dosis'
            className='font-semibold text-gray-700 text-step-0'
          >
            Dosis a Aplicar
          </label>
          <div className='relative'>
            <select
              id='dosis'
              value={selectedEsquemaId}
              onChange={e => setSelectedEsquemaId(e.target.value)}
              className='w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none cursor-pointer transition-all duration-200 text-step-0 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'
              disabled={!selectedVacunaId}
              required
            >
              <option value=''>
                {selectedVacunaId
                  ? 'Seleccione la dosis...'
                  : 'Primero seleccione una vacuna'}
              </option>
              {esquemas.map(esquema => (
                <option key={esquema.id} value={esquema.id}>
                  Dosis {esquema.numero}
                  {esquema.notas ? ` — ${esquema.notas}` : ''}
                </option>
              ))}
            </select>
            <IconArrowDown
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
              size='20'
            />
          </div>
        </div>

        {/* Info del esquema seleccionado */}
        {selectedEsquema && (
          <div className='bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6'>
            <h4 className='font-semibold text-primary-800 text-step-0 mb-2'>
              Detalle de la dosis seleccionada
            </h4>
            <ul className='text-step--1 text-primary-700 space-y-1'>
              <li>
                <span className='font-medium'>Dosis:</span> #
                {selectedEsquema.numero}
              </li>
              {selectedEsquema.intervalo_dias > 0 && (
                <li>
                  <span className='font-medium'>Intervalo mínimo:</span>{' '}
                  {selectedEsquema.intervalo_dias} días desde la dosis anterior
                </li>
              )}
              {selectedEsquema.edad_min_meses && (
                <li>
                  <span className='font-medium'>Edad mínima:</span>{' '}
                  {selectedEsquema.edad_min_meses} meses
                </li>
              )}
              {selectedEsquema.notas && (
                <li>
                  <span className='font-medium'>Nota:</span>{' '}
                  {selectedEsquema.notas}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Botones */}
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={() => router.push('/dashboard/fichas')}
            className='flex-1 py-3 px-4 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 cursor-pointer'
          >
            Cancelar
          </button>
          <button
            type='submit'
            disabled={createTratamiento.isPending || !selectedEsquemaId}
            className='flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {createTratamiento.isPending
              ? 'Registrando...'
              : 'Registrar Tratamiento'}
          </button>
        </div>
      </form>
    </section>
  )
}
