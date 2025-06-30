import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'

import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import itemUnitService from '~/service/admin/itemUnit.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import { Routes } from '~/config'
import { toast } from 'react-toastify'
import ItemUnitForm from '../form'
import useUserInfo from '~/hooks/useUserInfo'

function ItemUnitCreate() {
  const location = useLocation()
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const navigate = useNavigate()
  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)

  const submit = async (data) => {
    itemUnitService.create({ device_id, user_id, }, data)
      .then(res => {
        navigate(Routes.admin.itemUnit.list)
        toast.success('Tạo Đơn vị tính thành công')
        console.log(res)
      })
      .catch(err => {
        console.log(err)
        toast.error(err.response.data.message)
      })
  }

  return (
    <Box sx={{ minHeight: '700px' }}>
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
      <Typography variant="h4" sx={{ mb: 2 }}>
        Add new item unit
      </Typography>
      <ItemUnitForm submit={submit} />
    </Box>
  )
}

export default ItemUnitCreate
