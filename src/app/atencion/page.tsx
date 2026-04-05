'use client'

import { useState } from 'react'
import {
  useFichasPublico,
  FichaPublicaEspecialidad
} from '@/app/services/fichas-publico'
import {
  IconHospital,
  IconStethoscope,
  IconClock
} from '@/app/components/icons/icons'

export default function AtencionPublicaPage() {
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false)
  const { data, isLoading, isError, refetch } =
    useFichasPublico(refetchInterval)

  return (
    <section className='atencion-publica min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 font-secondary text-white'>
      {/* HEADER */}
      <header className='w-full px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-primary-600/30'>
        <div className='flex items-center gap-3'>
          <div className='bg-primary-500/20 p-2 rounded-xl border border-primary-400/30 backdrop-blur-sm'>
            <IconHospital className='text-primary-300' size='32' />
          </div>
          <div>
            <h1 className='text-step-4 font-bold tracking-tight font-primary'>
              Centro de Salud Alto Obrajes
            </h1>
            <p className='text-primary-300 text-step-1'>
              Pantalla de atención en tiempo real
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4 flex-wrap'>
          {/* Turno badge */}
          {data && (
            <div className='flex items-center gap-3'>
              <span className='px-4 py-2 bg-primary-500/20 text-primary-200 font-semibold rounded-full text-step-1 border border-primary-400/30 backdrop-blur-sm'>
                Turno: {data.turno === 'AM' ? '☀️ Mañana' : '🌙 Tarde'}
              </span>
              <span className='px-4 py-2 bg-primary-500/10 text-primary-300 rounded-full text-step-0 border border-primary-500/20'>
                📅 {data.fecha}
              </span>
            </div>
          )}

          {/* Polling selector */}
          <div className='flex items-center gap-2 bg-primary-500/10 rounded-xl px-3 py-2 border border-primary-500/20 backdrop-blur-sm'>
            <IconClock className='text-primary-400' size='18' />
            <label
              htmlFor='polling-publico'
              className='text-step-0 text-primary-300 font-medium whitespace-nowrap'
            >
              Actualizar:
            </label>
            <select
              id='polling-publico'
              className='bg-primary-800/80 border border-primary-600/40 rounded-lg px-3 py-1.5 text-step-0 text-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer'
              value={
                refetchInterval === false ? 'false' : String(refetchInterval)
              }
              onChange={e => {
                const val = e.target.value
                setRefetchInterval(val === 'false' ? false : Number(val))
              }}
            >
              <option value='false'>Manual</option>
              <option value='1000'>Tiempo real (1s)</option>
              <option value='5000'>Cada 5s</option>
              <option value='30000'>Cada 30s</option>
              <option value='60000'>Cada 1 min</option>
              <option value='1800000'>Cada 30 min</option>
            </select>

            {refetchInterval === false && (
              <button
                onClick={() => refetch()}
                className='ml-1 px-3 py-1.5 bg-primary-500 hover:bg-primary-400 text-white text-step-0 rounded-lg transition-all duration-200 cursor-pointer font-medium active:scale-95'
              >
                Actualizar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className='p-6'>
        {isLoading && (
          <div className='flex items-center justify-center min-h-[60vh]'>
            <div className='text-center'>
              <div className='inline-block w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mb-4' />
              <p className='text-primary-300 text-step-2'>
                Cargando información...
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className='flex items-center justify-center min-h-[60vh]'>
            <div className='text-center bg-red-500/10 border border-red-500/30 rounded-2xl p-8'>
              <p className='text-red-300 text-step-2 font-semibold'>
                Error al cargar los datos
              </p>
              <p className='text-red-400/70 text-step-1 mt-2'>
                Intente actualizar la página
              </p>
              <button
                onClick={() => refetch()}
                className='mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all duration-200 cursor-pointer border border-red-500/30'
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {data && data.especialidades.length === 0 && (
          <div className='flex items-center justify-center min-h-[60vh]'>
            <div className='text-center'>
              <IconStethoscope
                className='text-primary-500/40 mx-auto mb-4'
                size='64'
              />
              <p className='text-primary-300 text-step-3 font-semibold'>
                No hay fichas pendientes
              </p>
              <p className='text-primary-400/60 text-step-1 mt-2'>
                En este momento no hay pacientes en espera
              </p>
            </div>
          </div>
        )}

        {data && data.especialidades.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {data.especialidades.map(
              (esp: FichaPublicaEspecialidad, index: number) => (
                <EspecialidadCard
                  key={`${esp.especialidad_nombre}-${esp.doctor_nombre}-${index}`}
                  especialidad={esp}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className='fixed bottom-0 left-0 right-0 px-6 py-3 bg-primary-950/80 backdrop-blur-md border-t border-primary-700/30'>
        <div className='flex items-center justify-between text-primary-400/60 text-step-0'>
          <span>Sistema Censao — Centro de Salud Alto Obrajes</span>
          <span className='flex items-center gap-2'>
            {refetchInterval !== false && (
              <>
                <span className='inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse' />
                <span className='text-emerald-400/80'>
                  Actualizando cada{' '}
                  {refetchInterval < 60000
                    ? `${refetchInterval / 1000}s`
                    : `${refetchInterval / 60000} min`}
                </span>
              </>
            )}
            {refetchInterval === false && (
              <>
                <span className='inline-block w-2 h-2 bg-yellow-400 rounded-full' />
                <span className='text-yellow-400/80'>Actualización manual</span>
              </>
            )}
          </span>
        </div>
      </footer>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card de especialidad                                                       */
/* -------------------------------------------------------------------------- */

function EspecialidadCard({
  especialidad
}: {
  especialidad: FichaPublicaEspecialidad
}) {
  const {
    especialidad_nombre,
    doctor_nombre,
    atendiendo,
    siguiente,
    total_pendientes
  } = especialidad

  return (
    <article className='group relative bg-primary-800/40 backdrop-blur-md border border-primary-600/25 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary-400/40 hover:shadow-lg hover:shadow-primary-500/10'>
      {/* Gradient accent bar */}
      <div className='h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-emerald-400' />

      {/* Especialidad header */}
      <div className='px-5 pt-4 pb-3 border-b border-primary-600/20'>
        <h2 className='text-step-2 font-bold text-white uppercase tracking-wide font-primary'>
          {especialidad_nombre}
        </h2>
        <div className='flex items-center gap-2 mt-1.5'>
          <IconStethoscope className='text-primary-400' size='16' />
          <p className='text-primary-300 text-step-1 font-medium'>
            {doctor_nombre}
          </p>
        </div>
      </div>

      {/* Fichas info */}
      <div className='px-5 py-4 grid grid-cols-2 gap-4'>
        {/* Atendiendo */}
        <div className='text-center'>
          <p className='text-primary-400/70 text-step-0 uppercase tracking-wider font-semibold mb-1'>
            Atendiendo
          </p>
          {atendiendo !== null ? (
            <div className='relative'>
              <span className='text-step-6 font-bold text-white block leading-none animate-pulse'>
                # {atendiendo}
              </span>
              <div className='absolute -inset-2 bg-primary-400/5 rounded-xl -z-10' />
            </div>
          ) : (
            <span className='text-step-2 text-primary-500/50 block'>—</span>
          )}
        </div>

        {/* Siguiente */}
        <div className='text-center'>
          <p className='text-primary-400/70 text-step-0 uppercase tracking-wider font-semibold mb-1'>
            Siguiente
          </p>
          {siguiente !== null ? (
            <span className='text-step-6 font-bold text-primary-300 block leading-none'>
              # {siguiente}
            </span>
          ) : (
            <span className='text-step-2 text-primary-500/50 block'>—</span>
          )}
        </div>
      </div>

      {/* Footer con total pendientes */}
      <div className='px-5 py-3 bg-primary-900/30 border-t border-primary-600/15'>
        <div className='flex items-center justify-between'>
          <span className='text-primary-400/60 text-step-0'>En espera</span>
          <span className='text-primary-300 text-step-1 font-bold'>
            {total_pendientes}{' '}
            {total_pendientes === 1 ? 'paciente' : 'pacientes'}
          </span>
        </div>
      </div>
    </article>
  )
}
