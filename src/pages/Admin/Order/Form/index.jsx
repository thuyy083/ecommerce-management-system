import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import MapIcon from '@mui/icons-material/Map'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ExploreIcon from '@mui/icons-material/Explore'
import ShieldIcon from '@mui/icons-material/Shield'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Controller, useForm } from 'react-hook-form'
import { TbReceiptTax } from 'react-icons/tb'
import EditNoteIcon from '@mui/icons-material/EditNote'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload'
import CancelIcon from '@mui/icons-material/Cancel'
import { useQuery } from '@tanstack/react-query'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import unitInvoiceService from '~/service/admin/unitInvoice.service'
import { PAYMENT_STATUS, SALE_INVOICES_PURCHASE_METHODS, SALE_INVOICE_STATUS } from '~/utils/contant'
import SearchItemInput from '~/components/Admin/SearchItemInput'
import SearchUserInput from '~/components/Admin/SearchUserInput'
import { useMemo, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import { formatCurrency, formatUrl } from '~/utils/formatter'
import SearchVoucherInput from '~/components/Admin/SearchVoucherInput'
import UserInfoItem from '~/components/Admin/UserInfoItem'
import LocationSelector from '~/components/LocationSelector'
import { Badge } from '@mui/material'
import useAuth from '~/hooks/useAuth'
import { MuiTelInput } from 'mui-tel-input'

function OrderForm({ submit, data, isEdited, isReadOnly }) {
  const {
    control,
    handleSubmit,
    watch,
    register,
    formState: { errors }
  } = useForm()
  const deviceId = useDeviceId()
  const { nameInfo, email, phoneNumberInfo, addressInfo, userId } = useUserInfo()
  const { roles } = useAuth()
  const staffContact = data?.STAFF_CONTACT
    ? {
      ...data?.STAFF_CONTACT,
      ROLES: Object.entries(data?.STAFF_CONTACT?.ROLE)
        // eslint-disable-next-line no-unused-vars
        .filter(([_, value]) => value)
        .map(([key]) => key.replace(/^IS_/, '').toLowerCase())
    }
    : {
      _id: userId,
      NAME: nameInfo?.fullName ?? `${nameInfo?.lastName} ${nameInfo?.FIRST_NAME}`,
      EMAIL: email,
      PHONE_NUMBER: phoneNumberInfo?.FULL_PHONE_NUMBER,
      CITY: addressInfo?.CITY,
      DISTRICT: addressInfo?.DISTRICT,
      WARD: addressInfo?.WARD,
      ADDRESS_1: addressInfo?.ADDRESS_1,
      ADDRESS_2: addressInfo?.ADDRESS_2,
      ROLES: roles
    }
  const { userId: user_id } = useUserInfo()
  const extraFee = watch('extraFee')
  const tax = watch('tax') ? Number.parseInt(watch('tax')) : 0
  const extraFeeUnit = watch('extraFeeUnit')
  const [selectedUser, setSelectedUser] = useState(data?.CUSTOMER_CONTACT ? {
    ...data?.CUSTOMER_CONTACT,
  } : null)
  const canEditUserInfo = !isEdited || data?.PURCHASE_METHOD !== 'ONLINE'
  const [globalVoucher, setGlobalVoucher] = useState(null)
  const items = useMemo(() => data?.ITEMS
    ? data?.ITEMS.map(item => {
      const formattedItem = {
        ...item,
        PRICE: item.UNIT_PRICE,
        UNIT_INVOICE: item.UNIT,
        voucher: item?.VOUCHER
      }
      return formattedItem
    })
    : [], [data?.ITEMS])
  const { data: dataUnitInvoice, isLoading: isLoadingUnitInvoice, isError: isErrorUnitInvoice } = useQuery({
    queryKey: ['unitInvoiceList'],
    enabled: !!deviceId,
    queryFn: () => unitInvoiceService.search({
      user_id,
      device_id: deviceId
    }),
    retry: false,
    refetchOnWindowFocus: false, // Khi chuyển màn hình sẽ k bị refetch dữ liệu
    // staleTime: 1000 * 60 * 3
  })

  const getPriceDecreasedByVoucher = (item) => {
    if (!item.voucher?._id) return 0
    if (item.voucher.TYPE === 'PERCENTAGE') {
      const discount = item.PRICE * item.voucher.VALUE / 100
      return item.voucher.MAX_DISCOUNT ? Math.min(discount, item.voucher.MAX_DISCOUNT) : discount
    } else {
      return item.voucher.VALUE
    }
  }

  const getAvailableVouchers = (item) => {
    return item?.LIST_VOUCHER_ACTIVE?.filter(voucher => {
      const startDate = new Date(voucher.START_DATE)
      const endDate = new Date(voucher.END_DATE)
      const now = new Date()
      if (voucher._id === item?.voucher?._id) {
        if (now < startDate || now > endDate) {
          voucher.disableStatus = 'Hết hạn'
        }
        if (!voucher.IS_ACTIVE) {
          voucher.disableStatus = 'Không còn khả dụng'
        }
        return true
      }
      return voucher.IS_ACTIVE && now > startDate && now < endDate
    }) || []
  }

  const totalItemPrice = useMemo(() => items.reduce((acc, cur) => {
    const totalPriceOfItem = cur.QUANTITY * cur?.PRICE
    return acc + totalPriceOfItem
  }, 0), [items])

  const priceAfterDecreaseByProductVoucher = useMemo(() => {
    return items.reduce((acc, cur) => acc + getPriceDecreasedByVoucher(cur), 0)
  }, [items])

  const taxValue = useMemo(() => {
    return (totalItemPrice) * tax / 100
  }, [tax, totalItemPrice])

  const totalPriceDecreasedByGlobalVoucher = useMemo(() => {
    if (!globalVoucher) return 0
    if (globalVoucher.TYPE === 'PERCENTAGE') {
      const discount = (totalItemPrice - priceAfterDecreaseByProductVoucher) * globalVoucher.VALUE / 100
      return globalVoucher.MAX_DISCOUNT ? Math.min(discount, globalVoucher.MAX_DISCOUNT) : discount
    } else {
      return globalVoucher.VALUE || 0
    }
  }, [globalVoucher, priceAfterDecreaseByProductVoucher, totalItemPrice])

  const priceAfterExtraFeeAndAllVoucher = useMemo(() => {
    const allExtraFee = Number.parseInt(taxValue) + Number.parseInt(extraFee)
    return totalItemPrice - priceAfterDecreaseByProductVoucher + allExtraFee - totalPriceDecreasedByGlobalVoucher
  },
  [extraFee, priceAfterDecreaseByProductVoucher, taxValue, totalItemPrice, totalPriceDecreasedByGlobalVoucher]
  )

  const onSubmit = async (formData) => {
    await submit({ status: formData.status })
  }


  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isReadOnly || (isEdited)} style={{ border: 'none' }}>
        <Stack spacing={2} sx={{ minHeight: '1800px' }}>
          <Box>
            <Grid container spacing={4}>
              <Grid size={6}>
                <Card>
                  <CardHeader
                    title={<Typography variant="body1" fontWeight={600}>Thông tin khách hàng</Typography>}
                    sx={{
                      color: 'gray',
                      bgcolor: 'rgb(249, 250, 253)',
                      padding: 2,
                    }}
                  />
                  <CardContent>
                    <Stack gap={2}>
                      <Stack gap={2}>
                        <Stack spacing={1} sx={{ overflow: 'hidden' }}>
                          <UserInfoItem
                            label='Họ Tên'
                            value={selectedUser ? selectedUser?.NAME ?? 'Không rõ' : ''}
                          />
                          <UserInfoItem
                            icon={<MailOutlineIcon color='action' />}
                            label='Email'
                            value={selectedUser ? selectedUser?.EMAIL ?? 'Không rõ' : ''}
                          />
                          <UserInfoItem
                            icon={<LocalPhoneIcon color='action' />}
                            label='Điện thoại'
                            value={selectedUser ? selectedUser?.PHONE_NUMBER ?? 'Không rõ' : ''}
                          />
                          <UserInfoItem
                            icon={<LocationCityIcon color="action" />}
                            label="Tỉnh / Thành phố"
                            value={selectedUser ? selectedUser?.CITY || 'Chưa cập nhật' : ''}
                          />
                          <UserInfoItem
                            icon={<MapIcon color="action" />}
                            label="Quận / Huyện"
                            value={selectedUser ? selectedUser?.DISTRICT || 'Chưa cập nhật' : ''}
                          />
                          <UserInfoItem
                            icon={<LocationOnIcon color="action" />}
                            label="Địa chỉ"
                            value={selectedUser ? selectedUser?.ADDRESS_1 ?? selectedUser?.ADDRESS_2 ?? 'Chưa cập nhật' : ''}
                          />
                          {canEditUserInfo && !isReadOnly && <Button variant='outlined' color='error' onClick={() => setSelectedUser(null)}>Xóa khách hàng</Button>}
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card>
                  <CardHeader
                    title={<Typography variant="body1" fontWeight={600}>Thông tin nhân viên</Typography>}
                    sx={{
                      color: 'gray',
                      bgcolor: 'rgb(249, 250, 253)',
                      padding: 2,
                    }}
                  />
                  <CardContent>
                    {staffContact?._id &&
                      <Stack spacing={1} sx={{ overflow: 'hidden' }}>
                        <UserInfoItem
                          label='Họ Tên'
                          value={staffContact?.NAME ?? 'Không rõ'}
                        />
                        <UserInfoItem
                          icon={<ShieldIcon color="action" />}
                          label="Vai trò"
                          value={staffContact?.ROLES?.join(', ') || 'Chưa cập nhật'}
                        />
                        <UserInfoItem
                          icon={<MailOutlineIcon color='action' />}
                          label='Email'
                          value={staffContact.EMAIL ?? 'Không rõ'}
                        />
                        <UserInfoItem
                          icon={<LocalPhoneIcon color='action' />}
                          label='Điện thoại'
                          value={staffContact.PHONE_NUMBER ?? 'Không rõ'}
                        />
                        <UserInfoItem
                          icon={<LocationCityIcon color="action" />}
                          label="Tỉnh / Thành phố"
                          value={staffContact?.CITY || 'Chưa cập nhật'}
                        />
                        <UserInfoItem
                          icon={<MapIcon color="action" />}
                          label="Quận / Huyện"
                          value={staffContact?.DISTRICT || 'Chưa cập nhật'}
                        />
                        <UserInfoItem
                          icon={<ExploreIcon color="action" />}
                          label="Phường"
                          value={staffContact?.WARD || 'Chưa cập nhật'}
                        />
                        <UserInfoItem
                          icon={<LocationOnIcon color="action" />}
                          label="Địa chỉ"
                          value={staffContact?.ADDRESS_1 ?? staffContact?.ADDRESS_2 ?? 'Chưa cập nhật'}
                        />
                      </Stack>
                    }
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card>
                  <CardHeader
                    title={<Typography variant="body1" fontWeight={600}>Thông tin cơ bản</Typography>}
                    sx={{
                      color: 'gray',
                      bgcolor: 'rgb(249, 250, 253)',
                      padding: 2,
                    }}
                  ></CardHeader>
                  <CardContent sx={{ borderRadius: '5px', }}>
                    <Stack spacing={2}>
                      <FormControl sx={{ mt: 4 }}>
                        <InputLabel id="purchaseMethod">Hình thức mua hàng</InputLabel>
                        <Controller
                          defaultValue={data?.PURCHASE_METHOD || ''}
                          name="purchaseMethod"
                          control={control}
                          rules={{ required: 'Vui lòng chọn hình thức mua hàng', }}
                          disabled={isReadOnly}
                          render={({ field }) => (
                            <Select
                              {...field}
                              sx={{ height: '100%' }}
                              id="purchaseMethod"
                              label="Hình thức mua hàng"
                              labelId="purchaseMethod"
                              name='purchaseMethod'
                              error={!!errors.purchaseMethod}
                              disabled={isReadOnly || isEdited}
                            >
                              <MenuItem value=''>--</MenuItem>
                              {SALE_INVOICES_PURCHASE_METHODS.map(item => (
                                <MenuItem value={item.value} disabled={item.disable || !item.validate(data?.PURCHASE_METHOD)}>{item.label}</MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {!!errors.purchaseMethod &&
                          <Typography variant='caption' color='error'>
                            {errors.purchaseMethod?.message}
                          </Typography>}
                      </FormControl>
                      <Controller
                        name="addressSelector"
                        control={control}
                        rules={{
                          validate: (value) => {
                            if (value && Object.keys(value?.city)?.length > 0) {
                              if (Object.keys(value?.district)?.length === 0) {
                                return 'Vui lòng chọn Quận/Huyện'
                              } else if (Object.keys(value?.ward)?.length === 0) {
                                return 'Vui lòng nhập vào Phường, Thị xã,...'
                              }
                            }
                          }
                        }}
                        render={({ field, fieldState }) => (
                          <LocationSelector
                            disable={!canEditUserInfo || isReadOnly}
                            label='Phường, quận/huyện, Thành phố:'
                            value={{
                              city: data?.DELIVERY_INFORMATION?.ADDRESS?.CITY,
                              district: data?.DELIVERY_INFORMATION?.ADDRESS?.DISTRICT,
                              ward: data?.DELIVERY_INFORMATION?.ADDRESS?.WARD,
                            }}
                            onChange={field.onChange}
                            error={fieldState.error}
                          />
                        )}
                      />
                      <TextField
                        {...register('address', {
                          validate: (value) => {
                            const location = watch('addressSelector')
                            if (!!location?.ward && !value) return 'Vui lòng nhập địa chỉ'
                          }
                        })}
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            color: '#000000',
                          },
                          '& .MuiInputBase-root.Mui-disabled': {
                            backgroundColor: '#f0f0f0',
                            color: '#000000',
                          },
                          '& .MuiInputLabel-root.Mui-disabled': {
                            color: '#888888',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cccccc',
                          },
                        }}
                        disabled={!canEditUserInfo}
                        defaultValue={data?.DELIVERY_INFORMATION?.ADDRESS?.DETAIL}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <LocationOnIcon color='action' />
                            )
                          }
                        }}
                        label='Đường'
                        id="address"
                        name="address"
                        fullWidth
                        type="text"
                        error={!!errors.address}
                        helperText={errors.address?.message}
                      />
                      <TextField
                        {...register('nameReceiver', {
                          validate: (value) => {
                            const purchaseMethod = watch('purchaseMethod')
                            if (purchaseMethod === 'DELIVERY' && !value) return 'Vui lòng nhập tên người nhận hàng'
                          }
                        })}
                        sx={{
                          '& .MuiInputBase-input.Mui-disabled': {
                            color: '#000000',
                          },
                          '& .MuiInputBase-root.Mui-disabled': {
                            backgroundColor: '#f0f0f0',
                            color: '#000000',
                          },
                          '& .MuiInputLabel-root.Mui-disabled': {
                            color: '#888888',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cccccc',
                          },
                        }}
                        disabled={!canEditUserInfo}
                        defaultValue={data?.DELIVERY_INFORMATION?.NAME}
                        label='Tên người nhận'
                        id="nameReceiver"
                        name="nameReceiver"
                        fullWidth
                        type="text"
                        error={!!errors.nameReceiver}
                        helperText={errors.nameReceiver?.message}
                      />
                      <Controller
                        name="phoneNumberReceiver"
                        control={control}
                        defaultValue={data?.DELIVERY_INFORMATION?.PHONE_NUMBER}
                        rules={{
                          validate: (value) => {
                            const purchaseMethod = watch('purchaseMethod')
                            if (purchaseMethod === 'DELIVERY' && !value) return 'Vui lòng nhập tên người nhận hàng'
                          }
                        }}
                        render={({ field }) => (
                          <MuiTelInput
                            {...field}
                            fullWidth
                            disabled={isReadOnly || isEdited}
                            name="phoneNumberReceiver"
                            label="Số điện thoại"
                            onChange={(value) => {
                              field.onChange(value)
                            }}
                            error={!!errors.phoneNumberReceiver}
                            helperText={errors.phoneNumberReceiver?.message}
                          />
                        )}
                      />
                      <FormControl>
                        <InputLabel id="status">Trạng thái hóa đơn</InputLabel>
                        <Controller
                          defaultValue={data?.STATUS || ''}
                          name="status"
                          control={control}
                          rules={{ required: 'Vui lòng chọn trạng thái hóa đơn', }}
                          disabled={isReadOnly}
                          render={({ field }) => (
                            <Select
                              {...field}
                              sx={{ height: '100%' }}
                              id="status"
                              label="Trạng thái hóa đơn"
                              labelId="status"
                              disabled={isReadOnly || !isEdited}
                              name='status'
                              error={!!errors.status}
                            >
                              {!isEdited && <MenuItem value=''>--</MenuItem>}
                              {SALE_INVOICE_STATUS.map(item => (
                                <MenuItem key={item.value} value={item.value} color={item.color} disabled={item.disable || !item.validate(data?.STATUS)}>

                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {item.value === 'DRAFT' && <ModeEditIcon color={item.color} />}
                                    {item.value === 'CONFIRMED' && <CheckCircleIcon color={item.color} />}
                                    {item.value === 'PAYMENTED' && <AssuredWorkloadIcon color={item.color} />}
                                    {item.value === 'CANCELLED' && <CancelIcon color={item.color} />}
                                    <Typography color={item.color}>{item.label}</Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {!!errors.status &&
                          <Typography variant='caption' color='error'>
                            {errors.status?.message}
                          </Typography>}
                      </FormControl>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={6}>
                <Card sx={{ borderRadius: '5px', }}>
                  <CardHeader
                    title={<Typography variant="body1" fontWeight={600}>Phí phát sinh</Typography>}
                    sx={{
                      color: 'gray',
                      bgcolor: 'rgb(249, 250, 253)',
                      padding: 2,
                    }}
                  ></CardHeader>
                  <CardContent>
                    <Stack spacing={2}>
                      <TextField
                        {...register('tax', {
                          min: { value: 0, message: 'Thuế phải lớn hơn 0' },
                          max: { value: 100, message: 'Thuế phải nhỏ hơn 100' }
                        })}
                        defaultValue={data?.TAX}
                        size='small'
                        label="Phần trăm thuế"
                        name='tax'
                        fullWidth
                        type='number'
                        disabled={isReadOnly || isEdited}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position='start'><TbReceiptTax /></InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position='end'>%</InputAdornment>
                            )
                          },
                          htmlInput: { min: 0, max: 100 }
                        }}
                        error={!!errors.tax}
                        helperText={errors.tax?.message}
                      />
                      <Controller
                        name="extraFee"
                        control={control}
                        defaultValue={data?.EXTRA_FEE ?? 0}
                        rules={{
                          min: { value: 0, message: 'Giá trị nhập vào >= 0' }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size='small'
                            label="Phí phát sinh"
                            name='extraFee'
                            fullWidth
                            type='number'
                            disabled={isReadOnly}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position='start'><AttachMoneyIcon fontSize='small' /></InputAdornment>
                                )
                              },
                              htmlInput: { min: 0 }
                            }}
                            error={!!errors.extraFee}
                            helperText={errors.extraFee?.message}
                          />
                        )}
                      />
                      {!isLoadingUnitInvoice && !isErrorUnitInvoice && !!dataUnitInvoice && <FormControl>
                        <InputLabel id="extraFeeUnit">Đơn vị tiền tệ phí phát sinh</InputLabel>
                        <Controller
                          defaultValue={data?.EXTRA_FEE_UNIT || ''}
                          name="extraFeeUnit"
                          control={control}
                          rules={{ required: { value: !!watch('extraFee'), message: 'Vui lòng chọn đơn vị tiền tệ' } }}
                          disabled={isReadOnly || (isEdited)}
                          render={({ field }) => (
                            <Select
                              {...field}
                              sx={{ height: '100%' }}
                              id="extraFeeUnit"
                              label="Đơn vị tiền tệ"
                              labelId="extraFeeUnit"
                              name='extraFeeUnit'
                              error={!!errors.extraFeeUnit}
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
                        {!!errors.extraFeeUnit &&
                          <Typography variant='caption' color='error'>
                            {errors.extraFeeUnit?.message}
                          </Typography>}
                      </FormControl>
                      }
                      <Controller
                        name="extraFeeNote"
                        control={control}
                        defaultValue={data?.EXTRA_FEE_NOTE || ''}
                        disabled={isReadOnly}
                        rules={{ required: { value: !!watch('extraFee'), message: 'Vui lòng chọn đơn vị tiền tệ' } }}
                        render={({ field }) => (
                          <Box sx={{ position: 'relative', width: '100%' }}>
                            <InputLabel shrink sx={{ mb: 0.5 }}>
                              Lý do phát sinh phí
                            </InputLabel>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <EditNoteIcon sx={{ mt: '6px' }} />
                              <TextField
                                {...field}
                                size="small"
                                name="extraFeeNote"
                                fullWidth
                                type="text"
                                multiline
                                minRows={3}
                                error={!!errors.extraFeeNote}
                                helperText={errors.extraFeeNote?.message}
                              />
                            </Box>
                          </Box>
                        )}
                      />
                      <Controller
                        name="note"
                        control={control}
                        defaultValue={data?.NOTE}
                        rules={{}}
                        render={({ field }) => (
                          <Box sx={{ width: '100%' }}>
                            <InputLabel shrink htmlFor="note" sx={{ mb: 0.5 }}>
                              Ghi chú
                            </InputLabel>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <EditNoteIcon sx={{ mt: '6px', color: 'text.secondary' }} />
                              <TextField
                                {...field}
                                id="note"
                                name="note"
                                size="small"
                                fullWidth
                                type="text"
                                multiline
                                minRows={3}
                                disabled={isReadOnly || isEdited}
                                error={!!errors.note}
                                helperText={errors.note?.message}
                              />
                            </Box>
                          </Box>
                        )}
                      />
                      <FormControl>
                        <InputLabel id="paymentMethod">Hình thức thanh toán</InputLabel>
                        <Controller
                          defaultValue={data?.PAYMENT_METHOD || ''}
                          name="paymentMethod"
                          control={control}
                          rules={{ required: 'Vui lòng chọn Hình thức thanh toán', }}
                          disabled={isReadOnly}
                          render={({ field }) => (
                            <Select
                              {...field}
                              sx={{ height: '100%' }}
                              id="paymentMethod"
                              label="Đơn vị tiền tệ"
                              labelId="paymentMethod"
                              name='paymentMethod'
                              disabled={isReadOnly || isEdited}
                              error={!!errors.paymentMethod}
                            >
                              <MenuItem value=''>--</MenuItem>
                              {PAYMENT_STATUS.map(item => (
                                <MenuItem key={item.value} value={item.value} disabled={item?.disable}>{item.label}</MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {!!errors.paymentMethod &&
                          <Typography variant='caption' color='error'>
                            {errors.paymentMethod?.message}
                          </Typography>}
                      </FormControl>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          <Card sx={{ bgcolor: 'white', borderRadius: '5px', boxShadow: (theme) => theme.shadows[1], }}>
            <CardHeader
              title={
                <Typography variant="body1" fontWeight={600}>Hàng hóa: </Typography>
              }
              sx={{
                bgcolor: 'rgb(249, 250, 253)',
              }}
            ></CardHeader>
            <CardContent>
              <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table >
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell>Giá</TableCell>
                      <TableCell>Số lượng</TableCell>
                      <TableCell>Voucher</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items?.map((item) => (
                      <TableRow key={item.ITEM_CODE}>
                        <TableCell>
                          <Stack flexDirection='row' gap={2} alignItems='center'>
                            <Box
                              sx={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '5px',
                                marginRight: '10px',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundImage: item?.AVATAR_IMAGE_URL ? `url('${item?.AVATAR_IMAGE_URL}` : `url(${formatUrl('https://placehold.co/100', { text: item?.ITEM_NAME_EN })})`,
                              }}
                            />
                            <Stack gap={1}>
                              <Typography variant='body1' px={1}>{item?.ITEM_NAME}</Typography>
                              <Typography variant='caption' px={1}>{item?.ITEM_CODE}</Typography>
                              <Chip label={item?.ITEM_TYPE_NAME} sx={{ width: 'fit-content' }} />
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack>
                            <Typography variant='body1'>
                              {`${formatCurrency(item?.PRICE)} ${item?.UNIT_INVOICE.UNIT_ABB}`}
                            </Typography>
                            {item?.voucher?._id && (
                              <Typography variant='caption' color='text.secondary'>
                                {`- ${formatCurrency(getPriceDecreasedByVoucher(item))} ${item?.UNIT_INVOICE.UNIT_ABB}`}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {item?.QUANTITY}
                        </TableCell>
                        <TableCell>
                          {getAvailableVouchers(item).map(voucher =>
                            <MenuItem key={voucher._id} value={voucher._id} disabled={!!voucher.disableStatus} sx={{ textAlign: 'center', fontSize: '0.8rem' }}>
                              <Badge
                                badgeContent={voucher.disableStatus}
                                color="error"
                                anchorOrigin={{
                                  vertical: 'top',
                                  horizontal: 'right',
                                }}
                                sx={{
                                  '& .MuiBadge-badge': {
                                    fontSize: '8px',
                                    height: '18px',
                                    minWidth: '30px',
                                    right: '-13px'
                                  },
                                }}
                                overlap="rectangular"
                              >
                                {`Giảm ${voucher.VALUE} ${voucher.TYPE === 'FIXED_AMOUNT' ? items.at(0).UNIT_INVOICE.UNIT_ABB : '%'}
                                ${voucher.TYPE === 'PERCENTAGE' && voucher.MAX_DISCOUNT ? `(Tối đa ${formatCurrency(voucher.MAX_DISCOUNT)} ${items.at(0).UNIT_INVOICE.UNIT_ABB})` : ''}`}
                              </Badge>
                            </MenuItem>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length > 0 && (
                      <>
                        <TableRow>
                          <TableCell>
                            <Typography variant='h6' sx={{ textAlign: 'center' }}>
                              Tổng tiền hàng:
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='h6'>
                              {`${formatCurrency(totalItemPrice)} ${items?.at(0)?.UNIT_INVOICE.UNIT_ABB}`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Typography variant='caption'>
                              Giảm cho sản phẩm:
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='caption'>
                              {`- ${formatCurrency(items.reduce((acc, cur) => acc + getPriceDecreasedByVoucher(cur), 0))} ${items?.at(0)?.UNIT_INVOICE.UNIT_ABB}`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Typography variant='caption'>
                              Giảm cho Hóa đơn:
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='caption'>
                              <Chip label={`- ${formatCurrency(totalPriceDecreasedByGlobalVoucher)} ${items?.at(0)?.UNIT_INVOICE.UNIT_ABB}`} variant="outlined" onDelete={() => setGlobalVoucher(null)} />
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ textAlign: 'center', }}>
                            <Typography variant='caption'>
                              Thuế:
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='caption'>
                              {`+ ${formatCurrency(taxValue)} ${items?.at(0)?.UNIT_INVOICE.UNIT_ABB} (${tax} %)`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        {!!dataUnitInvoice && !!extraFeeUnit && (
                          <TableRow>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography variant='caption'>
                                Phí phát sinh:
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant='caption'>
                                {`+ ${formatCurrency(extraFee)} ${dataUnitInvoice?.data?.find(i => i._id === extraFeeUnit)?.UNIT_ABB}`}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell>
                            <Typography variant='h6' sx={{ textAlign: 'center' }}>
                              Tổng số tiền:
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='h6'>
                              {`${formatCurrency(priceAfterExtraFeeAndAllVoucher)} ${items?.at(0)?.UNIT_INVOICE.UNIT_ABB}`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {!isReadOnly && (
                <Stack flexDirection='row' gap={2} justifyContent='center' mt={6}>
                  <Button
                    type='submit'
                    variant="contained"
                    color="success"
                    endIcon={<CheckCircleIcon />}
                  >
                    Lưu
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      </fieldset>
    </form>
  )
}

export default OrderForm