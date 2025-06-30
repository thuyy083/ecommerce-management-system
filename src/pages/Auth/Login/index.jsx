import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
  Backdrop,
  CircularProgress
} from '@mui/material'
import LoginForm from './LoginForm'

import { useDispatch, useSelector } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import { login } from '~/redux/thunks/user.thunk'
import { useNavigate } from 'react-router-dom'
import { useDeviceId } from '~/hooks/useDeviceId'
import React from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { toast } from 'react-toastify'
import { Routes } from '~/config'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const deviceId = useDeviceId()
  const isReady = !!deviceId
  const status = useSelector((state) => state.user.status)
  // const { currentUser, error } = useSelector((s) => s.user)
  // const getRedirectPath = (roleObj) => {
  //   if (roleObj.IS_ADMIN || roleObj.IS_MANAGER || roleObj.IS_SERVICE_STAFF)
  //     return '/admin/dashboard'
  //   return '/'
  // }
  const handleLogin = async (data) => {
    if (!isReady) return
    const credentials = { ...data, deviceId }
    try {
      const result = await dispatch(login({ credentials, method: data.method || 'default' }))
      const originalPayload = unwrapResult(result)
      if (originalPayload) {
        console.log('originalPayload', originalPayload)
        if (originalPayload.ROLE.IS_CUSTOMER) {
          setTimeout(() => {
            navigate('/customer/home', { replace: true })
          }, 500)
          return
        }
        toast.success('Đăng nhập thành công!')
        // const redirect = getRedirectPath(user.ROLE)
        setTimeout(() => {
          navigate(Routes.admin.dashboard, { replace: true })
        }, 500)
      }
    } catch (error) {
      console.log(error)
      console.error('Đăng nhập thất bại:', error)
    }
  }
  return (

    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f3f8fc, #eaf1f8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Sign In
          </Typography>

          <Typography variant="body2" sx={{ mb: 3 }}>
            Don’t have an account?
            <Link
              href="/register"
              underline="hover"
              sx={{ ml: 0.75 }}
            >
              Create One Now!
            </Link>
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GG_CLIENT_ID}>
              <GoogleLogin
                fullWidth
                variant="outlined"
                sx={{ borderRadius: 999, p: 1 }}
                onSuccess={credentialResponse => {
                  console.log('credentialResponse: ', credentialResponse)
                  const token = credentialResponse.credential
                  handleLogin({ token, method: 'google' })
                }}
                onError={() => {
                  toast.error('Đăng nhập bằng Google thất bại')
                }}
              />
            </GoogleOAuthProvider>
            {/* <Button
              fullWidth
              variant="outlined"
              sx={{ borderRadius: 999, p: 1 }}
            >
              <IconifyIcon icon="eva:google-fill" color="error.main" />
            </Button> */}
            {/* <Button
              fullWidth
              variant="outlined"
              sx={{ borderRadius: 999, p: 1 }}
            >
              <IconifyIcon icon="gg:facebook" color="primary.main" />
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{ borderRadius: 999, p: 1 }}
            >
              <IconifyIcon icon="logos:twitter" />
            </Button> */}
          </Stack>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>

          <LoginForm handleLogin={handleLogin}/>
        </Card>
      </Container>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={status === 'loading'}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>

  )
}

export default LoginPage
