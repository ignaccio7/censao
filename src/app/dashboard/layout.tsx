import { systemFont } from '@/config/fonts'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <div className={`${systemFont.variable} antialiased`}>{children}</div>
}
