export const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed (${response.status})`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function createResourceApi<T extends { id: string | number }>(resource: string) {
  return {
    list: () => request<T[]>(`/${resource}`),
    get: (id: string | number) => request<T>(`/${resource}/${id}`),
    create: (data: Omit<T, 'id'>) => request<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string | number, data: Partial<T>) => request<T>(`/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string | number) => request<void>(`/${resource}/${id}`, { method: 'DELETE' }),
  }
}