// oxlint-disable no-await-in-loop
// oxlint-disable id-length
// oxlint-disable no-magic-numbers
// oxlint-disable no-console
// oxlint-disable func-style
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const SALT_ROUNDS = 12

// ========================================
// DEFINICIÓN DE USUARIOS/ROLES SIMPLIFICADOS
// ========================================

interface PermisoCompleto {
  nombre: string
  tipo: 'frontend' | 'backend'
  ruta: string
  metodos: string[]
  icono?: string
  descripcion: string
  modulo: string
}

interface UsuarioCompleto {
  // Datos de persona
  persona: {
    ci: string
    nombres: string
    paterno: string
    materno?: string
    telefono: string
    correo: string
    direccion: string
  }
  // Datos de usuario
  usuario: {
    username: string
    password: string
    activo: boolean
  }
  // Datos específicos (doctor/paciente)
  datosEspecificos?: {
    tipo: 'doctor' | 'paciente'
    matricula?: string
    nroHistoriaClinica?: string
    fechaNacimiento?: Date
    sexo?: 'M' | 'F' | 'O'
    grupoSanguineo?: string
  }
  // Rol y permisos
  rol: {
    nombre: string
    descripcion: string
    permisos: PermisoCompleto[]
  }
}

// ========================================
// PERMISOS COMUNES A TODOS LOS USUARIOS
// ========================================
const PERMISOS_COMUNES: PermisoCompleto[] = [
  {
    nombre: 'Inicio',
    tipo: 'frontend',
    ruta: '/dashboard',
    metodos: ['read'],
    icono: 'home',
    descripcion: 'Bienvenid@ a la aplicación de Gestión de Salud',
    modulo: 'principal'
  },
  {
    nombre: 'Perfil',
    tipo: 'frontend',
    ruta: '/dashboard/perfil',
    metodos: ['read', 'update'],
    icono: 'user',
    descripcion: 'Permite ver y actualizar el perfil del usuario personal',
    modulo: 'principal'
  },
  {
    nombre: 'API Perfil',
    tipo: 'backend',
    ruta: '/api/usuarios/perfil',
    metodos: ['GET', 'PATCH'],
    descripcion: 'API para gestionar perfil de usuario',
    modulo: 'principal'
  }
]

// ========================================
// DEFINICIÓN COMPLETA DE CADA USUARIO
// ========================================

// 🏥 PACIENTE 1
const USUARIO_PACIENTE_1: UsuarioCompleto = {
  persona: {
    ci: '12345678',
    nombres: 'Ana Sofía',
    paterno: 'Rojas',
    materno: 'Torres',
    telefono: '70123456',
    correo: 'paciente1@censao.com',
    direccion: 'Centro, La Paz'
  },
  usuario: {
    username: 'paciente1',
    password: '123',
    activo: true
  },
  datosEspecificos: {
    tipo: 'paciente',
    nroHistoriaClinica: 'HC-2025-001',
    fechaNacimiento: new Date('1990-05-15'),
    sexo: 'F',
    grupoSanguineo: 'O+'
  },
  rol: {
    nombre: 'PACIENTE',
    descripcion: 'Usuario paciente del sistema',
    permisos: [
      ...PERMISOS_COMUNES,
      // FRONTEND - Permisos específicos del paciente
      {
        nombre: 'Mis Tratamientos',
        tipo: 'frontend',
        ruta: '/dashboard/paciente/tratamientos',
        metodos: ['read'],
        icono: 'history',
        descripcion: 'Ver mis tratamientos médicos',
        modulo: 'mi_salud'
      },
      {
        nombre: 'Detalle Tratamiento',
        tipo: 'frontend',
        ruta: '/dashboard/paciente/tratamientos/:uuid',
        metodos: ['read'],
        icono: 'history',
        descripcion: 'Ver detalle de un tratamiento específico',
        modulo: 'mi_salud'
      },
      {
        nombre: 'Mis Citas',
        tipo: 'frontend',
        ruta: '/dashboard/paciente/citas',
        metodos: ['read'],
        icono: 'calendar',
        descripcion: 'Ver mis citas médicas programadas',
        modulo: 'mi_salud'
      },
      // BACKEND - APIs específicas del paciente
      {
        nombre: 'API Mis Tratamientos',
        tipo: 'backend',
        ruta: '/api/paciente/:uuid/tratamientos',
        metodos: ['GET'],
        descripcion: 'API para ver tratamientos del paciente',
        modulo: 'mi_salud'
      },
      {
        nombre: 'API Detalle Tratamiento',
        tipo: 'backend',
        ruta: '/api/paciente/:uuid/tratamientos/:uuid',
        metodos: ['GET'],
        descripcion: 'API para ver detalle de tratamiento',
        modulo: 'mi_salud'
      },
      {
        nombre: 'API Mis Citas',
        tipo: 'backend',
        ruta: '/api/paciente/:uuid/citas',
        metodos: ['GET'],
        descripcion: 'API para ver citas del paciente',
        modulo: 'mi_salud'
      }
    ]
  }
}

