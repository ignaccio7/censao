import Link from 'next/link'
import Icons from '../../icons'
interface Option {
  label: string
  icon: string
  link: string
  className?: string
}

export default function NavLink({ label, link, icon, className }: Option) {
  const IconComponent = Icons[icon]

  return (
    <Link
      href={link}
      className={`flex items-center gap-1 w-full text-left px-2 py-2 hover:bg-secondary-600 rounded ${className}`}
    >
      {IconComponent && <IconComponent size='20' />}
      {label}
    </Link>
  )
}
