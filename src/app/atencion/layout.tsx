import QueryProvider from '../components/ui/tanstack/query-provider'

export const metadata = {
  title: 'Pantalla de Atención — Centro de Salud Alto Obrajes',
  description:
    'Pantalla pública de atención del Centro de Salud Alto Obrajes. Muestra el estado de las fichas por especialidad en tiempo real.'
}

export default function AtencionLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <QueryProvider>{children}</QueryProvider>
}
