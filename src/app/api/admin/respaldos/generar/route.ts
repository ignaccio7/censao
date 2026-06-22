// src/app/api/admin/respaldos/generar/route.ts
import AuthService from '@/lib/services/auth-service'
import { BackupsService } from '@/services/respaldos'
import { NextResponse } from 'next/server'

// ─── POST /api/admin/respaldos/generar ────────────────────────────────────────
export async function POST() {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/respaldos/generar',
    'POST'
  )

  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 403 }
    )
  }

  const username = validation.data?.username ?? 'admin'

  try {
    const backup = await BackupsService.generarRespaldo(username)

    // Serializar con JSON.stringify estándar.
    // Las fechas de Prisma son objetos Date → toISOString() automático en JSON.stringify.
    // Se preservan en UTC tal cual están en PostgreSQL.
    console.log(backup)
    // const backupData = structuredClone(backup)

    // const jsonString = JSON.stringify(backupData, null, 2)
    const jsonString = JSON.stringify(
      backup,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2
    )

    // Nombre legible en hora boliviana para el Content-Disposition
    const fechaBO = new Date()
      .toLocaleString('es-BO', {
        timeZone: 'America/La_Paz',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      .replace(/[/: ,]/g, '-')

    const filename = `censao-respaldo-${fechaBO}.json`

    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(jsonString).toString()
      }
    })
  } catch (error) {
    console.error('[POST /api/admin/respaldos/generar]', error)
    return NextResponse.json(
      { success: false, message: 'Error al generar el respaldo' },
      { status: 500 }
    )
  }
}
