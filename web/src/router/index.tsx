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
import AnalyticsDashboard from '../pages/AnalyticsDashboard'

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

const analyticsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/analytics',
  component: AnalyticsDashboard,
})

const routeTree = rootRoute.addChildren([
  appRoute.addChildren([indexRoute, authRoute, analyticsRoute]),
])
export const router = createRouter({ routeTree })