// 🏥 PACIENTE 2
const USUARIO_PACIENTE_2: UsuarioCompleto = {
  persona: {
    ci: '98765432',
    nombres: 'Juan Carlos',
    paterno: 'Mamani',
    materno: 'Quispe',
    telefono: '70987654',
    correo: 'paciente2@censao.com',
    direccion: 'El Alto, La Paz'
  },
  usuario: {
    username: 'paciente2',
    password: '123',
    activo: true
  },
  datosEspecificos: {
    tipo: 'paciente',
    nroHistoriaClinica: 'HC-2025-002',
    fechaNacimiento: new Date('1985-10-22'),
    sexo: 'M',
    grupoSanguineo: 'A+'
  },
  rol: {
    nombre: 'PACIENTE', // Mismo rol que PACIENTE_1
    descripcion: 'Usuario paciente del sistema',
    permisos: [] // Se reutilizará el rol ya creado
  }
}

// 👩‍⚕️ DOCTOR ESPECIALIZADO EN FICHAS
const USUARIO_DOCTOR_FICHAS: UsuarioCompleto = {
  persona: {
    ci: '87654321',
    nombres: 'Dr. Maria',
    paterno: 'Villalobos',
    materno: 'Quispe',
    telefono: '70987654',
    correo: 'doctor.fichas@censao.com',
    direccion: 'Zona Sur, La Paz'
  },
  usuario: {
    username: 'doctor.fichas',
    password: '123',
    activo: true
  },
  datosEspecificos: {
    tipo: 'doctor',
    matricula: 'MED-002-2025'
  },
  rol: {
    nombre: 'DOCTOR_FICHAS',
    descripcion: 'Doctor especializado en fichas médicas',
    permisos: [
      ...PERMISOS_COMUNES,
      // FRONTEND - Solo fichas
      {
        nombre: 'Gestionar Fichas',
        tipo: 'frontend',
        ruta: '/dashboard/fichas',
        metodos: ['read', 'create', 'update', 'delete'],
        icono: 'plus',
        descripcion: 'Gestión completa de fichas médicas',
        modulo: 'fichas'
      },
      // BACKEND - Solo fichas
      {
        nombre: 'API Fichas',
        tipo: 'backend',
        ruta: '/api/fichas',
        metodos: ['GET', 'POST', 'PATCH', 'DELETE'],
        descripcion: 'API para gestión completa de fichas',
        modulo: 'fichas'
      }
    ]
  }
}

