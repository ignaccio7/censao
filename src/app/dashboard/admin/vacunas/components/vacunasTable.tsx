import Link from 'next/link'
import { IconPencil } from '@/app/components/icons/icons'
import CustomDataTable from '@/app/components/ui/dataTable'
import { VacunasService } from '@/services/vacunas'
import { DeleteVacunaButton } from './deleteVacunaButton'

interface Props {
  search?: string
  page?: number
  numberPerPage?: number
}

export default async function VacunasTable({
  search,
  page = 1,
  numberPerPage = 8
}: Props) {
  const vacunas = await VacunasService.getAllVacunas({
    search,
    page,
    numberPerPage
  })

  console.log(vacunas)

  const columnas = [
    { campo: 'Nombre' },
    { campo: 'Fabricante' },
    { campo: 'Descripción' },
    { campo: 'Esquemas de dosis' },
    { campo: 'Acciones' }
  ]

  const contenidoTabla = vacunas.map(vacuna => [
    // Nombre
    <span key={`nombre-${vacuna.id}`} className='font-semibold text-gray-800'>
      {vacuna.nombre}
    </span>,

    // Fabricante
    <span key={`fab-${vacuna.id}`} className='text-gray-600 text-sm'>
      {vacuna.fabricante ?? '—'}
    </span>,

    // Descripción
    <span
      key={`desc-${vacuna.id}`}
      className='text-gray-500 text-sm max-w-xs truncate block'
      title={vacuna.descripcion ?? ''}
    >
      {vacuna.descripcion ?? '—'}
    </span>,

    // Esquemas — chips con cada dosis
    <div
      key={`esq-${vacuna.id}`}
      className='flex flex-wrap gap-1 w-full md:w-64'
    >
      {vacuna.esquema_dosis.length === 0 ? (
        <span className='text-gray-400 text-xs italic'>Sin esquema</span>
      ) : (
        vacuna.esquema_dosis
          .sort((a, b) => a.numero - b.numero)
          .map(d => (
            <span
              key={d.id}
              className='px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full font-medium'
              title={d.notas ?? ''}
            >
              Dosis {d.numero}
              {d.intervalo_dias > 0 ? ` · +${d.intervalo_dias}d` : ''}
            </span>
          ))
      )}
    </div>,

    // Acciones
    <div key={`acc-${vacuna.id}`} className='flex gap-2 items-center'>
      <Link
        href={`/dashboard/admin/vacunas/${vacuna.id}/editar`}
        title='Editar'
        className='px-2 py-1.5 bg-amber-400 text-white rounded-md hover:bg-amber-500 transition-colors text-sm font-medium shadow-sm'
      >
        <IconPencil />
      </Link>
      <DeleteVacunaButton id={vacuna.id} />
    </div>
  ])

  return <CustomDataTable columnas={columnas} contenidoTabla={contenidoTabla} />
}
