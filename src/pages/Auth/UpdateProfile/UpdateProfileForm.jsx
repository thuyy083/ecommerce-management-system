import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useEffect } from 'react'
import FormControl from '@mui/material/FormControl'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
//import ImageUploader from '~/components/ImageUploader'
import LocationSelector from '~/components/LocationSelector'
import { MuiTelInput } from 'mui-tel-input'
import { useForm, Controller } from 'react-hook-form'
import useUserInfo from '~/hooks/useUserInfo'
import { useDispatch, useSelector } from 'react-redux'
import { useDeviceId } from '~/hooks/useDeviceId'
import { updateProfile } from '~/redux/thunks/user.thunk'
import { useNavigate } from 'react-router-dom'
import ImageUploader from '~/components/AvatarUploader'
import { useState } from 'react'
import { toast } from 'react-toastify'
import imageService from '~/service/image.service'
import dayjs from 'dayjs'

function UpdateProfileForm() {
  const {
    nameInfo,
    gender,
    phoneNumberInfo,
    addressInfo
  } = useUserInfo()

  const [avatarFile, setAvatarFile] = useState(null)
  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { dob: '' }
  })


  const user = useSelector(state => state.user.currentUser)
  const userId = user?.USER_ID
  const deviceId = useDeviceId()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (nameInfo) {
      setValue('firstname', nameInfo.firstName || '')
      setValue('lastname', nameInfo.lastName || '')
    }

    const fullPhone = `${phoneNumberInfo?.COUNTRY_CODE || ''}${phoneNumberInfo?.PHONE_NUMBER || ''}`
    setValue('phoneNumber', fullPhone)

    setValue('gender', gender ?? '')

    // setValue('addressSelector', {
    //   city: { name: 'Cần Thơ' },
    //   district: { name: 'Ninh Kiều' },
    //   ward: { name: 'An Khánh' }
    // })
    if (user?.ADDRESS) {
      setValue('addressSelector', {
        city: { name: user.ADDRESS.CITY || '' },
        district: { name: user.ADDRESS.DISTRICT || '' },
        ward: { name: user.ADDRESS.WARD || '' }
      })

      setValue('address1', user.ADDRESS.ADDRESS_1 || '')
      setValue('address2', user.ADDRESS.ADDRESS_2 || '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameInfo, gender, phoneNumberInfo, setValue])

  useEffect(() => {
    if (user?.dob) {
      setValue('dob', user.dob.slice(0, 10))
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
        fullPhoneNumber: `${countryCode}${number}`
      }

      let newAvt = null

      if (avatarFile) {
        const avatarUrl = await imageService.uploadAvatar(avatarFile, userId, user.AVATAR_IMG_URL)
        console.log('Uploaded avatar:', avatarUrl.data.url)
        newAvt = avatarUrl.data.url
        // window.location.reload()
      }
      const address = {
        country: 'Vietnam',
        city: data.addressSelector?.city?.name || '',
        district: data.addressSelector?.district?.name || '',
        ward: data.addressSelector?.ward?.name || '',
        state: 'SG',
        address1: data.address1 || '',
        address2: data.address2 || ''
      }

      const payload = {
        firstName: data.firstname,
        lastName: data.lastname,
        gender: data.gender,
        dob: data.dob,
        address,
        phone,
        avatar: newAvt || user.AVATAR_IMG_URL,
        contact: { relationship: 'vvv' }
      }

      console.log('Payload gửi về server:', payload)
      console.log('userId gửi về server:', userId)

      //await userService.updateProfile(payload, userId, deviceId)
      dispatch(updateProfile({ credentials: { user_Id: userId, device_Id: deviceId }, payload, navigate }))
      toast.success('Cập nhật thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật:', error)
      toast.error('Cập nhật thất bại!')
    }
  }
  useEffect(() => {
    if (user?.BIRTH_DATE) {
      const dobValue = dayjs(user.BIRTH_DATE).format('YYYY-MM-DD')
      setValue('dob', dobValue)
    }
  }, [user, setValue])

  // console.log("submit data: ", submit)

  return (
    <form style={{ backgroundColor: '#fff', padding: '24px' }} onSubmit={handleSubmit(submit)}>
      <Typography variant="h6" sx={{ color: '#4A4A4A', fontWeight: 400, textTransform: 'uppercase', pb: 4 }}>
        Thông tin cá nhân
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstname"
                control={control}
                defaultValue=""
                rules={{ required: 'Vui lòng nhập Họ' }}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Họ" error={!!errors.firstname} helperText={errors.firstname?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastname"
                control={control}
                defaultValue=""
                rules={{ required: 'Vui lòng nhập Tên' }}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Tên" error={!!errors.lastname} helperText={errors.lastname?.message} />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="gender"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel id="gender-label">Giới tính</InputLabel>
                    <Select
                      {...field}
                      fullWidth
                      labelId="gender-label"
                      label="Giới tính"
                      value={field.value || ''}
                    >
                      <MenuItem value="Nam">Nam</MenuItem>
                      <MenuItem value="Nữ">Nữ</MenuItem>
                      <MenuItem value="Khác">Khác</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="dob"
                control={control}
                defaultValue=""
                rules={{ required: 'Vui lòng chọn ngày sinh' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Ngày sinh"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={!!errors.dob}
                    helperText={errors.dob?.message}
                  />
                )}
              />
            </Grid>


            <Grid item xs={12} sm={6}>
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


            <Grid item xs={12}>
              <Controller
                name="addressSelector"
                control={control}
                rules={{
                  // eslint-disable-next-line no-unused-vars
                  validate: (value) => {
                    // if (!value || Object.keys(value?.city)?.length === 0) {
                    //   return 'Vui lòng nhập vào Thành phố/Tỉnh'
                    // } else if (Object.keys(value?.district)?.length === 0) {
                    //   return 'Vui lòng chọn Quận/Huyện'
                    // } else if (Object.keys(value?.ward)?.length === 0) {
                    //   return 'Vui lòng nhập vào Phường, Thị xã,...'
                    // }
                  }
                }}
                render={({ field, fieldState }) => (
                  <LocationSelector
                    value={{
                      city: addressInfo?.CITY,
                      district: addressInfo?.DISTRICT,
                      ward: addressInfo?.WARD,
                    }}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address1"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Địa chỉ 1 (số nhà, tên đường, v.v.)"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="address2"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Địa chỉ 2 (block, căn hộ, v.v.)"
                  />
                )}
              />
            </Grid>

          </Grid>

        </Grid>
        <Grid item xs={12} md={6}>
          <ImageUploader onImageUpload={(file) => setAvatarFile(file)} />
        </Grid>

      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button variant="outlined" color="secondary">Huỷ</Button>
        <Button type="submit" variant="contained" color="primary">Lưu thay đổi</Button>
      </Box>
    </form>
  )
}

export default UpdateProfileForm
