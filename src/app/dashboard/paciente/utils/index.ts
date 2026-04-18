import { StateTreatment } from '@/lib/constants'

const getColorByStatus = (status: string) => {
  switch (status) {
    case 'pendiente': {
      return 'bg-sky-600'
    }
    case 'completado': {
      return 'bg-green-600'
    }
    case 'rechazado': {
      return 'bg-red-500'
    }
    case 'en proceso': {
      return 'bg-yellow-600'
    }
    default: {
      return 'bg-gray-600'
    }
  }
}

const getColorStatusBadgeTreatment = (status: string) => {
  console.log(status)

  switch (status) {
    case StateTreatment.EN_CURSO: {
      return 'bg-yellow-500'
    }
    case StateTreatment.COMPLETADA: {
      return 'bg-green-500'
    }
    case StateTreatment.INCOMPLETA: {
      return 'bg-red-500'
    }
    default: {
      return 'bg-gray-600'
    }
  }
}

export { getColorByStatus, getColorStatusBadgeTreatment }
