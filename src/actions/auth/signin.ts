'use server'
import { signIn } from '@/auth'

export async function signin(formData: FormData) {
  console.log('signin')
  try {
    await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirect: false
    })
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
