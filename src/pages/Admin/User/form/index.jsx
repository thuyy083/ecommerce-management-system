import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'
import FormControl from '@mui/material/FormControl'
import Button from '@mui/material/Button'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import ImageUploader from '~/components/AvatarUploader'
import LocationSelector from '~/components/LocationSelector'
import { MuiTelInput, matchIsValidTel } from 'mui-tel-input'
import { useForm, Controller } from 'react-hook-form'
import { emailRegex } from '~/config/formValidateRegex'
import IconifyIcon from '~/pages/Auth/IconifyIcon'
import { toast } from 'react-toastify'

import authService from '~/service/auth.service'
import { useSelector } from 'react-redux'
import { useDeviceId } from '~/hooks/useDeviceId'
import { useNavigate, Link } from 'react-router-dom'
import { Routes } from '~/config'
import dayjs from 'dayjs'
import { CircularProgress, Backdrop } from '@mui/material'


function UserForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { control, handleSubmit, watch, formState: { errors } } = useForm()
  const [countryCode, setCountryCode] = useState('+84')
  const user = useSelector(state => state.user.currentUser)
  const userId = user?.USER_ID
  const deviceId = useDeviceId()
  const navigate = useNavigate()

  const submit = async (data) => {
    try {
      const fullPhone = data.phoneNumber.replace(/\D/g, '')
      const countryCodeDigits = countryCode.replace(/\D/g, '')

      let localPhone = fullPhone
      if (fullPhone.startsWith(countryCodeDigits)) {
        localPhone = fullPhone.slice(countryCodeDigits.length)
      }

      const areaCode = localPhone.slice(0, 2)
      const phoneNumber = localPhone

      const payload = {
        username: data.username,
        password: data.password,
        firstName: data.firstname,
        lastName: data.lastname,
        gender: data.gender,
        email: data.email,
        dob: data.dob?.format('YYYY-MM-DD') || '',
        country: 'VN',
        city: data.addressSelector?.city.name || '',
        district: data.addressSelector?.district.name || '',
        ward: data.addressSelector?.ward.name || '',
        state: data.addressSelector?.city.name || '',
        address1: data.address1 || '',
        address2: data.address2 || '',
        fullPhoneNumber: data.phoneNumber,
        countryCode,
        areaCode,
        phoneNumber,
        isAdmin: data.roles?.includes('admin'),
        isManager: data.roles?.includes('manager'),
        isServiceStaff: data.roles?.includes('staff')
      }

      const headers = {
        user_id: userId,
        device_id: deviceId
      }

      console.log('Tạo staff với payload:', payload)
      const res = await authService.createStaff(payload, headers)
      toast.success(res?.message || 'Tạo người dùng thành công!')
      navigate('/admin/user')
    } catch (err) {
      console.error('Lỗi tạo staff:', err)
      alert('Tạo người dùng thất bại!')
    }
  }


  return (
    <>
      <form
        style={{
          backgroundColor: '#fff',
          padding: '24px'
        }}
        onSubmit={handleSubmit(submit)}
      >
        <Grid container>
          <Grid size={6}>
            <Typography
              variant="h6"
              sx={{
                color: '#4A4A4A',
                fontWeight: 400,
                textTransform: 'uppercase',
                pb: 4,
                height: 'fit-content',
              }}
            >
              Thông tin cá nhân
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography
              variant="h6"
              sx={{
                color: '#4A4A4A',
                fontWeight: 400,
                textTransform: 'uppercase',
                pb: 4,
                height: 'fit-content',
              }}
            >
              Thông tin tài khoản
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={6}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Controller
                  name="firstname"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Vui lòng nhập Họ' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      name="firstname"
                      label="Họ"
                      size="medium"
                      error={!!errors.firstname}
                      helperText={errors.firstname ? errors.firstname.message : ''}
                    />
                  )}
                />
              </Grid>
              <Grid size={6}>
                <Controller
                  name="lastname"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Vui lòng nhập Tên' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      name="lastname"
                      label="Tên"
                      size="medium"
                      error={!!errors.lastname}
                      helperText={errors.lastname ? errors.lastname.message : ''}
                    />
                  )}
                />
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="create-update-user-gender-label">Giới tính</InputLabel>
                  <Controller
                    name="gender"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Vui lòng chọn giới tính', }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        sx={{ height: '100%' }}
                        labelId="create-update-user-gender-label"
                        id="gender"
                        // value={gender}
                        label="giới tính"
                        name='gender'
                        error={!!errors.gender}
                      >
                        <MenuItem value={'Nam'}>Nam</MenuItem>
                        <MenuItem value={'Nữ'}>Nữ</MenuItem>
                        <MenuItem value={'Khác'}>Khác</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.gender && <Typography variant='body1' color='error'>{errors.gender.message}</Typography>}
                </FormControl>
              </Grid>
              <Grid size={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DatePicker']} sx={{ p: 0, }}>
                    <Controller
                      name="dob"
                      control={control}
                      rules={{
                        required: 'Vui lòng chọn ngày sinh',
                        validate: (value) => {
                          if (!value) return 'Vui lòng chọn ngày sinh'
                          const age = dayjs().diff(value, 'year')
                          return age >= 16 || 'Người dùng phải ít nhất 16 tuổi'
                        },
                      }}

                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Ngày sinh"
                          name='dob'
                          value={field.value || null}
                          onChange={(date) => field.onChange(date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.dob,
                              helperText: errors.dob?.message,
                            },
                          }}
                        />
                      )}
                    />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>
              <Grid size={12}>
                <Controller
                  name="phoneNumber"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Vui lòng nhập Số điện thoại' }}
                  render={({ field }) => (
                    <MuiTelInput
                      {...field}
                      fullWidth
                      name="phoneNumber"
                      label="Số điện thoại"
                      onChange={(value) => {
                        field.onChange(value)

                        const match = value.match(/^(\+\d{1,4})/)
                        if (match) {
                          setCountryCode(match[1])
                        }
                      }}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber?.message}
                    />
                  )}

                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="addressSelector"
                  control={control}
                  // rules={{
                  //   validate: (value) => {
                  //     if (!value || Object.keys(value?.city)?.length === 0) {
                  //       return 'Vui lòng nhập vào Thành phố/Tỉnh'
                  //     } else if (Object.keys(value?.district)?.length === 0) {
                  //       return 'Vui lòng chọn Quận/Huyện'
                  //     } else if (Object.keys(value?.ward)?.length === 0) {
                  //       return 'Vui lòng nhập vào Phường, Thị xã,...'
                  //     }
                  //   }
                  // }}
                  render={({ field, fieldState }) => (
                    <LocationSelector
                      value={{
                        city: 'Cần Thơ',
                        district: 'Ninh Kiều',
                        ward: 'An Khánh',
                      }}
                      onChange={field.onChange}
                      error={fieldState.error}
                    />
                  )}
                />
                {/* <LocationSelector /> */}
              </Grid>
              <Grid size={12}>
                <Controller
                  name="address1"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Địa chỉ 1"
                      size="medium"
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="address2"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Địa chỉ 2"
                      size="medium"
                    />
                  )}
                />
              </Grid>

            </Grid>
          </Grid>
          <Grid size={6}>
            <Grid container spacing={2}>
              <Grid size={12} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                      label="Email address"
                      size="medium"
                      error={!!errors.email}
                      helperText={errors.email ? errors.email.message : ''}
                    />
                  )}
                />
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="role-label">Vai trò</InputLabel>
                  <Controller
                    name="roles"
                    control={control}
                    defaultValue={[]}
                    rules={{ required: 'Vui lòng chọn ít nhất một vai trò' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        multiple
                        labelId="role-label"
                        label="Vai trò"
                        error={!!errors.roles}
                        renderValue={(selected) => selected.join(', ')}
                      >
                        <MenuItem value="admin">Quản trị viên</MenuItem>
                        <MenuItem value="manager">Người quản lý</MenuItem>
                        <MenuItem value="staff">Nhân viên</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.roles && <Typography variant="body2" color="error">{errors.roles.message}</Typography>}
                </FormControl>

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
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Vui lòng nhập password', minLength: { value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' } }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        name="password"
                        label="Password"
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
                      required: 'Vui lòng nhập password',
                      minLength: { value: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                      validate: value => value === watch('password') || 'Mật khẩu không khớp'
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
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
                </Box>
              </Grid>
            </Grid>

          </Grid>
          {/* <Grid size={6}>
          <ImageUploader onImageUpload={(data) => {console.log(data)}} />
        </Grid> */}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" color="secondary"
            LinkComponent={Link} to={Routes.admin.user.list}
          >
            Hủy
          </Button>
          <Button type='submit' variant="contained" color="primary">
            Lưu
          </Button>
        </Box>
      </form>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={status === 'loading'}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>

  )
}

export default UserForm