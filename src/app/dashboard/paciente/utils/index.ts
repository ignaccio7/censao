import { StateTreatment } from '@/lib/constants'

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

export { getColorStatusBadgeTreatment }
