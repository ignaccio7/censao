'use client'
import { useState } from 'react'
import { IconStethoscope } from '@/app/components/icons/icons'
import Title from '@/app/components/ui/title'
import {
  useEstadoDoctores,
  type DoctorTurno
} from '@/app/services/estado-doctores'
import ModalReasignarDoctor from './components/ModalReasignarDoctor'

function getBarColor(activas: number, cuposRestantes: number): string {
  // Sin actividad en absoluto
  if (cuposRestantes === 0 && activas === 0) return 'bg-gray-300'
  // Sin cupos disponibles pero con fichas activas → sobrecargado
  if (cuposRestantes === 0) return 'bg-red-500'
  const ratio = activas / cuposRestantes
  if (ratio >= 0.8) return 'bg-red-500'
  if (ratio >= 0.5) return 'bg-yellow-500'
  return 'bg-green-500'
}

export default function EstadoDoctores() {
  const { doctores, isLoading, isError, refetch } = useEstadoDoctores()
  const [doctorSeleccionado, setDoctorSeleccionado] =
    useState<DoctorTurno | null>(null)

  console.log(doctores)

  return (
    <section className='estado-doctores'>
      <div className='w-full flex justify-between items-center gap-2 mb-6'>
        <Title
          className='w-fit'
          subtitle='Gestiona la cola de atención del turno actual'
        >
          Estado de los doctores
        </Title>

        <button
          onClick={() => refetch()}
          className='text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-600 cursor-pointer'
        >
          Actualizar
        </button>
      </div>

      {isLoading && (
        <div className='flex items-center justify-center h-40 text-gray-500'>
          <div className='animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full mr-3' />
          Cargando estado de doctores...
        </div>
      )}

      {isError && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm'>
          Error al cargar el estado de los doctores. Intenta actualizar.
        </div>
      )}

      {!isLoading && !isError && doctores.length === 0 && (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500'>
          No hay doctores con disponibilidades registradas para el turno actual.
        </div>
      )}

      {!isLoading && !isError && doctores.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {doctores.map(doctor => {
            const activas = doctor.fichasActivas.length
            // cuposRestantes = slots aún disponibles para asignar nuevas fichas
            const cuposRestantes = Math.max(
              doctor.cuposMaximos - doctor.fichasTotal,
              0
            )
            // porcentaje visual: fichas activas respecto al tope máximo del doctor
            const porcentaje = Math.min(
              (activas / Math.max(doctor.cuposMaximos, 1)) * 100,
              100
            )

            return (
              <div
                key={`${doctor.doctorId}-${doctor.especialidadId}`}
                className='border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow'
              >
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h3 className='font-semibold text-gray-800 text-step-1'>
                      {doctor.nombre}
                    </h3>
                    <p className='text-gray-500 text-step-0'>
                      {doctor.especialidadNombre}
                    </p>
                  </div>
                  <IconStethoscope
                    className='text-primary-700 shrink-0'
                    size='20'
                  />
                </div>

                {/* Contadores de estado */}
                <div className='flex gap-3 mb-3 flex-wrap'>
                  {[
                    {
                      estado: 'EN_ESPERA',
                      label: 'En espera',
                      color: 'bg-blue-100 text-blue-700'
                    },
                    {
                      estado: 'ATENDIENDO',
                      label: 'Atendiendo',
                      color: 'bg-purple-100 text-purple-700'
                    },
                    {
                      estado: 'CANCELADA',
                      label: 'Canceladas',
                      color: 'bg-red-100 text-red-700'
                    }
                  ].map(({ estado, label, color }) => {
                    const count = doctor.fichasActivas.filter(
                      f => f.estado === estado
                    ).length
                    return (
                      <span
                        key={estado}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
                      >
                        {count} {label}
                      </span>
                    )
                  })}
                  {/* Fichas ya atendidas en el turno */}
                  <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700'>
                    {doctor.fichasAtendidas} Atendidas
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className='mb-4'>
                  <div className='flex justify-between items-center mb-1'>
                    <span className='text-step-0 text-gray-500'>
                      Cupos de atención
                    </span>
                    <span className='text-step-0 font-medium text-gray-700'>
                      {activas} activas / {cuposRestantes} cupos
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getBarColor(activas, cuposRestantes)}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>

                {/* Botón de reasignación */}
                <button
                  onClick={() => setDoctorSeleccionado(doctor)}
                  disabled={activas === 0}
                  className='w-full bg-primary-100 text-primary-700 py-2 px-3 text-step-0 rounded-md hover:bg-primary-200 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium'
                >
                  {activas === 0
                    ? 'Sin fichas activas'
                    : `Reasignar ${activas} ficha(s)`}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de reasignación */}
      {doctorSeleccionado && (
        <ModalReasignarDoctor
          doctor={doctorSeleccionado}
          todosLosDoctores={doctores}
          isOpen={!!doctorSeleccionado}
          onClose={() => setDoctorSeleccionado(null)}
        />
      )}
    </section>
  )
}
