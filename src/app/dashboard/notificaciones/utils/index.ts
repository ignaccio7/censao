const getColorByNotification = (type: string) => {
  switch (type) {
    case 'system': {
      return 'black-700'
    }
    case 'email': {
      return 'amber-600'
    }
    default: {
      return 'black-900'
    }
  }
}

export { getColorByNotification }
