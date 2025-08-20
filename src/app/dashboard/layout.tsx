import { secondaryFont } from '@/config/fonts'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${secondaryFont.variable} antialiased`}>{children}</div>
  )
}
