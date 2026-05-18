'use client'

import { RoleType, RoleValue } from '@/lib/constants'
import { useSession } from 'next-auth/react'

export default function useUser() {
  const { data: session, status } = useSession()

  console.log(session)
  console.log(status)

  const roleName = session?.user.role
    ? RoleValue[session?.user.role as RoleType]
    : 'user'

  const user = {
    id: session?.user.id,
    usename: session?.user.username,
    name: session?.user.name,
    role: session?.user.role,
    roleName
  }

  return {
    user
  }
}
