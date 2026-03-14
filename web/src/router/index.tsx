import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'
import Layout from '../pages/Layout'
import HomePage from '../pages/HomePage'
import AuthPage from '../pages/AuthPage'

const rootRoute = createRootRoute({
  component: Outlet,
})

export const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: Layout,
})
const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  component: HomePage,
})

const authRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/auth',
  component: AuthPage,
})

const routeTree = rootRoute.addChildren([
  appRoute.addChildren([indexRoute, authRoute]),
])
export const router = createRouter({ routeTree })
