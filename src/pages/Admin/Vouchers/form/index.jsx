import React, { useEffect } from 'react'
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Routes } from '~/config'

function VoucherForm({ submit, data, disableCode = false, isSubmitting = false }) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      VOUCHER_CODE: data?.VOUCHER_CODE || '',
      TYPE: data?.TYPE || '',
      VALUE: data?.VALUE || '',
      APPLY_SCOPE: data?.APPLY_SCOPE || '',
      MAX_DISCOUNT: data?.MAX_DISCOUNT || '',
      QUANTITY: data?.QUANTITY || '',
      START_DATE: data?.START_DATE ? data.START_DATE.slice(0, 16) : '',
      END_DATE: data?.END_DATE ? data.END_DATE.slice(0, 16) : ''
    }
  })
  const selectedType = watch('TYPE')
  useEffect(() => {
    if (data) {
      reset({
        VOUCHER_CODE: data?.VOUCHER_CODE || '',
        TYPE: data?.TYPE || 'FIXED_AMOUNT',
        VALUE: data?.VALUE || '',
        APPLY_SCOPE: data?.APPLY_SCOPE || 'PRODUCT',
        MAX_DISCOUNT: data?.MAX_DISCOUNT || '',
        QUANTITY: data?.QUANTITY || '',
        START_DATE: data?.START_DATE ? data.START_DATE.slice(0, 16) : '',
        END_DATE: data?.END_DATE ? data.END_DATE.slice(0, 16) : ''
      })
    }
  }, [data, reset])

  const onSubmit = async (formData) => {
    await submit({
      VOUCHER_CODE: formData.VOUCHER_CODE,
      TYPE: formData.TYPE,
      VALUE: Number(formData.VALUE),
      APPLY_SCOPE: formData.APPLY_SCOPE,
      MAX_DISCOUNT: Number(formData.MAX_DISCOUNT) || null,
      QUANTITY: Number(formData.QUANTITY),
      START_DATE: formData.START_DATE,
      END_DATE: formData.END_DATE
    })
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
      <Typography textAlign="center" variant="h5" gutterBottom>
        {data?._id ? 'Cập nhật Voucher' : 'Tạo mới Voucher'}
      </Typography>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="VOUCHER_CODE"
          control={control}
          rules={{ required: 'Vui lòng nhập mã voucher' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Mã voucher"
              fullWidth
              sx={{ mb: 2 }}
              required
              disabled={disableCode}
              error={!!errors.VOUCHER_CODE}
              helperText={errors.VOUCHER_CODE?.message}
            />
          )}
        />
        <Controller
          name="TYPE"
          control={control}
          rules={{ required: 'Vui lòng chọn loại giảm giá' }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Loại giảm giá"
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.TYPE}
              helperText={errors.TYPE?.message}
            >
              <MenuItem value="FIXED_AMOUNT">Giảm giá cố định</MenuItem>
              <MenuItem value="PERCENTAGE">Giảm theo phần trăm</MenuItem>
            </TextField>
          )}
        />
        <Controller
          name="VALUE"
          control={control}
          rules={{
            required: 'Vui lòng nhập giá trị',
            validate: (value) => {
              const num = Number(value)
              if (selectedType === 'PERCENTAGE' && num > 100) {
                return 'Phần trăm giảm giá không được vượt quá 100%'
              }
              if (num <= 0) {
                return 'Giá trị phải lớn hơn 0'
              }
              return true
            }
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label={selectedType === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền (₫)'}
              type="number"
              fullWidth
              sx={{ mb: 2 }}
              required
              error={!!errors.VALUE}
              helperText={errors.VALUE?.message}
            />
          )}
        />

        <Controller
          name="APPLY_SCOPE"
          control={control}
          rules={{ required: 'Vui lòng chọn phạm vi áp dụng' }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Phạm vi áp dụng"
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.APPLY_SCOPE}
              helperText={errors.APPLY_SCOPE?.message}
            >
              <MenuItem value="PRODUCT">Sản phẩm</MenuItem>
              <MenuItem value="GLOBAL">Hóa đơn</MenuItem>
            </TextField>
          )}
        />

        {selectedType == 'PERCENTAGE' && (
          <Controller
            name="MAX_DISCOUNT"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Giảm tối đa"
                type="number"
                fullWidth
                sx={{ mb: 2 }}
              />
            )}
          />
        )}

        <Controller
          name="QUANTITY"
          control={control}
          rules={{ required: 'Vui lòng nhập số lượng' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Số lượng"
              type="number"
              fullWidth
              sx={{ mb: 2 }}
              required
              error={!!errors.QUANTITY}
              helperText={errors.QUANTITY?.message}
            />
          )}
        />
        <Controller
          name="START_DATE"
          control={control}
          rules={{ required: 'Vui lòng chọn ngày bắt đầu' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Ngày bắt đầu"
              type="datetime-local"
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              error={!!errors.START_DATE}
              helperText={errors.START_DATE?.message}
            />
          )}
        />
        <Controller
          name="END_DATE"
          control={control}
          rules={{ required: 'Vui lòng chọn ngày kết thúc' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Ngày kết thúc"
              type="datetime-local"
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              error={!!errors.END_DATE}
              helperText={errors.END_DATE?.message}
            />
          )}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" color="secondary" type="reset"
            LinkComponent={Link} to={Routes.admin.vouchers.list}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu...' : data?._id ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Box>
      </form>
    </Paper>
  )
}

export default VoucherForm
