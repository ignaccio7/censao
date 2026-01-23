'use client'

import { useSession } from 'next-auth/react'

export default function useUser() {
  const { data: session, status } = useSession()

  console.log(session)
  console.log(status)

  // TODO ver como arreglar esto ya que esta con datos quemados y en caso de aumentar roles tocaria ver como mapear o determinar el rol que se mostrara en al sistema
  const roles = {
    ['ADMINISTRADOR']: 'Administrador',
    ['PACIENTE']: 'Paciente',
    ['DOCTOR_FICHAS']: 'Doctor',
    ['DOCTOR_GENERAL']: 'Doctor'
  } as const

  type RoleKey = keyof typeof roles

  const roleName = session?.user.role
    ? roles[session?.user.role as RoleKey]
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
