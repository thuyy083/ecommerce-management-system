import { useLocation, Link, useNavigate, useParams, matchPath } from 'react-router-dom'
import { Box, Button, CircularProgress, Typography } from '@mui/material'

import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import itemUnitService from '~/service/admin/itemUnit.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import { Routes } from '~/config'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import ItemUnitForm from '../form'
import useUserInfo from '~/hooks/useUserInfo'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'

function ItemUnitEdit() {
  const { id } = useParams()
  const location = useLocation()
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['itemUnit', id],
    enabled: !!user_id && !!device_id,
    queryFn: () => itemUnitService.getById({ device_id, user_id, }, id),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const breadcrumbs = findBreadcrumbs(Routes.admin.itemUnit.edit(), routeTree)

  const submit = async (data) => {
    itemUnitService.update({ device_id, user_id, }, id, data)
      .then(res => {
        navigate(Routes.admin.itemUnit.list)
        toast.success('Cập nhật loại hàng hóa thành công')
        console.log(res)
      })
      .catch(err => {
        console.log(err)
        toast.error(err.response.data.message)
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
      <Box sx={{}}>
        {breadcrumbs.map((item, index) => (
          <Button
            key={index}
            variant="text"
            color={matchPath(item.path, location.pathname) === item.path ? 'primary' : 'secondary'}
            disabled={matchPath(item.path, location.pathname)}
            component={Link}
            to={item.path}
          >
            {item.name}
            {!matchPath(item.path, location.pathname) && ' > '}
          </Button>
        ))}
      </Box>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Chỉnh sửa đơn vị tính
      </Typography>
      <ItemUnitForm submit={submit} data={data?.data}/>
    </Box>
  )
}

export default ItemUnitEdit
