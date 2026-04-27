// oxlint-disable prefer-default-export
// oxlint-disable func-style
// oxlint-disable no-magic-numbers
import prisma from '@/lib/prisma/prisma'
import { getRangoUTCBoliviaHoy, getTurnoActual } from '@/app/utils/date'
import { NextResponse } from 'next/server'
import { RECORD_TYPES } from '../../lib/constants'

/**
 * GET /api/fichas/publico
 * Endpoint PÚBLICO (sin autenticación) para la pantalla de atención.
 * Retorna fichas agrupadas por especialidad y doctor.
 * Solo datos NO sensibles: nombre doctor, especialidad, orden de turno.
 *
 * Estados usados:
 * - ATENDIENDO: el médico está con el paciente en el consultorio ahora
 * - EN_ESPERA: pacientes en sala de espera con médico asignado
 * - ADMISION: pacientes sin médico asignado (deben ir a Enfermería)
 */
export async function GET() {
  const { inicioUTC, finUTC } = getRangoUTCBoliviaHoy()
  const turno = await getTurnoActual()

  const selectDocEsp = {
    select: {
      doctores_especialidades: {
        select: {
          especialidad_id: true,
          especialidades: {
            select: { nombre: true }
          },
          doctores: {
            select: {
              personas: {
                select: {
                  nombres: true,
                  paterno: true,
                  materno: true
                }
              }
            }
          }
        }
      }
    }
  }

  const baseWhere = {
    turno_codigo: turno,
    fecha_ficha: { gte: inicioUTC, lte: finUTC },
    // disponibilidades: { turno_codigo: turno },
    eliminado_en: null
  }

  try {
    // 1. Fichas ATENDIENDO: el médico está atendiendo al paciente ahora
    const fichasAtendiendo = await prisma.fichas.findMany({
      where: { ...baseWhere, estado: 'ATENDIENDO' },
      orderBy: [{ orden_turno: 'asc' }, { fecha_ficha: 'asc' }],
      select: {
        orden_turno: true,
        disponibilidades: selectDocEsp
      }
    })

    // 2. Fichas EN_ESPERA: pacientes en sala de espera con médico asignado
    const fichasEnEspera = await prisma.fichas.findMany({
      where: { ...baseWhere, estado: 'EN_ESPERA' },
      orderBy: [{ orden_turno: 'asc' }, { fecha_ficha: 'asc' }],
      select: {
        orden_turno: true,
        disponibilidades: selectDocEsp
      }
    })

    const fichas = await prisma.fichas.findMany({
      where: {
        fecha_ficha: { gte: inicioUTC, lte: finUTC },
        eliminado_en: null
      },
      orderBy: [{ orden_turno: 'asc' }, { fecha_ficha: 'asc' }],
      select: {
        orden_turno: true,
        estado: true,
        fecha_ficha: true,
        disponibilidades: {
          select: {
            turnos_catalogo: {
              select: {
                hora_inicio: true,
                hora_fin: true,
                codigo: true
              }
            }
          }
        }
      }
    })

    console.log('Fichas: ', fichas)

    // 3. Fichas ADMISION y ENFERMERIA: sin médico asignado aún (deben ir a Enfermería o están en triage)
    const fichasEnfermeriaBase = await prisma.fichas.findMany({
      where: {
        ...baseWhere,
        estado: { in: [RECORD_TYPES.ADMISION, RECORD_TYPES.ENFERMERIA] }
      },
      orderBy: [{ orden_turno: 'asc' }, { fecha_ficha: 'asc' }],
      select: { orden_turno: true, estado: true }
    })

    console.log(
      '--------------------------------------------------------------------------'
    )
    console.log(turno)
    console.log(inicioUTC, finUTC)

    console.log('fichasEnfermeriaBase', fichasEnfermeriaBase)

    // Agrupar EN_ESPERA por especialidad + doctor
    const agrupado = new Map<
      string,
      {
        especialidad_nombre: string
        doctor_nombre: string
        atendiendo: number | null
        cola_espera: number[]
      }
    >()

    // Primero, registrar quién está atendiendo para cada grupo
    for (const ficha of fichasAtendiendo) {
      const docEsp = ficha.disponibilidades?.doctores_especialidades
      const espNombre = docEsp?.especialidades?.nombre
      const docPersona = docEsp?.doctores?.personas
      const docNombre =
        `${docPersona?.nombres} ${docPersona?.paterno} ${docPersona?.materno}`.trim()
      const key = `${docEsp?.especialidad_id}-${docNombre}`

      if (!agrupado.has(key)) {
        agrupado.set(key, {
          especialidad_nombre: espNombre ?? 'Sin asignar',
          doctor_nombre: docNombre ?? 'Sin asignar',
          atendiendo: null,
          cola_espera: []
        })
      }
      // Solo el primero que está atendiendo (debería ser máximo 1 por médico)
      const grupo = agrupado.get(key)!
      if (grupo.atendiendo === null) {
        grupo.atendiendo = ficha.orden_turno ?? 0
      }
    }

    // Luego, agregar la cola en espera
    for (const ficha of fichasEnEspera) {
      const docEsp = ficha.disponibilidades?.doctores_especialidades
      const espNombre = docEsp?.especialidades?.nombre
      const docPersona = docEsp?.doctores?.personas
      const docNombre =
        `${docPersona?.nombres} ${docPersona?.paterno} ${docPersona?.materno}`.trim()
      const key = `${docEsp?.especialidad_id}-${docNombre}`

      if (!agrupado.has(key)) {
        agrupado.set(key, {
          especialidad_nombre: espNombre ?? 'Sin asignar',
          doctor_nombre: docNombre ?? 'Sin asignar',
          atendiendo: null,
          cola_espera: []
        })
      }
      agrupado.get(key)!.cola_espera.push(ficha.orden_turno ?? 0)
    }

    // Construir respuesta
    const especialidades = Array.from(agrupado.values()).map(grupo => ({
      especialidad_nombre: grupo.especialidad_nombre,
      doctor_nombre: grupo.doctor_nombre,
      atendiendo: grupo.atendiendo,
      siguiente: grupo.cola_espera[0] ?? null,
      fichas_pendientes: grupo.cola_espera,
      total_pendientes: grupo.cola_espera.length
    }))

    // Ordenar por nombre de especialidad
    especialidades.sort((a, b) =>
      a.especialidad_nombre.localeCompare(b.especialidad_nombre)
    )

    const fechaBolivia = new Date().toLocaleDateString('es-BO', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return NextResponse.json({
      success: true,
      data: {
        turno,
        fecha: fechaBolivia,
        especialidades,
        // Fichas sin médico asignado o en triage (presentarse a Enfermería)
        fichas_en_admision: fichasEnfermeriaBase
          .filter(f => (f.orden_turno ?? 0) > 0) // solo presenciales (positivos)
          .map(f => ({
            turno: f.orden_turno ?? 0,
            estado: f.estado
          })),
        total_en_admision: fichasEnfermeriaBase.length
      }
    })
  } catch (error) {
    console.error('Error en fichas públicas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}
