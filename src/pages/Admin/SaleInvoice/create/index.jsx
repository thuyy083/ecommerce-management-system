import { Box, Button, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import SaleInvoiceForm from '../form'
import { toast } from 'react-toastify'
import saleInvoiceSerivce from '~/service/admin/saleInvoice.serivce'
import useUserInfo from '~/hooks/useUserInfo'
import { useDeviceId } from '~/hooks/useDeviceId'
import { Routes } from '~/config'

function SaleInvoiceCreate() {
  const navigate = useNavigate()
  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)
  const { userId: user_id } = useUserInfo()
  const device_id = useDeviceId()
  const createSaleInvoice = async (data) => {
    try {
      await saleInvoiceSerivce.create(
        { device_id, user_id },
        data
      )

      toast.success('Tạo hóa đơn bán hàng thành công')
      navigate(Routes.admin.saleInvoices.list)
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }
  return (
    <Box
      sx={{ minHeight: '1000px', pt: 2 }}
    >
      <Box sx={{ mb: 3 }}>
        {breadcrumbs.map((item, index) => (
          <Button
            key={index}
            variant="text"
            color={location.pathname === item.path ? 'primary' : 'secondary'}
            disabled={location.pathname === item.path}
            component={Link}
            to={item.path}
          >
            {item.name}
            {location.pathname !== item.path && ' > '}
          </Button>
        ))}
      </Box>
      <Typography variant='h4' mb={4}>Hóa đơn bán hàng</Typography>
      <SaleInvoiceForm submit={createSaleInvoice}/>
    </Box>
  )
}

export default SaleInvoiceCreate