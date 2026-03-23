interface TitleProps {
  children?: React.ReactNode
  className?: string
  subtitle?: string
  badge?: React.ReactNode
}

export default function Title({
  children,
  className,
  subtitle,
  badge
}: TitleProps) {
  return (
    <header className='w-full flex justify-between items-center gap-4 mb-4'>
      <h1
        className={`text-left text-step-2 font-bold flex flex-col gap-0 leading-5 ${className}`}
      >
        {children}
        <small className='text-gray-600 font-normal text-step-0'>
          {subtitle}
        </small>
      </h1>
      <div className='badge'>{badge}</div>
    </header>
  )
}