// 👨‍⚕️ DOCTOR GENERAL
const USUARIO_DOCTOR_GENERAL: UsuarioCompleto = {
  persona: {
    ci: '11111111',
    nombres: 'Dr. Carlos',
    paterno: 'Mendoza',
    materno: 'Silva',
    telefono: '70111111',
    correo: 'doctor.general@censao.com',
    direccion: 'Miraflores, La Paz'
  },
  usuario: {
    username: 'doctor.general',
    password: '123',
    activo: true
  },
  datosEspecificos: {
    tipo: 'doctor',
    matricula: 'MED-003-2025'
  },
  rol: {
    nombre: 'DOCTOR_GENERAL',
    descripcion: 'Médico general con atención a pacientes',
    permisos: [
      ...PERMISOS_COMUNES,
      // FRONTEND - Fichas
      {
        nombre: 'Gestionar Fichas',
        tipo: 'frontend',
        ruta: '/dashboard/fichas',
        metodos: ['read', 'create', 'update', 'delete'],
        icono: 'plus',
        descripcion: 'Gestión completa de fichas médicas',
        modulo: 'fichas'
      },
      // FRONTEND - Atención médica
      {
        nombre: 'Pacientes',
        tipo: 'frontend',
        ruta: '/dashboard/atencion/pacientes',
        metodos: ['read', 'update', 'create'],
        icono: 'list',
        descripcion: 'Gestionar pacientes asignados',
        modulo: 'atencion'
      },
      {
        nombre: 'Seguimiento Tratamientos',
        tipo: 'frontend',
        ruta: '/dashboard/atencion/seguimiento',
        metodos: ['read', 'update', 'delete'],
        icono: 'monitor',
        descripcion: 'Seguimiento de tratamientos médicos',
        modulo: 'atencion'
      },
      {
        nombre: 'Reenviar Notificaciones',
        tipo: 'frontend',
        ruta: '/dashboard/atencion/notificaciones',
        metodos: ['read', 'create'],
        icono: 'send',
        descripcion: 'Gestionar notificaciones a pacientes',
        modulo: 'atencion'
      },
      // FRONTEND - Tratamientos (como doctor)
      {
        nombre: 'Tratamientos',
        tipo: 'frontend',
        ruta: '/dashboard/paciente/tratamientos',
        metodos: ['read', 'create', 'update', 'delete'],
        icono: 'history',
        descripcion: 'Gestionar tratamientos de pacientes',
        modulo: 'tratamientos'
      },
      {
        nombre: 'Detalle Tratamiento',
        tipo: 'frontend',
        ruta: '/dashboard/paciente/tratamientos/:uuid',
        metodos: ['read', 'update', 'delete'],
        icono: 'history',
        descripcion: 'Gestionar detalle de tratamiento',
        modulo: 'tratamientos'
      },
      {
        nombre: 'Citas',
        tipo: 'frontend',
        ruta: '/dashboard/paciente/citas',
        metodos: ['read', 'update', 'delete'],
        icono: 'calendar',
        descripcion: 'Gestionar citas médicas',
        modulo: 'tratamientos'
      },

      // BACKEND - APIs
      {
        nombre: 'API Fichas',
        tipo: 'backend',
        ruta: '/api/fichas',
        metodos: ['GET', 'POST', 'PATCH', 'DELETE'],
        descripcion: 'API para gestión completa de fichas',
        modulo: 'fichas'
      },
      {
        nombre: 'API Atención Pacientes',
        tipo: 'backend',
        ruta: '/api/atencion/:uuid/pacientes',
        metodos: ['GET'],
        descripcion: 'API para obtener pacientes asignados al doctor',
        modulo: 'atencion'
      },
      {
        nombre: 'API Tratamientos',
        tipo: 'backend',
        ruta: '/api/atencion/tratamientos',
        metodos: ['GET', 'POST'],
        descripcion: 'API para gestión de tratamientos',
        modulo: 'atencion'
      },
      {
        nombre: 'API Tratamientos Paciente',
        tipo: 'backend',
        ruta: '/api/atencion/tratamientos/paciente/:uuid',
        metodos: ['GET', 'PATCH'],
        descripcion: 'API para tratamientos específicos de paciente',
        modulo: 'atencion'
      },
      {
        nombre: 'API Notificaciones Médicas',
        tipo: 'backend',
        ruta: '/api/notificaciones/medicas',
        metodos: ['POST'],
        descripcion: 'API para enviar notificaciones médicas',
        modulo: 'atencion'
      },
      {
        nombre: 'API Notificaciones Específicas',
        tipo: 'backend',
        ruta: '/api/notificaciones/medicas/:uuid',
        metodos: ['POST'],
        descripcion: 'API para notificaciones a paciente específico',
        modulo: 'atencion'
      },
      {
        nombre: 'API Tratamientos de Paciente',
        tipo: 'backend',
        ruta: '/api/paciente/:uuid/tratamientos',
        metodos: ['GET', 'POST', 'PATCH', 'DELETE'],
        descripcion: 'API para gestionar tratamientos de pacientes',
        modulo: 'tratamientos'
      },
      {
        nombre: 'API Detalle Tratamiento Paciente',
        tipo: 'backend',
        ruta: '/api/paciente/:uuid/tratamientos/:uuid',
        metodos: ['GET', 'PATCH', 'DELETE'],
        descripcion: 'API para detalle de tratamiento específico',
        modulo: 'tratamientos'
      },
      {
        nombre: 'API Citas de Paciente',
        tipo: 'backend',
        ruta: '/api/paciente/:uuid/citas',
        metodos: ['GET', 'PATCH', 'DELETE'],
        descripcion: 'API para gestionar citas de pacientes',
        modulo: 'tratamientos'
      }
    ]
  }
}

