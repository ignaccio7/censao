import AuthService from '@/lib/services/auth-service'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma/prisma'
import Title from '@/app/components/ui/title'
import Link from 'next/link'
import { IconChevronLeft } from '@/app/components/icons/icons'
import FormEditUser from '../../components/editar/formEditUser'

interface Props {
  params: { uuid: string }
}

export default async function EditarUsuarioPage({ params }: Props) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/usuarios/:uuid',
    'PATCH'
  )
  if (!validation.success) redirect('/dashboard')

  console.log(params.uuid)
  let uuidParam = params.uuid

  const usuario = await prisma.usuarios.findUnique({
    where: { usuario_id: uuidParam, eliminado_en: null },
    include: {
      personas: true,
      usuarios_roles: {
        where: { eliminado_en: null },
        include: { roles: true }
      }
    }
  })

  if (!usuario) notFound()

  console.log(usuario)

  const rolActual = usuario.usuarios_roles[0]?.roles
  const ci = usuario.persona_ci
  const rolNombre = rolActual?.nombre?.toUpperCase() ?? ''

  // Cargar datos extra según el rol actual
  let extra: Record<string, string> = {}

  if (rolNombre.includes('DOCTOR')) {
    const doctor = await prisma.doctores.findUnique({
      where: { doctor_id: ci }
    })
    extra.matricula = doctor?.matricula ?? ''
  }

  if (rolNombre === 'PACIENTE') {
    const paciente = await prisma.pacientes.findUnique({
      where: { paciente_id: ci }
    })
    extra.fecha_nacimiento = paciente?.fecha_nacimiento
      ? paciente.fecha_nacimiento.toISOString().split('T')[0]
      : ''
    extra.sexo = paciente?.sexo ?? ''
    extra.grupo_sanguineo = paciente?.grupo_sanguineo ?? ''
  }

  const roles = await prisma.roles.findMany({
    where: { eliminado_en: null },
    select: { id: true, nombre: true, descripcion: true },
    orderBy: { nombre: 'asc' }
  })

  // defaultValues pre-poblados para el form
  const defaultValues = {
    ci: usuario.persona_ci,
    nombres: usuario.personas.nombres,
    paterno: usuario.personas.paterno ?? '',
    materno: usuario.personas.materno ?? '',
    correo: usuario.personas.correo ?? '',
    telefono: usuario.personas.telefono ?? '',
    direccion: usuario.personas.direccion ?? '',
    username: usuario.username,
    password: '',
    confirmar_password: '',
    rol_id: rolActual?.id ?? '',
    matricula: '',
    fecha_nacimiento: '',
    sexo: '' as any,
    grupo_sanguineo: '' as any,
    ...extra
  }

  return (
    <main className='pb-8'>
      <div className='flex items-center gap-2 mb-1'>
        <Link
          href='/dashboard/admin/usuarios'
          className='text-gray-400 hover:text-gray-600 transition-colors'
        >
          <IconChevronLeft />
        </Link>
        <Title subtitle={`${usuario.username} · CI: ${ci}`}>
          Editar usuario
        </Title>
      </div>

      <section className='w-full'>
        <FormEditUser
          usuarioId={usuario.usuario_id}
          defaultValues={defaultValues}
          ci={ci}
          username={usuario.username}
          roles={roles}
        />
      </section>
    </main>
  )
}
