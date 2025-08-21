// oxlint-disable sort-keys
import {
  IconList,
  IconCalendar,
  IconMessage,
  IconStethoscope,
  IconHome,
  IconUser,
  IconBell,
  IconClipboard,
  IconPlus,
  IconHistory,
  IconVaccine,
  IconMonitor,
  IconUserPlus,
  IconSchedule,
  IconMedicineBox,
  IconTeam,
  IconSecurity,
  IconSend
} from '@/app/components/icons/icons'

const Icons: Record<string, React.FC<{ className?: string; size?: string }>> = {
  home: IconHome,
  user: IconUser,
  bell: IconBell,
  clipboard: IconClipboard,
  plus: IconPlus,
  list: IconList,
  calendar: IconCalendar,
  message: IconMessage,
  stethoscope: IconStethoscope,
  vaccine: IconVaccine,
  monitor: IconMonitor,
  userPlus: IconUserPlus,
  schedule: IconSchedule,
  medicineBox: IconMedicineBox,
  team: IconTeam,
  security: IconSecurity,
  history: IconHistory,
  send: IconSend
}

export default Icons
