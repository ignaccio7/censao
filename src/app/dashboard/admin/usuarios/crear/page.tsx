// src/app/dashboard/admin/usuarios/crear/page.tsx
import Title from '@/app/components/ui/title'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import FormCreateUser from '../components/crear/formCreateUser'
import prisma from '@/lib/prisma/prisma'

export default async function CrearUsuarioPage() {
  // Validar permiso para crear usuarios
  const validation = await AuthService.validateApiPermission(
    '/api/admin/usuarios',
    'POST'
  )

  if (!validation.success) {
    redirect('/dashboard')
  }

  // Traer roles activos para el selector del Step 3
  const roles = await prisma.roles.findMany({
    where: { eliminado_en: null },
    select: { id: true, nombre: true, descripcion: true },
    orderBy: { nombre: 'asc' }
  })

  return (
    <main className='pb-8'>
      <Title subtitle='Completa los pasos para registrar un nuevo usuario en el sistema.'>
        Crear usuario
      </Title>

      <section className='max-w-2xl mx-auto'>
        <FormCreateUser roles={roles} />
      </section>
    </main>
  )
}
