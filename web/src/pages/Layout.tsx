import { Box, Button, Heading, Highlight } from '@chakra-ui/react'
import { Link, Outlet } from '@tanstack/react-router'
import { ColorModeButton } from '../components/ui/color-mode'
import { isAuthenticated, logout } from '../api'
import { useState } from 'react'

export default function Layout() {
  const [isAuth, setIsAuth] = useState(isAuthenticated())
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
          <Link to="/">
            <Highlight query="Quest" styles={{ color: 'purple.500' }}>
              VoiceQuest
            </Highlight>
          </Link>
        </Heading>
        <Box>
          <Button
            onClick={() => {
              logout()
              setIsAuth(false)
            }}
            variant={'ghost'}
          >
            {isAuth ? 'Logout' : null}
          </Button>
          <ColorModeButton />
        </Box>
      </Box>
      <Box h={'calc(100vh - 48px)'} p={2}>
        <Outlet />
      </Box>
    </Box>
  )
}
