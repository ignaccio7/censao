'use client'

import useUser from '@/hooks/useUser'
import DoctorConsultas from './component/doctor-consultas'

export default function Page() {
  const { user } = useUser()

  if (!user?.role) return null

  return (
    <main>
      <DoctorConsultas />
    </main>
  )
}
