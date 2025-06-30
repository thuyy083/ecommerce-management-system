import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import authService from '~/service/auth.service'

const ForgetPasswordForm = () => {
  const { control, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      const response = await authService.forgetPassword(data.email)

      if (response.success) {
        alert(response.message || 'Link reset mật khẩu đã được gửi đến email của bạn.')
      } else {
        alert(response.message || 'Gửi yêu cầu thất bại.')
      }
    } catch (error) {
      console.error('Forget password error:', error)
      alert('Đã xảy ra lỗi, vui lòng thử lại.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5} sx={{ mb: 3 }}>
        <Controller
          name="email"
          control={control}
          defaultValue=""
          rules={{ required: 'Please enter email' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Email address"
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ''}
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
          Send Reset Password Link
        </Button>
      </Stack>
    </form>
  )
}

export default ForgetPasswordForm
