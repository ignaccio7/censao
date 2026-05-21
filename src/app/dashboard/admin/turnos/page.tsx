import Title from '@/app/components/ui/title'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import TurnosTable from './components/turnosTable'
import SkeletonTable from '@/app/components/ui/skeletons/skeletonTable'

export default async function TurnosPage() {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/turnos',
    'GET'
  )
  if (!validation.success) redirect('/dashboard')

  return (
    <main className='pb-8'>
      <Title subtitle='Configura los horarios de los turnos del centro de salud.'>
        Horarios y turnos
      </Title>

      <Suspense fallback={<SkeletonTable columns={4} rows={3} />}>
        <TurnosTable />
      </Suspense>
    </main>
  )
}
