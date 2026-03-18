import { Box, Center, Spinner, Stack } from '@chakra-ui/react'
import AnalyticsCharts from '../components/app/AnalyticsCharts'
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { client } from '../api'
import { toaster } from '../components/ui/toaster'

export default function AnalyticsDashboard() {
  const navigate = useNavigate()
  const [chartData, setChartData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate({ to: '/auth', replace: true })
    }
    async function fetchData() {
      try {
        setLoading(true)
        const chartResponse = await client.get('/tasks/analytics')
        setChartData(chartResponse.data)
      } catch (err) {
        toaster.create({
          type: 'error',
          closable: true,
          title: 'Error',
          description: err,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading)
    return (
      <Center h="200px">
        <Spinner />
      </Center>
    )
  if (chartData) {
    return (
      <Box h="calc(100vh - 48px)" w="100%">
        <Stack p="2" direction={{ base: 'column', md: 'row' }} gap="10">
          <Box flex="1" h="calc(100vh - 88px)" overflowY={'auto'}>
            <AnalyticsCharts data={chartData} />
          </Box>

          <Box flex="1">Transcription Logs</Box>
        </Stack>
      </Box>
    )
  }
}
