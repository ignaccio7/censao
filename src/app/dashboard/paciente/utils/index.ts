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

export { getColorByStatus }
