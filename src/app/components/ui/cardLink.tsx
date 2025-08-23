import Link from 'next/link'
import Icons from '../icons'

interface CardLinkProps {
  className?: string
  description: string
  label: string
  icon: string
  link: string
}

export default function CardLink({
  label,
  icon,
  link,
  description,
  className
}: CardLinkProps) {
  const IconComponent = Icons[icon]

  return (
    <Link
      href={link}
      className={`${className} flex flex-col gap-2 p-3 border border-gray-300 bg-white rounded-xl hover:bg-white-200 transition-colors duration-200`}
    >
      <h3 className='text-step-0 flex flex-row gap-2 items-center font-semibold'>
        {IconComponent && <IconComponent size='20' />}
        {label}
      </h3>
      <p className='text-step-0'>{description}</p>
    </Link>
  )
}