// 🦷 ODONTÓLOGA (MISMOS PERMISOS QUE DOCTOR GENERAL)
const USUARIO_ODONTOLOGO: UsuarioCompleto = {
  persona: {
    ci: '22222222',
    nombres: 'Dra. Sofia',
    paterno: 'Rojas',
    materno: 'Mamani',
    telefono: '70222222',
    correo: 'odontologa@censao.com',
    direccion: 'Calacoto, La Paz'
  },
  usuario: {
    username: 'odontologa',
    password: '123',
    activo: true
  },
  datosEspecificos: {
    tipo: 'doctor',
    matricula: 'ODO-001-2025'
  },
  rol: {
    nombre: 'DOCTOR_GENERAL', // Mismo rol que DOCTOR_GENERAL
    descripcion: 'Médico general con atención a pacientes',
    permisos: [] // Se reutilizará el rol ya creado
  }
}

// 👤 ADMINISTRADOR (ACCESO TOTAL)
const USUARIO_ADMIN: UsuarioCompleto = {
  persona: {
    ci: '123123123',
    nombres: 'Casto',
    paterno: 'Navia',
    materno: '',
    telefono: '77777777',
    correo: 'admin@censao.com',
    direccion: 'Centro, La Paz'
  },
  usuario: {
    username: 'admin',
    password: '123',
    activo: true
  },
  datosEspecificos: {
    tipo: 'doctor',
    matricula: 'MED-001-2025'
  },
  rol: {
    nombre: 'ADMINISTRADOR',
    descripcion: 'Administrador del sistema con acceso total',
    permisos: [
      ...PERMISOS_COMUNES,
      // ACCESO TOTAL A FICHAS
      {
        nombre: 'Gestionar Fichas',
        tipo: 'frontend',
        ruta: '/dashboard/fichas',
        metodos: ['read', 'create', 'update', 'delete'],
        icono: 'plus',
        descripcion: 'Gestión completa de fichas médicas',
        modulo: 'fichas'
      },
      {
        nombre: 'API Fichas',
        tipo: 'backend',
        ruta: '/api/fichas',
        metodos: ['GET', 'POST', 'PATCH', 'DELETE'],
        descripcion: 'API para gestión completa de fichas',
        modulo: 'fichas'
      },
      // ACCESO TOTAL A ATENCIÓN MÉDICA
      {
        nombre: 'Pacientes',
        tipo: 'frontend',
        ruta: '/dashboard/atencion/pacientes',
        metodos: ['read', 'update', 'create'],
        icono: 'list',
        descripcion: 'Gestionar todos los pacientes',
        modulo: 'atencion'
      },
      {
        nombre: 'Seguimiento Tratamientos',
        tipo: 'frontend',
        ruta: '/dashboard/atencion/seguimiento',
        metodos: ['read', 'update', 'delete'],
        icono: 'monitor',
        descripcion: 'Seguimiento de tratamientos médicos',
        modulo: 'atencion'
      },
      {
        nombre: 'Reenviar Notificaciones',
        tipo: 'frontend',
        ruta: '/dashboard/atencion/notificaciones',
        metodos: ['read', 'create'],
        icono: 'send',
        descripcion: 'Gestionar notificaciones a pacientes',
        modulo: 'atencion'
      },
      {
        nombre: 'Tratamientos',
        tipo: 'frontend',
        ruta: '/dashboard/paciente/tratamientos',
        metodos: ['read', 'create', 'update', 'delete'],
        icono: 'history',
        descripcion: 'Gestionar todos los tratamientos',
        modulo: 'tratamientos'
      },
      {
        nombre: 'Detalle Tratamiento',
        tipo: 'frontend',
        ruta: '/dashboard/paciente/tratamientos/:uuid',
        metodos: ['read', 'update', 'delete'],
        icono: 'history',
        descripcion: 'Gestionar detalle de tratamientos',
        modulo: 'tratamientos'
      },
      {
        nombre: 'Citas',
        tipo: 'frontend',
        ruta: '/dashboard/paciente/citas',
        metodos: ['read', 'update', 'delete'],
        icono: 'calendar',
        descripcion: 'Gestionar todas las citas',
        modulo: 'tratamientos'
      },

      // BACKEND - APIs completas
      {
        nombre: 'API Atención Pacientes',
        tipo: 'backend',
        ruta: '/api/atencion/:uuid/pacientes',
        metodos: ['GET'],
        descripcion: 'API para obtener todos los pacientes',
        modulo: 'atencion'
      },
      {
        nombre: 'API Tratamientos',
        tipo: 'backend',
        ruta: '/api/atencion/tratamientos',
        metodos: ['GET', 'POST'],
        descripcion: 'API para gestión completa de tratamientos',
        modulo: 'atencion'
      },
      {
        nombre: 'API Tratamientos Paciente',
        tipo: 'backend',
        ruta: '/api/atencion/tratamientos/paciente/:uuid',
        metodos: ['GET', 'PATCH'],
        descripcion: 'API para tratamientos de pacientes específicos',
        modulo: 'atencion'
      },
      {
        nombre: 'API Notificaciones Médicas',
        tipo: 'backend',
        ruta: '/api/notificaciones/medicas',
        metodos: ['POST'],
        descripcion: 'API para enviar notificaciones médicas',
        modulo: 'atencion'
      },
      {
        nombre: 'API Notificaciones Específicas',
        tipo: 'backend',
        ruta: '/api/notificaciones/medicas/:uuid',
        metodos: ['POST'],
        descripcion: 'API para notificaciones a paciente específico',
        modulo: 'atencion'
      },
      {
        nombre: 'API Tratamientos de Paciente',
        tipo: 'backend',
        ruta: '/api/paciente/:uuid/tratamientos',
        metodos: ['GET', 'POST', 'PATCH', 'DELETE'],
        descripcion: 'API para gestión total de tratamientos de pacientes',
        modulo: 'tratamientos'
      },
      {
        nombre: 'API Detalle Tratamiento Paciente',
        tipo: 'backend',
        ruta: '/api/paciente/:uuid/tratamientos/:uuid',
        metodos: ['GET', 'PATCH', 'DELETE'],
        descripcion: 'API para gestión total de detalle de tratamientos',
        modulo: 'tratamientos'
      },
      {
        nombre: 'API Citas de Paciente',
        tipo: 'backend',
        ruta: '/api/paciente/:uuid/citas',
        metodos: ['GET', 'PATCH', 'DELETE'],
        descripcion: 'API para gestión total de citas',
        modulo: 'tratamientos'
      },

      // PERMISOS ADMINISTRATIVOS BÁSICOS (para futuro)
      {
        nombre: 'Gestión de Usuarios',
        tipo: 'frontend',
        ruta: '/dashboard/admin/usuarios',
        metodos: ['read', 'create', 'update', 'delete'],
        icono: 'team',
        descripcion: 'Gestionar usuarios del sistema',
        modulo: 'administracion'
      },
      {
        nombre: 'API Usuarios Admin',
        tipo: 'backend',
        ruta: '/api/admin/usuarios',
        metodos: ['GET', 'POST', 'PATCH', 'DELETE'],
        descripcion: 'API para administrar usuarios',
        modulo: 'administracion'
      }
    ]
  }
}

