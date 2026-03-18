interface Task {
  id: number
  user_id: number
  title: string
  due_date: string
  description: string
  create_at: string
  status: number
}

type Analytics = {
  total: number
  pending: number
  completed: number
  cancelled: number
  delayed: number
  completed_on_time: number
  completed_after_delay: number
  completion_rate: number
  on_time_rate: number
  delay_rate: number
}
