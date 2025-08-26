interface TitleProps {
  children?: React.ReactNode
  className?: string
  subtitle?: string
}

export default function Title({ children, className, subtitle }: TitleProps) {
  return (
    <h1
      className={`text-left text-step-2 font-bold flex flex-col gap-0 leading-5 ${className}`}
    >
      {children}
      <small className='text-gray-600 font-normal text-step-0'>
        {subtitle}
      </small>
    </h1>
  )
}
