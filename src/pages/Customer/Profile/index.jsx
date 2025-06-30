import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import useUserInfo from '~/hooks/useUserInfo'
import { Link } from 'react-router-dom'

export default function ProfileIndex() {
  const theme = useTheme()

  const {
    nameInfo,
    email,
    gender,
    birthDate,
    avatarImgUrl,
    addressInfo,
    phoneNumberInfo,
  } = useUserInfo()

  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Box sx={{ minWidth: 34 }}>{icon}</Box>
      <Typography variant="body1" fontWeight={500} sx={{ mr: 1 }}>
        {label}:
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  )

  if (!nameInfo) {
    return <Typography sx={{ p: 2 }}>Không tìm thấy thông tin người dùng</Typography>
  }

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        px: 2,
        pt: 1,
        pb: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          width: '100%',
          p: 4,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Avatar chính giữa */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar
            src={avatarImgUrl}
            alt={nameInfo.fullName}
            sx={{ width: 100, height: 100 }}
          />
        </Box>

        {/* Thông tin cá nhân */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            {nameInfo.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {email}
          </Typography>
        </Box>

        <Box>
          <InfoItem icon={<span>👤</span>} label="Giới tính" value={gender || 'Không rõ'} />
          <InfoItem
            icon={<span>📅</span>}
            label="Ngày sinh"
            value={birthDate ? new Date(birthDate).toLocaleDateString('vi-VN') : 'Không rõ'}
          />
          <InfoItem icon={<span>🌍</span>} label="Quốc gia" value={addressInfo?.COUNTRY || 'Chưa cập nhật'} />
          <InfoItem icon={<span>🏙️</span>} label="Tỉnh / Thành phố" value={addressInfo?.CITY || 'Chưa cập nhật'} />
          <InfoItem icon={<span>📍</span>} label="Quận / Huyện" value={addressInfo?.DISTRICT || 'Chưa cập nhật'} />

          {addressInfo?.ADDRESS_1 && (
            <InfoItem icon={<span>🏠</span>} label="Địa chỉ 1" value={addressInfo.ADDRESS_1} />
          )}
          {addressInfo?.ADDRESS_2 && (
            <InfoItem icon={<span>🏠</span>} label="Địa chỉ 2" value={addressInfo.ADDRESS_2} />
          )}

          <InfoItem icon={<span>📞</span>} label="Số điện thoại" value={phoneNumberInfo?.PHONE_NUMBER || 'Chưa có'} />
        </Box>


        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            component={Link}
            to="/customer/editProfile"
            variant="outlined"
            startIcon={<Edit />}
            sx={{
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            Chỉnh sửa thông tin
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
