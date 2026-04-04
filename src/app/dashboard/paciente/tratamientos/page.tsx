'use client'

import useUser from '@/hooks/useUser'
import { Roles, RoleGroups } from '@/lib/constants'
import PatientTreatments from './dashboard/patient-treatments'
import DoctorTreatments from './dashboard/doctor-treatments'
import Title from '@/app/components/ui/title'

export default function Page() {
  const { user } = useUser()

  if (!user?.role) return null

  const { role } = user

  // Check if role is a doctor
  const isDoctor = RoleGroups.DOCTOR.includes(role as any)

  return (
    <main>
      {role === Roles.PACIENTE && <PatientTreatments />}

      {isDoctor && <DoctorTreatments />}

      {!isDoctor && role !== Roles.PACIENTE && (
        <section className='mt-8'>
          <Title className='text-red-500'>
            No tienes acceso a los tratamientos
          </Title>
        </section>
      )}
    </main>
  )
}
