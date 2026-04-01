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

export function getTurnoActual(): 'AM' | 'PM' {
  const hour = parseInt(
    new Date().toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      hour: 'numeric',
      hour12: false
    })
  )
  return hour < 13 ? 'AM' : 'PM'
}
