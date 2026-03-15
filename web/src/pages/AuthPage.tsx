import { Box, Button, Field, Input, Text } from '@chakra-ui/react'
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

  const [signupSuccess, setSignupSuccess] = useState<string | null>()

  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loadingSignup, setLoadingSignup] = useState(false)

  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
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

  async function handleSignup(e: React.FormEvent) {
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
      setSignupSuccess('signup successful you can login now')
    } catch {
      setSignupError('Network error')
    } finally {
      setLoadingSignup(false)
    }
  }

  return (
    <Box height="100%">
      <Box
        mt="2rem"
        display="flex"
        alignItems="center"
        gap="4rem"
        justifyContent="center"
      >
        {/* LOGIN */}
        <form onSubmit={handleLogin}>
          <Box p={4} bg="bg.subtle" display="flex" flexDir="column" gap="1rem">
            <Text mb="1rem" fontSize="md">
              Login
            </Text>

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
                w="20vw"
                p={1}
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
                w="20vw"
                p={1}
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
          </Box>
        </form>

        {/* SIGNUP */}
        <form onSubmit={handleSignup}>
          <Box p={4} bg="bg.subtle" display="flex" flexDir="column" gap="1rem">
            <Text mb="1rem" fontSize="md">
              Sign Up
            </Text>

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
                w="20vw"
                value={signUpData.email}
                p={1}
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
                w="20vw"
                p={1}
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
          </Box>
        </form>
      </Box>
    </Box>
  )
}
