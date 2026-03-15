import { router } from '../router'

export const API_URL = 'http://localhost:8000/api'

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function logout() {
  localStorage.removeItem('token')
}

class APIClient {
  private async request<T>(url: string, config: RequestInit = {}): Promise<T> {
    const token = getToken()

    const res = await fetch(`${API_URL}${url}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 401) {
      logout()
      router.navigate({ to: '/auth' })
      throw new Error('Unauthorized')
    }

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || res.statusText)
    }

    return res.json()
  }

  get<T>(url: string, config?: RequestInit) {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  post<T>(url: string, data?: unknown, config?: RequestInit) {
    console.log(data)
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put<T>(url: string, data?: unknown, config?: RequestInit) {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  patch<T>(url: string, data?: unknown, config?: RequestInit) {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  delete<T>(url: string, config?: RequestInit) {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }
}

export const client = new APIClient()
