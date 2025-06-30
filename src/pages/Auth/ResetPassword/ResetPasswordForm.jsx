// ResetPasswordForm.jsx
import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import { useLocation, useNavigate } from 'react-router-dom'
import authService from '~/service/auth.service'

const ResetPasswordForm = () => {
  const { control, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')
  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get('token')

  const onSubmit = async (data) => {
    try {
      const response = await authService.resetPassword(token, data.password)

      if (response.success) {
        alert (response.message || 'Đổi mật khẩu thành công')
        navigate('/login')
      } else {
        alert(response.message || 'Đổi mật khẩu thất bại.')
      }
    } catch (error) {
      console.error('Lỗi đổi mật khẩu', error)
      alert('Đổi mật khẩu tahats bại')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5} sx={{ mb: 3 }}>
        <Controller
          name="password"
          control={control}
          defaultValue=""
          rules={{ required: 'Vui lòng nhập mật khẩu', minLength: { value: 8, message: 'mật khẩu phải có ít nhất 8 ký tự' } }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="password"
              label="Mật khẩu mới"
              error={!!errors.password}
              helperText={errors.password ? errors.password.message : ''}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          defaultValue=""
          rules={{
            required: 'Vui lòng xác nhận lại mật khẩu',
            validate: (value) => value === password || 'Mật khẩu không khớp'
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="password"
              label="Xác nhận mật khẩu"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword ? errors.confirmPassword.message : ''}
            />
          )}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          sx={{
            backgroundColor: '#1E00FF',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            py: 1.5,
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: '#1400cc',
            },
          }}
        >
          Reset Password
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          OR
        </Typography>
      </Divider>

      <Typography textAlign="center" fontWeight={400} color="text.primary" variant="subtitle1">
        Remembered your password?
      </Typography>

      <Button
        component={Link}
        href="/login"
        fullWidth
        size="large"
        type="button"
        variant="contained"
        sx={{
          mt: 2,
          backgroundColor: '#1E00FF',
          color: '#fff',
          fontWeight: 600,
          borderRadius: 2,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#1400cc',
          },
        }}
      >
        Back to Sign-in
      </Button>
    </form>
  )
}

export default ResetPasswordForm
