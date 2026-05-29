import Title from '@/app/components/ui/title'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { Roles } from '@/app/api/lib/constants'
import CitasTable from './components/CitasTable'

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) return notFound()

  const userRole = session.user.role

  // Solo ENFERMERIA y DOCTOR_GENERAL (y ADMIN para ver) tienen acceso a esta vista
  const allowedRoles = [
    Roles.ENFERMERIA,
    Roles.DOCTOR_GENERAL,
    Roles.ADMINISTRADOR
  ]
  if (!allowedRoles.includes(userRole as any)) {
    return notFound()
  }

  const titlePrefix = userRole === Roles.ENFERMERIA ? 'Vacunas' : 'Mis Citas'

  return (
    <section className='citas-atencion font-secondary pb-20'>
      <Title className='mb-2'>Citas programadas</Title>
      <p className='text-gray-500 mb-6'>{titlePrefix} de la semana actual.</p>

      <div className='w-full h-auto max-w-5xl'>
        <CitasTable />
      </div>
    </section>
  )
}
