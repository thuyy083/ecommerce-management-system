import { createTheme } from '@mui/material'

const themeCustomer = createTheme({
  palette: {
    primary:   { main: '#FF90BB', contrastText: '#ffffff' },
    secondary: { main: '#FFC1DA', contrastText: '#ffffff' },
    info:      { main: '#F8F8E1', contrastText: '#333333' },
    success:   { main: '#8ACCD5', contrastText: '#ffffff' },
    background: {
      default: '#F8F8E1',
      paper:   '#ffffff',
    },
  },
  components: {
    // AppBar luôn màu hồng đậm
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: '#FF90BB' } },
    },
    // Button nhẹ nhàng, bo góc tròn hơn
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 20, textTransform: 'none', fontWeight: 600 },
      },
    },
  },
})

export default themeCustomer
