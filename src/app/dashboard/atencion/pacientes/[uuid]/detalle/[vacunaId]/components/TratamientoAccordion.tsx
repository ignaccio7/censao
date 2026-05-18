'use client'

import { useState } from 'react'
import { IconPencil, IconTrash } from '@/app/components/icons/icons'

export default function TratamientoAccordion({
  tratamiento
}: {
  tratamiento: any
}) {
  const [open, setOpen] = useState(false)
  const citas = tratamiento.citas || []

  // Componente interno para el estado del tratamiento
  const ESTADO_TRATAMIENTO: Record<string, { label: string; color: string }> = {
    EN_CURSO: {
      label: 'En curso',
      color: 'border-blue-500 bg-blue-500/10 text-blue-700'
    },
    COMPLETADA: {
      label: 'Completado',
      color: 'border-green-500 bg-green-500/10 text-green-700'
    },
    INCOMPLETA: {
      label: 'Incompleto',
      color: 'border-amber-500 bg-amber-500/10 text-amber-700'
    },
    CANCELADO: {
      label: 'Cancelado',
      color: 'border-red-500 bg-red-500/10 text-red-700'
    }
  }

  const configEstado = ESTADO_TRATAMIENTO[tratamiento.estado] || {
    label: tratamiento.estado,
    color: 'border-gray-500 bg-gray-500/10 text-gray-700'
  }

  return (
    <div className='rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm transition-all duration-200 hover:shadow-md'>
      {/* HEADER DEL ACORDEÓN */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors border-none cursor-pointer ${
          open
            ? 'bg-gray-50/80 border-b border-gray-200'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className='flex items-center gap-4'>
          {/* Icono de Toggle */}
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors text-sm font-bold ${
              open ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2.5'
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </span>

          {/* Información Principal */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6'>
            <div>
              <p className='text-base sm:text-lg font-bold text-gray-900'>
                Dosis #{tratamiento.esquema_dosis?.numero}
              </p>
              <p className='text-xs sm:text-sm text-gray-500 font-medium mt-0.5'>
                Fecha de Aplicación:{' '}
                {new Date(tratamiento.fecha_aplicacion).toLocaleDateString(
                  'es-BO',
                  {
                    timeZone: 'America/La_Paz',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }
                )}
              </p>
            </div>

            {/* Estado del Tratamiento */}
            <div className='mt-1 sm:mt-0'>
              <span
                className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${configEstado.color}`}
              >
                {configEstado.label}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen de Citas */}
        <div className='flex flex-col items-end'>
          <span
            className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${citas.length > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
          >
            {citas.length}{' '}
            {citas.length === 1 ? 'cita agendada' : 'citas agendadas'}
          </span>
          {tratamiento.observaciones && (
            <span
              className='text-[10px] sm:text-[11px] text-gray-400 mt-1 truncate max-w-[120px] sm:max-w-[200px]'
              title={tratamiento.observaciones}
            >
              Nota: {tratamiento.observaciones}
            </span>
          )}
        </div>
      </button>

      {/* BODY DEL ACORDEÓN (LISTA DE CITAS) */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className='overflow-hidden'>
          {/* Cabecera de la lista de Citas */}
          <div className='bg-gray-50 px-4 py-2 sm:px-6 grid grid-cols-4 gap-4 items-center border-b border-gray-100'>
            <span className='text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
              Fecha Programada
            </span>
            <span className='text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
              Tipo
            </span>
            <span className='text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
              Estado
            </span>
            <span className='text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
              Acciones
            </span>
          </div>

          {/* Lista de Citas */}
          <div className='flex flex-col'>
            {citas.length === 0 ? (
              <div className='p-6 text-center text-gray-500 bg-white text-sm'>
                No hay citas programadas para esta dosis.
              </div>
            ) : (
              citas.map((cita: any) => (
                <div
                  key={cita.id}
                  className='grid grid-cols-4 gap-4 items-center px-4 py-3 sm:px-6 bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors'
                >
                  <span className='text-sm font-semibold text-gray-800'>
                    {new Date(cita.fecha_programada).toLocaleDateString(
                      'es-BO',
                      {
                        timeZone: 'America/La_Paz',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }
                    )}
                  </span>

                  <span className='text-sm text-gray-600 font-medium'>
                    {cita.tipo}
                  </span>

                  <div className='flex'>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        cita.estado === 'PENDIENTE'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : cita.estado === 'CANCELADA'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {cita.estado}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <button
                      className='inline-flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors shadow-sm border border-blue-100'
                      title='Modificar cita'
                    >
                      <IconPencil className='w-3.5 h-3.5 sm:mr-1.5' />
                      <span className='hidden sm:inline text-xs font-bold'>
                        Modificar
                      </span>
                    </button>
                    <button
                      className='inline-flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors shadow-sm border border-red-100'
                      title='Cancelar cita'
                    >
                      <IconTrash className='w-3.5 h-3.5 sm:mr-1.5' />
                      <span className='hidden sm:inline text-xs font-bold'>
                        Cancelar
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Botón de acción al pie del acordeón */}
          <div className='p-3 sm:p-4 bg-gray-50/50 flex justify-end'>
            <button className='inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm'>
              <svg
                className='w-3.5 h-3.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2.5'
                  d='M12 4v16m8-8H4'
                ></path>
              </svg>
              Programar Nueva Cita
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
