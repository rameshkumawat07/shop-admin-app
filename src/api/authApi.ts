import { request } from './apiClient'
import type { User } from './types'

export async function login(email: string, password: string): Promise<Omit<User, 'password'>> {
  const users = await request<User[]>(`/users?email=${encodeURIComponent(email)}`)
  const user = users.find((candidate) => candidate.password === password)
  if (!user) throw new Error('The email or password you entered is incorrect.')
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}