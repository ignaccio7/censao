import Title from '@/app/components/ui/title'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import UsersTable from './components/UsersTable'
import { Usuario } from './interfaces'

export default async function UsuariosPage() {
  // Validar que el usuario tenga permisos para acceder a esta pagina
  const validation = await AuthService.validateApiPermission(
    '/api/admin/usuarios',
    'GET'
  )

  if (!validation.success) {
    redirect('/dashboard')
  }

  const usuarios = await prisma.usuarios.findMany({
    include: {
      usuarios_roles: {
        select: {
          roles: {
            select: {
              nombre: true
            }
          }
        }
      },
      personas: {
        select: {
          nombres: true,
          paterno: true,
          materno: true
        }
      }
    }
  })

  console.log(usuarios)

  return (
    <main className='pb-8'>
      <Title subtitle='Gestiona los usuarios que se han registrado en el sistema.'>
        Usuarios del sistema
      </Title>

      <UsersTable data={usuarios as Usuario[]} />
    </main>
  )
}
