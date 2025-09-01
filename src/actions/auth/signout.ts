'use server'
import { signOut } from '@/auth'

export async function signout() {
  return signOut({
    redirectTo: '/'
  })
}
