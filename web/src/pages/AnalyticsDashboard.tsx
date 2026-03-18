import { Box, Center, List, Spinner, Stack, Text } from '@chakra-ui/react'
import AnalyticsCharts from '../components/app/AnalyticsCharts'
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { client } from '../api'
import { toaster } from '../components/ui/toaster'

export default function AnalyticsDashboard() {
  const navigate = useNavigate()
  const [chartData, setChartData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [transcripts, setTranscripts] = useState<Trnascription[]>([])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate({ to: '/auth', replace: true })
    }
    async function fetchData() {
      try {
        setLoading(true)
        const chartResponse = await client.get('/tasks/analytics')
        setChartData(chartResponse.data)

        const transcriptsResponse = await client.get('/transcripts')
        setTranscripts(transcriptsResponse.data)
      } catch (err) {
        if (err instanceof Error) {
          toaster.create({
            closable: true,
            title: err.message,
            type: 'error',
          })
        }
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

          <Box flex="1" h="calc(100vh - 88px)" overflowY={'auto'}>
            <h3>Transcription Logs</h3>
            {transcripts.length === 0 ? (
              <Text color="fg.subtle">0 trnascripts found</Text>
            ) : (
              <List.Root gap={2}>
                {transcripts.map((t) => (
                  <List.Item key={t.id}>{t.transcription}</List.Item>
                ))}
              </List.Root>
            )}
          </Box>
        </Stack>
      </Box>
    )
  }
}
