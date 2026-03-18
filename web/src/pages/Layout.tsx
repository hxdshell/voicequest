import { Box, Button, Heading, Highlight, HStack, Text } from '@chakra-ui/react'
import { Link, Outlet } from '@tanstack/react-router'
import { ColorModeButton } from '../components/ui/color-mode'
import { isAuthenticated, logout } from '../api'
import { useState } from 'react'
import { LayoutDashboardIcon } from 'lucide-react'

export default function Layout() {
  const [_isAuth, setIsAuth] = useState(isAuthenticated())
  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <Box
        h="48px"
        as="nav"
        p={2}
        display="flex"
        justifyContent="space-between"
        flexShrink={0}
      >
        <Heading fontFamily={'JetBrains Mono'} fontWeight={'bold'}>
          <Link to="/">
            <Highlight query="Quest" styles={{ color: 'purple.500' }}>
              VoiceQuest
            </Highlight>
          </Link>
        </Heading>
        <HStack>
          <Link to="/analytics">
            <Box display={'flex'} gap={1}>
              <LayoutDashboardIcon size={18} />
              <Text>Dashboard</Text>
            </Box>
          </Link>
          <Button
            onClick={() => {
              logout()
              setIsAuth(false)
            }}
            variant={'ghost'}
          >
            Logout
          </Button>
          <ColorModeButton />
        </HStack>
      </Box>
      <Box flex="1" overflow="auto">
        <Outlet />
      </Box>
    </Box>
  )
}
