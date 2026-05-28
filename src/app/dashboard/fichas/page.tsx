import { getTurnoActual } from '@/app/utils/date'
import FichasClient from './fichas-client'

export const dynamic = 'force-dynamic' // Para que no cachee el turno

export default async function PageFichas() {
  const turno = await getTurnoActual()

  return <FichasClient turnoActual={turno} />
}
