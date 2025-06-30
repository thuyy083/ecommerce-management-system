import { useLocation, Link, useNavigate, useParams, matchPath } from 'react-router-dom'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import VoucherForm from '../form'
import vouchersService from '~/service/admin/vouchers.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import { Routes } from '~/config'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import useUserInfo from '~/hooks/useUserInfo'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'

function EditVoucher() {
  const { id } = useParams()
  const location = useLocation()
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['voucher', id],
    enabled: !!user_id && !!device_id,
    queryFn: () => vouchersService.getVoucherDetail(id, { device_id, user_id }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const breadcrumbs = findBreadcrumbs(Routes.admin.vouchers.edit(id), routeTree)

  const submit = async (formData) => {
    vouchersService.updateVoucher({ device_id, user_id }, id, formData)
      .then(res => {
        navigate(Routes.admin.vouchers.voucherDetail(formData.VOUCHER_CODE))
        toast.success('Cập nhật voucher thành công')
      })
      .catch(err => {
        const message = err.response?.data?.message || 'Cập nhật voucher thất bại!';
        toast.error(message)
      })
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%', minHeight: '700px', p: 3 }}>
        <CircularProgress/>
        <Typography variant='body1' sx={{ color: 'grey' }}>Đang tải dữ liệu...</Typography>
      </Box>
    )
  }
  if (error) return (
    <Box sx={{ minHeight: '90vh' }}>
      <SearchResultNotFound message={error?.response?.data?.message || 'Lỗi khi lấy dữ liệu'} />
    </Box>
  )

  return (
    <Box sx={{ minHeight: '700px', p: 3 }}>
      <Box sx={{ mb: 2 }}>
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
      <VoucherForm submit={submit} data={data?.data} disableCode />
    </Box>
  )
}

export default EditVoucher
