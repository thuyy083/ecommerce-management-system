import {
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Link,
  useMediaQuery,
  useTheme,
  Stack,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import IconifyIcon from '../IconifyIcon'
import { useDeviceId } from '~/hooks/useDeviceId'

const LoginForm = ({ handleLogin, disabled }) => {
  const [showPassword, setShowPassword] = useState(false)
  const { control, handleSubmit, formState: { errors } } = useForm()
  const deviceId = useDeviceId()
  console.log('device id nè: ', deviceId)
  const theme = useTheme()
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'))

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      deviceId
    }
    await handleLogin(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5} sx={{ mb: 3 }}>
        <Controller
          name="username"
          control={control}
          defaultValue=""
          rules={{ required: 'Vui lòng nhập email hoặc username', }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              size={isSmUp ? 'medium' : 'small'}
              name="username"
              label="Username"
              error={!!errors.username}
              helperText={errors.username ? errors.username.message : ''}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          defaultValue=""
          rules={{ required: 'Vui lòng nhập mật khẩu', minLength: { value: 8, message: 'mật khẩu phải có ít nhất 8 ký tự' } }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              size={isSmUp ? 'medium' : 'small'}
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password ? errors.password.message : ''}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        <IconifyIcon
                          icon={
                            showPassword
                              ? 'majesticons:eye'
                              : 'majesticons:eye-off'
                          }
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
        <Stack direction="row" justifyContent="flex-end" alignItems='center'>
          {/* <FormControlLabel control={
            <Controller
              name="isRemember"
              control={control}
              render={({ field }) => (
                <Checkbox
                  {...field}
                  name="isRemember"
                />
              )}
              z/>
          } label="Nhớ mật khẩu" /> */}
          <Link
            href="/forgetPassword"
            variant="subtitle2"
            underline="hover"
          >
            Forgot password?
          </Link>
        </Stack>
        <Button
          fullWidth
          disabled={disabled}
          type="submit"
          variant="contained"
          size={isSmUp ? 'large' : 'medium'}
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
          Login
        </Button>
      </Stack>
    </form>
  )
}

export default LoginForm
