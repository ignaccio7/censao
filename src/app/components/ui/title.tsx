interface TitleProps {
  children?: React.ReactNode
  className?: string
}

export default function Title({ children, className }: TitleProps) {
  return (
    <h1 className={`text-left text-step-2 font-bold ${className}`}>
      {children}
    </h1>
  )
}
