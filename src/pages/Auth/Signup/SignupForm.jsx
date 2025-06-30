import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useForm, Controller } from 'react-hook-form'
import { emailRegex } from '~/config/formValidateRegex'
import { MuiTelInput } from 'mui-tel-input'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'


import IconifyIcon from '../IconifyIcon'
import authService from '~/service/auth.service'

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [countryCode, setCountryCode] = useState('+84')
  //const [gender, setGender] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const { control, handleSubmit, watch, formState: { errors } } = useForm()

  const validate = (value) => {
    const birthDate = new Date(value)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const dayDiff = today.getDate() - birthDate.getDate()

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return age - 1 >= 16 ? true : 'Bạn phải đủ 16 tuổi'
    }
    return age >= 16 ? true : 'Bạn phải đủ 16 tuổi'
  }
  const handlePhoneChange = (value, onChange) => {
    onChange(value)

    // Lấy mã quốc gia từ đầu chuỗi
    const countryMatch = value.match(/^(\+\d{1,4})/)
    if (countryMatch) {
      setCountryCode(countryMatch[1])
    }
  }


  const submit = async (data) => {
    const fullPhone = data.phoneNumber.replace(/\D/g, '') // Chỉ giữ số
    const countryCodeDigits = countryCode.replace(/\D/g, '') // +84 → 84

    let localPhone = fullPhone
    if (fullPhone.startsWith(countryCodeDigits)) {
      localPhone = fullPhone.slice(countryCodeDigits.length)
    }

    const areaCode = localPhone.slice(0, 2) // Lấy 2 số đầu
    const phoneNumber = localPhone
    console.log('Full Phone:', data.phoneNumber)
    console.log('Country Code:', countryCode)
    console.log('Local Phone:', localPhone)
    console.log('Area Code:', areaCode)
    console.log('Phone Number:', phoneNumber)
    const payload = {
      username: data.username,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      email: data.email,
      dob: data.dob.format('YYYY-MM-DD'),
      countryCode,
      areaCode,
      phoneNumber
    }

    try {
      const response = await authService.register(payload)
      if (response.success) {
        toast.success(response.message || 'Đăng ký thành công!')
        navigate('/login')
      } else {
        toast.error(response.message || 'Đăng ký thất bại.')
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại sau.'
      console.error('Lỗi đăng ký:', error)
      toast.error(msg)
    }
  }

  // const handleChange = (event) => {
  //   setGender(event.target.value)
  // }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Grid container spacing={2.5} sx={{ mb: 3, p: 2, overflowY: 'auto', height: { xs: '300px', lg: 'auto' } }}>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{ required: 'Vui lòng nhập email', pattern: { value: emailRegex, message: 'Email không hợp lệ' } }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                name="email"
                label="Địa chỉ email"
                size="medium"
                error={!!errors.email}
                helperText={errors.email ? errors.email.message : ''}
              />
            )}
          />
          <Controller
            name="phoneNumber"
            control={control}
            defaultValue=""
            rules={{
              required: 'Vui lòng nhập Số điện thoại',
              validate: (value) => value.trim() !== '' || 'Số điện thoại không hợp lệ'
            }}

            render={({ field: { onChange, ...field } }) => (
              <MuiTelInput
                {...field}
                fullWidth
                name="phoneNumber"
                label="Số điện thoại"
                value={field.value}
                onChange={(value) => handlePhoneChange(value, onChange)}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            defaultValue=""
            rules={{ required: 'Vui lòng nhập mật khẩu', minLength: { value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' } }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                name="password"
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                size="medium"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          <IconifyIcon
                            icon={showPassword ? 'majesticons:eye' : 'majesticons:eye-off'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
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
              required: 'Vui lòng nhập mật khẩu',
              minLength: { value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
              validate: value => value === watch('password') || 'Mật khẩu không khớp'
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? 'text' : 'password'}
                size="medium"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          <IconifyIcon
                            icon={showConfirmPassword ? 'majesticons:eye' : 'majesticons:eye-off'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword ? errors.confirmPassword.message : ''}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="username"
            control={control}
            defaultValue=""
            rules={{ required: 'Vui lòng nhập tên đăng nhập', }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                name="username"
                label="Tên đăng nhập"
                size="medium"
                error={!!errors.username}
                helperText={errors.username ? errors.username.message : ''}
              />
            )}
          />

          <Controller
            name="firstName"
            control={control}
            defaultValue=""
            rules={{ required: 'Vui lòng nhập họ', }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                name="firstName"
                label="Họ"
                size="medium"
                error={!!errors.firstName}
                helperText={errors.firstName ? errors.firstName.message : ''}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            defaultValue=""
            rules={{ required: 'Vui lòng nhập Tên', }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                name="lastName"
                label="Tên"
                size="medium"
                error={!!errors.lastName}
                helperText={errors.lastName ? errors.lastName.message : ''}
              />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <FormControl fullWidth error={!!errors.gender}>
              <InputLabel id="signup-gender-label">Giới tính</InputLabel>
              <Controller
                name="gender"
                control={control}
                defaultValue=""
                rules={{ required: 'Vui lòng chọn giới tính', }}
                render={({ field }) => (
                  <Select
                    {...field}
                    sx={{ height: '100%' }}
                    labelId="signup-gender-label"
                    id="gender"
                    label="Giới tính"
                    name='gender'
                  >
                    <MenuItem value={'Nam'}>Nam</MenuItem>
                    <MenuItem value={'Nữ'}>Nữ</MenuItem>
                    <MenuItem value={'Khác'}>Khác</MenuItem>
                  </Select>
                )}
              />
              {errors.gender && <Typography variant='body1' color='error'>{errors.gender.message}</Typography>}
            </FormControl>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '60%' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <DemoContainer components={['DatePicker']} sx={{ p: 0, }}>
                  <Controller
                    name="dob"
                    control={control}
                    rules={{ required: 'Vui lòng chọn ngày sinh',
                      validate: (value) => {
                        if (!value) return 'Vui lòng chọn ngày sinh'
                        const today = new Date()
                        const birthDate = new Date(value)
                        const age = today.getFullYear() - birthDate.getFullYear()
                        const monthDiff = today.getMonth() - birthDate.getMonth()
                        const dayDiff = today.getDate() - birthDate.getDate()

                        const isOldEnough = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)
                          ? age - 1 >= 16
                          : age >= 16

                        return isOldEnough || 'Bạn phải đủ 16 tuổi'
                      }
                    }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Ngày sinh"
                        format="DD/MM/YYYY"
                        name='dob'
                        value={field.value || null}
                        onChange={(date) => field.onChange(date)}
                        renderInput={(params) => (
                          <TextField {...params} error={!!errors.dob} helperText={errors.dob?.message} />
                        )}
                      />
                    )}
                  />
                </DemoContainer>
              </LocalizationProvider>
              {errors.dob && <Typography variant='body1' color='error'>{errors.dob.message}</Typography>}
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Button
        type="submit"
        fullWidth
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
        Đăng ký
      </Button>
    </form>
  )
}

export default SignupForm
