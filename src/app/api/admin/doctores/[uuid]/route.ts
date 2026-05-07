import { NextRequest, NextResponse } from 'next/server'
import AuthService from '@/lib/services/auth-service'
import prisma from '@/lib/prisma/prisma'
import { configDoctorSchema } from '@/app/dashboard/admin/doctores/schemas'

// ─── GET /api/admin/doctores/:uuid ───────────────────────────────────────────
// Retorna el detalle completo de un doctor con sus especialidades,
// disponibilidades, y las listas de especialidades activas y turnos del catálogo.
export async function GET(
  _req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/doctores/:uuid',
    'GET'
  )
  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: validation.error },
      { status: validation.status }
    )
  }

  try {
    const { uuid } = await params

    const doctor = await prisma.doctores.findUnique({
      where: { doctor_id: uuid, eliminado_en: null },
      include: {
        personas: {
          select: { ci: true, nombres: true, paterno: true, materno: true }
        },
        doctores_especialidades: {
          include: {
            especialidades: {
              select: { id: true, nombre: true, estado: true }
            },
            disponibilidades: {
              select: {
                id: true,
                turno_codigo: true,
                cupos: true,
                estado: true,
                observacion: true
              }
            }
          }
        }
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor no encontrado' },
        { status: 404 }
      )
    }

    // Especialidades activas para el select de nuevas asignaciones
    const especialidades = await prisma.especialidades.findMany({
      where: { eliminado_en: null, estado: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' }
    })

    // Turnos del catálogo
    const turnos = await prisma.turnos_catalogo.findMany({
      select: { codigo: true, nombre: true, hora_inicio: true, hora_fin: true },
      orderBy: { hora_inicio: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: doctor,
      especialidades,
      turnos
    })
  } catch (error) {
    console.error('Error al obtener doctor:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ─── PATCH /api/admin/doctores/:uuid ─────────────────────────────────────────
// Actualiza matrícula, sincroniza especialidades y disponibilidades.
// Las disponibilidades que ya no están se INACTIVAN (estado=false), NO se eliminan.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/doctores/:uuid',
    'PATCH'
  )
  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: validation.error },
      { status: validation.status }
    )
  }

  try {
    const { uuid } = await params
    const body = await req.json()

    // Validar body con Zod
    const parsed = configDoctorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { matricula, especialidades } = parsed.data

    // Verificar que el doctor existe
    const doctorExistente = await prisma.doctores.findUnique({
      where: { doctor_id: uuid, eliminado_en: null },
      include: {
        doctores_especialidades: {
          include: { disponibilidades: true }
        }
      }
    })

    if (!doctorExistente) {
      return NextResponse.json(
        { success: false, message: 'Doctor no encontrado' },
        { status: 404 }
      )
    }

    // Ejecutar en transacción
    const resultado = await prisma.$transaction(async tx => {
      // 1. Actualizar matrícula
      await tx.doctores.update({
        where: { doctor_id: uuid },
        data: {
          matricula: matricula || null,
          actualizado_en: new Date()
        }
      })

      // 2. IDs de especialidades que vienen en el body
      const especialidadesBodyIds = especialidades.map(e => e.especialidad_id)

      // 3. Para cada especialidad en el body: upsert doctores_especialidades + disponibilidades
      for (const esp of especialidades) {
        // Upsert la relación doctor-especialidad
        const docEsp = await tx.doctores_especialidades.upsert({
          where: {
            doctor_id_especialidad_id: {
              doctor_id: uuid,
              especialidad_id: esp.especialidad_id
            }
          },
          create: {
            doctor_id: uuid,
            especialidad_id: esp.especialidad_id
          },
          update: {} // Ya existe, no necesitamos actualizar nada de la relación
        })

        // IDs de turnos que vienen para esta especialidad
        const turnosBodyCodigos = esp.disponibilidades.map(d => d.turno_codigo)

        // Upsert cada disponibilidad
        for (const disp of esp.disponibilidades) {
          // Buscar si ya existe una disponibilidad para este turno
          const dispExistente = await tx.disponibilidades.findFirst({
            where: {
              doctor_especialidad_id: docEsp.id,
              turno_codigo: disp.turno_codigo
            }
          })

          if (dispExistente) {
            // Actualizar cupos y estado
            await tx.disponibilidades.update({
              where: { id: dispExistente.id },
              data: {
                cupos: disp.cupos,
                estado: disp.estado,
                actualizado_en: new Date()
              }
            })
          } else {
            // Crear nueva disponibilidad
            await tx.disponibilidades.create({
              data: {
                doctor_especialidad_id: docEsp.id,
                turno_codigo: disp.turno_codigo,
                cupos: disp.cupos,
                estado: disp.estado
              }
            })
          }
        }

        // Inactivar disponibilidades de esta especialidad que NO están en el body
        await tx.disponibilidades.updateMany({
          where: {
            doctor_especialidad_id: docEsp.id,
            turno_codigo: { notIn: turnosBodyCodigos },
            estado: true
          },
          data: {
            estado: false,
            actualizado_en: new Date()
          }
        })
      }

      // 4. Inactivar disponibilidades de especialidades que el doctor tenía pero ya NO están en el body
      const especialidadesActualesIds = doctorExistente.doctores_especialidades
        .filter(de => !especialidadesBodyIds.includes(de.especialidad_id))
        .map(de => de.id)

      if (especialidadesActualesIds.length > 0) {
        await tx.disponibilidades.updateMany({
          where: {
            doctor_especialidad_id: { in: especialidadesActualesIds },
            estado: true
          },
          data: {
            estado: false,
            actualizado_en: new Date()
          }
        })
      }

      return true
    })

    if (resultado) {
      return NextResponse.json({
        success: true,
        message: 'Configuración del doctor actualizada correctamente'
      })
    }

    return NextResponse.json(
      { success: false, message: 'Error al actualizar' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error al actualizar doctor:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
