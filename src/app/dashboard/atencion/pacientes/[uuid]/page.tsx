'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/app/services/client'
import CustomDataTable from '@/app/components/ui/dataTable'
import { StatusBadge } from '@/app/dashboard/fichas/components/statusBadge'
import Link from 'next/link'
import {
  IconCredential,
  IconEmail,
  IconVaccine
} from '@/app/components/icons/icons'

const ESTADO_TRATAMIENTO: Record<string, { label: string; color: string }> = {
  EN_CURSO: {
    label: 'En curso',
    color: 'border-blue-500 bg-blue-500/20 text-blue-700'
  },
  COMPLETADA: {
    label: 'Completado',
    color: 'border-green-500 bg-green-500/20 text-green-700'
  },
  INCOMPLETA: {
    label: 'Incompleto',
    color: 'border-amber-500 bg-amber-500/20 text-amber-700'
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'border-red-500 bg-red-500/20 text-red-700'
  }
}

function EstadoTratamientoBadge({ estado }: { estado: string }) {
  const config = ESTADO_TRATAMIENTO[estado] || {
    label: estado,
    color: 'border-gray-500 bg-gray-500/20 text-gray-700'
  }
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${config.color}`}
    >
      {config.label}
    </span>
  )
}

export default function PacienteDetallePage() {
  const params = useParams()
  const uuid = params.uuid as string

  const {
    data: paciente,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['atencion-pacientes', uuid],
    queryFn: () =>
      apiClient.get(`atencion/pacientes/${uuid}`).then(res => res.data.data)
  })

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center p-12'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4' />
        <p className='text-gray-500'>Cargando historial del paciente...</p>
      </div>
    )
  }

  if (isError || !paciente) {
    return (
      <div className='p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100'>
        <h3 className='text-xl font-bold mb-2'>Error</h3>
        <p>
          No se pudo cargar la información del paciente. Verifica la conexión o
          intenta más tarde.
        </p>
        <Link
          href='/dashboard/atencion/pacientes'
          className='mt-4 inline-block px-4 py-2 bg-gray-800 text-white rounded-lg'
        >
          Volver a pacientes
        </Link>
      </div>
    )
  }

  // ── Columnas de fichas ──
  const columnasFichas = [
    { campo: 'Fecha' },
    { campo: 'Turno' },
    { campo: 'Estado' },
    { campo: 'Especialidad' },
    { campo: 'Doctor' }
  ]

  const contenidoFichas =
    paciente.fichas?.map((ficha: any) => [
      <span
        key={`date-${ficha.id}`}
        className='whitespace-nowrap font-medium text-gray-700'
      >
        {new Date(ficha.fecha_ficha).toLocaleString('es-BO', {
          timeZone: 'America/La_Paz',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </span>,
      <span
        key={`turno-${ficha.id}`}
        className={
          ficha.orden_turno && ficha.orden_turno < 0
            ? 'text-indigo-600 font-medium'
            : 'text-emerald-600 font-medium'
        }
      >
        {ficha.orden_turno && ficha.orden_turno < 0
          ? 'Programada'
          : `Presencial (#${ficha.orden_turno})`}
      </span>,
      <StatusBadge key={`status-${ficha.id}`} status={ficha.estado} />,
      <span key={`esp-${ficha.id}`} className='text-gray-600'>
        {ficha.disponibilidades?.doctores_especialidades?.especialidades
          ?.nombre || '-'}
      </span>,
      <span key={`doc-${ficha.id}`} className='text-gray-600'>
        {`${ficha.disponibilidades?.doctores_especialidades?.doctores?.personas?.nombres || ''} ${ficha.disponibilidades?.doctores_especialidades?.doctores?.personas?.paterno || ''}`.trim() ||
          '-'}
      </span>
    ]) || []

  // ── Columnas de tratamientos ──
  const columnasTratamientos = [
    { campo: 'Vacuna' },
    { campo: 'Dosis' },
    { campo: 'Fecha Aplicación' },
    { campo: 'Observaciones' },
    { campo: 'Estado' }
  ]

  const contenidoTratamientos =
    paciente.tratamientos?.map((t: any) => [
      <span key={`vac-${t.id}`} className='flex items-center gap-1.5'>
        <IconVaccine className='text-primary-600 shrink-0' size='16' />
        <span>{t.esquema_dosis?.vacunas?.nombre || '-'}</span>
      </span>,
      <span key={`dos-${t.id}`} className='font-semibold text-primary-700'>
        Dosis #{t.esquema_dosis?.numero}
        {t.esquema_dosis?.notas && (
          <span className='block text-step--2 font-normal text-gray-500'>
            {t.esquema_dosis.notas}
          </span>
        )}
      </span>,
      <span key={`fecha-${t.id}`} className='text-gray-600'>
        {new Date(t.fecha_aplicacion).toLocaleDateString('es-BO', {
          timeZone: 'America/La_Paz',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
      </span>,
      <span
        key={`obs-${t.id}`}
        className='text-gray-500 text-step--2 truncate max-w-[200px]'
        title={t.observaciones || ''}
      >
        {t.observaciones || '-'}
      </span>,
      <EstadoTratamientoBadge key={`est-${t.id}`} estado={t.estado} />
    ]) || []

  return (
    <div className='flex flex-col gap-6 animate-fade-in pb-8'>
      <div className='flex items-center gap-2 mb-2'>
        <Link
          href='/dashboard/atencion/pacientes'
          className='text-primary-600 hover:text-primary-800 transition-colors font-semibold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M10 19l-7-7m0 0l7-7m-7 7h18'
            />
          </svg>
          Volver a Pacientes
        </Link>
      </div>

      {/* Card info paciente */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white'>
          <h2 className='text-2xl font-bold flex items-center gap-2'>
            👤 {paciente.personas.nombres} {paciente.personas.paterno}{' '}
            {paciente.personas.materno || ''}
          </h2>
          <p className='text-primary-100 mt-1 opacity-90'>
            Historial completo de atenciones y tratamientos.
          </p>
        </div>
        <div className='p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-gray-700'>
          <div className='flex items-start gap-3'>
            <div className='bg-gray-100 p-2 rounded-lg text-gray-500'>
              <IconCredential />
            </div>
            <div>
              <p className='text-xs text-gray-400 font-semibold uppercase'>
                Cédula de Identidad
              </p>
              <p className='font-medium text-base'>{paciente.paciente_id}</p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='bg-gray-100 p-2 rounded-lg text-gray-500'>📱</div>
            <div>
              <p className='text-xs text-gray-400 font-semibold uppercase'>
                Teléfono
              </p>
              <p className='font-medium text-base'>
                {paciente.personas.telefono || 'No registrado'}
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='bg-gray-100 p-2 rounded-lg text-gray-500'>
              <IconEmail />
            </div>
            <div>
              <p className='text-xs text-gray-400 font-semibold uppercase'>
                Correo
              </p>
              <p className='font-medium text-base'>
                {paciente.personas.correo || 'No registrado'}
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='bg-gray-100 p-2 rounded-lg text-gray-500'>📍</div>
            <div>
              <p className='text-xs text-gray-400 font-semibold uppercase'>
                Dirección
              </p>
              <p className='font-medium text-base'>
                {paciente.personas.direccion || 'No registrada'}
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='bg-gray-100 p-2 rounded-lg text-gray-500'>🚻</div>
            <div>
              <p className='text-xs text-gray-400 font-semibold uppercase'>
                Sexo
              </p>
              <p className='font-medium text-base'>
                {paciente.sexo === 'M'
                  ? 'Masculino'
                  : paciente.sexo === 'F'
                    ? 'Femenino'
                    : paciente.sexo === 'O'
                      ? 'Otro'
                      : 'No registrado'}
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='bg-gray-100 p-2 rounded-lg text-gray-500'>🩸</div>
            <div>
              <p className='text-xs text-gray-400 font-semibold uppercase'>
                Grupo Sanguíneo
              </p>
              <p className='font-medium text-base'>
                {paciente.grupo_sanguineo || 'No registrado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tratamientos del paciente */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
              <IconVaccine className='text-emerald-600' size='22' />
              Tratamientos (Vacunas)
            </h3>
            <p className='text-sm text-gray-500'>
              {paciente.tratamientos?.length || 0} tratamiento(s) registrado(s)
            </p>
          </div>
          <Link
            href={`/dashboard/tratamientos/${uuid}/crear`}
            className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold shadow-sm cursor-pointer flex items-center gap-2'
          >
            <IconVaccine size='18' />
            Registrar tratamiento
          </Link>
        </div>
        <CustomDataTable
          columnas={columnasTratamientos}
          contenidoTabla={contenidoTratamientos}
          numeracion={true}
          contenidoCuandoVacio='Este paciente aún no tiene tratamientos registrados.'
        />
      </div>

      {/* Fichas del paciente */}
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
        <CustomDataTable
          titulo='Fichas del Paciente'
          subtitulo={`Mostrando ${paciente.fichas?.length || 0} atenciones registradas`}
          columnas={columnasFichas}
          contenidoTabla={contenidoFichas}
          numeracion={true}
          contenidoCuandoVacio='Este paciente aún no tiene fichas registradas.'
        />
      </div>
    </div>
  )
}
