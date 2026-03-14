// --- Types based on your API response ---
export interface Task {
  id: number
  user_id: number
  title: string
  description: string
  status: string
  due_date: string
  original_tz: string
  times_dealyed: number
  created_at: string
}

interface ApiResponse<T> {
  message: string
  data: T
}

const BASE_URL = 'http://localhost:8000/api/tasks'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}

export const taskService = {
  getAll: async () => {
    const res = await request<ApiResponse<Task[]>>('/')
    return res.data
  },

  create: async (task: Partial<Task>) => {
    const res = await request<ApiResponse<Task>>('/', {
      method: 'POST',
      body: JSON.stringify(task),
    })
    return res.data
  },

  update: async (id: number, updates: Partial<Task>) => {
    const res = await request<ApiResponse<Task>>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    return res.data
  },

  delete: async (id: number) => {
    return request<ApiResponse<any>>(`/${id}`, {
      method: 'DELETE',
    })
  },
}
