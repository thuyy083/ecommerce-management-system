import { Routes } from '~/config'
import Forbidden403 from '~/pages/Error/Forbidden403'
import NotFound404 from '~/pages/Error/NotFound404'

export default [
  {
    path: Routes.error.notFound404,
    element: <NotFound404 />
  },
  {
    path: Routes.error.forbidden403,
    element: <Forbidden403 />
  }
]