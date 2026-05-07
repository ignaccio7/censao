import { IconPencil } from '@/app/components/icons/icons'
import CustomDataTable from '@/app/components/ui/dataTable'
import { UserssService } from '@/services/usuarios'
import Link from 'next/link'
// import { DeleteButton } from './buttonDelete'
// import { ToggleSwitch } from '@/app/components/ui/toggle-switch'
import { SwitchState } from './switchState'
import { RoleType, RoleValue } from '@/lib/constants'
import ViewUserSummary from './viewUserSummary'

interface UsersTableProps {
  search?: string
  page?: number
  numberPerPage?: number
}

export default async function UsersTable({
  search,
  page = 1,
  numberPerPage = 5
}: UsersTableProps) {
  // await de 2 segundos
  // await new Promise(resolve => setTimeout(resolve, 2000))

  const usuarios = await UserssService.getAllUsers({
    search,
    page,
    numberPerPage
  })

  console.log(search)
  console.log(usuarios)
  console.log(page)
  console.log(numberPerPage)

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

  const contenidoTabla = usuarios?.map(usuario => [
    <span key={`ci-${usuario.persona_ci}`}>{usuario.persona_ci}</span>,
    <span
      key={`nombres-${usuario.persona_ci}`}
    >{`${usuario.personas.nombres} ${usuario.personas.paterno ?? ''} ${usuario.personas.materno ?? ''}`}</span>,
    <span key={`username-${usuario.persona_ci}`}>{usuario.username}</span>,
    <span key={`rol-${usuario.persona_ci}`}>
      {usuario.usuarios_roles
        .map(ur => RoleValue[ur.roles.nombre as RoleType])
        .join(', ')}
    </span>,
    <SwitchState
      key={`estado-${usuario.usuario_id}`}
      activo={usuario.activo}
      usuarioId={usuario.usuario_id}
    />,
    <div
      key={`acciones-${usuario.persona_ci}`}
      className='flex flex-row gap-2 items-center'
    >
      <ViewUserSummary usuario={usuario} />
      {/* ---------------------  Editar --------------------- */}
      {/* Ahora esta funcionando con un param id */}
      {/* /dashboard/admin/usuarios/editar?id=${usuario.usuario_id}*/}
      {/* <Link
        href={
          {
            pathname: '/dashboard/admin/usuarios/editar',
            query: {
              id: usuario.usuario_id
            }
          }
        }
        className='px-2 py-1.5 bg-amber-400 text-white rounded-md hover:bg-amber-500 transition-colors text-sm font-medium shadow-sm cursor-pointer'
        title='Editar'
      >
        <IconPencil />
      </Link> */}
      {/* Ahora haremos lo mismo pero con un param */}
      {/* /dashboard/admin/usuarios/${usuario.usuario_id}/editar */}
      <Link
        href={`/dashboard/admin/usuarios/${usuario.usuario_id}/editar`}
        title='Editar'
        className='px-2 py-1.5 bg-amber-400 text-white rounded-md hover:bg-amber-500 transition-colors text-sm font-medium shadow-sm cursor-pointer'
      >
        <IconPencil />
      </Link>
      {/* ---------------------  Eliminar --------------------- */}
      {/* <DeleteButton id={usuario.usuario_id} /> */}
    </div>
  ])

  return (
    <CustomDataTable
      columnas={columnas}
      contenidoTabla={contenidoTabla ?? [[]]}
    />
  )
}
