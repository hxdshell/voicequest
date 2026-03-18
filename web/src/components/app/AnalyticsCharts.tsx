import { Text, VStack } from '@chakra-ui/react'
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Sector,
  Label,
} from 'recharts'

export default function AnalyticsCharts({ data }: { data: Analytics }) {
  const statusData = [
    { name: 'Pending', value: data.pending, color: '#8b5cf6' },
    { name: 'Completed', value: data.completed, color: '#7c3aed' },
    { name: 'Cancelled', value: data.cancelled, color: '#a78bfa' },
    { name: 'Delayed', value: data.delayed, color: '#c4b5fd' },
  ]

  const completionData = [
    { name: 'On Time', value: data.completed_on_time, fill: '#7c3aed' },
    { name: 'After Delay', value: data.completed_after_delay, fill: '#a78bfa' },
  ]

  const rateData = [
    { name: 'Completion', value: data.completion_rate, fill: '#7c3aed' },
    { name: 'On Time', value: data.on_time_rate, fill: '#8b5cf6' },
    { name: 'Delay', value: data.delay_rate, fill: '#a78bfa' },
  ]

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      {/* Pie: Status Distribution */}

      <div style={{ width: '100%', height: 300 }}>
        <h3>Status Distribution</h3>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip cursor={false} animationDuration={100} />
            <Pie
              innerRadius={80}
              outerRadius={100}
              isAnimationActive={true}
              data={statusData}
              dataKey="value"
              nameKey="name"
              shape={(props) => (
                <Sector {...props} fill={props.payload?.color} />
              )}
            >
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as any
                  return (
                    <foreignObject
                      x={cx - 50}
                      y={cy - 30}
                      width={100}
                      height={60}
                    >
                      <VStack gap={0} align="center" justify="center">
                        <Text fontSize="lg" fontWeight="bold">
                          {data.total}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          tasks
                        </Text>
                      </VStack>
                    </foreignObject>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar: Completion Breakdown */}
      <div style={{ width: '100%', height: 300 }}>
        <h3>Completion Breakdown</h3>
        <ResponsiveContainer>
          <BarChart data={completionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" isAnimationActive></Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar: Rates */}
      <div style={{ width: '100%', height: 300 }}>
        <h3>Rates</h3>
        <ResponsiveContainer>
          <BarChart data={rateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
