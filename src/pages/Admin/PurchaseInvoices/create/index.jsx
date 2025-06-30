import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  InputLabel,
  Select,
  FormControl
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import SearchItemInput from '~/components/Admin/SearchItemInput'
import SearchSupplierInput from '~/components/Admin/SearchSupplierInput'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import invoicesService from '~/service/admin/invoices.service'
import { toast } from 'react-toastify'
import { cloneDeep } from 'lodash'
import unitInvoiceService from '~/service/admin/unitInvoice.service'
import { Controller, useForm } from 'react-hook-form'
import { PURCHASE_INVOICE_PAYMENT_METHODS, PURCHASE_INVOICE_STATUS } from '~/utils/contant'
import { hasAnyPermission } from '~/utils/rolePermission'
import useAuth from '~/hooks/useAuth'


export default function AddPurchaseInvoiceForm() {
  const { register, handleSubmit, formState: { errors }, watch, control } = useForm()
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedItems, setSelectedItems] = useState([])
  const device_id = useDeviceId()
  const { roles } = useAuth()
  const { userId: user_id } = useUserInfo()
  const { data: dataUnitInvoice, isLoading: isLoadingUnitInvoice, isError: isErrorUnitInvoice } = useQuery({
    queryKey: ['unitInvoiceList'],
    enabled: !!device_id,
    queryFn: () => unitInvoiceService.search({
      user_id,
      device_id
    }),
    retry: false,
    refetchOnWindowFocus: false, // Khi chuyển màn hình sẽ k bị refetch dữ liệu
    // staleTime: 1000 * 60 * 3
  })

  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)

  const mutation = useMutation({
    mutationFn: (data) => invoicesService.create( { user_id, device_id } ,data),
    onSuccess: (res) => {
      console.log('Tạo hóa đơn thành công:', res)
      toast.success('Tạo hóa đơn thành công!')
      navigate(`/admin/purchase-invoices/${res.data.INVOICE_CODE}`)
    },
    onError: (err) => {
      console.error('Lỗi:', err)
      toast.error('Đã xảy ra lỗi khi tạo hóa đơn!')
    }
  })

  const handleItemClick = (item) => {
    setSelectedItems((prev) => {
      const newItems = cloneDeep(prev)
      const isItemInserted = newItems.find(i => i.ITEM_CODE === item.ITEM_CODE)
      if (isItemInserted) {
        isItemInserted.QUANTITY += 1
      } else {
        const newAddItem = {
          ITEM_CODE: item.ITEM_CODE,
          ITEM_NAME: item.ITEM_NAME,
          SUPPLIER_ID: '', // chưa có, người dùng sẽ chọn
          QUANTITY: 1,
          UNIT_PRICE: 0,
          UNIT: '',
          UNIT_ITEM_NAME: item.UNIT_NAME,
        }
        newItems.push(newAddItem)
      }
      return newItems
    })
  }

  const handleSupplierSelect = (itemIndex, supplierId) => {
    setSelectedItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex ? { ...item, SUPPLIER_ID: supplierId } : item
      )
    )
  }

  const handleQuantityChange = (itemIndex, quantity) => {
    setSelectedItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex ? { ...item, QUANTITY: quantity } : item
      )
    )
  }

  const handlePriceChange = (itemIndex, price) => {
    setSelectedItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex ? { ...item, UNIT_PRICE: price } : item
      )
    )
  }

  const handleChangUnitInvoiceItem = (itemIndex, unitInvocieId) => {
    setSelectedItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex ? { ...item, UNIT: unitInvocieId } : item
      )
    )
  }

  const handleDeleteItem = (itemIndex) => {
    setSelectedItems((prev) => prev.filter((_, index) => index !== itemIndex))
  }

  const submit = (data) => {
    const formatedSelectedItems = cloneDeep(selectedItems)
    formatedSelectedItems.forEach(item => {
      delete item.UNIT_ITEM_NAME
      delete item.ITEM_NAME
      if (!item.UNIT) {
        toast.error('Vui lòng chọn đơn vị tiền tệ cho tất cả nguyên liệu!')
        return
      }
    })
    const filteredData = {
      ...data,
      tax: Number.parseInt(data.tax),
      extraFee: Number.parseInt(data.extraFee),
      items: formatedSelectedItems
    }

    Object.keys(filteredData).forEach(key => {
      if (key.includes('price-item') || key.includes('unit-invoice-item') || !filteredData[key])
        delete filteredData[key]
    })

    // Validate: tất cả SUPPLIER_ID đã chọn
    const missingSuppliers = selectedItems.some(item => !item.SUPPLIER_ID)
    if (missingSuppliers) {
      toast.error('Vui lòng chọn đầy đủ nhà cung cấp cho từng sản phẩm.')
      return
    }
    console.log(filteredData)
    mutation.mutate(filteredData)
  }


  return (
    <form onSubmit={handleSubmit(submit)}>
      <Paper sx={{ p: 3, mx: 'auto' }}>
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
        <Typography variant="h5" gutterBottom>
          Tạo mới hóa đơn mua nhập
        </Typography>

        {/* Search sản phẩm */}
        <Box mb={2} sx={{ position: 'relative', zIndex: 2000 }}>
          <Box
            sx={{
              position: 'relative',
              backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: 1,
              zIndex: 2000,
              p: 1 // thêm padding nhẹ nếu cần
            }}
          >
            <SearchItemInput onItemClick={handleItemClick} searchOption='material' />
          </Box>
        </Box>


        {/* Chọn trạng thái và phương thức thanh toán */}
        <Box mb={2} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            {...register('statusName', {
              required: 'Vui lòng chọn trạng thái'
            })}
            label="Trạng thái"
            select
            defaultValue=''
            sx={{ width: 200, }}
            error={!!errors.statusName}
            helperText={errors.statusName?.message}
          >
            <MenuItem value=''>
              --
            </MenuItem>
            {PURCHASE_INVOICE_STATUS.map((option) => (
              <MenuItem key={option.value} value={option.value} disabled={!hasAnyPermission(roles, 'purchaseInvoice', option.needPermission)}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            {...register('paymented', {
              required: 'Vui lòng chọn trạng thái'
            })}
            label="Phương thức thanh toán"
            defaultValue=''
            select
            sx={{ width: 200, }}
            error={!!errors.paymented}
            helperText={errors.paymented?.message}
          >
            <MenuItem value=''>
              --
            </MenuItem>
            {PURCHASE_INVOICE_PAYMENT_METHODS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            {...register('tax', {
              required: 'Vui lòng nhập thuế',
              min: { value: 0, message: 'Thuế phải >= 0 & <= 100' },
              max: { value: 100, message: 'Thuế phải >= 0 & <= 100' }
            })}
            label="Thuế (%)"
            type='number'
            sx={{ width: 200, }}
            error={!!errors.tax}
            helperText={errors.tax?.message}
          />
          <TextField
            {...register('extraFee', {
              min: { value: 0, message: 'Phí phát sinh phát >= 0' },
            })}
            label="Phi phát sinh"
            type='number'
            sx={{ width: 200, }}
            error={!!errors.extraFee}
            helperText={errors.extraFee}
          />
          {!isLoadingUnitInvoice && !isErrorUnitInvoice && !!dataUnitInvoice && (
            <TextField
              {...register('extraFeeUnit', {
                required: { value: !!watch('extraFee'), message: 'vui lòng chọn đơn vị tiền tệ của phí phát sinh' },
              })}
              defaultValue=''
              label="Đơn vị tiền tệ phí phát sinh"
              select
              sx={{ width: 200, }}
              error={!!errors.extraFeeUnit}
              helperText={errors.extraFeeUnit?.message}
            >
              <MenuItem value=''>
                --
              </MenuItem>
              {dataUnitInvoice?.data.map((option) => (
                <MenuItem key={option._id} value={option._id}>
                  {option.UNIT_NAME}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Box sx={{ position: 'relative', width: '100%' }}>
            <InputLabel shrink sx={{ mb: 0.5 }}>
              Lý do phát sinh phí
            </InputLabel>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <EditNoteIcon sx={{ mt: '6px' }} />
              <TextField
                {...register('extraFeeNote', {
                  required: { value: !!watch('extraFee'), message: 'vui lòng chọn đơn vị tiền tệ của phí phát sinh' }
                })}
                size="small"
                fullWidth
                type="text"
                multiline
                minRows={3}
                error={!!errors.extraFeeNote}
                helperText={errors.extraFeeNote?.message}
              />
            </Box>
          </Box>
        </Box>

        {/* Bảng sản phẩm đã chọn */}
        <TableContainer component={Paper} sx={{ mb: 2, width: '100%', overflowX: 'auto' }} >
          <Table sx={{ minWidth: 1200 }} aria-label="table">
            <TableHead>
              <TableRow>
                <TableCell>Mã sản phẩm</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell>Nhà cung cấp</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Giá nhập</TableCell>
                <TableCell>đơn vị tiền tệ</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedItems.map((item, index) => (
                <TableRow key={item._id || item.ITEM_CODE}>
                  <TableCell>{item.ITEM_CODE}</TableCell>
                  <TableCell>{item.ITEM_NAME}</TableCell>
                  <TableCell
                    sx={{
                      position: 'relative',
                      backgroundColor: '#fff',
                      maxWidth: '300px',
                      zIndex: 0
                    }}
                  >
                    <SearchSupplierInput
                      index={index}
                      selectedSupplier={item.SUPPLIER_ID}
                      onSelect={(supplierId) => handleSupplierSelect(index, supplierId)}
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      sx={{ maxWidth: '100px' }}
                      value={item.QUANTITY}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position='end'>{item.UNIT_ITEM_NAME}</InputAdornment>
                          )
                        }
                      }}
                      onChange={(e) =>
                        handleQuantityChange(index, Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`price-item-${index}`}
                      control={control}
                      defaultValue={item.UNIT_PRICE || 0}
                      rules={{ required: 'Vui lòng nhập giá nhập' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          size="small"
                          sx={{ maxWidth: '150px' }}
                          error={!!errors[`price-item-${index}`]}
                          helperText={errors?.[`price-item-${index}`]?.message}
                          onChange={(e) => {
                            const value = Number(e.target.value)
                            field.onChange(value)
                            handlePriceChange(index, value)
                          }}
                        />
                      )}
                    />

                  </TableCell>
                  <TableCell>
                    {!isLoadingUnitInvoice && !isErrorUnitInvoice && !!dataUnitInvoice && <Controller
                      name={`unit-invoice-item-${index}`}
                      control={control}
                      defaultValue={item.UNIT || ''}
                      rules={{ required: 'Vui chọn đơn vị tiền tệ' }}
                      render={({ field }) => (
                        <FormControl fullWidth size='small' error={!!errors[`unit-invoice-item-${index}`]}>
                          <InputLabel id={`unit-invoice-label-${index}`}>Đơn vị tiền tệ</InputLabel>
                          <Select
                            labelId={`unit-invoice-label-${index}`}
                            label="Đơn vị tiền tệ"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              handleChangUnitInvoiceItem(index, e.target.value)
                            }}
                          >
                            <MenuItem value="">--</MenuItem>
                            {dataUnitInvoice?.data?.map((unitInvoice) => (
                              <MenuItem key={unitInvoice._id} value={unitInvoice._id}>
                                {unitInvoice.UNIT_NAME}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors[`unit-invoice-item-${index}`]?.message && (
                            <Typography variant='caption' color='error'>
                              {errors[`unit-invoice-item-${index}`]?.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />

                    }
                  </TableCell>
                  <TableCell>
                    <IconButton color='error' onClick={() => handleDeleteItem(index)}>
                      <CloseIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Submit */}
        <Button
          variant="contained"
          color="primary"
          type='submit'
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Đang lưu...' : 'Lưu hóa đơn'}
        </Button>
      </Paper>
    </form>
  )
}
