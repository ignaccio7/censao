import CardLink from '../components/ui/cardLink'
import Title from '../components/ui/title'

const permissions = [
  {
    icon: 'principal',
    label: 'Principal',
    options: [
      {
        description: 'Bienvenid@ a la aplicación de Gestión de Salud',
        icon: 'home',
        label: 'Inicio',
        link: '/dashboard'
      },
      {
        description: 'Permite ver el perfil del usuario',
        icon: 'user',
        label: 'Perfil',
        link: '/dashboard/perfil'
      },
      {
        description: 'Puedes ver las notificaciones programadas para ti',
        icon: 'bell',
        label: 'Notificaciones',
        link: '/dashboard/notificaciones'
      }
    ]
  },
  // Módulo para Doctor de Fichas
  {
    icon: 'clipboard',
    label: 'Gestión de Fichas',
    options: [
      {
        description: 'Permite registrar nuevas fichas',
        icon: 'plus',
        label: 'Registrar Nueva Ficha',
        link: '/fichas/registrar'
      },
      {
        description: 'Permite ver los registros de las fichas',
        icon: 'list',
        label: 'Listado de Fichas',
        link: '/fichas/listado'
      },
      {
        description:
          'Permite visualizar los registros de las fichas en un calendario interactivo',
        icon: 'calendar',
        label: 'Reorganizar Fichas',
        link: '/fichas/reorganizar'
      },
      {
        description: 'Permite ver los chats que se hizo con los pacientes',
        icon: 'message',
        label: 'Chat con Pacientes',
        link: '/fichas/chat'
      }
    ]
  }
]

export default function Dashboard() {
  return (
    <div className='inicio font-secondary'>
      <Title>Bienvenid@ Juan Perez</Title>
      <p className=''>Tienes acceso a los siguientes modulos</p>
      {permissions.map(permission => (
        <div className='content-submenu' key={permission.label}>
          <h2 className='font-semibold text-step-0 my-2'>{permission.label}</h2>
          <div className='content-cards grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {permission.options.map(option => (
              <CardLink
                key={option.label}
                description={option.description}
                label={option.label}
                icon={option.icon}
                link={option.link}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
