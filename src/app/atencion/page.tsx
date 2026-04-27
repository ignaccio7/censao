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

  console.log(data)

  return (
    <section className='atencion-publica min-h-screen bg-gray-50 font-secondary'>
      {/* HEADER */}
      <header className='w-full bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary-600 p-2.5 rounded-xl shadow-md'>
              <IconHospital className='text-white' size='28' />
            </div>
            <div>
              <h1 className='text-step-3 font-bold text-gray-800 tracking-tight font-primary'>
                Centro de Salud Alto Obrajes
              </h1>
              <p className='text-gray-500 text-step-0'>
                Pantalla de atención en tiempo real
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3 flex-wrap'>
            {/* Turno + Fecha badges */}
            {data && (
              <div className='flex items-center gap-2'>
                <span className='px-4 py-2 bg-primary-50 text-primary-700 font-semibold rounded-full text-step-1 border border-primary-200'>
                  {data.turno === 'AM' ? '☀️ Mañana' : '🌙 Tarde'}
                </span>
                <span className='px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-step-0 border border-gray-200'>
                  📅 {data.fecha}
                </span>
              </div>
            )}

            {/* Polling selector */}
            <div className='flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200'>
              <IconClock className='text-gray-400' size='16' />
              <label
                htmlFor='polling-publico'
                className='text-step-0 text-gray-500 font-medium whitespace-nowrap'
              >
                Actualizar:
              </label>
              <select
                id='polling-publico'
                className='bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-step-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer'
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
                  className='ml-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-step-0 rounded-lg transition-all duration-200 cursor-pointer font-medium active:scale-95 shadow-sm'
                >
                  Actualizar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className='max-w-7xl mx-auto p-6 pb-20'>
        {isLoading && (
          <div className='flex items-center justify-center min-h-[60vh]'>
            <div className='text-center'>
              <div className='inline-block w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4' />
              <p className='text-gray-500 text-step-2'>
                Cargando información...
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className='flex items-center justify-center min-h-[60vh]'>
            <div className='text-center bg-red-50 border border-red-200 rounded-2xl p-8'>
              <p className='text-red-700 text-step-2 font-semibold'>
                Error al cargar los datos
              </p>
              <p className='text-red-500 text-step-1 mt-2'>
                Intente actualizar la página
              </p>
              <button
                onClick={() => refetch()}
                className='mt-4 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-200 cursor-pointer border border-red-300'
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {data &&
          data.especialidades.length === 0 &&
          data.total_en_admision === 0 && (
            <div className='flex items-center justify-center min-h-[60vh]'>
              <div className='text-center'>
                <IconStethoscope
                  className='text-gray-300 mx-auto mb-4'
                  size='64'
                />
                <p className='text-gray-500 text-step-3 font-semibold'>
                  No hay fichas pendientes
                </p>
                <p className='text-gray-400 text-step-1 mt-2'>
                  En este momento no hay pacientes en espera
                </p>
              </div>
            </div>
          )}

        {data && data.total_en_admision > 0 && (
          <div className='mb-8'>
            <EnfermeriaRow
              fichas={data.fichas_en_admision}
              total={data.total_en_admision}
            />
          </div>
        )}

        {data && data.especialidades.length > 0 && (
          <div className='space-y-6'>
            {data.especialidades.map(
              (esp: FichaPublicaEspecialidad, index: number) => (
                <EspecialidadRow
                  key={`${esp.especialidad_nombre}-${esp.doctor_nombre}-${index}`}
                  especialidad={esp}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className='fixed bottom-0 left-0 right-0 px-6 py-3 bg-white/90 backdrop-blur-md border-t border-gray-200'>
        <div className='max-w-7xl mx-auto flex items-center justify-between text-gray-400 text-step-0'>
          <span>Sistema Censao — Centro de Salud Alto Obrajes</span>
          <span className='flex items-center gap-2'>
            {refetchInterval !== false && (
              <>
                <span className='inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
                <span className='text-emerald-600'>
                  Actualizando cada{' '}
                  {refetchInterval < 60000
                    ? `${refetchInterval / 1000}s`
                    : `${refetchInterval / 60000} min`}
                </span>
              </>
            )}
            {refetchInterval === false && (
              <>
                <span className='inline-block w-2 h-2 bg-amber-400 rounded-full' />
                <span className='text-amber-600'>Actualización manual</span>
              </>
            )}
          </span>
        </div>
      </footer>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Fila de especialidad con cola de fichas                                    */
/* -------------------------------------------------------------------------- */

function EspecialidadRow({
  especialidad
}: {
  especialidad: FichaPublicaEspecialidad
}) {
  const {
    especialidad_nombre,
    doctor_nombre,
    atendiendo,
    siguiente,
    fichas_pendientes,
    total_pendientes
  } = especialidad

  // CORREGIDO: Determinar qué fichas van en cada posición
  // Si hay "siguiente", esa ficha se muestra en el bloque "Siguiente"
  // Si hay "atendiendo", esa ficha se muestra en el bloque "Atendiendo"
  // El resto de fichas (excluyendo atendiendo y siguiente si existen) van a la cola

  const fichasRestantes = [...fichas_pendientes]

  // Remover la ficha que está siendo atendida (si existe)
  if (atendiendo !== null) {
    const index = fichasRestantes.indexOf(atendiendo)
    if (index !== -1) fichasRestantes.splice(index, 1)
  }

  // Remover la ficha que es la siguiente (si existe y no es la misma que atendiendo)
  if (siguiente !== null && siguiente !== atendiendo) {
    const index = fichasRestantes.indexOf(siguiente)
    if (index !== -1) fichasRestantes.splice(index, 1)
  }

  // Las fichas restantes son las que van en la cola
  const colaRestante = fichasRestantes

  return (
    <article className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md'>
      {/* Barra superior verde */}
      <div className='h-1 bg-gradient-to-r from-primary-500 to-primary-400' />

      <div className='p-5'>
        {/* Header: Especialidad y Doctor */}
        <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary-50 p-2 rounded-lg border border-primary-100'>
              <IconStethoscope className='text-primary-600' size='20' />
            </div>
            <div>
              <h2 className='text-step-2 font-bold text-gray-800 uppercase tracking-wide font-primary'>
                {especialidad_nombre}
              </h2>
              <p className='text-gray-500 text-step-1'>{doctor_nombre}</p>
            </div>
          </div>
          <span className='px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-step-0 border border-gray-200 font-medium'>
            {total_pendientes} en espera
          </span>
        </div>

        {/* Fichas: Atendiendo + Siguiente + Cola */}
        <div className='flex flex-wrap items-start gap-3'>
          {/* Atendiendo — Verde destacado */}
          {atendiendo !== null && (
            <div className='bg-primary-600 text-white rounded-xl px-5 py-3 shadow-md shadow-primary-200 min-w-[120px] text-center transition-all duration-300'>
              <p className='text-primary-100 text-step-0 uppercase tracking-wider font-semibold mb-0.5'>
                Atendiendo
              </p>
              <span className='text-step-5 font-bold block leading-none'>
                # {atendiendo}
              </span>
            </div>
          )}

          {/* Siguiente — Verde suave */}
          {siguiente !== null && siguiente !== atendiendo && (
            <div className='bg-primary-50 border-2 border-primary-300 text-primary-700 rounded-xl px-5 py-3 min-w-[120px] text-center transition-all duration-300'>
              <p className='text-primary-500 text-step-0 uppercase tracking-wider font-semibold mb-0.5'>
                Siguiente
              </p>
              <span className='text-step-5 font-bold block leading-none'>
                # {siguiente}
              </span>
            </div>
          )}

          {/* Cola de espera — fichas pequeñas blancas */}
          {colaRestante.length > 0 && (
            <div className='flex items-center gap-1.5 flex-wrap'>
              {/* Separador visual */}
              <div className='hidden sm:block w-px h-12 bg-gray-200 mx-1' />

              {colaRestante.map((orden, i) => (
                <div
                  key={`cola-${orden}-${i}`}
                  className='bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-[56px] text-center transition-all duration-200 hover:border-gray-300 hover:bg-gray-100'
                >
                  <p className='text-gray-400 text-[10px] uppercase tracking-wider font-medium leading-none mb-0.5'>
                    #
                    {i +
                      (atendiendo !== null ? 1 : 0) +
                      (siguiente !== null && siguiente !== atendiendo ? 1 : 0) +
                      1}
                  </p>
                  <span className='text-step-2 font-bold text-gray-600 block leading-none'>
                    {orden}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Sin fichas en cola (pero puede haber atendiendo o siguiente) */}
          {colaRestante.length === 0 &&
            atendiendo === null &&
            siguiente === null && (
              <div className='bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center'>
                <p className='text-gray-400 text-step-1'>
                  Sin fichas pendientes
                </p>
              </div>
            )}
        </div>
      </div>
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/*  Fila de Enfermería (Triage)                                                */
/* -------------------------------------------------------------------------- */

function EnfermeriaRow({
  fichas,
  total
}: {
  fichas: { turno: number; estado: string }[]
  total: number
}) {
  return (
    <article className='bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 mb-6'>
      {/* Barra superior verde esmeralda */}
      <div className='h-1 bg-gradient-to-r from-emerald-500 to-emerald-400' />

      <div className='p-5'>
        {/* Header: Enfermería */}
        <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-emerald-50 p-2 rounded-lg border border-emerald-100'>
              <IconHospital className='text-emerald-600' size='20' />
            </div>
            <div>
              <h2 className='text-step-2 font-bold text-gray-800 uppercase tracking-wide font-primary'>
                Enfermería
              </h2>
              <p className='text-gray-500 text-step-1'>
                Presentarse según número de ficha
              </p>
            </div>
          </div>
          <span className='px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-step-0 border border-gray-200 font-medium'>
            {total} en espera
          </span>
        </div>

        {/* Fichas: ADMISION (plomo) y ENFERMERIA (verde distintivo) */}
        <div className='flex flex-wrap items-start gap-3'>
          {fichas.length > 0 ? (
            <div className='flex items-center gap-2 flex-wrap'>
              {fichas.map((ficha, i) => {
                const enTriage = ficha.estado === 'ENFERMERIA'
                return (
                  <div
                    key={`enf-${ficha.turno}-${i}`}
                    className={`border rounded-xl px-4 py-3 min-w-[80px] text-center transition-all duration-300 ${
                      enTriage
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-200 scale-105'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <p
                      className={`text-[10px] uppercase tracking-wider font-bold leading-none mb-1 ${
                        enTriage ? 'text-emerald-100' : 'text-gray-400'
                      }`}
                    >
                      {enTriage ? 'ENFERMERIA' : 'ESPERANDO'}
                    </p>
                    <span className='text-step-4 font-bold block leading-none'>
                      {ficha.turno}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-center'>
              <p className='text-gray-400 text-step-1'>
                Sin fichas pendientes para Enfermería
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
