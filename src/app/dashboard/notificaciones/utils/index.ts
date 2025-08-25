const getColorByNotification = (type: string) => {
  switch (type) {
    case 'email': {
      return {
        border: 'border-amber-600',
        bg: 'bg-amber-600'
      }
    }
    case 'system': {
      return {
        border: 'border-black-600',
        bg: 'bg-black-600'
      }
    }
    default: {
      return {
        border: 'border-gray-600',
        bg: 'bg-gray-600'
      }
    }
  }
}

export { getColorByNotification }
