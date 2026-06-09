import prisma from '@/lib/prisma/prisma'
import { DoctoresService } from '@/services/doctores'
import CrearConsultaForm from './crear-consulta-form'

type Params = Promise<{ fichaId: string }>
type SearchParams = Promise<{ consultaPadreId?: string }>

export default async function Page({
  params,
  searchParams
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { fichaId } = await params
  const { consultaPadreId } = await searchParams

  // Fetch datos básicos de la ficha para mostrar contexto
  const ficha = await prisma.fichas.findUnique({
    where: { id: fichaId },
    select: {
      id: true,
      orden_turno: true,
      estado: true,
      pacientes: {
        select: {
          paciente_id: true,
          personas: {
            select: {
              nombres: true,
              paterno: true,
              materno: true,
              ci: true
            }
          }
        }
      },
      disponibilidades: {
        select: {
          turno_codigo: true,
          doctores_especialidades: {
            select: {
              doctor_id: true,
              especialidad_id: true,
              especialidades: {
                select: { nombre: true }
              }
            }
          }
        }
      }
    }
  })

  if (!ficha) {
    return (
      <main className='font-secondary p-4'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
          <h2 className='text-step-2 font-bold text-red-700'>
            Ficha no encontrada
          </h2>
          <p className='text-red-600 mt-2'>
            La ficha solicitada no fue encontrada.
          </p>
        </div>
      </main>
    )
  }

  const pacienteNombre =
    `${ficha.pacientes.personas.nombres} ${ficha.pacientes.personas.paterno} ${ficha.pacientes.personas.materno || ''}`.trim()
  const especialidadNombre =
    ficha.disponibilidades?.doctores_especialidades?.especialidades?.nombre

  // ID del doctor y especialidad actuales de la ficha (pueden ser Doctor 2 si hubo reasignación)
  const doctorDefaultId =
    ficha.disponibilidades?.doctores_especialidades?.doctor_id
  const turnoDefaultCodigo = ficha.disponibilidades?.turno_codigo
  const especialidadId =
    ficha.disponibilidades?.doctores_especialidades?.especialidad_id

  // Obtener todos los doctores de esa especialidad con sus turnos activos
  // para poblar el selector de doctor en la cita de retorno
  const doctoresDisponibles = especialidadId
    ? await DoctoresService.getDoctoresConTurnosPorEspecialidad(especialidadId)
    : []

  const doctorDefaultNombre = doctoresDisponibles.find(
    d => d.id === doctorDefaultId
  )?.nombre

  let motivoPadre = undefined
  if (consultaPadreId) {
    const consultaPadre = await prisma.consultas.findUnique({
      where: { id: consultaPadreId },
      select: { motivo_consulta: true }
    })
    if (consultaPadre) {
      motivoPadre = consultaPadre.motivo_consulta
    }
  }

  return (
    <main className='font-secondary'>
      <CrearConsultaForm
        fichaId={fichaId}
        pacienteNombre={pacienteNombre}
        pacienteCi={ficha.pacientes.personas.ci}
        especialidadNombre={especialidadNombre ?? 'Consultorio general'}
        ordenTurno={ficha.orden_turno}
        consultaPadreId={consultaPadreId}
        motivoPadre={motivoPadre}
        doctorDefaultId={doctorDefaultId}
        doctorDefaultNombre={doctorDefaultNombre}
        turnoDefaultCodigo={turnoDefaultCodigo}
        doctoresDisponibles={doctoresDisponibles}
      />
    </main>
  )
}
