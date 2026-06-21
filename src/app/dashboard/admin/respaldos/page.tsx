// src/app/dashboard/admin/respaldos/page.tsx
import { redirect } from 'next/navigation'
import AuthService from '@/lib/services/auth-service'
import Title from '@/app/components/ui/title'
import BackupSection from './components/backupSection'
import RestoreSection from './components/restoreSection'

export const metadata = {
  title: 'Respaldos — Censao',
  description:
    'Módulo de respaldos del sistema. Permite generar, descargar y restaurar la base de datos completa.'
}

export default async function RespaldosPage() {
  // ── Validación de acceso: solo ADMINISTRADOR ──────────────────────────────
  const validation = await AuthService.validateApiPermission(
    '/api/admin/respaldos/generar',
    'POST'
  )

  if (!validation.success) {
    redirect('/dashboard')
  }

  return (
    <section className='admin-respaldos font-secondary'>
      <Title className='mb-4'>Gestión de Respaldos</Title>

      <div className='flex flex-col gap-6'>
        {/* ── Sección 1: Generar respaldo ─────────────────────────────────── */}
        <BackupSection />

        {/* ── Sección 2: Restaurar respaldo ───────────────────────────────── */}
        <RestoreSection />
      </div>
    </section>
  )
}
