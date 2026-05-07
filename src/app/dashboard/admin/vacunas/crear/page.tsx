import Title from '@/app/components/ui/title'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import FormVacuna from '../components/formVacuna'

export default async function CrearVacunaPage() {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/vacunas',
    'POST'
  )
  if (!validation.success) redirect('/dashboard')

  return (
    <main className='pb-8'>
      <div className='flex items-center gap-2 mb-1'>
        <Title subtitle='Registra la vacuna y define cuántas dosis tiene y en qué intervalos.'>
          Crear vacuna
        </Title>
      </div>
      <FormVacuna />
    </main>
  )
}
