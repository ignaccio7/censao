import Link from 'next/link'
import Icons from '../../icons'
import { usePathname } from 'next/navigation'
interface Option {
  label: string
  icon: string
  link: string
  className?: string
}

export default function NavLink({ label, link, icon, className }: Option) {
  const IconComponent = Icons[icon]
  const pathname = usePathname()
  const isActive = pathname === link

  return (
    <Link
      href={link}
      className={`flex items-center gap-1 w-[95%] text-left px-2 py-2 hover:bg-secondary-600 rounded-md ${isActive ? 'bg-secondary-600' : ''} ${className}`}
    >
      {IconComponent && <IconComponent size='20' />}
      {label}
    </Link>
  )
}
