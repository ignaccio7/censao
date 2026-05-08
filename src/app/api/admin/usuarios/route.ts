// src/app/api/admin/usuarios/route.ts
// import { RECORD_TYPES } from '@/app/api/lib/constants'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RoleGroups } from '../../lib/constants'

// ─── Schema de validación para crear usuario ──────────────────────────────────
const createUsuarioSchema = z.object({
  // Persona
  ci: z
    .string()
    .min(5, 'La cédula debe tener al menos 5 caracteres')
    .max(20)
    .regex(/^\d+$/, 'La cédula solo debe contener números'),
  nombres: z.string().min(2).max(100),
  paterno: z.string().max(50).optional().or(z.literal('')),
  materno: z.string().max(50).optional().or(z.literal('')),
  correo: z.string().email().max(255),
  telefono: z.string().max(20).optional().or(z.literal('')),
  direccion: z.string().max(255).optional().or(z.literal('')),
  // Credenciales
  username: z
    .string()
    .min(4)
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(8).max(100),
  // Rol
  rol_id: z.string().uuid('El rol_id debe ser un UUID válido'),
  // Campos condicionales según rol
  matricula: z.string().optional().or(z.literal('')),
  fecha_nacimiento: z.string().optional().or(z.literal('')),
  sexo: z.enum(['M', 'F', 'O']).optional().or(z.literal('')),
  grupo_sanguineo: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal(''))
})

// ─── GET /api/admin/usuarios ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/usuarios',
    'GET'
  )

  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const page = Number(searchParams.get('page') ?? '1')
    const numberPerPage = Number(searchParams.get('limit') ?? '10')
    const skip = (page - 1) * numberPerPage

    const whereClause = search
      ? {
          OR: [
            {
              personas: {
                nombres: { contains: search, mode: 'insensitive' as const }
              }
            },
            {
              personas: {
                paterno: { contains: search, mode: 'insensitive' as const }
              }
            },
            { username: { contains: search, mode: 'insensitive' as const } },
            { persona_ci: { contains: search, mode: 'insensitive' as const } }
          ],
          eliminado_en: null
        }
      : { eliminado_en: null }

    const [usuarios, total] = await Promise.all([
      prisma.usuarios.findMany({
        where: whereClause,
        skip,
        take: numberPerPage,
        include: {
          personas: true,
          usuarios_roles: {
            where: { eliminado_en: null },
            include: { roles: true }
          }
        },
        orderBy: { creado_en: 'desc' }
      }),
      prisma.usuarios.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: usuarios,
      meta: {
        total,
        page,
        numberPerPage,
        totalPages: Math.ceil(total / numberPerPage)
      }
    })
  } catch (error) {
    console.error('[GET /api/admin/usuarios]', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ─── POST /api/admin/usuarios ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/usuarios',
    'POST'
  )

  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 403 }
    )
  }

  const idUser = validation.data?.id

  try {
    const body = await req.json()
    const parsed = createUsuarioSchema.safeParse(body)

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

    const {
      ci,
      nombres,
      paterno,
      materno,
      correo,
      telefono,
      direccion,
      username,
      password,
      rol_id,
      matricula,
      fecha_nacimiento,
      sexo,
      grupo_sanguineo
    } = parsed.data

    // Verificar que el rol existe
    const rol = await prisma.roles.findUnique({
      where: { id: rol_id, eliminado_en: null }
    })

    if (!rol) {
      return NextResponse.json(
        { success: false, message: 'El rol seleccionado no existe' },
        { status: 404 }
      )
    }

    // Verificar unicidad de CI y username
    const [personaExistente, usernameExistente] = await Promise.all([
      prisma.personas.findUnique({ where: { ci } }),
      prisma.usuarios.findUnique({ where: { username } })
    ])

    if (personaExistente) {
      console.log('Ya existe persona')
      return NextResponse.json(
        {
          success: false,
          message: 'Ya existe una persona con esa cédula de identidad'
        },
        { status: 409 }
      )
    }

    if (usernameExistente) {
      console.log('Ya existe usuario')
      return NextResponse.json(
        { success: false, message: 'El nombre de usuario ya está en uso' },
        { status: 409 }
      )
    }

    // Hash de contraseña
    const password_hash = await bcrypt.hash(password, 12)

    // Determinar tipo de rol para crear registros adicionales
    const rolNombre = rol.nombre

    // Transacción: crear todo en cadena
    const resultado = await prisma.$transaction(async tx => {
      // 1. Crear persona
      const persona = await tx.personas.create({
        data: {
          ci,
          nombres,
          paterno: paterno || null,
          materno: materno || null,
          correo,
          telefono: telefono || null,
          direccion: direccion || null,
          creado_por: idUser ?? 'sistema'
        }
      })
      // TODO ver esto flujo usuarios
      console.log(persona)

      // 2. Crear usuario
      const usuario = await tx.usuarios.create({
        data: {
          persona_ci: ci,
          username,
          password_hash,
          activo: true,
          creado_por: idUser ?? 'sistema'
        }
      })

      // 3. Asignar rol
      await tx.usuarios_roles.create({
        data: {
          usuario_id: usuario.usuario_id,
          rol_id,
          creado_por: idUser ?? 'sistema'
        }
      })

      // 4. Crear doctor si aplica
      if (RoleGroups.DOCTOR.includes(rolNombre as any)) {
        await tx.doctores.create({
          data: {
            doctor_id: ci,
            matricula: matricula || null,
            creado_por: idUser ?? 'sistema'
          }
        })
      }

      // 5. Crear paciente si aplica
      if (RoleGroups.PACIENTE.includes(rolNombre as any)) {
        await tx.pacientes.create({
          data: {
            paciente_id: ci,
            fecha_nacimiento: fecha_nacimiento
              ? new Date(fecha_nacimiento)
              : null,
            sexo: sexo || null,
            grupo_sanguineo: grupo_sanguineo || null,
            creado_por: idUser ?? 'sistema'
          }
        })
      }

      return usuario
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario creado exitosamente',
        data: { usuario_id: resultado.usuario_id, username: resultado.username }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[POST /api/admin/usuarios]', error)

    // Error de constraint único de Prisma
    if (error?.code === 'P2002') {
      const campo = error?.meta?.target?.[0] ?? 'campo'
      return NextResponse.json(
        { success: false, message: `Ya existe un registro con ese ${campo}` },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ─── DELETE /api/admin/usuarios/[id] ─────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/usuarios',
    'DELETE'
  )
  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 403 }
    )
  }

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { usuario_id: params.id, eliminado_en: null }
    })
    if (!usuario) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    await prisma.usuarios.update({
      where: { usuario_id: params.id },
      data: {
        eliminado_en: new Date(),
        eliminado_por: validation.data?.id ?? 'sistema'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    })
  } catch (error) {
    console.error('[DELETE /api/admin/usuarios/[id]]', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
