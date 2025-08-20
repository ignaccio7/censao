import {
  Raleway as fontRaleway,
  Montserrat_Alternates as fontMontserrat
} from 'next/font/google'

export const primaryFont = fontMontserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '700', '900'],
  display: 'swap'
})

export const secondaryFont = fontRaleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap'
})
