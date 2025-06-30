import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  TextField,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Grid,
} from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import { Save } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { PhotoCamera } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useDeviceId } from '~/hooks/useDeviceId'
import { updateProfileCus } from '~/redux/thunks/user.thunk'
import { useNavigate } from 'react-router-dom'
import ImageUploader from '~/components/AvatarUploader'
import { toast } from 'react-toastify'
import imageService from '~/service/image.service'
import useUserInfo from '~/hooks/useUserInfo'
import dayjs from 'dayjs'
import LocationSelector from '~/components/LocationSelector'
import { MuiTelInput } from 'mui-tel-input'


export default function EditProfile() {
  const theme = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const deviceId = useDeviceId()
  const { nameInfo, gender, phoneNumberInfo } = useUserInfo()
  const user = useSelector(state => state.user.currentUser)
  const userId = user?.USER_ID
  const [avatarFile, setAvatarFile] = useState(null)
  const { control, handleSubmit, setValue, formState: { errors } } = useForm({ defaultValues: { dob: '' } })

  useEffect(() => {
    if (nameInfo) {
      setValue('firstname', nameInfo.firstName || '')
      setValue('lastname', nameInfo.lastName || '')
    }
    const fullPhone = `${phoneNumberInfo?.COUNTRY_CODE || ''}${phoneNumberInfo?.PHONE_NUMBER || ''}`
    setValue('phoneNumber', fullPhone)
    setValue('gender', gender ?? '')
    setValue('addressSelector', {
      city: { name: 'Cần Thơ' },
      district: { name: 'Ninh Kiều' },
      ward: { name: 'An Khánh' },
    })
    setValue('address1', user?.ADDRESS?.ADDRESS_1 || '')
    setValue('address2', user?.ADDRESS?.ADDRESS_2 || '')
  }, [nameInfo, gender, phoneNumberInfo, setValue, user])

  useEffect(() => {
    if (user?.dob) {
      setValue('dob', user.dob.slice(0, 10))
    }
    if (user?.BIRTH_DATE) {
      const dobValue = dayjs(user.BIRTH_DATE).format('YYYY-MM-DD')
      setValue('dob', dobValue)
    }
  }, [user, setValue])

  const submit = async (data) => {
    try {
      const rawPhone = data.phoneNumber.replace(/\D/g, '')
      const countryCode = `+${rawPhone.substring(0, 2)}`
      const areaCode = rawPhone.substring(2, 4)
      const number = rawPhone.substring(2)

      const phone = {
        countryCode,
        countryName: 'Vietnam',
        areaCode,
        phoneNumber: number,
        fullPhoneNumber: `${countryCode}${number}`,
      }

      let newAvt = null
      if (avatarFile) {
        const avatarUrl = await imageService.uploadAvatar(avatarFile, userId, user.AVATAR_IMG_URL)
        newAvt = avatarUrl.data.url
      }

      const address = {
        country: 'Vietnam',
        city: data.addressSelector?.city?.name || '',
        district: data.addressSelector?.district?.name || '',
        ward: data.addressSelector?.ward?.name || '',
        state: 'SG',
        address1: data.address1 || '',
        address2: data.address2 || '',
      }

      const payload = {
        firstName: data.firstname,
        lastName: data.lastname,
        gender: data.gender,
        dob: data.dob,
        address,
        phone,
        avatar: newAvt || user.AVATAR_IMG_URL,
        contact: { relationship: 'vvv' },
      }

      dispatch(updateProfileCus({ credentials: { user_Id: userId, device_Id: deviceId }, payload, navigate }))
      toast.success('Cập nhật thành công!')
    } catch (error) {
      toast.error('Cập nhật thất bại!')
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        px: 2,
        pt: 2,
        pb: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <form onSubmit={handleSubmit(submit)}>
        <Paper
          elevation={3}
          sx={{ maxWidth: 600, width: '100%', px: 4, py: 3, borderRadius: 3 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ImageUploader onImageUpload={(file) => setAvatarFile(file)} />
          </Box>

          <Grid container spacing={2}>
            <Grid sx={{ width: 250 } } item xs={12} sm={6}>
              <Controller
                name="firstname"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Họ" />
                )}
              />
            </Grid>
            <Grid sx={{ width: 250}} item xs={12} sm={6}>
              <Controller
                name="lastname"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Tên" />
                )}
              />
            </Grid>

            <Grid sx={{ width: 250}} item xs={12} sm={6}>
              <Controller
                name="gender"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Giới tính</InputLabel>
                    <Select {...field} fullWidth label="Giới tính">
                      <MenuItem value="Nam">Nam</MenuItem>
                      <MenuItem value="Nữ">Nữ</MenuItem>
                      <MenuItem value="Khác">Khác</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid sx={{ width: 250}} item xs={12} sm={6}>
              <Controller
                name="dob"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} type="date" fullWidth label="Ngày sinh" InputLabelProps={{ shrink: true }} />
                )}
              />
            </Grid>
            <Grid sx={{ width: 500}} item xs={12}>
              <Controller
                name="phoneNumber"
                control={control}
                defaultValue=""
                rules={{
                  required: 'Vui lòng nhập Số điện thoại',
                  validate: (value) => value.trim() !== '' || 'Số điện thoại không hợp lệ'
                }}
                render={({ field }) => (
                  <MuiTelInput
                    {...field}
                    fullWidth
                    defaultCountry="VN"
                    label="Số điện thoại"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid sx={{ width: 500 }} item xs={12}>
              <Controller
                name="addressSelector"
                control={control}
                render={({ field }) => (
                  <LocationSelector
                    value={{ city: 'Cần Thơ', district: 'Ninh Kiều', ward: 'An Khánh' }}
                    onChange={field.onChange}
                  />
                )}
              />
            </Grid>
            <Grid sx={{ width: 250}} item xs={12}>
              <Controller
                name="address1"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Địa chỉ 1" />
                )}
              />
            </Grid>
            <Grid sx={{ width: 250}} item xs={12}>
              <Controller
                name="address2"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Địa chỉ 2" />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button type="submit" variant="contained" startIcon={<Save />}>
              Lưu thay đổi
            </Button>
          </Box>
        </Paper>
      </form>
    </Box>
  )
}
