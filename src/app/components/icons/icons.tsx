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

const IconHome = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M5 12l-2 0l9 -9l9 9l-2 0' />
    <path d='M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7' />
    <path d='M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6' />
  </svg>
)

const IconUser = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0' />
    <path d='M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2' />
  </svg>
)
const IconBell = ({ className = '', size = '24' }: IconProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M14.235 19c.865 0 1.322 1.024 .745 1.668a3.992 3.992 0 0 1 -2.98 1.332a3.992 3.992 0 0 1 -2.98 -1.332c-.552 -.616 -.158 -1.579 .634 -1.661l.11 -.006h4.471z' />
    <path d='M12 2c1.358 0 2.506 .903 2.875 2.141l.046 .171l.008 .043a8.013 8.013 0 0 1 4.024 6.069l.028 .287l.019 .289v2.931l.021 .136a3 3 0 0 0 1.143 1.847l.167 .117l.162 .099c.86 .487 .56 1.766 -.377 1.864l-.116 .006h-16c-1.028 0 -1.387 -1.364 -.493 -1.87a3 3 0 0 0 1.472 -2.063l.021 -.143l.001 -2.97a8 8 0 0 1 3.821 -6.454l.248 -.146l.01 -.043a3.003 3.003 0 0 1 2.562 -2.29l.182 -.017l.176 -.004zm0 6a1 1 0 0 0 -1 1v1h-1l-.117 .007a1 1 0 0 0 .117 1.993h1v1l.007 .117a1 1 0 0 0 1.993 -.117v-1h1l.117 -.007a1 1 0 0 0 -.117 -1.993h-1v-1l-.007 -.117a1 1 0 0 0 -.993 -.883z' />
  </svg>
)
const IconClipboard = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2' />
    <path d='M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z' />
  </svg>
)
const IconPlus = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M12.5 21h-7.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7.5' />
    <path d='M3 10h18' />
    <path d='M10 3v18' />
    <path d='M16 19h6' />
    <path d='M19 16v6' />
  </svg>
)
const IconList = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M9 6l11 0' />
    <path d='M9 12l11 0' />
    <path d='M9 18l11 0' />
    <path d='M5 6l0 .01' />
    <path d='M5 12l0 .01' />
    <path d='M5 18l0 .01' />
  </svg>
)
const IconCalendar = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z' />
    <path d='M16 3v4' />
    <path d='M8 3v4' />
    <path d='M4 11h16' />
    <path d='M11 15h1' />
    <path d='M12 15v3' />
  </svg>
)

const IconStethoscope = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M6 4h-1a2 2 0 0 0 -2 2v3.5h0a5.5 5.5 0 0 0 11 0v-3.5a2 2 0 0 0 -2 -2h-1' />
    <path d='M8 15a6 6 0 1 0 12 0v-3' />
    <path d='M11 3v2' />
    <path d='M6 3v2' />
    <path d='M20 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
  </svg>
)

const IconVaccine = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M17 3l4 4' />
    <path d='M19 5l-4.5 4.5' />
    <path d='M11.5 6.5l6 6' />
    <path d='M16.5 11.5l-6.5 6.5h-4v-4l6.5 -6.5' />
    <path d='M7.5 12.5l1.5 1.5' />
    <path d='M10.5 9.5l1.5 1.5' />
    <path d='M3 21l3 -3' />
  </svg>
)

const IconMonitor = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M3 4m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z' />
    <path d='M7 20h10' />
    <path d='M9 16v4' />
    <path d='M15 16v4' />
    <path d='M9 12v-4' />
    <path d='M12 12v-1' />
    <path d='M15 12v-2' />
    <path d='M12 12v-1' />
  </svg>
)

const IconMessage = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M10.5 19h-5.5a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4' />
    <path d='M3 7l9 6l2.983 -1.989l6.017 -4.011' />
    <path d='M18 22l3.35 -3.284a2.143 2.143 0 0 0 .005 -3.071a2.242 2.242 0 0 0 -3.129 -.006l-.224 .22l-.223 -.22a2.242 2.242 0 0 0 -3.128 -.006a2.143 2.143 0 0 0 -.006 3.071l3.355 3.296z' />
  </svg>
)

const IconUserPlus = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0' />
    <path d='M16 19h6' />
    <path d='M19 16v6' />
    <path d='M6 21v-2a4 4 0 0 1 4 -4h4' />
  </svg>
)

const IconSchedule = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4' />
    <path d='M18 14v4h4' />
    <path d='M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0' />
    <path d='M15 3v4' />
    <path d='M7 3v4' />
    <path d='M3 11h16' />
  </svg>
)

const IconMedicineBox = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M21 12.5v-4.509a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.007c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0' />
    <path d='M12 22v-10' />
    <path d='M12 12l8.73 -5.04' />
    <path d='M3.27 6.96l8.73 5.04' />
    <path d='M16 19h6' />
    <path d='M19 16v6' />
  </svg>
)

const IconTeam = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' />
    <path d='M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1' />
    <path d='M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' />
    <path d='M17 10h2a2 2 0 0 1 2 2v1' />
    <path d='M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' />
    <path d='M3 13v-1a2 2 0 0 1 2 -2h2' />
  </svg>
)

