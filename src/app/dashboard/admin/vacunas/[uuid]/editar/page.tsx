import Title from '@/app/components/ui/title'
import AuthService from '@/lib/services/auth-service'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { IconChevronLeft } from '@/app/components/icons/icons'
import FormVacuna from '../../components/formVacuna'
import { VacunasService } from '@/services/vacunas'

interface Props {
  params: { uuid: string }
}

export default async function EditarVacunaPage({ params }: Props) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/vacunas/:uuid',
    'PATCH'
  )
  if (!validation.success) redirect('/dashboard')

  const vacuna = await VacunasService.getVacunaById(params.uuid)
  if (!vacuna) notFound()

  // Pre-poblar defaultValues con los datos actuales
  const defaultValues = {
    nombre: vacuna.nombre,
    descripcion: vacuna.descripcion ?? '',
    fabricante: vacuna.fabricante ?? '',
    esquemas: vacuna.esquema_dosis.map(d => ({
      numero: d.numero,
      intervalo_dias: d.intervalo_dias,
      edad_min_meses: d.edad_min_meses ?? null,
      notas: d.notas ?? ''
    }))
  }

  return (
    <main className='pb-8'>
      <div className='flex items-center gap-2 mb-1'>
        <Link
          href='/dashboard/admin/vacunas'
          className='text-gray-400 hover:text-gray-600 transition-colors'
        >
          <IconChevronLeft />
        </Link>
        <Title subtitle={`Modificando: ${vacuna.nombre}`}>Editar vacuna</Title>
      </div>
      <FormVacuna vacunaId={params.uuid} defaultValues={defaultValues} />
    </main>
  )
}
