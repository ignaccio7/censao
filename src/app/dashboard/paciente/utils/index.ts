const getColorByStatus = (status: string) => {
  switch (status) {
    case 'pendiente': {
      return 'bg-sky-500'
    }
    case 'completado': {
      return 'bg-green-500'
    }
    case 'rechazado': {
      return 'bg-amber-500'
    }
    case 'en proceso': {
      return 'bg-yellow-500'
    }
    default: {
      return 'bg-gray-500'
    }
  }
}

export { getColorByStatus }
