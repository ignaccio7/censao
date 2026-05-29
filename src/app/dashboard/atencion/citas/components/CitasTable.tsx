'use client'
// oxlint-disable no-magic-numbers
import { useState, useMemo } from 'react'
import {
  useCitasAtencion,
  CitaAtencionDTO
} from '@/app/services/citas-atencion'
import {
  IconCalendar,
  IconHistory,
  IconStethoscope,
  IconSun,
  IconSunset,
  IconVaccine
} from '@/app/components/icons/icons'

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Devuelve los días hábiles (Lun–Vie) de la semana que contiene `base` */
function getDiasHabilesSemanaDe(base: Date): Date[] {
  const lunes = new Date(base)
  const dow = base.getDay() // 0=Dom, 1=Lun ... 6=Sáb
  const diffLunes = dow === 0 ? -6 : 1 - dow
  lunes.setDate(base.getDate() + diffLunes)
  lunes.setHours(0, 0, 0, 0)

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(lunes)
    d.setDate(lunes.getDate() + i)
    return d
  })
}

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10) // YYYY-MM-DD
}

function toHoy(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

const DIAS_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

// ──────────────────────────────────────────────────────────────────────────────
// Badge de estado
// ──────────────────────────────────────────────────────────────────────────────
const estadoStyles: Record<string, string> = {
  PENDIENTE: 'bg-blue-50 text-blue-700 border-blue-200',
  GENERADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ABSORBIDA: 'bg-violet-50 text-violet-700 border-violet-200',
  CANCELADA: 'bg-red-50 text-red-700 border-red-200',
  VENCIDA: 'bg-gray-100 text-gray-500 border-gray-200'
}

function EstadoBadge({ estado }: { estado: string }) {
  const cls =
    estadoStyles[estado] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase ${cls}`}
    >
      {estado}
    </span>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Ícono por tipo de cita
// ──────────────────────────────────────────────────────────────────────────────
const tipoIcon: Record<string, React.ReactNode> = {
  VACUNA: <IconVaccine />,
  CONTROL: <IconStethoscope />,
  CONSULTA: <IconHistory />
}

// ──────────────────────────────────────────────────────────────────────────────
// Fila de cita
// ──────────────────────────────────────────────────────────────────────────────
function CitaRow({ cita }: { cita: CitaAtencionDTO }) {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors'>
      {/* Ícono + tipo */}
      <div className='flex items-center gap-2 shrink-0 w-36'>
        <span className='text-xl'>{tipoIcon[cita.tipo] ?? '📅'}</span>
        <span className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
          {cita.tipo}
        </span>
      </div>

      {/* Paciente */}
      <div className='flex-1 min-w-0'>
        <p className='font-semibold text-gray-800 truncate'>
          {cita.paciente_nombre}
        </p>
        <p className='text-xs text-gray-400'>CI: {cita.paciente_ci}</p>
      </div>

      {/* Vacuna / Dosis (solo si VACUNA) */}
      {cita.vacuna_nombre && (
        <div className='shrink-0 text-sm text-gray-600'>
          <span className='font-medium'>{cita.vacuna_nombre}</span>
          {cita.dosis_numero && (
            <span className='ml-1 text-xs text-gray-400'>
              (Dosis {cita.dosis_numero})
            </span>
          )}
        </div>
      )}

      {/* Doctor */}
      {cita.doctor_nombre && (
        <p className='shrink-0 text-xs text-gray-500'>{cita.doctor_nombre}</p>
      )}

      {/* Estado */}
      <div className='shrink-0'>
        <EstadoBadge estado={cita.estado} />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Grupo AM/PM
// ──────────────────────────────────────────────────────────────────────────────
function TurnoGroup({
  turno,
  citas
}: {
  turno: 'AM' | 'PM'
  citas: CitaAtencionDTO[]
}) {
  if (citas.length === 0) return null

  return (
    <div className='mb-6'>
      <div className='flex items-center gap-2 mb-3'>
        <span className='text-lg'>
          {turno === 'AM' ? <IconSun /> : <IconSunset />}
        </span>
        <h3 className='font-bold text-gray-700 text-step-0'>
          Turno {turno === 'AM' ? 'Mañana (AM)' : 'Tarde (PM)'}
        </h3>
        <span className='ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold'>
          {citas.length} cita{citas.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className='flex flex-col gap-2'>
        {citas.map(c => (
          <CitaRow key={c.id} cita={c} />
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────────────────────
export default function CitasTable() {
  const hoy = useMemo(() => toHoy(), [])
  const [semanaBase, setSemanaBase] = useState<Date>(hoy)
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date>(hoy)

  const diasHabiles = useMemo(
    () => getDiasHabilesSemanaDe(semanaBase),
    [semanaBase]
  )

  const fechaStr = toYMD(diaSeleccionado)
  const { data: citas = [], isLoading } = useCitasAtencion(fechaStr)

  const citasAM = citas.filter(c => c.turno_codigo === 'AM')
  const citasPM = citas.filter(c => c.turno_codigo === 'PM')

  function semanaAnterior() {
    const prev = new Date(semanaBase)
    prev.setDate(prev.getDate() - 7)
    setSemanaBase(prev)
  }

  function semanaSiguiente() {
    const next = new Date(semanaBase)
    next.setDate(next.getDate() + 7)
    setSemanaBase(next)
  }

  return (
    <div className='font-secondary'>
      {/* Selector de semana */}
      <div className='flex items-center gap-2 mb-6 flex-wrap'>
        <button
          onClick={semanaAnterior}
          className='p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600'
          aria-label='Semana anterior'
        >
          ←
        </button>

        {diasHabiles.map((dia, i) => {
          const ymd = toYMD(dia)
          const esHoy = toYMD(hoy) === ymd
          const esSel = toYMD(diaSeleccionado) === ymd

          return (
            <button
              key={ymd}
              onClick={() => setDiaSeleccionado(dia)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl text-sm transition-colors min-w-[52px]
                ${esSel ? 'bg-blue-600 text-white shadow-sm' : esHoy ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <span className='text-[11px] font-medium'>{DIAS_LABELS[i]}</span>
              <span className='font-bold'>
                {dia.toLocaleDateString('es-BO', {
                  timeZone: 'America/La_Paz',
                  day: '2-digit'
                })}
              </span>
              {esHoy && !esSel && (
                <span className='w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5' />
              )}
            </button>
          )
        })}

        <button
          onClick={semanaSiguiente}
          className='p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600'
          aria-label='Semana siguiente'
        >
          →
        </button>

        {/* Fecha larga */}
        <span className='ml-auto text-sm text-gray-500'>
          {diaSeleccionado.toLocaleDateString('es-BO', {
            timeZone: 'America/La_Paz',
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </span>
      </div>

      {/* Contenido */}
      {isLoading && (
        <div className='flex flex-col gap-3'>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className='h-14 rounded-lg bg-gray-200 animate-pulse'
            />
          ))}
        </div>
      )}

      {!isLoading && citas.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-gray-400 gap-2'>
          <span className='text-4xl'>
            <IconCalendar size='32' />
          </span>
          <p className='text-step-0'>No hay citas programadas para este día</p>
        </div>
      )}

      {!isLoading && citas.length > 0 && (
        <>
          <TurnoGroup turno='AM' citas={citasAM} />
          <TurnoGroup turno='PM' citas={citasPM} />
        </>
      )}
    </div>
  )
}
