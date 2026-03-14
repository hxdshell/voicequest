import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import Layout from '../pages/Layout'
import HomePage from '../pages/HomePage'
import AuthPage from '../pages/AuthPage'
import { isAuthenticated } from '../api'

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
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/auth',
      })
    }
  },
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
