import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import EditNoteIcon from '@mui/icons-material/EditNote'

import invoicesService from '~/service/admin/invoices.service'
import unitInvoiceService from '~/service/admin/unitInvoice.service'
import useUserInfo from '~/hooks/useUserInfo'
import { useDeviceId } from '~/hooks/useDeviceId'
import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import { Controller, useForm } from 'react-hook-form'
import { PURCHASE_INVOICE_PAYMENT_METHODS, PURCHASE_INVOICE_STATUS } from '~/utils/contant'
import SearchSupplierInput from '~/components/Admin/SearchSupplierInput'
import { cloneDeep } from 'lodash'
import SearchItemInput from '~/components/Admin/SearchItemInput'
import { hasAnyPermission } from '~/utils/rolePermission'
import useAuth from '~/hooks/useAuth'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'

export default function EditPurchaseInvoiceForm() {
  const { id } = useParams() // INVOICE_CODE
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors }, watch, control } = useForm()
  const { userId: user_id } = useUserInfo()
  const { roles } = useAuth()
  const device_id = useDeviceId()
  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)
  const [selectedItems, setSelectedItems] = useState([])

  // Fetch hóa đơn hiện tại
  const { data: invoiceData, isLoading, error } = useQuery({
    enabled: !!device_id,
    queryKey: ['invoiceDetail', id],
    queryFn: () => invoicesService.getInvoiceDetail(id, { device_id, user_id }),
    refetchOnWindowFocus: false,
    retry: false,
  })

  // Fetch danh sách đơn vị tiền tệ
  const { data: dataUnitInvoice, isLoading: isLoadingUnitInvoice, isError: isErrorUnitInvoice } = useQuery({
    queryKey: ['unitInvoiceList'],
    queryFn: () => unitInvoiceService.search({ user_id, device_id }),
    enabled: !!device_id,
    refetchOnWindowFocus: false,
  })

  // Cập nhật lại selectedItems khi có dữ liệu
  useEffect(() => {
    if (invoiceData?.data?.ITEMS) {
      const formatedItems = invoiceData.data.ITEMS.map(item => ({
        ITEM_CODE: item.ITEM_CODE,
        ITEM_NAME: item.ITEM_DETAIL?.ITEM_NAME,
        QUANTITY: item.QUANTITY,
        UNIT_PRICE: item.UNIT_PRICE,
        UNIT: item?.UNIT?._id,
        SUPPLIER_ID: item?.SUPPLIER?._id
      }))
      setSelectedItems(formatedItems)
    }
  }, [invoiceData])

  // Submit cập nhật hóa đơn
  const mutation = useMutation({
    mutationFn: (data) => invoicesService.update({ user_id, device_id, }, invoiceData.data.INVOICE_CODE, data),
    onSuccess: () => {
      toast.success('Cập nhật hóa đơn thành công!')
      navigate(`/admin/purchase-invoices/${id}`)
    },
    onError: () => {
      toast.error('Đã xảy ra lỗi khi cập nhật hóa đơn!')
    }
  })

  const status = invoiceData?.data?.STATUS?.at(-1)

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

  // Xóa sản phẩm khỏi danh sách
  const handleDeleteItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSupplierSelect = (itemIndex, supplierId) => {
    setSelectedItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex ? { ...item, SUPPLIER_ID: supplierId } : item
      )
    )
  }

  const submit = (data) => {
    if (selectedItems.length === 0) {
      toast.warning('Hóa đơn cần ít nhất một sản phẩm.')
      return
    }

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

  if (!device_id || !user_id || isLoading) {
    console.log('device_id hoặc user_id chưa sẵn sàng:', { device_id, user_id })
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
    <form onSubmit={handleSubmit(submit)}>
      <Paper sx={{ p: 3, mx: 'auto' }}>
        <Box sx={{ mb: 2 }}>
          {breadcrumbs.map((item, index) => (
            <Button
              key={index}
              variant="text"
              color={location.pathname === item.path ? 'primary' : 'secondary'}
              disabled={location.pathname === item.path}
              component="span"
            >
              {item.name}
              {index < breadcrumbs.length - 1 && ' > '}
            </Button>
          ))}
        </Box>

        <Typography variant="h5" gutterBottom>
                  Chỉnh sửa hóa đơn
        </Typography>

        {/* Search sản phẩm */}
        {status?.STATUS_NAME === 'DRAFT' && (
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
        )}

        {/* Thông tin thanh toán (readonly) */}
        <Box mb={2} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            {...register('statusName', {
              required: 'Vui lòng chọn trạng thái'
            })}
            label="Trạng thái"
            select
            defaultValue={status.STATUS_NAME || ''}
            sx={{ minWidth: 180 }}
            error={!!errors.statusName}
            helperText={errors.statusName?.message}
          >
            <MenuItem value=''>
                          --
            </MenuItem>
            {PURCHASE_INVOICE_STATUS.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{
                  display: !hasAnyPermission(roles, 'purchaseInvoice', option.needPermission)
                    || !option.validate(invoiceData?.data?.STATUS?.at(-1)?.STATUS_NAME) ? 'none' : ''
                }}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            {...register('paymented', {
              required: 'Vui lòng chọn trạng thái'
            })}
            label="Phương thức thanh toán"
            select
            defaultValue={invoiceData.data.PAYMENTED || ''}
            sx={{ minWidth: 180 }}
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
            defaultValue={invoiceData.data.TAX}
            type='number'
            sx={{ minWidth: 120 }}
            error={!!errors.tax}
            helperText={errors.tax?.message}
          />
          <TextField
            {...register('extraFee', {
              min: { value: 0, message: 'Phí phát sinh phát >= 0' },
            })}
            label="Phi phát sinh"
            defaultValue={invoiceData.data.EXTRA_FEE}
            type='number'
            sx={{ minWidth: 120 }}
            error={!!errors.extraFee}
            helperText={errors.extraFee}
          />
          {!isLoadingUnitInvoice && !isErrorUnitInvoice && !!dataUnitInvoice && (
            <TextField
              {...register('extraFeeUnit', {
                required: { value: !!watch('extraFee'), message: 'vui lòng chọn đơn vị tiền tệ của phí phát sinh' },
              })}
              label="Đơn vị tiền tệ phí phát sinh"
              select
              defaultValue={invoiceData.data.EXTRA_FEE_UNIT || ''}
              sx={{ minWidth: 180 }}
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

        {/* Bảng sản phẩm */}
        <TableContainer component={Paper} sx={{ mb: 2, width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1200 }} aria-label="table">
            <TableHead>
              <TableRow>
                <TableCell>Mã sản phẩm</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell>Nhà cung cấp</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Giá nhập</TableCell>
                <TableCell>Đơn vị tiền tệ</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedItems?.map((item, index) => (
                <TableRow key={item.ITEM_CODE}>
                  <TableCell>{item.ITEM_CODE}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>{item.ITEM_NAME}</TableCell>
                  <TableCell sx={{ overflow: 'hidden' }}>
                    <SearchSupplierInput
                      index={index}
                      key={item.ITEM_CODE}
                      needInitialFetch
                      selectedSupplier={item.SUPPLIER_ID ?? ''}
                      onSelect={(supplierId) => handleSupplierSelect(index, supplierId)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      sx={{ maxWidth: '100px' }}
                      disabled={status?.STATUS_NAME !== 'DRAFT'}
                      value={item.QUANTITY}
                      slotProps={{
                        input: {
                          endAdornment: (
                            item.UNIT_ITEM_NAME && <InputAdornment position='end'>{item.UNIT_ITEM_NAME}</InputAdornment>
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
                      disabled={status?.STATUS_NAME !== 'DRAFT'}
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
                            disabled={status?.STATUS_NAME !== 'DRAFT'}
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
                    <IconButton color="error" disabled={status?.STATUS_NAME !== 'DRAFT'} onClick={() => handleDeleteItem(index)}>
                      <CloseIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          color="primary"
          type='submit'
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Đang cập nhật...' : 'Lưu thay đổi'}
        </Button>
      </Paper>
    </form>
  )
}
