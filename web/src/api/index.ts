import { router } from '../router'

export const API_URL = 'http://localhost:8000/api'

export function getToken() {
  return localStorage.getItem('token')
}

export function isAuthenticated() {
  return !!getToken()
}

export function logout() {
  localStorage.removeItem('token')
  router.navigate({ to: '/auth' })
}

class APIClient {
  private async request(url: string, data = {}) {
    const token = getToken()

    if (!token) {
      logout()
      throw new Error('No token found')
    }

    const res = await fetch(`${API_URL}${url}`, {
      ...data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (res.status === 401) {
      logout()
      throw new Error('Unauthorized')
    }

    if (!res.ok) {
      console.log(res)
      let error = res.statusText
      try {
        const body = await res.json()
        error = body.message ?? error
      } catch {
        error = (await res.text()) || error
      }
      throw new Error(error)
    }

    return res.json()
  }

  get(url: string) {
    return this.request(url, { method: 'GET' })
  }

  post(url: string, data: any) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put(url: string, data: any) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  patch(url: string, data: any) {
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  delete(url: string) {
    return this.request(url, { method: 'DELETE' })
  }
}

export const client = new APIClient()
