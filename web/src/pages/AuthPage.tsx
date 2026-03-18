import { Box, Button, Field, Input, Stack, Text, Tabs } from '@chakra-ui/react'
import { PasswordInput } from '../components/ui/password-input'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

type AuthData = {
  email: string
  password: string
}

export default function AuthPage() {
  const [loginData, setLoginData] = useState<AuthData>({
    email: '',
    password: '',
  })
  const [signUpData, setSignUpData] = useState<AuthData>({
    email: '',
    password: '',
  })

  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null)

  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loadingSignup, setLoadingSignup] = useState(false)

  const navigate = useNavigate()

  async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginError(null)
    setLoadingLogin(true)

    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      const data = await res.json()

      if (!res.ok) {
        setLoginError(data.message || 'Login failed')
        return
      }

      localStorage.setItem('token', data.data.token)
      navigate({ to: '/', replace: true })
    } catch {
      setLoginError('Network error')
    } finally {
      setLoadingLogin(false)
    }
  }

  async function handleSignup(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setSignupError(null)
    setLoadingSignup(true)

    try {
      const res = await fetch('http://localhost:8000/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData),
      })

      const data = await res.json()

      if (!res.ok) {
        setSignupError(data.message || 'Signup failed')
        return
      }

      setSignupSuccess('Signup successful, you can login now')
    } catch {
      setSignupError('Network error')
    } finally {
      setLoadingSignup(false)
    }
  }

  return (
    <Box
      h="calc(100vh - 48px)"
      display="flex"
      paddingTop="1rem"
      justifyContent="center"
    >
      <Tabs.Root w="400px" variant="outline" defaultValue="login" fitted>
        <Tabs.List>
          <Tabs.Trigger value="login">Login</Tabs.Trigger>
          <Tabs.Trigger value="signup">Sign Up</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="login">
          <form onSubmit={handleLogin}>
            <Stack p={4} gap="1.5rem">
              {loginError && (
                <Text color="red.400" fontSize="sm">
                  {loginError}
                </Text>
              )}

              <Field.Root required>
                <Field.Label>
                  Email <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>
                  Password <Field.RequiredIndicator />
                </Field.Label>
                <PasswordInput
                  value={loginData.password}
                  onChange={(e: any) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  placeholder="Enter your password"
                />
              </Field.Root>

              <Button loading={loadingLogin} type="submit">
                Login
              </Button>
            </Stack>
          </form>
        </Tabs.Content>

        <Tabs.Content value="signup">
          <form onSubmit={handleSignup}>
            <Stack p={4} gap="1.5rem">
              {signupError && (
                <Text color="red.400" fontSize="sm">
                  {signupError}
                </Text>
              )}

              {signupSuccess && (
                <Text color="green.400" fontSize="sm">
                  {signupSuccess}
                </Text>
              )}

              <Field.Root required>
                <Field.Label>
                  Email <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  value={signUpData.email}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>
                  Password <Field.RequiredIndicator />
                </Field.Label>
                <PasswordInput
                  value={signUpData.password}
                  onChange={(e: any) =>
                    setSignUpData({ ...signUpData, password: e.target.value })
                  }
                  placeholder="Enter your password"
                />
              </Field.Root>

              <Button loading={loadingSignup} type="submit">
                Sign Up
              </Button>
            </Stack>
          </form>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
