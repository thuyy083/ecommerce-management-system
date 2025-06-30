import React, { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import {
  Box, AppBar, Toolbar, Typography, Button, IconButton, Avatar,
  Container, CssBaseline, ThemeProvider, Drawer, List, ListItem, ListItemText
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import LogoutIcon from '@mui/icons-material/Logout'
import LoginIcon from '@mui/icons-material/Login'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '~/redux/thunks/user.thunk'
import { logo1 } from '~/assets/images'
import themeCustomer from '../themeCustomer'
import { useDeviceId } from '~/hooks/useDeviceId'
import MiniCart from './MiniCart'

export default function CustomerLayout() {
  const user = useSelector(s => s.user.currentUser)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const device_id = useDeviceId()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = () => {
    const user_id = user.USER_ID
    dispatch(logout({ credentials: { user_id, device_id }, navigate }))
  }

  const navLinks = [
    { label: 'Trang chủ', path: '/customer/home' },
    { label: 'Sản phẩm', path: '/customer/list-Item' },
    { label: 'Đơn hàng', path: '/customer/orderInfo' }
  ]

  return (
    <ThemeProvider theme={themeCustomer}>
      <CssBaseline />

      {/* ---------- Navbar ---------- */}
      <AppBar position="fixed" color="primary">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/customer/home"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <Box
              component="img"
              src={logo1}
              alt="Logo"
              sx={{ height: { xs: 40, md: 56 }, width: 'auto', objectFit: 'contain', mr: 1 }}
            />
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, ml: 5, flexGrow: 1 }}>
            {navLinks.map(link => (
              <Button
                key={link.path}
                component={Link}
                to={link.path}
                sx={{ color: '#fff', fontWeight: 600, '&:hover': { bgcolor: 'secondary.main' } }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MiniCart />
            {user ? (
              <>
                <IconButton color="inherit" component={Link} to="/customer/profileCustomer">
                  <Avatar src={user.AVATAR_IMG_URL} sx={{ width: 30, height: 30 }} />
                </IconButton>
                <IconButton color="inherit" onClick={handleLogout}>
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton color="inherit" component={Link} to="/login"><LoginIcon /></IconButton>
                <IconButton color="inherit" component={Link} to="/register"><HowToRegIcon /></IconButton>
              </>
            )}

            <IconButton
              color="inherit"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 200 }}>
          {navLinks.map(link => (
            <ListItem button key={link.path} onClick={() => { navigate(link.path); setDrawerOpen(false) }}>
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Toolbar />

      {/* ---------- Main content ---------- */}
      <Box sx={{ minHeight: '80vh', py: { xs: 2, md: 3 }, bgcolor: 'info.main' }}>
        <Container><Outlet /></Container>
      </Box>

      {/* ---------- Footer ---------- */}
      <Box component="footer" sx={{ bgcolor: 'success.main', color: '#fff', py: 4, mt: 4 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gap: 4,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            }}
          >
            <Box sx={{ wordBreak: 'break-word' }}>
              <Typography variant="h6" gutterBottom>Về 5TRENDZ</Typography>
              <Typography variant="body2">
                5TRENDZ là shop thời trang dành cho giới trẻ, mang phong cách
                hiện đại, năng động và luôn bắt kịp xu hướng. Tại đây, bạn sẽ tìm thấy
                đa dạng mẫu mã từ streetwear cá tính đến trang phục thanh lịch,
                với chất liệu chất lượng, giá cả hợp lý và dịch vụ tận tâm.
                5TRENDZ – khẳng định cá tính, bắt nhịp xu hướng!
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>Thành viên nhóm</Typography>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                <li>Võ Thị Cẩm Thùy</li>
                <li>Đỗ Thanh Dũ</li>
                <li>Trần Quốc Việt</li>
                <li>Võ Thị Hồng Lam</li>
                <li>Trần Kim Ngân</li>
              </ul>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>Liên hệ</Typography>
              <Typography>Email: 5trendz@example.com</Typography>
              <Typography>Hotline: 0123 456 789</Typography>
              <Typography>Địa chỉ: 123 HN, Cần Thơ</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}
