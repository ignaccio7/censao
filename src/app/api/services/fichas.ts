// oxlint-disable no-extraneous-class
import { useQuery } from '@tanstack/react-query'
import apiClient from './client'

export default class FichasService {
  static async getFichas() {
    return useQuery({
      queryKey: ['fichas'],
      queryFn: async () => {
        const response = await apiClient.get('/fichas')
        return response.data
      },
      staleTime: 5 * 60 * 1000
    })
  }
}
