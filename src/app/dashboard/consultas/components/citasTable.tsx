import CustomDataTable from '@/app/components/ui/dataTable'

// ── Sub-componente: tabla de citas compacta ──────────────────────────
function CitaEstadoBadge({ estado }: { estado: string }) {
  const cls =
    CITA_ESTADO_STYLES[estado] ?? 'border-gray-300 bg-gray-50 text-gray-600'
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${cls}`}
    >
      {estado}
    </span>
  )
}

function formatDateLong(date: Date | string) {
  return new Date(date).toLocaleDateString('es-BO', {
    timeZone: 'America/La_Paz',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ── Sub-componente: badge de estado de cita ──────────────────────────
const CITA_ESTADO_STYLES: Record<string, string> = {
  PENDIENTE: 'border-amber-300 bg-amber-50 text-amber-700',
  ABSORBIDA: 'border-gray-300 bg-gray-50 text-gray-500 line-through',
  CANCELADA: 'border-red-300 bg-red-50 text-red-600',
  GENERADA: 'border-blue-300 bg-blue-50 text-blue-700',
  VENCIDA: 'border-orange-300 bg-orange-50 text-orange-600'
}

export default function CitasTable({ citas }: { citas: any[] }) {
  const columnas = [
    { campo: 'Fecha' },
    { campo: 'Tipo' },
    { campo: 'Estado' },
    { campo: 'Observaciones' }
  ]

  const contenido = citas.map(cita => [
    <span
      key={`fec-${cita.id}`}
      className='font-medium text-gray-800 whitespace-nowrap'
    >
      {formatDateLong(cita.fecha_programada)}
    </span>,
    <span key={`tip-${cita.id}`} className='text-gray-600'>
      {cita.tipo}
    </span>,
    <CitaEstadoBadge key={`est-${cita.id}`} estado={cita.estado} />,
    <span
      key={`obs-${cita.id}`}
      className='text-gray-600 truncate max-w-[200px]'
      title={cita.observaciones || ''}
    >
      {cita.observaciones || '—'}
    </span>
  ])

  return (
    <CustomDataTable
      columnas={columnas}
      contenidoTabla={contenido}
      numeracion
      contenidoCuandoVacio={
        <p className='text-center py-4 text-sm text-gray-500'>
          No hay citas registradas.
        </p>
      }
    />
  )
}
