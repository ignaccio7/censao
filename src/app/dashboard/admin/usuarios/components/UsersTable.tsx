import CustomDataTable from '@/app/components/ui/dataTable'
import prisma from '@/lib/prisma/prisma'

interface UsersTableProps {
  search?: string
}

export default async function UsersTable({ search }: UsersTableProps) {
  /**
   *  {
      usuario_id: 'c0ce6b09-a53c-4d5b-a879-3387e1a2b3ad',
      persona_ci: '12345678',
      username: 'paciente1',
      password_hash: '$2b$12$zHTyMP.P0HEb.BivNh.mYOqaF/A9ejtPrpaq1VnF457CHmNKyAPT6',
      activo: true,
      creado_en: new Date('2026-04-26T22:45:57.000Z'),
      creado_por: null,
      actualizado_en: new Date('2026-04-26T22:45:57.000Z'),
      actualizado_por: null,
      eliminado_en: null,
      eliminado_por: null,
      usuarios_roles: [ { roles: { nombre: 'PACIENTE' } } ],
      personas: { nombres: 'Ana Sofía', paterno: 'Rojas', materno: 'Torres' }
    },
   */

  // await de 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000))

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
    },
    where: {
      OR: [
        {
          personas: {
            OR: [
              {
                nombres: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                materno: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                paterno: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        },
        {
          username: {
            contains: search,
            mode: 'insensitive'
          }
        }
        // Para buscar por roles
        // {
        //   usuarios_roles: {
        //     some: {
        //       roles: {
        //         nombre: {
        //           contains: search,
        //           mode: 'insensitive'
        //         }
        //       }
        //     }
        //   }
        // }
      ]
    }
  })

  console.log(search)
  console.log(usuarios)

  // const handleEdit = (id: string) => {
  //   console.log(id)
  // }

  // const handleDelete = (id: string) => {
  //   console.log(id)
  // }

  const columnas = [
    { campo: 'CI' },
    { campo: 'Nombres completo' },
    { campo: 'Nombre de Usuario' },
    { campo: 'Rol' },
    { campo: 'Estado' },
    { campo: 'Acciones' }
  ]

  console.log(columnas)
  console.log(usuarios)

  const contenidoTabla = usuarios.map(usuario => [
    <span key={`ci-${usuario.persona_ci}`}>{usuario.persona_ci}</span>,
    <span
      key={`nombres-${usuario.persona_ci}`}
    >{`${usuario.personas.nombres} ${usuario.personas.paterno} ${usuario.personas.materno}`}</span>,
    <span key={`username-${usuario.persona_ci}`}>{usuario.username}</span>,
    <span key={`rol-${usuario.persona_ci}`}>
      {usuario.usuarios_roles.map(ur => ur.roles.nombre).join(', ')}
    </span>,
    <span key={`estado-${usuario.persona_ci}`}>
      {usuario.activo ? 'Activo' : 'Inactivo'}
    </span>,
    <span key={`acciones-${usuario.persona_ci}`}>
      Editar Eliminar
      {/* <button onClick={() => handleEdit(usuario.usuario_id)}>Editar</button>
      <button onClick={() => handleDelete(usuario.usuario_id)}>Eliminar</button> */}
    </span>
  ])

  return <CustomDataTable columnas={columnas} contenidoTabla={contenidoTabla} />
}
