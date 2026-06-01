'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { updatePerfilSchema } from '@/app/dashboard/perfil/schemas'

export async function updatePerfil(formData: unknown) {
  // 1. Verificar sesión — ABAC: el ID siempre viene del servidor, nunca del cliente
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'No autenticado' }
  }

  const userId = session.user.id

  // 2. Validar datos con Zod
  const parsed = updatePerfilSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Datos inválidos',
      fieldErrors: parsed.error.flatten().fieldErrors
    }
  }

  const { correo, direccion, nueva_password } = parsed.data

  // 3. Obtener el CI de la persona asociada al usuario
  const usuario = await prisma.usuarios.findUnique({
    where: { usuario_id: userId },
    select: { persona_ci: true }
  })

  if (!usuario) {
    return { success: false, error: 'Usuario no encontrado' }
  }

  // 4. Verificar unicidad de correo (si se proporcionó uno)
  if (correo && correo !== '') {
    const existingPersona = await prisma.personas.findFirst({
      where: {
        correo,
        NOT: { ci: usuario.persona_ci }
      }
    })
    if (existingPersona) {
      return {
        success: false,
        error: 'El correo electrónico ya está en uso por otro usuario',
        fieldErrors: { correo: ['El correo electrónico ya está en uso'] }
      }
    }
  }

  // 5. Preparar datos para actualizar en personas
  // Siempre incluir correo y dirección (null cuando el campo está vacío)
  const personaData = {
    correo: correo && correo !== '' ? correo : null,
    direccion: direccion && direccion !== '' ? direccion : null,
    actualizado_en: new Date(),
    actualizado_por: userId
  }

  // 6. Ejecutar transacción Prisma
  try {
    await prisma.$transaction(async tx => {
      // Actualizar persona (correo y/o dirección)
      await tx.personas.update({
        where: { ci: usuario.persona_ci },
        data: personaData
      })

      // Actualizar contraseña solo si se proporcionó una nueva
      if (nueva_password && nueva_password !== '') {
        // oxlint-disable-next-line no-magic-numbers
        const hash = await bcrypt.hash(nueva_password, 10)
        await tx.usuarios.update({
          where: { usuario_id: userId },
          data: {
            password_hash: hash,
            actualizado_en: new Date(),
            actualizado_por: userId
          }
        })
      }
    })

    revalidatePath('/dashboard/perfil')
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    return { success: false, error: 'Error interno al guardar los cambios' }
  }
}