const IconSecurity = ({ className = '', size = '24' }: IconProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M11.998 2l.032 .002l.086 .005a1 1 0 0 1 .342 .104l.105 .062l.097 .076l.016 .015l.247 .21a11 11 0 0 0 7.189 2.537l.342 -.01a1 1 0 0 1 1.005 .717a13 13 0 0 1 -9.208 16.25a1 1 0 0 1 -.502 0a13 13 0 0 1 -9.209 -16.25a1 1 0 0 1 1.005 -.717a11 11 0 0 0 7.791 -2.75l.046 -.036l.053 -.041a1 1 0 0 1 .217 -.112l.075 -.023l.036 -.01a1 1 0 0 1 .12 -.022l.086 -.005zm.002 2.296l-.176 .135a13 13 0 0 1 -7.288 2.572l-.264 .006l-.064 .31a11 11 0 0 0 1.064 7.175l.17 .314a11 11 0 0 0 6.49 5.136l.068 .019z' />
  </svg>
)

const IconHistory = ({ className = '', size = '24' }: IconProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
  >
    <path stroke='none' d='M0 0h24v24H0z' fill='none' />
    <path d='M17.997 4.17a3 3 0 0 1 2.003 2.83v12a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 2.003 -2.83a4 4 0 0 0 3.997 3.83h4a4 4 0 0 0 3.98 -3.597zm-5.997 6.83a1 1 0 0 0 -1 1v1h-1a1 1 0 0 0 0 2h1v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 0 -2h-1v-1a1 1 0 0 0 -1 -1m2 -9a2 2 0 1 1 0 4h-4a2 2 0 1 1 0 -4z' />
  </svg>
)

const IconSend = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M10.5 19h-5.5a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4' />
    <path d='M3 7l9 6l2.983 -1.989l6.017 -4.011' />
    <path d='M18 22l3.35 -3.284a2.143 2.143 0 0 0 .005 -3.071a2.242 2.242 0 0 0 -3.129 -.006l-.224 .22l-.223 -.22a2.242 2.242 0 0 0 -3.128 -.006a2.143 2.143 0 0 0 -.006 3.071l3.355 3.296z' />
  </svg>
)

const IconPencil = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4' />
    <path d='M13.5 6.5l4 4' />
  </svg>
)

const IconCheck = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M5 12l5 5l10 -10' />
  </svg>
)

const IconSettings = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z' />
    <path d='M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0' />
  </svg>
)

const IconSignOut = ({ className = '', size = '24' }: IconProps) => (
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
    <path d='M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2' />
    <path d='M15 12h-12l3 -3' />
    <path d='M6 15l-3 -3' />
  </svg>
)

// const IconNotification = ({ className = '', size = '24' }: IconProps) => (
//   <svg
//     xmlns='http://www.w3.org/2000/svg'
//     width={size}
//     height={size}
//     viewBox='0 0 24 24'
//     fill='currentColor'
//     className={className}
//   >
//     <path stroke='none' d='M0 0h24v24H0z' fill='none' />
//     <path d='M14.235 19c.865 0 1.322 1.024 .745 1.668a3.992 3.992 0 0 1 -2.98 1.332a3.992 3.992 0 0 1 -2.98 -1.332c-.552 -.616 -.158 -1.579 .634 -1.661l.11 -.006h4.471z' />
//     <path d='M12 2c1.358 0 2.506 .903 2.875 2.141l.046 .171l.008 .043a8.013 8.013 0 0 1 4.024 6.069l.028 .287l.019 .289v2.931l.021 .136a3 3 0 0 0 1.143 1.847l.167 .117l.162 .099c.86 .487 .56 1.766 -.377 1.864l-.116 .006h-16c-1.028 0 -1.387 -1.364 -.493 -1.87a3 3 0 0 0 1.472 -2.063l.021 -.143l.001 -2.97a8 8 0 0 1 3.821 -6.454l.248 -.146l.01 -.043a3.003 3.003 0 0 1 2.562 -2.29l.182 -.017l.176 -.004zm0 6a1 1 0 0 0 -1 1v1h-1l-.117 .007a1 1 0 0 0 .117 1.993h1v1l.007 .117a1 1 0 0 0 1.993 -.117v-1h1l.117 -.007a1 1 0 0 0 -.117 -1.993h-1v-1l-.007 -.117a1 1 0 0 0 -.993 -.883z' />
//   </svg>
// )

// const Icon = ({ className = '', size = '24' }: IconProps) => (

// )
export {
  IconSignIn,
  IconHeart,
  IconSearch,
  IconOpenSidebar,
  IconCloseSidebar,
  IconArrowDown,
  IconArrowUp,
  IconHome,
  IconUser,
  IconBell,
  IconClipboard,
  IconPlus,
  IconList,
  IconCalendar,
  IconMessage,
  IconStethoscope,
  IconHistory,
  // IconNotification,
  IconVaccine,
  IconMonitor,
  IconUserPlus,
  IconSchedule,
  IconMedicineBox,
  IconTeam,
  IconSecurity,
  IconSend,
  IconPencil,
  IconCheck,
  IconSettings,
  IconSignOut
}
