interface IconProps {
  className?: string
  size?: string
}

const IconHeart = ({ className = '', size = '24' }: IconProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z' />
  </svg>
)

const IconSignIn = ({ className = '', size = '24' }: IconProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M9 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2' />
    <path d='M3 12h13l-3 -3' />
    <path d='M13 15l3 -3' />
  </svg>
)

const IconSearch = ({ className = '', size = '24' }: IconProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0' />
    <path d='M21 21l-6 -6' />
  </svg>
)

const IconOpenSidebar = ({ className = '', size = '24' }: IconProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M18 3a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h12zm0 2h-9v14h9a1 1 0 0 0 .993 -.883l.007 -.117v-12a1 1 0 0 0 -.883 -.993l-.117 -.007zm-4.387 4.21l.094 .083l2 2a1 1 0 0 1 .083 1.32l-.083 .094l-2 2a1 1 0 0 1 -1.497 -1.32l.083 -.094l1.292 -1.293l-1.292 -1.293a1 1 0 0 1 -.083 -1.32l.083 -.094a1 1 0 0 1 1.32 -.083z' />
  </svg>
)

const IconCloseSidebar = ({ className = '', size = '24' }: IconProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M6 21a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3zm12 -16h-8v14h8a1 1 0 0 0 1 -1v-12a1 1 0 0 0 -1 -1' />
  </svg>
)

const IconArrowDown = ({ className = '', size = '24' }: IconProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M6 9l6 6l6 -6' />
  </svg>
)

const IconArrowUp = ({ className = '', size = '24' }: IconProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M6 15l6 -6l6 6' />
  </svg>
)

export {
  IconSignIn,
  IconHeart,
  IconSearch,
  IconOpenSidebar,
  IconCloseSidebar,
  IconArrowDown,
  IconArrowUp
}
