import { useState, useMemo } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { useQuery } from '@tanstack/react-query'
import saleInvoiceSerivce from '~/service/admin/saleInvoice.serivce'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import dayjs from 'dayjs'
import { useTheme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'

/* ---------------- mapping ---------------- */
const TAB_LABELS = [
  { vn: 'Tất cả', code: '' },
  { vn: 'Chờ xác nhận', code: 'DRAFT' },
  { vn: 'Đã xác nhận', code: 'CONFIRMED' },
  { vn: 'Đã thanh toán', code: 'PAYMENTED' },
  { vn: 'Đã huỷ', code: 'CANCELLED' }
]

export default function OrdersInfo() {
  const theme = useTheme()

  /* ----------- state ----------- */
  const [tabIdx, setTabIdx] = useState(0)
  const [search, setSearch] = useState('')
  const handleChangeTab = (_, v) => setTabIdx(v)

  /* ----------- credential ----------- */
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const navigate = useNavigate()

  /* ----------- call API ----------- */
  const { data, isLoading } = useQuery({
    queryKey: ['sales-invoices', TAB_LABELS[tabIdx].code, search],
    enabled: !!user_id && !!device_id,
    queryFn: () =>
      saleInvoiceSerivce.search(
        { user_id, device_id },
        {
          page: 1,
          size: 50,
          status: TAB_LABELS[tabIdx].code || undefined,
          search: search.trim() || undefined
        }
      ),
    keepPreviousData: true
  })

  /* ----------- chuẩn hoá data ----------- */
  const invoices = useMemo(() => {
    if (!data?.data?.results) return []
    const list = data.data.results
    if (!search.trim()) return list
    const kw = search.toLowerCase()
    return list.filter(inv => inv.INVOICE_CODE.toLowerCase().includes(kw))
  }, [data, search])

  /* ----------- helpers ----------- */
  const chipColor = status => {
    switch (status) {
    case 'PAYMENTED':
      return 'success'
    case 'CANCELLED':
      return 'error'
    case 'CONFIRMED':
      return 'secondary'
    case 'DRAFT':
      return 'warning'
    default:
      return 'default'
    }
  }

  return (
    <Box sx={{ bgcolor: theme.palette.background.paper, p: { xs: 1, md: 3 } }}>
      <Tabs
        value={tabIdx}
        onChange={handleChangeTab}
        variant="scrollable"
        allowScrollButtonsMobile
        textColor="inherit"
        TabIndicatorProps={{ style: { height: 0 } }}
        sx={{
          '& .MuiTab-root': {
            minHeight: 40,
            fontWeight: 500,
            borderRadius: 20,
            mx: 0.5
          },
          '& .Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText !important',
            fontWeight: 700
          }
        }}
      >
        {TAB_LABELS.map(t => (
          <Tab key={t.code} disableRipple label={t.vn} />
        ))}
      </Tabs>

      {/* <TextField
        fullWidth
        size="small"
        sx={{ mt: 2, bgcolor: theme.palette.info.main + '20' }}
        placeholder="Tìm theo mã đơn…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          )
        }}
      /> */}

      {/* ---------- danh sách ---------- */}
      {isLoading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : invoices.length === 0 ? (
        <Typography mt={4} textAlign="center" color="text.secondary">
          Không có đơn {TAB_LABELS[tabIdx].vn.toLowerCase()}.
        </Typography>
      ) : (
        invoices.map(inv => (
          <Paper
            onClick={() => navigate(`/customer/order/${inv.INVOICE_CODE}`)}
            key={inv.INVOICE_CODE} sx={{ cursor:'pointer', mt: 2, p: 2, border: `1px solid ${theme.palette.primary.main}20` }}>
            {/* header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongIcon fontSize="small" />
                {inv.INVOICE_CODE}
              </Typography>

              <Chip
                label={TAB_LABELS.find(t => t.code === inv.STATUS)?.vn || inv.STATUS}
                color={chipColor(inv.STATUS)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {/* date */}
            <Typography fontSize={14} color="text.secondary" sx={{ mb: 0.5 }}>
              {dayjs(inv.SELL_DATE).format('DD/MM/YYYY HH:mm')}
            </Typography>

            {/* payment & purchase */}
            <Typography fontSize={14} color="text.secondary" sx={{ mb: 1 }}>
              Thanh toán: <b>{inv.PAYMENT_METHOD}</b> | Hình thức: <b>{inv.PURCHASE_METHOD}</b>
            </Typography>

            <Divider />

            {/* total */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Typography fontWeight={700} color="primary.main">
                Tổng:&nbsp;₫{inv.TOTAL_WITH_TAX_EXTRA_FEE.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  )
}
