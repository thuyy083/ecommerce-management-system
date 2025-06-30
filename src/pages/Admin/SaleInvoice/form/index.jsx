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

function SaleInvoiceForm({ submit, data, isEdited, isReadOnly }) {
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
  const tax = Number.parseInt(watch('tax'))
  const extraFeeUnit = watch('extraFeeUnit')
  const [selectedUser, setSelectedUser] = useState(data?.CUSTOMER_CONTACT ? {
    ...data?.CUSTOMER_CONTACT,
  } : null)
  const canEditUserInfo = data?.PURCHASE_METHOD !== 'ONLINE' && !isReadOnly && data?.STATUS !== 'CONFIRMED'
  const [globalVoucher, setGlobalVoucher] = useState(null)
  const [items, setItems] = useState(data?.ITEMS
    ? data?.ITEMS.map(item => {
      const formattedItem = {
        ...item,
        PRICE: item.UNIT_PRICE,
        UNIT_INVOICE: item.UNIT,
        voucher: item?.VOUCHER
      }
      return formattedItem
    })
    : []
  )
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


  const handleUserChose = (user) => {
    const nameInfo = user.LIST_CONTACT?.at(-1)
    const emailInfo = user.LIST_EMAIL?.at(-1)
    const phoneNumberInfo = user.LIST_PHONE_NUMBER?.at(-1)
    const addressInfo = user.LIST_ADDRESS?.at(-1)
    setSelectedUser({
      _id: user._id,
      NAME: nameInfo.FULL_NAME ?? `${nameInfo.LAST_NAME} ${nameInfo.FIRST_NAME}`,
      EMAIL: emailInfo.EMAIL,
      PHONE_NUMBER: phoneNumberInfo.PHONE_NUMBER,
      CITY: addressInfo.CITY,
      DISTRICT: addressInfo.DISTRICT,
      WARD: addressInfo.WARD,
      ADDRESS_1: addressInfo.ADDRESS_1,
      ADDRESS_2: addressInfo.ADDRESS_2,
    })
  }

  const onSubmit = async (formData) => {
    let saleInvoiceData = {}
    if (formData.status === 'DRAFT') {
      saleInvoiceData = {
        ...formData,
        items: items.map(item => ({
          ITEM_CODE: item.ITEM_CODE,
          QUANTITY: item.QUANTITY,
          PRODUCT_VOUCHER_ID: item.voucher?._id || null
        })),
        country: 'Việt Nam',
        city: formData.addressSelector?.city?.name || '',
        district: formData.addressSelector?.district?.name || '',
        ward: formData.addressSelector?.ward?.name || '',
        detail: formData.address,
        voucherGlobalId: globalVoucher?._id || null,
        customerId: selectedUser?._id || null,
        name: formData.nameReceiver,
        phoneNumber: formData.phoneNumberReceiver
      }
      delete saleInvoiceData.address
      delete saleInvoiceData.addressSelector
      delete saleInvoiceData.nameReceiver
      delete saleInvoiceData.phoneNumberReceiver
    } else {
      saleInvoiceData = {
        status: formData.status
      }
    }
    console.log(saleInvoiceData)
    submit(saleInvoiceData)
  }

  console.log(errors)

  const handleAddItem = (itemToAdd) => {
    const isItemInserted = items.find(i => i.ITEM_CODE === itemToAdd.ITEM_CODE)
    let newItems
    if (isItemInserted) {
      isItemInserted.QUANTITY += 1
      newItems = [...items]
    } else {
      newItems = [...items, { ...itemToAdd, QUANTITY: 1 }]
      newItems = newItems.map(item => {
        const availableVouchers = getAvailableVouchers(item)
        const priceInfo = item.PRICE?.at(-1)
        console.log(priceInfo)
        if (availableVouchers.length > 0) {
          const highestVoucher = getHighestVoucher(availableVouchers, priceInfo.PRICE_AMOUNT)
          return { ...item,
            PRICE: priceInfo.PRICE_AMOUNT,
            UNIT_INVOICE: { _id: priceInfo.UNIT, UNIT_ABB: priceInfo.UNIT_ABB, UNIT_NAME: item.PRICE?.at(-1).UNIT_NAME },
            voucher: highestVoucher
          }
        }
        return item
      })
    }
    setItems(newItems)
  }

  const handleQuantityChange = (e, itemCode) => {
    const targetItem = items.find(item => item.ITEM_CODE === itemCode)
    targetItem.QUANTITY = Number.parseInt(e.target.value)
    let newItems = [...items]
    setItems(newItems)
    // changeBomMaterials(newItemMaterials)
  }

  const handleRemove = (itemCode) => {
    const filteredItemMaterials = items.filter(item => item.ITEM_CODE !== itemCode)
    setItems(filteredItemMaterials)
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

  const getHighestVoucher = (vouchers, itemPrice) => {
    const voucherValues = vouchers.map(voucher => {
      if (voucher.TYPE === 'PERCENTAGE') {
        const discount = itemPrice * voucher.VALUE / 100
        return voucher.MAX_DISCOUNT ? Math.min(discount, voucher.MAX_DISCOUNT) : discount
      } else if (voucher.TYPE === 'FIXED_AMOUNT') {
        return voucher.VALUE
      }
      return 0
    })

    return vouchers[voucherValues.indexOf(Math.max(...voucherValues))]
  }

  const getPriceDecreasedByVoucher = (item) => {
    if (!item.voucher?._id) return 0
    if (item.voucher.TYPE === 'PERCENTAGE') {
      const discount = item.PRICE * item.voucher.VALUE / 100
      return item.voucher.MAX_DISCOUNT ? Math.min(discount, item.voucher.MAX_DISCOUNT) : discount
    } else {
      return item.voucher.VALUE
    }
  }

  const handleChangeVoucher = (e, itemCode) => {
    const targetItem = items.find(item => item.ITEM_CODE === itemCode)
    if (e.target.value === '') {
      targetItem.voucher = null
    } else {
      const selectedVoucher = getAvailableVouchers(targetItem).find(voucher => voucher._id === e.target.value)
      if (selectedVoucher) {
        targetItem.voucher = selectedVoucher
      }
    }
    let newItems = [...items]
    setItems(newItems)
  }

  const handleAddGlobalVoucher = (voucher) => {
    setGlobalVoucher(voucher)
  }

  const totalItemPrice = useMemo(() => items.reduce((acc, cur) => {
    const totalPriceOfItem = cur.QUANTITY * cur?.PRICE
    return acc + totalPriceOfItem
  }, 0), [items])

  const priceAfterDecreaseByProductVoucher = useMemo(() => {
    return items.reduce((acc, cur) => acc + getPriceDecreasedByVoucher(cur), 0)
  }, [items])

  const totalPriceDecreasedByGlobalVoucher = useMemo(() => {
    if (!globalVoucher) return 0
    if (globalVoucher.TYPE === 'PERCENTAGE') {
      const discount = (totalItemPrice - priceAfterDecreaseByProductVoucher) * globalVoucher.VALUE / 100
      return globalVoucher.MAX_DISCOUNT ? Math.min(discount, globalVoucher.MAX_DISCOUNT) : discount
    } else {
      return globalVoucher.VALUE || 0
    }
  }, [globalVoucher, priceAfterDecreaseByProductVoucher, totalItemPrice])

  const taxValue = useMemo(() => {
    return (totalItemPrice) * tax / 100
  }, [tax, totalItemPrice])

  const priceAfterExtraFeeAndAllVoucher = useMemo(() => {
    const allExtraFee = Number.parseInt(taxValue) + Number.parseInt(extraFee)
    return totalItemPrice - priceAfterDecreaseByProductVoucher + allExtraFee - totalPriceDecreasedByGlobalVoucher
  },
  [extraFee, priceAfterDecreaseByProductVoucher, taxValue, totalItemPrice, totalPriceDecreasedByGlobalVoucher]
  )

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isReadOnly || (isEdited && data?.STATUS !== 'DRAFT')} style={{ border: 'none' }}>
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
                        {canEditUserInfo && <SearchUserInput onItemClick={handleUserChose} placeholder='Nhập tên người mua' />}
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
                          {canEditUserInfo && <Button variant='outlined' color='error' onClick={() => setSelectedUser(null)}>Xóa khách hàng</Button>}
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
                          disabled={isReadOnly || (isEdited && data?.STATUS !== 'DRAFT')}
                          render={({ field }) => (
                            <Select
                              {...field}
                              sx={{ height: '100%' }}
                              id="purchaseMethod"
                              label="Hình thức mua hàng"
                              labelId="purchaseMethod"
                              name='purchaseMethod'
                              error={!!errors.purchaseMethod}
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
                            disable={!canEditUserInfo || isReadOnly || (isEdited && data?.STATUS !== 'DRAFT')}
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
                          rules={{ required: 'Vui lòng chọn đơn vị tiền tệ', }}
                          disabled={isReadOnly || (isEdited && data?.STATUS !== 'DRAFT')}
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
                        rules={{}}
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
                          disabled={isReadOnly || (isEdited && data?.STATUS !== 'DRAFT')}
                          render={({ field }) => (
                            <Select
                              {...field}
                              sx={{ height: '100%' }}
                              id="paymentMethod"
                              label="Đơn vị tiền tệ"
                              labelId="paymentMethod"
                              name='paymentMethod'
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
                <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant="body1" fontWeight={600}>Hàng hóa: </Typography>
                  <Stack flexDirection='row' gap={2} alignItems='center'>
                    {
                      data?.STATUS.at(-1).STATUS_NAME && (
                        <>
                          <SearchVoucherInput searchOption='PRODUCT' available notExpired onItemClick={handleAddGlobalVoucher} />
                          <SearchItemInput properPosition='bottom-end' searchOption='product' onItemClick={handleAddItem} />
                        </>
                      )
                    }
                  </Stack>
                </Stack>
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
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items?.map((item) => (
                      <TableRow key={item.ITEM_CODE}>
                        <TableCell>
                          <Stack flexDirection='row' gap={2} alignItems='center' maxWidth={400}>
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
                          <TextField
                            size='small'
                            type='number'
                            name='bomMaterials'
                            sx={{ maxWidth: '100px' }}
                            disabled={isReadOnly || (isEdited && data?.STATUS !== 'DRAFT')}
                            slotProps={{
                              htmlInput: { min: 1 },
                              input: {
                                endAdornment: (
                                  <InputAdornment position='end'>{item.UNIT_NAME}</InputAdornment>
                                )
                              }
                            }}
                            value={item?.QUANTITY}
                            onChange={(e) => handleQuantityChange(e, item.ITEM_CODE)}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            disabled={isReadOnly || (isEdited && data?.STATUS !== 'DRAFT')}
                            value={item?.voucher?._id || ''}
                            onChange={(e) => handleChangeVoucher(e, item.ITEM_CODE)}
                            sx={{ width: '250px', fontSize: '0.8rem', }}
                          >
                            <MenuItem value='' sx={{ textAlign: 'center', fontSize: '0.8rem', color: 'grey' }}>--</MenuItem>
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
                          </Select>
                        </TableCell>
                        <TableCell>
                          <IconButton aria-label="delete" size="large" onClick={() => handleRemove(item.ITEM_CODE)}>
                            <DeleteIcon color='error' />
                          </IconButton>
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
                              <Chip
                                label={`- ${formatCurrency(totalPriceDecreasedByGlobalVoucher)} ${items?.at(0)?.UNIT_INVOICE.UNIT_ABB}`}
                                variant="outlined"
                                onDelete={data?.STATUS === 'DRAFT' ? () => setGlobalVoucher(null) : null} />
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
            </CardContent>
          </Card>
        </Stack>
      </fieldset>
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
    </form>
  )
}

export default SaleInvoiceForm