import * as React from 'react'
import { createTheme } from '@mui/material/styles'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import BarChartIcon from '@mui/icons-material/BarChart'
import DescriptionIcon from '@mui/icons-material/Description'
import LayersIcon from '@mui/icons-material/Layers'
import { AppProvider } from '@toolpad/core/AppProvider'
import { DashboardLayout } from '@toolpad/core/DashboardLayout'
import PeopleIcon from '@mui/icons-material/People'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import HandshakeIcon from '@mui/icons-material/Handshake'
import CategoryIcon from '@mui/icons-material/Category'
import BalanceIcon from '@mui/icons-material/Balance'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import InventoryIcon from '@mui/icons-material/Inventory'
import { Navigate } from 'react-router-dom'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import PieChartIcon from '@mui/icons-material/PieChart'
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia'
import { LiaFileInvoiceSolid } from 'react-icons/lia'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'


import UserMenu from './UserMenu'
import { Routes } from '~/config'
import { logo } from '~/assets/images'
import useAuth from '~/hooks/useAuth'
import RouteChangeProgress from '~/components/RouteChangeProgress'

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Main',
  },
  {
    segment: Routes.admin.dashboard.slice(1),
    title: 'Thống kê',
    icon: <DashboardIcon />,
  },
  {
    segment: Routes.admin.staticticRevenue.slice(1),
    title: 'Thống kê doanh thu',
    icon: <AttachMoneyIcon />,
  },
  {
    segment: Routes.admin.staticticExpense.slice(1),
    title: 'Thống kê chi tiêu',
    icon: <MoneyOffIcon />,
  },
  {
    segment: Routes.admin.orders.list.slice(1),
    title: 'Đơn hàng',
    icon: <ShoppingCartIcon />,
  },
  // {
  //   kind: 'divider',
  // },
  // {
  //   kind: 'header',
  //   title: 'Analytics',
  // },
  // {
  //   segment: 'reports',
  //   title: 'Reports',
  //   icon: <BarChartIcon />,
  //   children: [
  //     {
  //       segment: 'sales',
  //       title: 'Sales',
  //       icon: <DescriptionIcon />,
  //     },
  //     {
  //       segment: 'traffic',
  //       title: 'Traffic',
  //       icon: <DescriptionIcon />,
  //     },
  //   ],
  // },
  // {
  //   segment: 'integrations',
  //   title: 'Integrations',
  //   icon: <LayersIcon />,
  // },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Hóa đơn'
  },
  {
    segment: Routes.admin.purchaseInvoices.list.slice(1),
    title: 'Hóa đơn nhập hàng',
    icon: <LiaFileInvoiceSolid size={25} />,
  },
  {
    segment: Routes.admin.saleInvoices.list.slice(1),
    title: 'Hóa đơn bán hàng',
    icon: <LiaFileInvoiceDollarSolid size={25} />
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Authentication',
    requireRoles: ['admin']
  },
  {
    segment: Routes.admin.user.list.slice(1),
    title: 'Người dùng',
    icon: <PeopleIcon />,
    requireRoles: ['admin']
  },
  {
    kind: 'divider',
    requireRoles: ['admin']
  },
  {
    kind: 'header',
    title: 'Hàng hóa',
  },
  {
    segment: Routes.admin.item.list.slice(1),
    title: 'Hàng hóa',
    icon: <InventoryIcon />
  },
  {
    segment: Routes.admin.itemType.list.slice(1),
    title: 'Loại hàng hóa',
    icon: <CategoryIcon />
  },
  {
    segment: Routes.admin.itemUnit.list.slice(1),
    title: 'Đơn vị tính',
    icon: <BalanceIcon />
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Mã giảm giá',
  },
  {
    segment: Routes.admin.vouchers.list.slice(1),
    title: 'Mã giảm giá',
    icon: <LocalOfferIcon />
  },
  {
    segment: Routes.admin.vouchers.statistics.slice(1),
    title: 'Thống kê mã giảm giá',
    icon: <PieChartIcon />
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Other',
  },
  {
    segment: Routes.admin.supplier.list.slice(1),
    title: 'Nhà cung ứng',
    icon: <HandshakeIcon />
  },
  {
    segment: Routes.admin.unitInvoice.list.slice(1),
    title: 'Đơn vị tiền tệ',
    icon: <AttachMoneyIcon />
  }
]

const demoTheme = createTheme({
  colorSchemes: { light: true, dark: false },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
})


function useAdminRouter() {
  const location = useLocation()
  const navigate = useNavigate()

  const router = React.useMemo(() => ({
    pathname: location.pathname,
    searchParams: new URLSearchParams(location.search),
    navigate: (to) => {
      const path = to
      navigate(path)
    },
  }), [location, navigate])

  return router
}

export default function DashboardLayoutBasic(props) {
  const router = useAdminRouter()
  const { haveOneOfRoles } = useAuth()
  const { window } = props

  // if (!user) {
  //   return <Navigate to="/login" replace />
  // }

  // Remove this const when copying and pasting into your project.
  const demoWindow = window ? window() : undefined

  const filteredNavigation = NAVIGATION.filter(item => {
    if (item?.requireRoles && !haveOneOfRoles(item?.requireRoles)) {
      return false
    }
    return true
  })

  return (
    <AppProvider
      branding={{ logo: <img src={logo} />, title: '' }}
      navigation={filteredNavigation}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout
        slots={{
          toolbarAccount: () => (
            <UserMenu />
          ),
        }}
      >
        <RouteChangeProgress />
        <Box sx={{ mx: 1, px: 3, pt: 3, backgroundColor: '#f5f7fa' }}>
          <Outlet />
        </Box>
      </DashboardLayout>
    </AppProvider>
  )
}
