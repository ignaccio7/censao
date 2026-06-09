import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import { ConsultasService } from '@/services/consultas'
import { DoctoresService } from '@/services/doctores'
import Link from 'next/link'
import {
  IconChevronLeft,
  IconCheckupList,
  IconCalendar,
  IconHistory,
  IconFileCheck
} from '@/app/components/icons/icons'
import AccionesConsulta from '@/app/dashboard/consultas/components/accionesConsulta'
import CitasTable from '@/app/dashboard/consultas/components/citasTable'

export default async function DetalleConsultaPacientePage({
  params
}: {
  params: Promise<{ pacienteCi: string; consultaId: string }>
}) {
  const { pacienteCi: rawPacienteCi, consultaId } = await params
  const pacienteCi = decodeURIComponent(rawPacienteCi)

  const validation = await AuthService.validateApiPermission(
    '/api/consultas',
    'GET'
  )
  if (!validation.success) {
    redirect('/dashboard')
  }

  const consulta = await ConsultasService.getConsultaDetalle(consultaId)

  if (!consulta) {
    return (
      <div className='p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100'>
        <h3 className='text-xl font-bold mb-2'>Consulta no encontrada</h3>
        <Link
          href={`/dashboard/consultas/paciente/${pacienteCi}`}
          className='mt-4 inline-block px-4 py-2 bg-gray-800 text-white rounded-lg'
        >
          Volver
        </Link>
      </div>
    )
  }

  const esSeguimiento = !!consulta.consulta_padre_id

  // Extraer doctor y especialidad de la ficha origen para el selector de cita
  const doctorDefaultId =
    consulta.ficha_origen?.disponibilidades?.doctores_especialidades?.doctores
      ?.doctor_id
  const especialidadId =
    consulta.ficha_origen?.disponibilidades?.doctores_especialidades
      ?.especialidad_id
  const turnoDefaultCodigo =
    consulta.ficha_origen?.disponibilidades?.turno_codigo

  // Obtener doctores de esa especialidad con sus turnos activos
  const doctoresDisponibles = especialidadId
    ? await DoctoresService.getDoctoresConTurnosPorEspecialidad(especialidadId)
    : []

  const doctorDefaultNombre = doctoresDisponibles.find(
    d => d.id === doctorDefaultId
  )?.nombre

  const estadoBadge =
    consulta.estado_calculado === 'ACTIVA' ? (
      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border bg-emerald-500/20 border-emerald-400 text-emerald-100'>
        <IconCheckupList size='14' /> ACTIVA
      </span>
    ) : (
      <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border bg-white/10 border-white/20 text-white/80'>
        <IconFileCheck size='14' /> CERRADA
      </span>
    )

  // Sacar fichaId desde la consulta para usar en acciones que lo requieran
  const fichaId = consulta.ficha_origen?.id

  return (
    <main className='pb-8 animate-fade-in space-y-6'>
      <div className='flex items-center gap-2'>
        {esSeguimiento && consulta.consulta_padre ? (
          <Link
            href={`/dashboard/consultas/paciente/${pacienteCi}/consulta/${consulta.consulta_padre.id}`}
            className='text-primary-600 hover:text-primary-800 transition-colors font-semibold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100 w-fit text-sm'
          >
            <IconChevronLeft size='18' />
            Volver a consulta padre
          </Link>
        ) : (
          <Link
            href={`/dashboard/consultas/paciente/${pacienteCi}`}
            className='text-primary-600 hover:text-primary-800 transition-colors font-semibold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100 w-fit text-sm'
          >
            <IconChevronLeft size='18' />
            Volver al Resumen Clínico
          </Link>
        )}
      </div>

      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
        <div
          className={`p-5 text-white ${esSeguimiento ? 'bg-linear-to-r from-secondary-600 to-secondary-700' : 'bg-linear-to-r from-sky-600 to-sky-800'}`}
        >
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3'>
            <div>
              <p className='text-step-0 font-semibold uppercase tracking-wide opacity-80 mb-1'>
                {esSeguimiento
                  ? 'SEGUIMIENTO DE: ' +
                    consulta.consulta_padre?.motivo_consulta
                  : 'CONSULTA RAÍZ'}
              </p>
              <h1 className='text-step-1 font-bold flex items-center gap-2'>
                <IconCheckupList size='24' />
                {consulta.motivo_consulta}
              </h1>
              <p className='text-step-1 mt-1 opacity-80'>
                {consulta.especialidad ?? 'General'} · Registrada el{' '}
                {consulta.fecha_formateada}
              </p>
            </div>
            {estadoBadge}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100'>
          <div className='lg:col-span-2 p-5 space-y-4 text-step-1'>
            <div className='flex flex-col gap-2'>
              <p className='text-step-1 text-gray-400 font-semibold uppercase mb-1'>
                Paciente
              </p>
              <p className='font-semibold text-gray-800 text-step-1'>
                {consulta.paciente_nombre}
              </p>
              <p className='text-gray-500'>CI: {consulta.paciente_ci}</p>
            </div>
            <div>
              <p className='text-step-1 text-gray-400 font-semibold uppercase mb-1'>
                Observaciones
              </p>
              <p className='text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px]'>
                {consulta.observaciones || 'Sin observaciones registradas.'}
              </p>
            </div>
            {esSeguimiento && (
              <div className='flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800'>
                <span className='text-lg leading-none'>⚠️</span>
                <span>
                  Este seguimiento no puede tener sub-seguimientos. Si el
                  paciente requiere otra consulta, vuelve a la{' '}
                  <strong>consulta padre</strong> y registra un nuevo
                  seguimiento.
                </span>
              </div>
            )}
          </div>

          <div className='p-5'>
            <AccionesConsulta
              fichaId={fichaId}
              consultaId={consulta.id}
              motivo={consulta.motivo_consulta}
              pacienteCi={consulta.paciente_ci}
              doctorId={doctorDefaultId}
              estadoFicha={consulta.ficha_origen.estado}
              esSeguimiento={esSeguimiento}
              esAbsorbida={consulta.es_absorbida}
              isFromPatientePath={true}
              doctorDefaultNombre={doctorDefaultNombre}
              turnoDefaultCodigo={turnoDefaultCodigo}
              doctoresDisponibles={doctoresDisponibles}
            />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
            <IconCalendar className='text-sky-600' size='22' />
            Citas de esta {esSeguimiento ? 'Seguimiento' : 'Consulta'}
          </h2>
          <span className='bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-sm font-bold'>
            {consulta.citas.length} en total
          </span>
        </div>
        <CitasTable citas={consulta.citas} />
      </div>

      {!esSeguimiento && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
              <IconHistory className='text-primary-600' size='22' />
              Seguimientos Registrados
            </h2>
            <span className='bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 rounded-full text-sm font-bold'>
              {consulta.seguimientos.length} en total
            </span>
          </div>

          {consulta.seguimientos.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500'>
              <p>No se han registrado seguimientos para esta consulta.</p>
            </div>
          ) : (
            consulta.seguimientos.map((seg: any, idx: number) => {
              const segActiva = seg.estado_calculado === 'ACTIVA'
              return (
                <div
                  key={seg.id}
                  className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
                >
                  {/* Encabezado del seguimiento */}
                  <div
                    className={`px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${segActiva ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-gray-50 border-b border-gray-100'}`}
                  >
                    <div>
                      <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                        Seguimiento #{idx + 1}
                      </p>
                      <p className='font-bold text-gray-800 text-sm'>
                        {seg.motivo_consulta}
                      </p>
                      <p className='text-xs text-gray-500 mt-0.5'>
                        Fecha creación: {seg.fecha_formateada}
                      </p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                          segActiva
                            ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                            : 'border-gray-300 bg-gray-100 text-gray-600'
                        }`}
                      >
                        {segActiva ? (
                          <>
                            <IconCheckupList size='14' /> Activa
                          </>
                        ) : (
                          <>
                            <IconFileCheck size='14' /> Cerrada
                          </>
                        )}
                      </span>
                      <Link
                        href={`/dashboard/consultas/paciente/${pacienteCi}/consulta/${seg.id}`}
                        className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors text-xs font-semibold rounded-lg whitespace-nowrap'
                      >
                        <IconHistory size='14' />
                        Ver Detalle
                      </Link>
                    </div>
                  </div>

                  {/* Citas del seguimiento */}
                  <div className='p-5'>
                    <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1'>
                      <IconCalendar size='14' />
                      Citas de este seguimiento ({seg.citas.length})
                    </p>
                    {seg.citas.length === 0 ? (
                      <p className='text-sm text-gray-400 italic'>
                        Sin citas programadas para este seguimiento.
                      </p>
                    ) : (
                      <CitasTable citas={seg.citas} />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </main>
  )
}
