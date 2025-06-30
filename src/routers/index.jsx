import { createBrowserRouter } from 'react-router-dom'
import adminRoute from './admin.route'
import AuthRoutes from './auth.route'
import ErrorRoute from './Error.route'
import customerRoute from './customer.route'

export const router = createBrowserRouter([
  ...adminRoute,
  ...AuthRoutes,
  ...ErrorRoute,
  ...customerRoute
])