import { Box, Heading, Highlight } from '@chakra-ui/react'
import { Outlet } from '@tanstack/react-router'
import { ColorModeButton } from '../components/ui/color-mode'

export default function Layout() {
  return (
    <Box height={'100vh'}>
      <Box
        h="48px"
        as={'nav'}
        p={2}
        display={'flex'}
        justifyContent={'space-between'}
      >
        <Heading fontFamily={'JetBrains Mono'} fontWeight={'bold'}>
          <Highlight query="Quest" styles={{ color: 'purple.500' }}>
            VoiceQuest
          </Highlight>
        </Heading>
        <ColorModeButton />
      </Box>
      <Box h={'calc(100vh - 48px)'} p={2}>
        <Outlet />
      </Box>
    </Box>
  )
}
