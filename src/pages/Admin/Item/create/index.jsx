import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Backdrop, Box, Button, CircularProgress, Typography } from '@mui/material'

import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import itemService from '~/service/admin/item.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import { Routes } from '~/config'
import { toast } from 'react-toastify'
import ItemCreateForm from '../form/create'
import useUserInfo from '~/hooks/useUserInfo'
import imageService from '~/service/image.service'
import { useState } from 'react'

function ItemCreate() {
  const location = useLocation()
  const device_id = useDeviceId()
  const [isCreating, setIsCreating] = useState(false)
  const { userId: user_id } = useUserInfo()
  const navigate = useNavigate()
  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)

  const submit = async (data) => {
    const itemAvtFile = data.itemAvtFile
    const itemDescImgFiles = data.itemDescImgFiles
    delete data.itemAvtFile
    delete data.itemDescImgFiles
    const credential = { user_id, device_id }
    console.log(itemAvtFile, itemDescImgFiles)
    setIsCreating(true)
    itemService.create(credential, data)
      .then(async res => {
        console.log(res)
        try {
          if (itemAvtFile) {
            const avtItemRes = await imageService.uploadAvatarItem(itemAvtFile, res.data._id)
            await itemService.update(
              credential,
              res.data._id,
              { avatarImageUrl: avtItemRes.data.url }
            )
          }

          if (itemDescImgFiles?.length > 0) {
            const descImagesListRes = await imageService.upLoadListImage(itemDescImgFiles, 'PRODUCT', res.data._id,)
            await itemService.updateListDescImages(
              credential,
              res.data._id,
              descImagesListRes.data.urls.map(url => ({ URL: url }))
            )
          }
          setIsCreating(false)
          navigate(Routes.admin.item.list)
          toast.success('Tạo hàng hóa thành công')
        } catch (error) {
          setIsCreating(false)
          console.log(error)
          toast.error(error?.response?.data?.message)
        }
      })
      .catch(err => {
        setIsCreating(false)
        console.log(err)
        toast.error(err?.response?.data?.message)
      })
  }

  return (
    <Box sx={{ minHeight: '700px' }}>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={isCreating}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
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
      <Typography variant="h4" sx={{ mb: 5 }}>
        Add new Item
      </Typography>
      <ItemCreateForm submit={submit} />
    </Box>
  )
}

export default ItemCreate
