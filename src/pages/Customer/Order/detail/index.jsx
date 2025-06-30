import {
  Box, Typography, Chip, Divider, CircularProgress, Paper, Avatar, Button
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import saleInvoiceService from '~/service/admin/saleInvoice.serivce'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import dayjs from 'dayjs'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { useTheme } from '@mui/material/styles'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'

const TAB_LABELS = [
  { vn: 'Tất cả', code: '' },
  { vn: 'Chờ xác nhận', code: 'DRAFT' },
  { vn: 'Đã xác nhận', code: 'CONFIRMED' },
  { vn: 'Đã thanh toán', code: 'PAYMENTED' },
  { vn: 'Đã huỷ', code: 'CANCELLED' }
]

const chipColor = s =>
  ({ PAYMENTED: 'success', CANCELLED: 'error', CONFIRMED: 'secondary', DRAFT: 'warning' }[s] || 'default')

export default function OrderDetail () {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()

  const device_id = useDeviceId()
  const { userId } = useUserInfo()
  const cred = { user_id: userId, device_id }
  const queryClient = useQueryClient()
  const cancelMutation = useMutation({
    mutationFn: () => saleInvoiceService.cancellingOrder(cred, inv.INVOICE_CODE),
    onSuccess: res => {
      toast.success(res.message || 'Huỷ đơn thành công')
      queryClient.invalidateQueries({ queryKey: ['invoice-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] })
    },
    onError: err => {
      const msg = err?.response?.data?.message || 'Không thể huỷ đơn!'
      toast.error(msg)
    }
  })


  const { data, isLoading } = useQuery({
    queryKey: ['invoice-detail', id],
    enabled: !!id && !!userId && !!device_id,
    queryFn: () => saleInvoiceService.getById(cred, id)
  })

  if (isLoading || !data?.data) {
    return (
      <Box textAlign='center' mt={4}>
        <CircularProgress />
      </Box>
    )
  }

  const inv = data.data
  const vnStatus = TAB_LABELS.find(t => t.code === inv.STATUS)?.vn || inv.STATUS

  const formatVnd = n => `₫${n.toLocaleString()}`

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, bgcolor: theme.palette.background.paper }}>
      {/* back */}
      <Box
        onClick={() => navigate(-1)}
        sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer', fontWeight: 500 }}
      >
        <ArrowBackIcon fontSize='small' />&nbsp;Quay lại
      </Box>

      <Paper sx={{ p: { xs: 2, md: 3 }, border: `1px solid ${theme.palette.primary.main}25` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={700}>Mã đơn: {inv.INVOICE_CODE}</Typography>

          <Chip
            label={vnStatus}
            size='small'
            color={chipColor(inv.STATUS)}
            sx={{ fontWeight: 600 }}
          />

        </Box>

        <Typography fontSize={14} color='text.secondary' mt={0.5}>
          Ngày bán: {dayjs(inv.SELL_DATE).format('DD/MM/YYYY HH:mm')}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight={700} mb={1}>Địa chỉ nhận hàng</Typography>
        <Typography>{inv.DELIVERY_INFORMATION.NAME}</Typography>
        <Typography>{inv.DELIVERY_INFORMATION.PHONE_NUMBER}</Typography>
        <Typography whiteSpace='pre-line'>
          {Object.values(inv.DELIVERY_INFORMATION.ADDRESS.DETAIL + ', ' + inv.DELIVERY_INFORMATION.ADDRESS.WARD + ', ' + inv.DELIVERY_INFORMATION.ADDRESS.CITY + ', ' + inv.DELIVERY_INFORMATION.ADDRESS.COUNTRY).filter(Boolean) }
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight={700} mb={1}>Sản phẩm</Typography>
        {inv.ITEMS.map(it => {
          const img = it.AVATAR_IMAGE_URL
          const voucherLabel = it.VOUCHER ? it.VOUCHER.VOUCHER_CODE : null
          return (
            <Box key={it.ITEM_CODE}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={img} variant='square' sx={{ width: 64, height: 64, borderRadius: 1 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontSize={14} fontWeight={600} noWrap>{it.ITEM_NAME}</Typography>
                  {voucherLabel && (
                    <Chip
                      label={`Voucher: ${voucherLabel}`}
                      size='small'
                      sx={{ mt: 0.5, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}
                    />
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography fontSize={13} color='text.secondary'>Đơn giá:</Typography>
                    <Typography fontSize={13}>{formatVnd(it.UNIT_PRICE)}</Typography>
                    {/* <NavigateNextIcon fontSize='small' /> */}
                    {/* <Typography fontSize={13} fontWeight={600}>{formatVnd(it.TOTAL_PRICE)}</Typography> */}
                  </Box>
                </Box>
                <Typography fontSize={13}>x{it.QUANTITY}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
            </Box>
          )
        })}


        {inv.GLOBAL_VOUCHER && (() => {
          const gv = inv.GLOBAL_VOUCHER
          let voucherText = ''

          if (gv.TYPE === 'FIXED_AMOUNT') {
            voucherText = `-${formatVnd(gv.VALUE)}`
          } else if (gv.TYPE === 'PERCENTAGE') {
            voucherText = `-${gv.VALUE}% (tối đa ${formatVnd(gv.MAX_DISCOUNT ?? 0)})`
          }

          return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
              {voucherText && (
                <Typography>
                        Giảm giá: &nbsp;<b>{voucherText}</b>
                </Typography>
              )
              }
            </Box>
          )
        })()}


        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Typography fontWeight={700} color='primary.main' fontSize={16}>
            Tổng thanh toán:&nbsp;{formatVnd(inv.TOTAL_WITH_TAX_EXTRA_FEE)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight={700} mb={1}>Phương thức thanh toán</Typography>
        <Typography>Thanh toán: <b>{inv.PAYMENT_METHOD}</b></Typography>
        <Typography>Hình thức mua: <b>{inv.PURCHASE_METHOD}</b></Typography>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box fontWeight={700}>
            <Typography mb={1}>Thông tin khách hàng</Typography>
            <Typography>{inv.CUSTOMER_CONTACT.NAME}</Typography>
            <Typography>SĐT: {inv.CUSTOMER_CONTACT.PHONE_NUMBER}</Typography>
            <Typography>Email: {inv.CUSTOMER_CONTACT.EMAIL}</Typography>
            <Typography>
                Địa chỉ: {[
                inv.CUSTOMER_CONTACT.ADDRESS_1,
                inv.CUSTOMER_CONTACT.WARD,
                inv.CUSTOMER_CONTACT.DISTRICT,
                inv.CUSTOMER_CONTACT.CITY,
                inv.CUSTOMER_CONTACT.COUNTRY
              ].filter(Boolean).join(', ')}
            </Typography>
          </Box>
          {inv.STATUS === 'DRAFT' && (
            <Button
              size='small'
              color='error'
              variant='outlined'
              disabled={cancelMutation.isLoading}
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn huỷ đơn này?')) {
                  cancelMutation.mutate()
                }
              }}
            >
            Huỷ đơn
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
