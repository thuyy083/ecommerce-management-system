import { useLocation, Link, useParams, matchPath } from 'react-router-dom'
import { Box, Button, Typography, CircularProgress } from '@mui/material'

import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import itemService from '~/service/admin/item.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import { Routes } from '~/config'
import { useQuery } from '@tanstack/react-query'
import ItemUpdateForm from '../form/update'
import useUserInfo from '~/hooks/useUserInfo'

function ItemDetail() {
  const { id } = useParams()
  const location = useLocation()
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const { data, isLoading, error } = useQuery({
    queryKey: ['item', id],
    enabled: !!user_id && !!device_id,
    queryFn: () => itemService.search({
      user_id,
      device_id,
    }, {
      itemId: id
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const breadcrumbs = findBreadcrumbs(Routes.admin.item.edit(), routeTree)

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%', minHeight: '700px', p: 3 }}>
      <CircularProgress/>
      <Typography variant='body1' sx={{ color: 'grey' }}>Đang tải dữ liệu...</Typography>
    </Box>)
  if (error) return <div>Error: {error.message}</div>


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
      <Typography variant="h4" sx={{ mb: 5, mx: 20, textAlign: 'center' }}>
        Chi tiết hàng hóa
      </Typography>
      <ItemUpdateForm data={data?.data?.items[0]} viewOnly/>
    </Box>
  )
}

export default ItemDetail
