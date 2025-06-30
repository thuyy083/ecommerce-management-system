import * as React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import ChangePasswordForm from './ChangePasswordForm'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
const ChangePasswordPage = () => {
  const user = useSelector(state => state.user.currentUser)
  const navigate = useNavigate()
  useEffect(() => {
    if (!user) {
      alert('Bạn cần đăng nhập để truy cập chức năng này!')
      navigate('/login')
    }
  }, [user, navigate])

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
            Đổi Mật Khẩu
          </Typography>

          <Typography variant="body2" sx={{ mb: 3 }}>
            Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để đổi mật khẩu.
          </Typography>

          <ChangePasswordForm />
        </Card>
      </Container>
    </Box>
  )
}

export default ChangePasswordPage
