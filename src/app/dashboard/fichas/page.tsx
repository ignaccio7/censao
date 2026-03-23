// oxlint-disable jsx-key
'use client'
import Title from '@/app/components/ui/title'
import { useFichas } from '@/app/services/fichas'
import useUser from '@/hooks/useUser'
import { Roles } from '@/app/api/lib/constants'
import DashboardDoctorFichas from './sections/dashboard/doctor-fichas'
import DashboardDoctorGeneral from './sections/dashboard/doctor-general'

export default function PageFichas() {
  // const {
  //   read,
  //   create,
  //   update
  //   // delete: deleteFicha
  // } = useProfileRoutes()
  const { user } = useUser()
  const { role } = user

  // console.log(read)
  // console.log(create)
  // console.log(update)
  // console.log(user)

  const { fichas } = useFichas()
  console.log('La data es:')
  console.log(fichas)

  const subtitle =
    Roles.DOCTOR_GENERAL === role
      ? 'Puedes dar seguimiento a los pacientes o solo atenderlos'
      : 'Configura las fichas de los pacientes'

  return (
    <main>
      <Title
        className='w-fit'
        subtitle={subtitle}
        badge={
          <span className='px-4 py-2 bg-primary-200 text-primary-700 font-semibold rounded-full text-step-0 border border-primary-300'>
            Turno: Mañana
          </span>
        }
      >
        Gestión de fichas
      </Title>

      {(Roles.DOCTOR_FICHAS === role || Roles.ADMINISTRADOR === role) && (
        <DashboardDoctorFichas fichas={fichas} />
      )}

      {Roles.DOCTOR_GENERAL === role && (
        <DashboardDoctorGeneral fichas={fichas} />
      )}
    </main>
  )
}
