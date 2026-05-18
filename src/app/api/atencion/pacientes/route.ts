import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { crearPacienteSchema } from '@/app/dashboard/atencion/pacientes/schemas'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
// import { Roles } from '@/app/api/lib/constants'

export async function GET(request: NextRequest) {
  // req: Request
  try {
    const validation = await AuthService.validateApiPermission(
      '/api/atencion/pacientes',
      'GET'
    )
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'No estas autorizado para realizar esta accion'
        },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const huerfanas = searchParams.get('huerfanas') === 'true'

    // const esDoctorFichas = validation.data?.role === Roles.DOCTOR_FICHAS
    // const userId = validation.data?.id
    console.log('Estamos entrando aqui')
    // console.log(esDoctorFichas);

    const pacientes = await prisma.pacientes.findMany({
      where: {
        eliminado_en: null,
        fichas: huerfanas
          ? { none: { eliminado_en: null } } // al menos una
          : { some: { eliminado_en: null } } // ninguna
        // ...(esDoctorFichas && {
        // fichas: {
        //   some: {
        //     // creado_por: userId,
        //     eliminado_en: null
        //   }
        // }
        // })
      },
      include: {
        personas: true,
        _count: {
          select: { fichas: { where: { eliminado_en: null } } }
        }
      },
      orderBy: { personas: { paterno: 'asc' } }
    })

    console.log(pacientes)

    return NextResponse.json(
      { success: true, data: pacientes },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error GET /api/atencion/pacientes:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ── POST /api/atencion/pacientes — Crear paciente (Enfermería) ──
export async function POST(request: NextRequest) {
  try {
    const validation = await AuthService.validateApiPermission(
      '/api/atencion/pacientes',
      'POST'
    )
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'No estas autorizado para realizar esta accion'
        },
        { status: 403 }
      )
    }

    const userId = validation.data?.id || 'sistema'
    const body = await request.json()

    const parsed = crearPacienteSchema.safeParse(body)
    if (!parsed.success) {
      const treeified = z.treeifyError(parsed.error)
      return NextResponse.json(
        {
          success: false,
          message: 'Error de validación',
          errors: treeified.properties || {}
        },
        { status: 400 }
      )
    }

    const validData = parsed.data

    const {
      ci,
      nombres,
      paterno,
      materno,
      telefono,
      correo,
      direccion,
      fecha_nacimiento,
      sexo,
      grupo_sanguineo
    } = validData

    // Verificar que no exista
    const personaExistente = await prisma.personas.findUnique({
      where: { ci }
    })

    if (personaExistente) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ya existe una persona con esa cédula de identidad'
        },
        { status: 409 }
      )
    }

    // Transacción: persona + paciente + usuario + rol
    const resultado = await prisma.$transaction(async tx => {
      // 1. Crear persona
      await tx.personas.create({
        data: {
          ci,
          nombres: nombres
            .trim()
            .split(' ')
            .map(
              (word: string) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(' '),
          paterno: paterno
            ? paterno
                .trim()
                .split(' ')
                .map(
                  (word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(' ')
            : null,
          materno: materno
            ? materno
                .trim()
                .split(' ')
                .map(
                  (word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(' ')
            : null,
          telefono: telefono || null,
          correo: correo || null,
          direccion: direccion || null,
          creado_por: userId
        }
      })

      // 2. Crear paciente
      await tx.pacientes.create({
        data: {
          paciente_id: ci,
          fecha_nacimiento: fecha_nacimiento
            ? new Date(fecha_nacimiento)
            : null,
          sexo: sexo || null,
          grupo_sanguineo: grupo_sanguineo || null,
          creado_por: userId
        }
      })

      // 3. Crear usuario (CI como username y contraseña)
      const passwordHash = await bcrypt.hash(ci, 10)
      const usuario = await tx.usuarios.create({
        data: {
          persona_ci: ci,
          username: ci,
          password_hash: passwordHash,
          activo: true,
          creado_por: userId
        }
      })

      // 4. Buscar rol PACIENTE y asignar
      const rolPaciente = await tx.roles.findUnique({
        where: { nombre: 'PACIENTE' }
      })

      if (rolPaciente) {
        await tx.usuarios_roles.create({
          data: {
            usuario_id: usuario.usuario_id,
            rol_id: rolPaciente.id,
            desde: new Date()
          }
        })
      }

      return { ci, nombres, paterno }
    })

    return NextResponse.json(
      {
        success: true,
        message: `Paciente ${resultado.nombres} ${resultado.paterno} creado exitosamente. Usuario: ${resultado.ci} | Contraseña: ${resultado.ci}`,
        data: { paciente_id: resultado.ci }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error POST /api/atencion/pacientes:', error)

    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Ya existe un registro con esos datos' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
