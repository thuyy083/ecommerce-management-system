import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import EditIcon from '@mui/icons-material/Edit'
import WcIcon from '@mui/icons-material/Wc'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PublicIcon from '@mui/icons-material/Public'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import MapIcon from '@mui/icons-material/Map'
import PhoneIcon from '@mui/icons-material/Phone'
import { Link } from 'react-router-dom'

import useUserInfo from '~/hooks/useUserInfo'

const Profile = () => {
  const {
    nameInfo,
    gender,
    email,
    birthDate,
    avatarImgUrl,
    addressInfo,
    phoneNumberInfo
  } = useUserInfo()
  console.log('Profile: ',Profile)

  if (!nameInfo) {
    return <Typography>Không tìm thấy thông tin người dùng</Typography>
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: '#fafafa',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={avatarImgUrl} sx={{ width: 64, height: 64 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {nameInfo.fullName}
              </Typography>
              <Typography color="text.secondary">{email}</Typography>
            </Box>
          </Stack>

          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            component={Link}
            to="/updateProfile"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Chỉnh sửa thông tin
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={2}>
          <InfoItem icon={<WcIcon color="action" />} label="Giới tính" value={gender || 'Không rõ'} />

          <InfoItem
            icon={<CalendarTodayIcon color="action" />}
            label="Ngày sinh"
            value={birthDate ? new Date(birthDate).toLocaleDateString('vi-VN') : 'Không rõ'}
          />

          <InfoItem icon={<PublicIcon color="action" />} label="Quốc gia" value={addressInfo?.COUNTRY || 'Chưa cập nhật'} />

          <InfoItem
            icon={<LocationCityIcon color="action" />}
            label="Tỉnh / Thành phố"
            value={addressInfo?.CITY || 'Chưa cập nhật'}
          />

          <InfoItem
            icon={<MapIcon color="action" />}
            label="Quận / Huyện"
            value={addressInfo?.DISTRICT || 'Chưa cập nhật'}
          />

          <InfoItem
            icon={<PhoneIcon color="action" />}
            label="Số điện thoại"
            value={phoneNumberInfo?.PHONE_NUMBER || 'Chưa có'}
          />
        </Stack>
      </Paper>
    </Box>
  )
}

const InfoItem = ({ icon, label, value }) => (
  <Grid container alignItems="center">
    <Grid item xs={12} sm={4} md={3}>
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography variant="subtitle2" color="text.secondary">
          {label}:
        </Typography>
      </Stack>
    </Grid>
    <Grid item xs={12} sm={8} md={9}>
      <Typography>{value}</Typography>
    </Grid>
  </Grid>
)

export default Profile
