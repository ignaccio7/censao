import {
  IconClock,
  IconStethoscope,
  IconAlertTriangle,
  IconUserCheck,
  IconCheckupList
} from '@/app/components/icons/icons'
import { StateRecord, StateRecordType, StateRecordValue } from '@/lib/constants'

export function StatusBadge({ status }: { status: StateRecordType }) {
  const statusConfig: Record<
    string,
    { icon: React.ComponentType<any>; color: string; iconColor: string }
  > = {
    [StateRecord.ADMISION]: {
      icon: IconClock,
      color: 'border-slate-400 bg-slate-100 text-slate-600',
      iconColor: 'text-slate-400'
    },
    [StateRecord.ENFERMERIA]: {
      icon: IconStethoscope,
      color: 'border-green-500 bg-green-500/20 text-green-700',
      iconColor: 'text-green-500'
    },
    [StateRecord.EN_ESPERA]: {
      icon: IconCheckupList,
      color: 'border-blue-500 bg-blue-500/20 text-blue-700',
      iconColor: 'text-blue-500'
    },
    [StateRecord.ATENDIENDO]: {
      icon: IconUserCheck,
      color: 'border-purple-600 bg-purple-600/20 text-purple-700',
      iconColor: 'text-purple-600'
    },
    [StateRecord.ATENDIDA]: {
      icon: IconClock,
      color: 'border-neutral-500 bg-neutral-500/20 text-neutral-700',
      iconColor: 'text-neutral-500'
    },
    [StateRecord.CANCELADA]: {
      icon: IconAlertTriangle,
      color: 'border-yellow-500 bg-yellow-500/20 text-yellow-700',
      iconColor: 'text-yellow-500'
    }
  }

  const config = statusConfig[status] ?? {
    icon: IconAlertTriangle,
    color: 'border-gray-500 bg-gray-500/20 text-gray-700',
    iconColor: 'text-gray-500'
  }

  const StatusIcon = config.icon

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-primary-500 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden ${config.color}`}
    >
      <StatusIcon className={config.iconColor} />
      {StateRecordValue[status] ?? status}
    </span>
  )
}
