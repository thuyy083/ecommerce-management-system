import LoginPage from '../pages/Auth/Login'
import SignupPage from '../pages/Auth/Signup'
import ForgetPasswordPage from '../pages/Auth/ForgetPassword'
import ResetPasswordPage from '../pages/Auth/ResetPassword'
import ChangePasswordPage from '~/pages/Auth/ChangePassword'
import ProfilePage from '~/pages/Auth/Profile'
import AdminLayout from '~/layouts/AdminLayout'
import UpdateProfilePage from '~/pages/Auth/UpdateProfile'

const AuthRoutes = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <SignupPage />,
  },
  {
    path: '/forgetPassword',
    element: <ForgetPasswordPage />,
  },
  {
    path: '/resetPassword',
    element: <ResetPasswordPage />,
  },
  {
    element : <AdminLayout />,
    children: [
      {
        path: '/changePassword',
        element: <ChangePasswordPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/updateProfile',
        element: <UpdateProfilePage />,
      },
    ]
  }
]

export default AuthRoutes
