// oxlint-disable consistent-type-imports
// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import { tratamientoBatchCreateSchema } from '@/app/dashboard/tratamientos/schemas'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
// import { Roles } from '@/app/api/lib/constants'
import { StateTreatment } from '@/lib/constants'

/**
 * POST /api/tratamientos/batch
 * Registra N tratamientos + citas opcionales en UNA sola transacción.
 * Si algo falla, se hace rollback completo.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/tratamientos',
    'POST'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { id: userId = '' } = validation.data || {}

  try {
    const body = await request.json()

    // Validar datos de entrada
    const validationResult = tratamientoBatchCreateSchema.safeParse(body)
    if (!validationResult.success) {
      const treeified = z.treeifyError(validationResult.error)
      const errors = treeified.properties || {}
      return NextResponse.json(
        {
          success: false,
          message: 'Error de validación',
          errors
        },
        { status: 400 }
      )
    }

    const validData = validationResult.data

    // ══════════════════════════════════════════════════════════════════════
    // TRANSACCIÓN: todo o nada
    // ══════════════════════════════════════════════════════════════════════
    const result = await prisma.$transaction(async tx => {
      // 1. Buscar la ficha origen
      const ficha = await tx.fichas.findUnique({
        where: { id: validData.fichaOrigenId },
        include: {
          pacientes: {
            include: { personas: true }
          },
          disponibilidades: {
            select: {
              doctores_especialidades: {
                select: { doctor_id: true }
              }
            }
          }
        }
      })

      if (!ficha) {
        throw new Error('FICHA_NOT_FOUND')
      }

      const pacienteCi = ficha.pacientes.paciente_id
      const persona = ficha.pacientes.personas
      const doctorId =
        ficha.disponibilidades?.doctores_especialidades?.doctor_id

      // 2. Verificar/crear usuario del paciente
      let usuarioCreado = false
      const usuarioExistente = await tx.usuarios.findFirst({
        where: { persona_ci: pacienteCi }
      })

      if (!usuarioExistente) {
        console.log(`[BATCH] Creando usuario para paciente CI: ${pacienteCi}`)

        const passwordHash = await bcrypt.hash(pacienteCi, 10)

        const rolPaciente = await tx.roles.findUnique({
          where: { nombre: 'PACIENTE' }
        })

        if (!rolPaciente) {
          throw new Error('ROL_PACIENTE_NOT_FOUND')
        }

        const nuevoUsuario = await tx.usuarios.create({
          data: {
            persona_ci: pacienteCi,
            username: pacienteCi,
            password_hash: passwordHash,
            activo: true,
            creado_por: userId
          }
        })

        await tx.usuarios_roles.create({
          data: {
            usuario_id: nuevoUsuario.usuario_id,
            rol_id: rolPaciente.id,
            desde: new Date()
          }
        })

        usuarioCreado = true
        console.log(
          `[BATCH] Usuario creado: ${pacienteCi} para ${persona.nombres} ${persona.paterno}`
        )
      }

      // 3. Procesar cada tratamiento
      const tratamientosCreados = []
      let citasCreadas = 0

      for (const item of validData.tratamientos) {
        // 3.1 Verificar esquema de dosis
        const esquemaDosis = await tx.esquema_dosis.findUnique({
          where: { id: item.esquemaId },
          include: {
            vacunas: { select: { nombre: true, id: true } }
          }
        })

        if (!esquemaDosis) {
          throw new Error(`ESQUEMA_NOT_FOUND:${item.esquemaId}`)
        }

        // 3.2 Lógica de estado del tratamiento
        const esquemaActual = await tx.esquema_dosis.findUnique({
          where: { id: item.esquemaId },
          select: { vacuna_id: true, numero: true }
        })

        const todosEsquemasVacuna = await tx.esquema_dosis.findMany({
          where: { vacuna_id: esquemaActual!.vacuna_id },
          orderBy: { numero: 'asc' },
          select: { id: true, numero: true }
        })

        const totalDosis = todosEsquemasVacuna.length
        const esUltimaDosis = esquemaActual!.numero === totalDosis

        // Buscar tratamientos anteriores de esta vacuna para este paciente
        const tratamientosAnteriores = await tx.tratamientos.findMany({
          where: {
            eliminado_en: null,
            ficha_origen: { paciente_id: pacienteCi },
            esquema_dosis: { vacuna_id: esquemaActual!.vacuna_id }
          },
          include: {
            esquema_dosis: { select: { numero: true } }
          },
          orderBy: { fecha_aplicacion: 'asc' }
        })

        // Caso REINICIO
        const dosisYaAplicada = tratamientosAnteriores.some(
          t => t.esquema_dosis.numero === esquemaActual!.numero
        )

        let estadoNuevoTratamiento: string

        if (dosisYaAplicada) {
          const ultimoEnCurso = tratamientosAnteriores
            .filter(t => t.estado === StateTreatment.EN_CURSO)
            .at(-1)

          if (ultimoEnCurso) {
            await tx.tratamientos.update({
              where: { id: ultimoEnCurso.id },
              data: {
                estado: 'INCOMPLETA',
                actualizado_por: userId,
                actualizado_en: new Date()
              }
            })
          }

          estadoNuevoTratamiento = StateTreatment.EN_CURSO
        } else if (esUltimaDosis) {
          const numerosAplicados = new Set(
            tratamientosAnteriores
              .filter(t => t.estado === StateTreatment.EN_CURSO)
              .map(t => t.esquema_dosis.numero)
          )

          const todasLasAnterioresAplicadas = todosEsquemasVacuna
            .filter(e => e.numero < esquemaActual!.numero)
            .every(e => numerosAplicados.has(e.numero))

          estadoNuevoTratamiento = todasLasAnterioresAplicadas
            ? StateTreatment.COMPLETADA
            : StateTreatment.EN_CURSO
        } else {
          estadoNuevoTratamiento = StateTreatment.EN_CURSO
        }

        // 3.3 Crear el tratamiento
        const tratamiento = await tx.tratamientos.create({
          data: {
            ficha_origen_id: validData.fichaOrigenId,
            esquema_id: item.esquemaId,
            estado: estadoNuevoTratamiento,
            fecha_aplicacion: new Date(),
            creado_por: userId
          }
        })

        // 3.4 Crear cita si fue incluida
        if (item.cita && doctorId) {
          await tx.citas.create({
            data: {
              paciente_id: pacienteCi,
              doctor_id: doctorId,
              tratamiento_id: tratamiento.id,
              fecha_programada: new Date(item.cita.fechaProgramada),
              tipo: item.cita.tipo,
              estado: 'PENDIENTE',
              observaciones: item.cita.observaciones || null,
              creado_por: userId
            }
          })
          citasCreadas++
          console.log(
            `[BATCH] Cita creada para ${pacienteCi} — ${item.cita.tipo} el ${item.cita.fechaProgramada}`
          )
        }

        tratamientosCreados.push({
          id: tratamiento.id,
          vacuna: esquemaDosis.vacunas.nombre,
          dosis: item.dosisNumero,
          estado: estadoNuevoTratamiento
        })
      }

      // 4. Marcar la ficha como ATENDIDA
      await tx.fichas.update({
        where: { id: validData.fichaOrigenId },
        data: {
          estado: 'ATENDIDA',
          actualizado_por: userId
        }
      })

      return {
        tratamientosCreados,
        citasCreadas,
        usuarioCreado,
        paciente: `${persona.nombres} ${persona.paterno} ${persona.materno}`
      }
    })

    // ══════════════════════════════════════════════════════════════════════

    const nombresVacunas = result.tratamientosCreados
      .map(t => `${t.vacuna} (D${t.dosis})`)
      .join(', ')

    return NextResponse.json(
      {
        success: true,
        message: `${result.tratamientosCreados.length} tratamiento(s) registrado(s): ${nombresVacunas}${result.citasCreadas > 0 ? ` · ${result.citasCreadas} cita(s) programada(s)` : ''}`,
        data: {
          tratamientos: result.tratamientosCreados,
          citas_creadas: result.citasCreadas,
          usuario_creado: result.usuarioCreado,
          paciente: result.paciente
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[BATCH] Error creating tratamientos:', error)

    // Errores controlados
    if (error.message === 'FICHA_NOT_FOUND') {
      return NextResponse.json(
        { success: false, message: 'Ficha no encontrada' },
        { status: 404 }
      )
    }
    if (error.message === 'ROL_PACIENTE_NOT_FOUND') {
      return NextResponse.json(
        {
          success: false,
          message: 'Rol PACIENTE no encontrado en el sistema'
        },
        { status: 500 }
      )
    }
    if (error.message?.startsWith('ESQUEMA_NOT_FOUND')) {
      return NextResponse.json(
        { success: false, message: 'Esquema de dosis no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
