import { RoleGroups, Roles } from '@/app/api/lib/constants'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  nombres: z.string().min(2).max(100),
  paterno: z.string().max(50).optional().or(z.literal('')),
  materno: z.string().max(50).optional().or(z.literal('')),
  correo: z.string().email().max(255),
  telefono: z.string().max(20).optional().or(z.literal('')),
  direccion: z.string().max(255).optional().or(z.literal('')),
  password: z.string().min(8).optional().or(z.literal('')),
  rol_id: z.string().uuid(),
  matricula: z.string().optional().or(z.literal('')),
  fecha_nacimiento: z.string().optional().or(z.literal('')),
  sexo: z.enum(['M', 'F', 'O']).optional().or(z.literal('')),
  grupo_sanguineo: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal(''))
})

// ─── PATCH ────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/usuarios/:uuid',
    'PATCH'
  )
  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 403 }
    )
  }

  const idUser = validation.data?.id
  console.log(idUser)
  console.log(params.uuid)

  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    console.log(body)
    console.log(parsed)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 422 }
      )
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { usuario_id: params.uuid, eliminado_en: null },
      include: {
        usuarios_roles: {
          where: { eliminado_en: null },
          include: { roles: true }
        }
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { success: false, message: 'No encontrado' },
        { status: 404 }
      )
    }

    const {
      nombres,
      paterno,
      materno,
      correo,
      telefono,
      direccion,
      password,
      rol_id,
      matricula,
      fecha_nacimiento,
      sexo,
      grupo_sanguineo
    } = parsed.data

    const ci = usuario.persona_ci
    const rolActualId = usuario.usuarios_roles[0]?.rol_id

    console.log(usuario)

    await prisma.$transaction(async tx => {
      // 1. Actualizar persona
      await tx.personas.update({
        where: { ci },
        data: {
          nombres,
          paterno: paterno || null,
          materno: materno || null,
          correo,
          telefono: telefono || null,
          direccion: direccion || null,
          actualizado_por: idUser
        }
      })

      // 2. Actualizar password solo si se envió
      if (password && password.trim() !== '') {
        const password_hash = await bcrypt.hash(password, 12)
        await tx.usuarios.update({
          where: { usuario_id: params.uuid },
          data: { password_hash, actualizado_por: idUser }
        })
      }

      // 3. Cambiar rol si es diferente
      // → soft delete del rol anterior + insert del nuevo
      // → NO se borran registros de doctores/pacientes
      if (rolActualId && rolActualId !== rol_id) {
        await tx.usuarios_roles.update({
          where: {
            usuario_id_rol_id: { usuario_id: params.uuid, rol_id: rolActualId }
          },
          data: { eliminado_en: new Date(), eliminado_por: idUser }
        })
        await tx.usuarios_roles.create({
          data: { usuario_id: params.uuid, rol_id, creado_por: idUser }
        })
      }

      // 4. Verificar qué rol nuevo tiene para actualizar datos extra
      const rolNuevo = await tx.roles.findUnique({ where: { id: rol_id } })
      const rolNombreNuevo = rolNuevo?.nombre

      // 5. Datos de doctor — actualizar si ya existe, crear si no existe
      // if (rolNombreNuevo.includes('DOCTOR') && matricula) {
      if (RoleGroups.DOCTOR.includes(rolNombreNuevo as any) && matricula) {
        await tx.doctores.upsert({
          where: { doctor_id: ci },
          update: { matricula, actualizado_por: idUser },
          create: { doctor_id: ci, matricula, creado_por: idUser }
        })
      }

      // 6. Datos de paciente — upsert igual
      if (rolNombreNuevo === Roles.PACIENTE) {
        await tx.pacientes.upsert({
          where: { paciente_id: ci },
          update: {
            fecha_nacimiento: fecha_nacimiento
              ? new Date(fecha_nacimiento)
              : null,
            sexo: sexo || null,
            grupo_sanguineo: grupo_sanguineo || null,
            actualizado_por: idUser
          },
          create: {
            paciente_id: ci,
            fecha_nacimiento: fecha_nacimiento
              ? new Date(fecha_nacimiento)
              : null,
            sexo: sexo || null,
            grupo_sanguineo: grupo_sanguineo || null,
            creado_por: idUser
          }
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado correctamente'
    })
  } catch (error: any) {
    console.error('[PATCH /api/admin/usuarios/:uuid]', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Ya existe un registro con ese dato' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
