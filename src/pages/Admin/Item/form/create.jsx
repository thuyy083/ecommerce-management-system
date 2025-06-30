import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { useForm, Controller } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import ImageUploader from '~/components/ImagesUploader'
import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import itemTypeService from '~/service/admin/itemType.service'
import unitInvoiceService from '~/service/admin/unitInvoice.service'
import MyEditor from '~/components/MyEditor'
import itemUnitService from '~/service/admin/itemUnit.service'
import BomMaterial from './BomMaterialCreate'
import { Link } from 'react-router-dom'
import { Routes } from '~/config'
import { Stack } from '@mui/material'


function ItemCreateForm({ submit }) {
  const {
    control,
    handleSubmit,
    formState: { errors }, watch
  } = useForm()
  const [itemAvtFile, setItemAvtFile] = useState(null)
  const [itemDescImgFiles, setItemDescImgFiles] = useState([])
  const [bomMaterials, setBomMaterials] = useState([])
  const [description, setDescription] = useState('')
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const { data: dataItemType, isLoading : isLoadingItemType, error: errorItemType } = useQuery({
    queryKey: ['itemTypeList'],
    enabled: !!device_id,
    queryFn: () => itemTypeService.search({
      user_id,
      device_id
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const { data: dataUnitInvoice, isLoading: isLoadingUnitInvoice, error: errorUnitInvoice } = useQuery({
    queryKey: ['unitInvoiceList'],
    enabled: !!device_id,
    queryFn: () => unitInvoiceService.search({
      user_id,
      device_id
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const { data: dataItemUnit, isLoading: isLoadingItemUnit, error: errorItemUnit } = useQuery({
    queryKey: ['itemUnitList'],
    enabled: !!device_id,
    queryFn: () => itemUnitService.search({
      user_id,
      device_id
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const { data: dataMaterialItemType } = useQuery({
    enabled: !!user_id && !!device_id,
    queryKey: ['materialItems'],
    queryFn: () => itemTypeService.findOneByName({
      user_id,
      device_id
    }, 'Nguyên liệu'),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5
  })
  const isMaterial = dataMaterialItemType?.data?._id === watch('itemType')

  const onSubmit = async (data) => {
    const validatedData = {
      ...data,
      description,
      itemAvtFile,
      itemDescImgFiles,
      stock: 0
    }

    if (bomMaterials.length > 0) {
      validatedData.bomMaterials = bomMaterials
    }

    console.log('data:', validatedData)

    await submit(validatedData)
  }

  console.log(errors)

  const handleChangeFiles = useCallback((files) => {
    console.log('files:', files)
    setItemAvtFile(files.uploadyFiles[0])
  }, [])

  const handleChangeDescFiles = useCallback((files) => {
    console.log('des img files:', files)
    setItemDescImgFiles(files.uploadyFiles)
  }, [])

  const handleChangBomMaterial = useCallback((materialItems) => {
    setBomMaterials(materialItems?.map(materialItem => ({
      QUANTITY: materialItem.QUANTITY,
      ITEM_CODE: materialItem.ITEM_CODE
    })))
  }, [])

  return (
    <Box
      sx={{
        // minHeight: '100vh',
      }}
      pb={20}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} id='form-create-update-item'>
        <Card>
          <CardHeader
            title={<Typography variant="body1" fontWeight={600}>Thông tin cơ bản</Typography>}
            sx={{
              color: 'gray',
              bgcolor: 'rgb(249, 250, 253)',
              padding: 2,
            }}
          >
          </CardHeader>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Stack gap={2}>
                  <Controller
                    name="itemName"
                    control={control}
                    rules={{ required: 'Vui lòng nhập tên loại mặt hàng', }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tên"
                        name='itemName'
                        fullWidth
                        error={!!errors.itemName}
                        helperText={errors.itemName?.message}
                      />
                    )}
                  />
                  <Controller
                    name="itemNameEn"
                    control={control}
                    rules={{ required: 'Vui lòng nhập tên tiếng Anh', }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tên tiếng Anh"
                        name='itemNameEn'
                        fullWidth
                        error={!!errors.itemNameEn}
                        helperText={errors.itemNameEn?.message}
                      />
                    )}
                  />
                  {!isLoadingItemType && !errorItemType && !!dataItemType && <FormControl>
                    <InputLabel id="itemType">loại</InputLabel>
                    <Controller
                      defaultValue=''
                      name="itemType"
                      control={control}
                      rules={{ required: 'Vui lòng chọn loại mặt hàng', }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          sx={{ height: '100%' }}
                          id="itemType"
                          label="Loại hàng hóa"
                          labelId="itemType"
                          name='itemType'
                          error={!!errors.itemType}
                        >
                          <MenuItem value=''>--</MenuItem>
                          {dataItemType?.data?.itemTypes?.map((itemType) => (
                            <MenuItem key={itemType._id} value={itemType._id}>
                              {itemType.ITEM_TYPE_NAME}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                  }
                </Stack>
              </Grid>
              <Grid size={6}>
                <Stack gap={2}>
                  {!isLoadingItemUnit && !errorItemUnit && !!dataItemUnit && <FormControl>
                    <InputLabel id="unitId">Đơn vị tính</InputLabel>
                    <Controller
                      defaultValue=''
                      name="unitId"
                      control={control}
                      rules={{ required: 'Vui lòng chọn đơn vị  tính', }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          sx={{ height: '100%' }}
                          id="unitId"
                          label="Đơn vị tính"
                          labelId="unitId"
                          name='unitId'
                          error={!!errors.unitId}
                        >
                          <MenuItem value=''>--</MenuItem>
                          {dataItemUnit?.data?.map((itemUnit) => (
                            <MenuItem key={itemUnit._id} value={itemUnit._id}>
                              {itemUnit.UNIT_ITEM_NAME}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                  }
                  {errorItemType && <Typography variant='body1' color='error'>Lỗi khi tải loại hàng hóa:</Typography>}
                  {errors.unitId && <Typography variant='caption' color='error'>{errors.unitId.message}</Typography>}
                  {!isMaterial && (
                    <>
                      {!isLoadingUnitInvoice && !errorUnitInvoice && !!dataUnitInvoice && <FormControl>
                        <InputLabel id="unitInvoiceId">Đơn vị tiền tệ</InputLabel>
                        <Controller
                          defaultValue=''
                          name="unitInvoiceId"
                          control={control}
                          rules={{ required: 'Vui lòng chọn đơn vị tiền tệ', }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              sx={{ height: '100%' }}
                              id="unitInvoiceId"
                              label="Đơn vị tiền tệ"
                              labelId="unitInvoiceId"
                              name='unitInvoiceId'
                              error={!!errors.unitInvoiceId}
                            >
                              <MenuItem value=''>--</MenuItem>
                              {dataUnitInvoice?.data?.map((unitInvoice) => (
                                <MenuItem key={unitInvoice._id} value={unitInvoice._id}>
                                  {unitInvoice.UNIT_NAME}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                      </FormControl>
                      }
                      {errorItemType && <Typography variant='body1' color='error'>Lỗi khi tải loại hàng hóa:</Typography>}
                      {errors.unitInvoiceId && <Typography variant='caption' color='error'>{errors.unitInvoiceId.message}</Typography>}
                      <Controller
                        name="price"
                        control={control}
                        rules={{ required: 'Vui lòng nhập giá hàng hóa', }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Giá"
                            name='price'
                            type='number'
                            fullWidth
                            error={!!errors.price}
                            helperText={errors.price?.message}
                          />
                        )}
                      />
                    </>
                  )}
                </Stack>
              </Grid>
            </Grid>
            {errorItemType && <Typography variant='body1' color='error'>Lỗi khi tải loại hàng hóa:</Typography>}
            {errors.unitInvoiceId && <Typography variant='caption' color='error'>{errors.unitInvoiceId.message}</Typography>}
            <MyEditor content={description} handleChange={(html) => setDescription(html)} />
          </CardContent>
        </Card>
        <Grid container spacing={2} my={4}>
          <Grid size={6}>
            <Typography variant="h6" mb={2} fontWeight={600}>Thêm ảnh đại diện</Typography>
            <ImageUploader handleChange={handleChangeFiles} limit={1}/>
          </Grid>
          <Grid size={6}>
            <Typography variant="h6" mb={2} fontWeight={600}>Thêm ảnh mô tả</Typography>
            <ImageUploader handleChange={handleChangeDescFiles} />
          </Grid>
        </Grid>
        {!isMaterial && (
          <>
            <Typography variant="h6" mb={2} fontWeight={600}>Thành phần sản xuất</Typography>
            <BomMaterial changeBomMaterials={handleChangBomMaterial}/>
          </>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" color="secondary" type="reset"
            LinkComponent={Link} to={Routes.admin.item.list}
          >
                            Hủy
          </Button>
          <Button variant="contained" color="primary" type="submit">
                            Lưu
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export default ItemCreateForm