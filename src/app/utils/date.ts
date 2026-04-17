import prisma from '@/lib/prisma/prisma'

export function getRangoUTCBoliviaHoy() {
  // Obtenemos la fecha actual en Bolivia como string "DD/MM/YYYY"
  const fechaStr = new Date().toLocaleDateString('es-BO', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  // "31/03/2026" → [31, 3, 2026]
  const [dia, mes, anio] = fechaStr.split('/').map(Number)

  // Bolivia es UTC-4, su medianoche (00:00 BOT) = 04:00 UTC
  const inicioUTC = new Date(Date.UTC(anio, mes - 1, dia, 4, 0, 0, 0))
  const finUTC = new Date(Date.UTC(anio, mes - 1, dia + 1, 3, 59, 59, 999))

  return { inicioUTC, finUTC }
}

function timeToSecondsFromPrisma(d: Date) {
  return d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds()
}

function nowInLaPazSeconds() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/La_Paz',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date())

  const get = (type: string) =>
    Number(parts.find(p => p.type === type)?.value ?? 0)

  return get('hour') * 3600 + get('minute') * 60 + get('second')
}

export async function getTurnoActual(): Promise<string> {
  const turnosCatalogo = await prisma.turnos_catalogo.findMany({
    select: {
      codigo: true,
      hora_inicio: true,
      hora_fin: true
    }
  })

  const currentSeconds = nowInLaPazSeconds()

  const turno = turnosCatalogo.find(t => {
    const inicio = timeToSecondsFromPrisma(t.hora_inicio)
    const fin = timeToSecondsFromPrisma(t.hora_fin)

    if (inicio <= fin) {
      return currentSeconds >= inicio && currentSeconds <= fin
    }

    return currentSeconds >= inicio || currentSeconds <= fin
  })

  console.log({ currentSeconds, turno, turnosCatalogo })

  return turno?.codigo ?? 'AM'
}
