'use client'

// import CustomDataTable from '@/app/components/ui/dataTable'
import { Usuario } from '../interfaces'
// import Pagination from '@/app/components/ui/pagination'

interface UsersTableProps {
  data: Usuario[]
}

export default function UsersTable({ data }: UsersTableProps) {
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
  console.log(data)

  // const contenidoTabla = data.map(usuario => [
  //   <span>{usuario.persona_ci}</span>,
  //   <span>{`${usuario.personas.nombres} ${usuario.personas.paterno} ${usuario.personas.materno}`}</span>,
  //   <span>{usuario.username}</span>,
  //   <span>{usuario.usuarios_roles.map(ur => ur.roles.nombre).join(', ')}</span>,
  //   <span>{usuario.activo ? 'Activo' : 'Inactivo'}</span>,
  //   <span>
  //     <button onClick={() => handleEdit(usuario.usuario_id)}>Editar</button>
  //     <button onClick={() => handleDelete(usuario.usuario_id)}>Eliminar</button>
  //   </span>
  // ])

  return (
    <>
      <section className='filters'>
        <search>
          <input
            type='text'
            name='search'
            id='search'
            placeholder='Buscar por nombre o usuario '
          />
        </search>
      </section>
      {/* <CustomDataTable columnas={columnas} contenidoTabla={contenidoTabla} /> */}
      {/* <Pagination /> */}
    </>
  )
}
