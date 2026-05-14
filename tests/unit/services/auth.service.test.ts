// tests/unit/services/auth.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn()
}))

import AuthService from '../../../src/lib/services/auth-service'
import prisma from '../../../src/lib/prisma/prisma'
import bcrypt from 'bcryptjs'

// ============================================
// Credenciales correctas - Retorna usuario con permisos
// ============================================

describe('AuthService - validateCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe retornar usuario cuando las credenciales son correctas', async () => {
    // Datos falsos
    const usuarioFalso = {
      usuario_id: 'ce0727b0-7f6e-4ca3-9a5f-68eccb6bb339',
      password_hash: '$2a$10$hashFalso'
    }

    const permisosFalsos = {
      usuario_id: 'ce0727b0-7f6e-4ca3-9a5f-68eccb6bb339',
      username: 'doctor.general',
      personas: {
        nombres: 'Carlos',
        paterno: 'Mendoza',
        materno: 'Silva'
      },
      usuarios_roles: [
        {
          roles: {
            nombre: 'DOCTOR_GENERAL',
            descripcion: 'Médico general con atención a pacientes',
            roles_permisos: [
              { permisos: { ruta: '/dashboard' } },
              { permisos: { ruta: '/dashboard/perfil' } }
            ]
          }
        }
      ]
    }

    // Configurar mocks (solo para dependencias externas)
    prisma.usuarios.findUnique = vi.fn().mockResolvedValue(usuarioFalso)
    bcrypt.compare = vi.fn().mockResolvedValue(true)
    vi.spyOn(AuthService as any, 'getUserPermissionsForJWT').mockResolvedValue(
      permisosFalsos
    )

    // Ejecutar
    const resultado = await AuthService.validateCredentials(
      'doctor.general',
      'password123'
    )

    // Verificar - calculamos el resultado ESPERADO manualmente
    expect(resultado).toEqual({
      id: 'ce0727b0-7f6e-4ca3-9a5f-68eccb6bb339',
      username: 'doctor.general',
      name: 'Carlos Mendoza Silva',
      role: 'DOCTOR_GENERAL',
      roleDescription: 'Médico general con atención a pacientes',
      permisos: ['/dashboard', '/dashboard/perfil']
    })
  })

  // ============================================
  // Usuario no existe, contraseña incorrecta, error en BD - Retorna null
  // ============================================

  it('debe retornar null cuando el usuario no existe', async () => {
    prisma.usuarios.findUnique = vi.fn().mockResolvedValue(null)

    const resultado = await AuthService.validateCredentials(
      'noexiste',
      'pass123'
    )

    expect(resultado).toBeNull()
    expect(bcrypt.compare).not.toHaveBeenCalled()
    expect((AuthService as any).getUserPermissionsForJWT).not.toHaveBeenCalled()
  })

  it('debe retornar null cuando la contraseña es incorrecta', async () => {
    const usuarioFalso = {
      usuario_id: 'ce0727b0-7f6e-4ca3-9a5f-68eccb6bb339',
      password_hash: '$2a$10$hashFalso'
    }
    prisma.usuarios.findUnique = vi.fn().mockResolvedValue(usuarioFalso)
    bcrypt.compare = vi.fn().mockResolvedValue(false)

    const resultado = await AuthService.validateCredentials(
      'doctor.general',
      'wrongpass'
    )

    expect(resultado).toBeNull()
    expect(bcrypt.compare).toHaveBeenCalled()
    expect((AuthService as any).getUserPermissionsForJWT).not.toHaveBeenCalled()
  })

  it('debe retornar null cuando hay error en la BD', async () => {
    prisma.usuarios.findUnique = vi
      .fn()
      .mockRejectedValue(new Error('Error de conexión'))

    const resultado = await AuthService.validateCredentials(
      'doctor.general',
      'pass123'
    )

    expect(resultado).toBeNull()
  })
})
