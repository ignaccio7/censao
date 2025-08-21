import { IconHeart } from '../icons/icons'

interface LogoProps {
  children?: React.ReactNode
}

export default function Logo({ children }: LogoProps) {
  return (
    <div className='logo primary-font font-semibold flex gap-0 items-center text-step-1 text-primary-600 cursor-pointer'>
      {children}
      CENSA
      <IconHeart
        size='20'
        className='p-1 border border-white rounded-full text-white bg-primary-600'
      />
    </div>
  )
}
