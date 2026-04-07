'use client'

import useUser from '@/hooks/useUser'
import DoctorTreatments from './component/doctor-treatments'

export default function Page() {
  const { user } = useUser()

  if (!user?.role) return null

  return (
    <main>
      <DoctorTreatments />
    </main>
  )
}
