import Title from '@/app/components/ui/title'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import FormCrearPaciente from './FormCrearPaciente'

export default async function CrearPacientePage() {
  const validation = await AuthService.validateApiPermission(
    '/api/atencion/pacientes',
    'GET'
  )

  if (!validation.success) {
    redirect('/dashboard')
  }

  return (
    <main className='pb-8'>
      <Title subtitle='Registra un nuevo paciente en el sistema. Se creará automáticamente una cuenta con el CI como usuario y contraseña.'>
        Registrar Paciente
      </Title>

      <section className='w-full mt-4'>
        <FormCrearPaciente />
      </section>
    </main>
  )
}
