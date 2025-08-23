import useAside from '@/hooks/useAside'
import { useEffect, useRef } from 'react'

interface AsideProps {
  children?: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}

export default function Aside({
  children,
  title,
  subtitle,
  className
}: AsideProps) {
  const asideRef = useRef<HTMLDivElement>(null)
  const { aside, closeAside } = useAside()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        aside &&
        asideRef.current &&
        !asideRef.current.contains(event?.target as Node)
      ) {
        closeAside()
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
    // oxlint-disable-next-line exhaustive-deps
  }, [aside])

  return (
    <div
      ref={asideRef}
      className={`fixed z-40 min-w-3xs bg-white-100 shadow-2xl top-[var(--size-header)] right-0 h-[var(--size-window)] px-2 py-4 max-w-xs transition-transform duration-200 ease-in-out
    ${className} ${aside ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <h2 className='notification-title flex flex-col font-secondary font-bold text-step-1'>
        {title}
        <small className='notification-subtitle text-step-0 font-normal text-gray-800'>
          {subtitle}
        </small>
      </h2>
      <div className='notification-content flex flex-col gap-2 mt-2 text-step-0'>
        {children}
      </div>
    </div>
  )
}
