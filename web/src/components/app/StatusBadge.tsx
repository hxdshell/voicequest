import { Badge } from '@chakra-ui/react'

const statusMap = {
  0: { label: 'pending', color: 'cyan' },
  1: { label: 'delayed', color: 'orange' },
  2: { label: 'completed', color: 'green' },
  3: { label: 'cancelled', color: 'red' },
} as const

export default function StatusBadge({ status }: { status: number }) {
  const s = statusMap[status as keyof typeof statusMap]
  if (!s) return null

  return (
    <Badge size="sm" colorPalette={s.color}>
      {s.label}
    </Badge>
  )
}
