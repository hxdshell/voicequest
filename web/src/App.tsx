import { RouterProvider } from '@tanstack/react-router'
import { UIProvider } from './components/ui/provider'
import { router } from './router'
import { Toaster } from './components/ui/toaster'

export default function App() {
  return (
    <UIProvider>
      <Toaster />
      <RouterProvider router={router} />
    </UIProvider>
  )
}