// ========================================
// LISTA ORDENADA DE USUARIOS A CREAR
// ========================================
const USUARIOS_A_CREAR: UsuarioCompleto[] = [
  USUARIO_PACIENTE_1,
  USUARIO_PACIENTE_2,
  USUARIO_DOCTOR_FICHAS,
  USUARIO_DOCTOR_GENERAL,
  USUARIO_ODONTOLOGO,
  USUARIO_ADMIN
]

// ========================================
// FUNCIONES AUXILIARES
// ========================================

async function limpiarBaseDatos() {
  console.log('🧹 Limpiando datos existentes...')
  await prisma.usuarios_roles.deleteMany()
  await prisma.roles_permisos.deleteMany()
  await prisma.usuarios.deleteMany()
  await prisma.doctores.deleteMany()
  await prisma.pacientes.deleteMany()
  await prisma.permisos.deleteMany()
  await prisma.roles.deleteMany()
  await prisma.personas.deleteMany()
  console.log('✅ Base de datos limpia')
}

async function crearUsuarioCompleto(usuarioData: UsuarioCompleto) {
  const hashedPassword = await hash(usuarioData.usuario.password, SALT_ROUNDS)

  console.log(`\n👤 Creando usuario: ${usuarioData.usuario.username}`)

  // 1. Crear persona
  console.log(
    `  📝 Creando persona: ${usuarioData.persona.nombres} ${usuarioData.persona.paterno}`
  )
  const persona = await prisma.personas.create({
    data: {
      ci: usuarioData.persona.ci,
      nombres: usuarioData.persona.nombres,
      paterno: usuarioData.persona.paterno,
      materno: usuarioData.persona.materno || '',
      telefono: usuarioData.persona.telefono,
      correo: usuarioData.persona.correo,
      direccion: usuarioData.persona.direccion
    }
  })

  // 2. Crear usuario
  console.log(`  🔐 Creando usuario: ${usuarioData.usuario.username}`)
  const usuario = await prisma.usuarios.create({
    data: {
      usuario_id: persona.id,
      username: usuarioData.usuario.username,
      password_hash: hashedPassword,
      activo: usuarioData.usuario.activo
    }
  })

  // 3. Crear datos específicos (doctor/paciente)
  if (usuarioData.datosEspecificos) {
    if (usuarioData.datosEspecificos.tipo === 'doctor') {
      console.log(
        `  👩‍⚕️ Creando doctor con matrícula: ${usuarioData.datosEspecificos.matricula}`
      )
      await prisma.doctores.create({
        data: {
          doctor_id: persona.id,
          matricula: usuarioData.datosEspecificos.matricula!
        }
      })
    } else if (usuarioData.datosEspecificos.tipo === 'paciente') {
      console.log(
        `  🏥 Creando paciente con HC: ${usuarioData.datosEspecificos.nroHistoriaClinica}`
      )
      await prisma.pacientes.create({
        data: {
          paciente_id: persona.id,
          nro_historia_clinica:
            usuarioData.datosEspecificos.nroHistoriaClinica!,
          fecha_nacimiento: usuarioData.datosEspecificos.fechaNacimiento!,
          sexo: usuarioData.datosEspecificos.sexo!,
          grupo_sanguineo: usuarioData.datosEspecificos.grupoSanguineo!
        }
      })
    }
  }

  // 4. Crear o reutilizar rol
  let rol
  const rolExistente = await prisma.roles.findUnique({
    where: { nombre: usuarioData.rol.nombre }
  })

  if (rolExistente) {
    console.log(`  🔄 Reutilizando rol existente: ${usuarioData.rol.nombre}`)
    rol = rolExistente
  } else {
    console.log(`  🆕 Creando nuevo rol: ${usuarioData.rol.nombre}`)
    rol = await prisma.roles.create({
      data: {
        nombre: usuarioData.rol.nombre,
        descripcion: usuarioData.rol.descripcion
      }
    })

    // 5. Crear permisos del rol (solo si es nuevo)
    if (usuarioData.rol.permisos.length > 0) {
      console.log(
        `  📋 Creando ${usuarioData.rol.permisos.length} permisos para el rol`
      )

      for (const permisoData of usuarioData.rol.permisos) {
        // Verificar si el permiso ya existe
        const permisoExistente = await prisma.permisos.findFirst({
          where: {
            nombre: permisoData.nombre,
            ruta: permisoData.ruta
          }
        })

        let permiso
        if (permisoExistente) {
          permiso = permisoExistente
        } else {
          permiso = await prisma.permisos.create({
            data: {
              nombre: permisoData.nombre,
              tipo: permisoData.tipo,
              ruta: permisoData.ruta,
              metodos: permisoData.metodos,
              icono: permisoData.icono,
              descripcion: permisoData.descripcion,
              modulo: permisoData.modulo
            }
          })
        }

        // Asignar permiso al rol
        await prisma.roles_permisos.create({
          data: {
            rol_id: rol.id,
            permiso_id: permiso.id
          }
        })
      }
    }
  }

  // 6. Asignar rol al usuario
  console.log(`  🔗 Asignando rol ${usuarioData.rol.nombre} al usuario`)
  await prisma.usuarios_roles.create({
    data: {
      usuario_id: persona.id,
      rol_id: rol.id,
      desde: new Date()
    }
  })

  console.log(`✅ Usuario ${usuarioData.usuario.username} creado exitosamente!`)

  return {
    persona,
    usuario,
    rol
  }
}

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================
async function main() {
  console.log('🚀 Iniciando seeding simplificado de la base de datos...')

  try {
    // 1. Limpiar base de datos
    await limpiarBaseDatos()

    // 2. Crear todos los usuarios de forma ordenada
    console.log('\n📋 Creando usuarios en orden...')

    const usuariosCreados = []
    for (const usuarioData of USUARIOS_A_CREAR) {
      const resultado = await crearUsuarioCompleto(usuarioData)
      usuariosCreados.push(resultado)
    }

    // 3. Mostrar resumen final
    console.log('\n' + '='.repeat(50))
    console.log('🎉 SEEDING SIMPLIFICADO COMPLETADO!')
    console.log('='.repeat(50))

    console.log('\n📊 RESUMEN:')
    const totalRoles = await prisma.roles.count()
    const totalPermisos = await prisma.permisos.count()
    const totalPersonas = await prisma.personas.count()
    const totalUsuarios = await prisma.usuarios.count()
    const totalDoctores = await prisma.doctores.count()
    const totalPacientes = await prisma.pacientes.count()

    console.log(`   👥 Personas creadas: ${totalPersonas}`)
    console.log(`   🔐 Usuarios creados: ${totalUsuarios}`)
    console.log(`   👩‍⚕️ Doctores creados: ${totalDoctores}`)
    console.log(`   🏥 Pacientes creados: ${totalPacientes}`)
    console.log(`   🏷️ Roles creados: ${totalRoles}`)
    console.log(`   📋 Permisos creados: ${totalPermisos}`)

    console.log('\n🔑 CREDENCIALES DE ACCESO:')
    console.log('   (Todos usan la contraseña: "123")')
    console.log('')

    console.log('   🏥 PACIENTE: username="paciente1"')
    console.log('   🏥 PACIENTE: username="paciente2"')
    console.log('   👩‍⚕️ DOCTOR FICHAS: username="doctor.fichas"')
    console.log('   👨‍⚕️ DOCTOR GENERAL: username="doctor.general"')
    console.log('   🦷 ODONTÓLOGA: username="odontologa"')
    console.log('   👤 ADMINISTRADOR: username="admin"')

    console.log('\n📋 PERMISOS POR ROL:')
    console.log('')
    console.log('   🏥 PACIENTE:')
    console.log('     - Solo ver sus propios tratamientos y citas')
    console.log('     - Acceso de solo lectura a su información médica')
    console.log('')
    console.log('   👩‍⚕️ DOCTOR FICHAS:')
    console.log('     - Gestión completa de fichas médicas')
    console.log('     - Sin acceso a atención de pacientes')
    console.log('')
    console.log('   👨‍⚕️ DOCTOR GENERAL y 🦷 ODONTÓLOGA:')
    console.log('     - Gestión completa de fichas médicas')
    console.log('     - Atención y seguimiento de pacientes')
    console.log('     - Gestión de tratamientos y citas')
    console.log('     - Envío de notificaciones médicas')
    console.log('')
    console.log('   👤 ADMINISTRADOR:')
    console.log('     - Acceso total al sistema')
    console.log('     - Todos los permisos de doctores')
    console.log('     - Gestión básica de usuarios')

    console.log('\n✨ ¡Listo para comenzar el desarrollo!')
  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    throw error
  }
}

