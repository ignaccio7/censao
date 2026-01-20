import {
  IconClock,
  IconStethoscope,
  IconAlertTriangle
} from '@/app/components/icons/icons'
import { RECORD_TYPES, RecordType } from '@/lib/constants'

export function StatusBadge({ status }: { status: RecordType }) {
  const statusConfig = {
    [RECORD_TYPES.PENDIENTE]: {
      icon: IconClock,
      color: 'border-emerald-500 bg-emerald-500/20 text-emerald-700',
      iconColor: 'text-emerald-500'
    },
    [RECORD_TYPES.ATENCION]: {
      icon: IconStethoscope,
      color: 'border-green-500 bg-green-500/20 text-green-700',
      iconColor: 'text-green-500'
    },
    [RECORD_TYPES.ATENDIDO]: {
      icon: IconClock,
      color: 'border-neutral-500 bg-neutral-500/20 text-neutral-700',
      iconColor: 'text-neutral-500'
    },
    [RECORD_TYPES.CANCELADO]: {
      icon: IconClock,
      color: 'border-yellow-500 bg-yellow-500/20 text-yellow-700',
      iconColor: 'text-yellow-500'
    },
    [RECORD_TYPES.URGENTE]: {
      icon: IconAlertTriangle,
      color: 'border-red-600 bg-red-600/20 text-red-800',
      iconColor: 'text-red-600'
    }
  }

  const config = statusConfig[status] || {
    icono: IconAlertTriangle,
    color: 'border-gray-500 bg-gray-500/20 text-gray-700',
    iconColor: 'text-gray-500'
  }

  const StatusIcon = config.icon

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-primary-500 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden ${config.color}`}
    >
      <StatusIcon className={config.iconColor} />
      {status}
    </span>
  )
}
