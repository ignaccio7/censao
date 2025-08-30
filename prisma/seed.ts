// oxlint-disable no-magic-numbers
// oxlint-disable no-console
// oxlint-disable func-style
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const SALT_ROUNDS = 12

async function main() {
  console.log('Iniciando seeding de la base de datos...')

  try {
    // 1. LIMPIAR DATOS EXISTENTES (opcional)
    console.log('Limpiando datos existentes...')
    await prisma.usuarios_roles.deleteMany()
    await prisma.roles_permisos.deleteMany()
    await prisma.usuarios.deleteMany()
    await prisma.doctores.deleteMany()
    await prisma.permisos.deleteMany()
    await prisma.roles.deleteMany()
    await prisma.personas.deleteMany()

    // 2. CREAR ROLES
    console.log('Creando roles...')
    const roles = await Promise.all([
      prisma.roles.create({
        data: {
          nombre: 'ADMINISTRADOR',
          descripcion: 'Administrador del sistema con acceso total'
        }
      }),
      prisma.roles.create({
        data: {
          nombre: 'DOCTOR_FICHAS',
          descripcion: 'Doctor especializado en fichas y citas'
        }
      }),
      prisma.roles.create({
        data: {
          nombre: 'DOCTOR_GENERAL',
          descripcion: 'Médico general con acceso a pacientes'
        }
      }),
      prisma.roles.create({
        data: {
          nombre: 'PACIENTE',
          descripcion: 'Usuario paciente del sistema'
        }
      })
    ])

    console.log(`Creados ${roles.length} roles`)

    // 3. CREAR PERMISOS
    console.log('Creando permisos...')
    const permisos = await Promise.all([
      // Permisos comunes
      prisma.permisos.create({
        data: {
          nombre: 'Perfil',
          ruta: '/dashboard/perfil',
          metodos: ['GET', 'PATCH'],
          icono: 'user',
          descripcion: 'Ver y actualizar perfil personal',
          modulo: 'principal'
        }
      }),
      prisma.permisos.create({
        data: {
          nombre: 'Inicio',
          ruta: '/dashboard',
          metodos: ['GET'],
          icono: 'home',
          descripcion: 'Bienvenid@ a la aplicación de Gestión de Salud',
          modulo: 'principal'
        }
      }),
      // Permisos específicos
      prisma.permisos.create({
        data: {
          nombre: 'Gestionar Fichas',
          ruta: '/dashboard/fichas',
          metodos: ['GET', 'POST', 'PATCH', 'DELETE'],
          icono: 'plus',
          descripcion: 'Gestión completa de fichas médicas',
          modulo: 'fichas'
        }
      }),
      prisma.permisos.create({
        data: {
          nombre: 'Mis tratamientos',
          ruta: '/dashboard/paciente/tratamientos',
          metodos: ['GET'],
          icono: 'history',
          descripcion: 'Ver mis tratamientos médicos',
          modulo: 'tratamientos'
        }
      }),
      prisma.permisos.create({
        data: {
          nombre: 'Mi tratamiento',
          ruta: '/dashboard/paciente/tratamientos/:uuid',
          metodos: ['GET'],
          icono: 'history',
          descripcion:
            'Ver el historial de un tratamiento médico en específico',
          modulo: 'tratamientos'
        }
      }),
      prisma.permisos.create({
        data: {
          nombre: 'Mis Citas',
          ruta: '/dashboard/paciente/citas',
          metodos: ['GET'],
          icono: 'calendar',
          descripcion: 'Ver mis citas médicas programadas',
          modulo: 'tratamientos'
        }
      }),
      prisma.permisos.create({
        data: {
          nombre: 'Pacientes Atendidos',
          ruta: '/dashboard/atencion/pacientes',
          metodos: ['GET', 'PATCH'],
          icono: 'list',
          descripcion: 'Ver mis citas médicas programadas',
          modulo: 'tratamientos'
        }
      })
    ])

    console.log(`Creados ${permisos.length} permisos`)

    // 4. CREAR PERSONAS
    console.log('Creando personas...')
    const personas = await Promise.all([
      prisma.personas.create({
        // Doctor Administrador - Doctor General
        data: {
          ci: '123123123',
          nombres: 'Casto',
          paterno: 'Navia',
          materno: '',
          telefono: '77777777',
          correo: 'admin@censao.com',
          direccion: 'Centro, La Paz'
        }
      }),
      prisma.personas.create({
        // Doctora Fichas
        data: {
          ci: '87654321',
          nombres: 'Dr. Maria',
          paterno: 'Villalobos',
          materno: 'Quispe',
          telefono: '70987654',
          correo: 'doctor.fichas@censao.com',
          direccion: 'Zona Sur, La Paz'
        }
      }),
      prisma.personas.create({
        // Paciente 1
        data: {
          ci: '12345678',
          nombres: 'Ana Sofía',
          paterno: 'Rojas',
          materno: 'Torres',
          telefono: '70123456',
          correo: 'paciente1@censao.com',
          direccion: 'Centro, La Paz'
        }
      })
    ])

    console.log(`Creadas ${personas.length} personas`)

    // 5. CREAR USUARIOS CON PASSWORDS HASHEADOS
    console.log('Creando usuarios...')
    const hashedPassword = await hash('123', SALT_ROUNDS)

    const usuarios = await Promise.all([
      prisma.usuarios.create({
        data: {
          usuario_id: personas[0].id, // Admin
          username: 'admin',
          password_hash: hashedPassword,
          activo: true
        }
      }),
      prisma.usuarios.create({
        data: {
          usuario_id: personas[1].id, // Doctor
          username: 'doctor.fichas',
          password_hash: hashedPassword,
          activo: true
        }
      }),
      prisma.usuarios.create({
        data: {
          usuario_id: personas[2].id, // Paciente
          username: 'paciente1',
          password_hash: hashedPassword,
          activo: true
        }
      })
    ])

    console.log(`Creados ${usuarios.length} usuarios`)

    // 6. CREAR DOCTORES
    console.log('Creando doctores...')
    await prisma.doctores.create({
      data: {
        doctor_id: personas[0].id,
        matricula: 'MED-001-2025'
      }
    })
    await prisma.doctores.create({
      data: {
        doctor_id: personas[1].id,
        matricula: 'MED-002-2025'
      }
    })

    // 7. ASIGNAR ROLES A USUARIOS
    console.log('Asignando roles...')
    await Promise.all([
      prisma.usuarios_roles.create({
        data: {
          usuario_id: usuarios[0].usuario_id, // Admin
          rol_id: roles[0].id, // ADMINISTRADOR
          desde: new Date()
        }
      }),
      prisma.usuarios_roles.create({
        data: {
          usuario_id: usuarios[1].usuario_id, // Doctor
          rol_id: roles[1].id, // DOCTOR_FICHAS
          desde: new Date()
        }
      }),
      prisma.usuarios_roles.create({
        data: {
          usuario_id: usuarios[2].usuario_id, // Paciente 1
          rol_id: roles[2].id, // PACIENTE
          desde: new Date()
        }
      })
    ])

    // 8. ASIGNAR PERMISOS A ROLES
    console.log('Asignando permisos a roles...')

    // Todos tienen acceso básico
    for (const rol of roles) {
      for (const permiso of permisos.slice(0, 2)) {
        // perfil e inicio
        await prisma.roles_permisos.create({
          data: {
            rol_id: rol.id,
            permiso_id: permiso.id
          }
        })
      }
    }

    // Permisos específicos
    // Doctor Fichas
    await prisma.roles_permisos.create({
      data: {
        rol_id: roles[1].id, // DOCTOR_FICHAS
        permiso_id: permisos[2].id // Gestionar Fichas
      }
    })

    // Doctor General
    await prisma.roles_permisos.create({
      data: {
        rol_id: roles[0].id, // DOCTOR_GENERAL
        permiso_id: permisos[3].id // Tratamientos
      }
    })
    await prisma.roles_permisos.create({
      data: {
        rol_id: roles[0].id, // DOCTOR_GENERAL
        permiso_id: permisos[4].id // Tratamiento especifico
      }
    })
    await prisma.roles_permisos.create({
      data: {
        rol_id: roles[0].id, // DOCTOR_GENERAL
        permiso_id: permisos[6].id // Pacientes
      }
    })

    // Paciente
    await prisma.roles_permisos.create({
      data: {
        rol_id: roles[2].id, // PACIENTE
        permiso_id: permisos[3].id // Tratamientos
      }
    })
    await prisma.roles_permisos.create({
      data: {
        rol_id: roles[2].id, // PACIENTE
        permiso_id: permisos[4].id // Tratamiento especifico
      }
    })
    await prisma.roles_permisos.create({
      data: {
        rol_id: roles[2].id, // PACIENTE
        permiso_id: permisos[5].id // Mis citas
      }
    })

    console.log('Seeding completado exitosamente!')
  } catch (error) {
    console.error('Error durante el seeding:', error)
    throw error
  }
}

// Ejecutar el seeder
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async event => {
    console.error(event)
    await prisma.$disconnect()
    process.exit(1)
  })
