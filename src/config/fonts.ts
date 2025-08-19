import {
  Raleway as fontRaleway,
  Montserrat_Alternates as fontMontserrat
} from 'next/font/google'

const publicFont = fontMontserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '700', '900']
})

const systemFont = fontRaleway({
  subsets: ['latin'],
  variable: '--font-raleway'
})

export { publicFont, systemFont }
