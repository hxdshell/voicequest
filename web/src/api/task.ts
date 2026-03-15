import { client } from '.'

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

export const taskService = {
  getAll: async () => {
    const res = await client.get<ApiResponse<Task[]>>('/tasks')
    return res.data
  },

  create: async (task: { title: string; due_date: string | null }) => {
    const res = await client.post<ApiResponse<Task>>('/tasks/create', task)
    return res.data
  },

  update: async (id: number, updates: Partial<Task>) => {
    const res = await client.patch<ApiResponse<Task>>(
      `/tasks/edit/${id}`,
      updates,
    )
    return res.data
  },

  delete: async (id: number) => {
    return client.delete<ApiResponse<any>>(`/tasks/delete/${id}`)
  },
}