// ========================================
// EJECUTAR EL SEEDER
// ========================================
main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n🔌 Conexión a base de datos cerrada correctamente')
  })
  .catch(async error => {
    console.error('💥 Error fatal:', error)
    await prisma.$disconnect()
    process.exit(1)
  })

// ========================================
// NOTAS PARA DESARROLLO
// ========================================

/*
🔄 PRÓXIMOS PASOS PARA EXPANDIR:

1. Cuando necesites más funcionalidades administrativas, puedes agregar al rol ADMINISTRADOR:
   - Gestión de roles y permisos
   - Registro de doctores
   - Gestión de turnos y disponibilidades
   - Gestión de vacunas

2. Para agregar nuevos tipos de usuarios, usa este template:

const USUARIO_NUEVO: UsuarioCompleto = {
  persona: { ... },
  usuario: { ... },
  datosEspecificos: { ... },
  rol: {
    nombre: 'NUEVO_ROL',
    descripcion: 'Descripción',
    permisos: [
      ...PERMISOS_COMUNES,
      // Agregar permisos específicos
    ]
  }
}

3. Recuerda que los roles se reutilizan automáticamente, así que puedes
   tener múltiples usuarios con el mismo rol sin duplicar permisos.

🎯 ESTRUCTURA ACTUAL:
- PACIENTE: Solo lectura de su información médica
- DOCTOR_FICHAS: Solo gestión de fichas
- DOCTOR_GENERAL: Fichas + atención completa de pacientes
- ADMINISTRADOR: Acceso total + gestión básica de usuarios
*/
