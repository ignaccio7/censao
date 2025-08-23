// import Image from "next/image";

import CampaignsSection from './components/campaignsSection'
import Footer from './components/footer'
import HeroSection from './components/heroSection'
import TrustSection from './components/trustSection'

export default function Home() {
  return (
    <>
      <section className='principal container min-h-[var(--size-window)]'>
        <HeroSection />
        <CampaignsSection />
        <TrustSection />
      </section>

      <Footer />
    </>
  )
}
