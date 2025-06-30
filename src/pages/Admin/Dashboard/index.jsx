import { Grid, IconButton, Paper, Stack, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Typography, Chip, Tooltip as MUIToolTip, CircularProgress } from '@mui/material'
import { Card, CardContent, Box, Avatar } from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AllInboxIcon from '@mui/icons-material/AllInbox' // hoặc Inventory2Outlined nếu muốn icon giống hộp hơn
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { green, blue, red, yellow, orange } from '@mui/material/colors'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import PaidIcon from '@mui/icons-material/Paid'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CancelIcon from '@mui/icons-material/Cancel'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import { useMemo, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import saleInvoiceSerivce from '~/service/admin/saleInvoice.serivce'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import { formatCurrency, formatToVietnamTime } from '~/utils/formatter'
import dayjs from 'dayjs'
import { SALE_INVOICE_STATUS, SALE_INVOICES_PURCHASE_METHODS } from '~/utils/contant'
import { getColorByValue, getLabelByValue } from '~/utils/mapper'
import invoicesService from '~/service/admin/invoices.service'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'

// Đăng ký các thành phần cần dùng trong ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

// Tuỳ chọn hiển thị


const PURCHASE_METHODS = ['ONLINE', 'IN_STORE', 'DELIVERY', 'PRE_ORDER']

const getColorByIndex = (index) => {
  const colors = [
    'rgba(75, 192, 192, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
  ]
  return colors[index % colors.length]
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))


const backgroundColorsOfStatisticRevenueByItem = [
  'rgba(75, 192, 192, 0.6)',
  'rgba(255, 99, 132, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)',
]

const transformRevenueData = (listday = []) => {
  const labels = listday.map(item => item.date)

  const methodDataMap = {}
  PURCHASE_METHODS.forEach(method => {
    methodDataMap[method] = new Array(labels.length).fill(0)
  })

  listday.forEach((day, index) => {
    (day.purchase_methods || []).forEach(pm => {
      const method = pm.purchase_method_name
      if (methodDataMap[method]) {
        methodDataMap[method][index] = pm.total_amount
      }
    })
  })

  const datasets = PURCHASE_METHODS.map((method, i) => ({
    label: method,
    data: methodDataMap[method],
    backgroundColor: getColorByIndex(i),
  }))

  return { labels, datasets }
}


function Dashboard() {
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const lastDayOfthisMonth = useMemo(() => {
    const today = new Date()

    const year = today.getFullYear()
    const month = today.getMonth() // Tháng 0-11

    const lastDayDate = new Date(year, month + 1, 0)

    const day = String(lastDayDate.getDate()).padStart(2, '0')
    const formattedMonth = String(lastDayDate.getMonth() + 1).padStart(2, '0')
    const formattedYear = lastDayDate.getFullYear()

    return `${formattedYear}-${formattedMonth}-${day}`
  }, [])

  const lastDayOfPreviosMonth = useMemo(() => {
    const today = new Date()

    const year = today.getFullYear()
    const month = today.getMonth() // Tháng hiện tại (0–11)

    // Tạo ngày 0 của tháng hiện tại → là ngày cuối cùng của tháng trước
    const lastDayPrevMonth = new Date(year, month, 0)

    const day = String(lastDayPrevMonth.getDate()).padStart(2, '0')
    const formattedMonth = String(lastDayPrevMonth.getMonth() + 1).padStart(2, '0')
    const formattedYear = lastDayPrevMonth.getFullYear()

    // yyyy-mm-dd
    return `${formattedYear}-${formattedMonth}-${day}`
  }, [])

  const getFirstDayOfThisMonthFormatted = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() // 0-11

    const firstDay = new Date(year, month, 1)

    const day = String(firstDay.getDate()).padStart(2, '0')
    const formattedMonth = String(firstDay.getMonth() + 1).padStart(2, '0')
    const formattedYear = firstDay.getFullYear()

    return `${formattedYear}-${formattedMonth}-${day}`
  }, [])

  const getFirstDayOfThisPrevFormatted = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() // 0-11

    const firstDayPrevMonth = new Date(year, month - 1, 1)

    const day = String(firstDayPrevMonth.getDate()).padStart(2, '0')
    const formattedMonth = String(firstDayPrevMonth.getMonth() + 1).padStart(2, '0')
    const formattedYear = firstDayPrevMonth.getFullYear()

    return `${formattedYear}-${formattedMonth}-${day}`
  }, [])

  const results = useQueries({
    queries: [
      {
        enabled: !!user_id && !!device_id,
        queryKey: ['totalRevenueLastMonth'],
        queryFn: () => saleInvoiceSerivce.statisticRevenueLastFourWeeks({ user_id, device_id }, { date: lastDayOfPreviosMonth }),
        refetchOnWindowFocus: false,
      },
      {
        enabled: !!user_id && !!device_id,
        queryKey: ['totalRevenueThisMonth'],
        queryFn: () => saleInvoiceSerivce.statisticRevenueLastFourWeeks({ user_id, device_id }, { date: lastDayOfthisMonth }),
        refetchOnWindowFocus: false,
      },
      {
        enabled: !!user_id && !!device_id,
        queryKey: ['quantityOrderThisMonth'],
        queryFn: () => saleInvoiceSerivce.search({ user_id, device_id }, { fromDate: getFirstDayOfThisMonthFormatted, toDate: lastDayOfthisMonth, status: 'PAYMENTED' }),
        refetchOnWindowFocus: false,
      },
      {
        enabled: !!user_id && !!device_id,
        queryKey: ['quantityOrderPreviousMonth'],
        queryFn: () => saleInvoiceSerivce.search({ user_id, device_id }, { fromDate: getFirstDayOfThisPrevFormatted, toDate: lastDayOfPreviosMonth, status: 'PAYMENTED' }),
        refetchOnWindowFocus: false,
      },
      {
        enabled: !!user_id && !!device_id,
        queryKey: ['totalExpenseLastMonth'],
        queryFn: () => invoicesService.statisticRevenueLastFourWeeks({ user_id, device_id }, { date: lastDayOfPreviosMonth }),
        refetchOnWindowFocus: false,
      },
      {
        enabled: !!user_id && !!device_id,
        queryKey: ['totalExpenseThisMonth'],
        queryFn: () => invoicesService.statisticRevenueLastFourWeeks({ user_id, device_id }, { date: lastDayOfthisMonth }),
        refetchOnWindowFocus: false,
      },
      {
        enabled: !!user_id && !!device_id,
        queryKey: ['quantityPurchaseInvoviceThisMonth'],
        queryFn: () => invoicesService.search({ user_id, device_id }, { fromDate: getFirstDayOfThisMonthFormatted, toDate: lastDayOfthisMonth, status: 'PAYMENTED' }),
        refetchOnWindowFocus: false,
      },
      {
        enabled: !!user_id && !!device_id,
        queryKey: ['quantityPurchaseInvovicePreviousMonth'],
        queryFn: () => invoicesService.search({ user_id, device_id }, { fromDate: getFirstDayOfThisPrevFormatted, toDate: lastDayOfPreviosMonth, status: 'PAYMENTED' }),
        refetchOnWindowFocus: false,
      },
    ],
  })

  const dataTotalRevenuePreviousMonth = results[0]?.data?.data.total ?? 0
  const dataTotalRevenueThisMonth = results[1]?.data?.data.total ?? 0
  const dataQuantityOrderThisMonth = results[2]?.data?.data?.total
  const dataQuantityOrderPreviousMonth = results[3]?.data?.data?.total
  const totalExpensePreviosMonth = results[4]?.data?.data?.total
  const totalExpenseThisMonth = results[5]?.data?.data?.total
  const dataQuantityPurchaseInvoiceThisMonth = results[6]?.data?.data?.total
  const dataQuantityPurchaseInvoicePreviousMonth = results[7]?.data?.data?.total

  const getPercentIncreaseRevenue = useMemo(() => {
    if (!dataTotalRevenuePreviousMonth || dataTotalRevenuePreviousMonth === 0) return null // tránh chia cho 0 hoặc undefined
    const growth = ((dataTotalRevenueThisMonth - dataTotalRevenuePreviousMonth) / dataTotalRevenuePreviousMonth) * 100
    return Math.round(growth * 100) / 100 // làm tròn 2 chữ số thập phân
  }, [dataTotalRevenuePreviousMonth, dataTotalRevenueThisMonth])

  const getPercentIncreaseExPense = useMemo(() => {
    if (!totalExpenseThisMonth || totalExpensePreviosMonth === 0) return null // tránh chia cho 0 hoặc undefined
    const growth = ((totalExpenseThisMonth - totalExpensePreviosMonth) / totalExpensePreviosMonth) * 100
    return Math.round(growth * 100) / 100 // làm tròn 2 chữ số thập phân
  }, [totalExpensePreviosMonth, totalExpenseThisMonth])

  const getPercentIncreaseOrder= useMemo(() => {
    if (
      !dataQuantityOrderPreviousMonth ||
      dataQuantityOrderPreviousMonth === 0 ||
      dataQuantityOrderThisMonth == null
    ) {
      return null
    }

    const growth =
      ((dataQuantityOrderThisMonth - dataQuantityOrderPreviousMonth) /
        dataQuantityOrderPreviousMonth) *
      100

    return Math.round(growth * 100) / 100 // Làm tròn 2 chữ số
  }, [dataQuantityOrderPreviousMonth, dataQuantityOrderThisMonth])

  const getPercentIncreasePurchaseInvoice = useMemo(() => {
    if (
      !dataQuantityPurchaseInvoicePreviousMonth ||
      dataQuantityPurchaseInvoicePreviousMonth === 0 ||
      dataQuantityPurchaseInvoiceThisMonth == null
    ) {
      return null
    }

    const growth =
      ((dataQuantityPurchaseInvoiceThisMonth - dataQuantityPurchaseInvoicePreviousMonth) /
        dataQuantityPurchaseInvoicePreviousMonth) *
      100

    return Math.round(growth * 100) / 100 // Làm tròn 2 chữ số
  }, [dataQuantityPurchaseInvoicePreviousMonth, dataQuantityPurchaseInvoiceThisMonth])


  const getFirstDay = (monthOffset = 0) => {
    const date = new Date()
    date.setMonth(date.getMonth() - monthOffset)
    date.setDate(1)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = '01'
    return `${yyyy}-${mm}-${dd}`
  }

  const keys = Array.from({ length: 12 }, (_, i) => getFirstDay(5 - i))

  const statisticTotalRevenueDataOfYear = useQueries({
    queries: keys.map((key) => ({
      queryKey: ['by-month', key],
      queryFn: () => saleInvoiceSerivce.statisticRevenueLastFourWeeks({ user_id, device_id }, { date: key }),
      refetchOnWindowFocus: false,
      enabled: !!user_id && !!device_id,
    })),
  })

  const {
    data: dataStatisticRevenueOfEachPurchaseMethodPerWeek,
    isLoading: isLoadingStatisticRevenueOfEachPurchaseMethodPerWeek,
    isError: isErrorStatisticRevenueOfEachPurchaseMethodPerWeek
  } = useQuery({
    enabled: !!user_id && !!device_id,
    queryKey: ['statisticRevenueOfEachPurchaseMethodPerWeek'],
    queryFn: () => saleInvoiceSerivce.statisticRevenueOfEachPurchaseMethodPerWeek({ user_id, device_id }),
    refetchOnWindowFocus: false
  })

  const listday = dataStatisticRevenueOfEachPurchaseMethodPerWeek?.data?.listday || []
  const { labels, datasets } = transformRevenueData(listday)

  const dataStatisticRevenueOfEachPurchaseMethodPerWeekChart = {
    labels,
    datasets,
  }

  const optionsOfWeekChart = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20, // khoảng cách giữa các item và chart
          boxWidth: 20,
        }, },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'VNĐ',
        },
      },
    },
  }

  const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7))
  const [fromDate, setFromDate] = useState(dayjs(lastWeek))
  const { data: dataStatisticRevenueByItem, isLoading: isLoadingStatisticRevenueByItem, isError: isErrorStatisticRevenueByItem } = useQuery({
    enabled: !!user_id && !!device_id && !!fromDate,
    queryKey: ['statistic-total-revenue-by-item', fromDate],
    queryFn: () => saleInvoiceSerivce.statisticTotalRevenuePerItem({ user_id, device_id }, { fromDate: fromDate.format('YYYY-MM-DD') }),
    refetchOnWindowFocus: false,
  })

  const listItemStatisticRevenueByItem = dataStatisticRevenueByItem?.data?.listItem || []

  const labelsOfStatisticRevenueByItem = listItemStatisticRevenueByItem.map(item => item.ITEM_NAME)
  const dataValuesOfStatisticRevenueByItem = listItemStatisticRevenueByItem.map(item => item.total_amount)

  const dataStatisticRevenueByItemFormatForChart = {
    labels: labelsOfStatisticRevenueByItem,
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: dataValuesOfStatisticRevenueByItem,
        backgroundColor: backgroundColorsOfStatisticRevenueByItem.slice(0, labelsOfStatisticRevenueByItem.length),
        borderWidth: 1,
      },
    ],
  }

  const MAX_LABEL_LENGTH = 20 // hoặc bao nhiêu ký tự bạn thấy hợp lý

  const optionsStatisticRevenueByItem = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          generateLabels: (chart) => {
            const data = chart.data
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0]
                // eslint-disable-next-line no-unused-vars
                const value = dataset.data[i]

                const truncatedLabel = label.length > MAX_LABEL_LENGTH
                  ? label.slice(0, MAX_LABEL_LENGTH) + '...'
                  : label

                return {
                  text: truncatedLabel,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor?.[i] || dataset.backgroundColor[i],
                  lineWidth: 1,
                  hidden: chart.getDataVisibility(i) === false,
                  index: i,
                }
              })
            }
            return []
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const index = ctx.dataIndex
            const item = listItemStatisticRevenueByItem[index] || {}
            const name = item.ITEM_NAME || ctx.label
            const code = item.ITEM_CODE || '??'
            const value = ctx.raw || 0

            // Tách thành nhiều dòng
            return [`Mã: ${code}`, `Tên: ${name}`, `Doanh thu: ${value.toLocaleString('vi-VN')} VNĐ`]
          },
        },
      },
    },
  }

  const { data: dataReviewSaleInvocie, isLoading: isLoadingReviewSaleInvocie, isError: isErrorReviewSaleInvocie } = useQuery({
    queryKey: ['saleInvoiceList',],
    enabled: !!device_id && !!user_id,
    queryFn: () => saleInvoiceSerivce.search({
      user_id,
      device_id
    }, {
      limits: 5,
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const isLoading = results.some(query => query.isLoading) || statisticTotalRevenueDataOfYear.some(res => res.isLoading)
    || isLoadingStatisticRevenueOfEachPurchaseMethodPerWeek
    || isLoadingStatisticRevenueByItem
    || isLoadingReviewSaleInvocie
  const isError = results.some(query => query.isError)
    || statisticTotalRevenueDataOfYear.some(res => res.isError)
    || isErrorStatisticRevenueOfEachPurchaseMethodPerWeek
    || isErrorStatisticRevenueByItem
    || isErrorReviewSaleInvocie

  if (isLoading || !device_id || !user_id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%', minHeight: '700px', p: 3 }}>
        <CircularProgress/>
        <Typography variant='body1' sx={{ color: 'grey' }}>Đang tải dữ liệu...</Typography>
      </Box>
    )
  }

  if (isError) {
    return (
      <SearchResultNotFound message='Lỗi xảy ra khi lấy dữ liệu thống kê' />
    )
  }

  return (
    <div>
      <style>
        {`
  .chartjs-tooltip {
    max-width: 400px !important;
    white-space: normal !important;
    word-wrap: break-word;
    text-align: left;
  }
`}
      </style>
      <Typography sx={{ mb: 4 }} variant='h4'>Thống kê</Typography>
      <Grid container spacing={10}>
        <Grid size={6}>
          <Stack sx={{ height: '100%' }} gap={2} justifyContent='center' alignItems='center'>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderLeft: '4px solid #4caf50' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(dataTotalRevenueThisMonth)} đ
                </Typography>
                <Typography color="text.secondary" fontSize="14px">
                  Doanh thu tháng này
                </Typography>
                {!! getPercentIncreaseRevenue && (
                  <Box display="flex" alignItems="center" mt={1}>
                    {getPercentIncreaseRevenue > 0
                      ? <>
                        <ArrowUpwardIcon fontSize="small" sx={{ color: green[500], mr: 0.5 }} />
                        <Typography fontSize="14px" sx={{ color: green[500], mr: 0.5 }}>
                          {getPercentIncreaseRevenue}%
                        </Typography>
                      </>
                      : <>
                        <ArrowDownwardIcon fontSize="small" sx={{ color: red[500], mr: 0.5 }} />
                        <Typography fontSize="14px" sx={{ color: red[500], mr: 0.5 }}>
                          {Math.abs(getPercentIncreaseRevenue)}%
                        </Typography>
                      </>}
                    <Typography fontSize="14px" color="text.secondary">
                      so với tháng trước
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <Avatar sx={{ bgcolor: green[500], width: 48, height: 48 }}>
                <AccountBalanceWalletIcon />
              </Avatar>
            </Card>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderLeft: '4px solid #2196f3' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {dataQuantityOrderThisMonth}
                </Typography>
                <Typography color="text.secondary" fontSize="14px">
                  Đơn hàng tháng này
                </Typography>
                {!!getPercentIncreaseOrder && (
                  <Box display="flex" alignItems="center" mt={1}>
                    {getPercentIncreaseOrder > 0
                      ? <>
                        <ArrowUpwardIcon fontSize="small" sx={{ color: green[500], mr: 0.5 }} />
                        <Typography fontSize="14px" sx={{ color: green[500], mr: 0.5 }}>
                          {getPercentIncreaseOrder}%
                        </Typography>
                      </>
                      : <>
                        <ArrowDownwardIcon fontSize="small" sx={{ color: red[500], mr: 0.5 }} />
                        <Typography fontSize="14px" sx={{ color: red[500], mr: 0.5 }}>
                          {Math.abs(getPercentIncreaseOrder)}%
                        </Typography>
                      </>}
                    <Typography fontSize="14px" color="text.secondary">
                      so với tháng trước
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <Avatar sx={{ bgcolor: blue[500], width: 48, height: 48 }}>
                <AllInboxIcon />
              </Avatar>
            </Card>
          </Stack>
        </Grid>
        <Grid size={6}>
          <Stack sx={{ height: '100%' }} gap={2} justifyContent='center' alignItems='center'>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderLeft: '4px solid yellow' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(totalExpenseThisMonth)} đ
                </Typography>
                <Typography color="text.secondary" fontSize="14px">
                  Chi tiêu tháng này
                </Typography>
                {!!getPercentIncreaseExPense && (
                  <Box display="flex" alignItems="center" mt={1}>
                    {getPercentIncreaseExPense > 0
                      ? <>
                        <ArrowUpwardIcon fontSize="small" sx={{ color: yellow[500], mr: 0.5 }} />
                        <Typography fontSize="14px" sx={{ color: yellow[500], mr: 0.5 }}>
                          {getPercentIncreaseExPense}%
                        </Typography>
                      </>
                      : <>
                        <ArrowDownwardIcon fontSize="small" sx={{ color: red[500], mr: 0.5 }} />
                        <Typography fontSize="14px" sx={{ color: red[500], mr: 0.5 }}>
                          {Math.abs(getPercentIncreaseExPense)}%
                        </Typography>
                      </>}
                    <Typography fontSize="14px" color="text.secondary">
                      so với tháng trước
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <Avatar sx={{ bgcolor: yellow[500], width: 48, height: 48 }}>
                <AccountBalanceWalletIcon />
              </Avatar>
            </Card>
            <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderLeft: '4px solid orange' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {dataQuantityPurchaseInvoiceThisMonth}
                </Typography>
                <Typography color="text.secondary" fontSize="14px">
                  Đơn hàng tháng này
                </Typography>
                {!!getPercentIncreasePurchaseInvoice && (
                  <Box display="flex" alignItems="center" mt={1}>
                    {getPercentIncreasePurchaseInvoice > 0
                      ? <>
                        <ArrowUpwardIcon fontSize="small" sx={{ color: green[500], mr: 0.5 }} />
                        <Typography fontSize="14px" sx={{ color: green[500], mr: 0.5 }}>
                          {getPercentIncreasePurchaseInvoice}%
                        </Typography>
                      </>
                      : <>
                        <ArrowDownwardIcon fontSize="small" sx={{ color: red[500], mr: 0.5 }} />
                        <Typography fontSize="14px" sx={{ color: red[500], mr: 0.5 }}>
                          {Math.abs(getPercentIncreasePurchaseInvoice)}%
                        </Typography>
                      </>}
                    <Typography fontSize="14px" color="text.secondary">
                      so với tháng trước
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <Avatar sx={{ bgcolor: orange[500], width: 48, height: 48 }}>
                <AllInboxIcon />
              </Avatar>
            </Card>
          </Stack>
        </Grid>
        <Grid size={6}>
          <Stack gap={2} alignItems='center'>
            <Typography variant='h5'>Thống kê doanh thu theo tuần</Typography>
            <Bar data={dataStatisticRevenueOfEachPurchaseMethodPerWeekChart} options={optionsOfWeekChart} />
          </Stack>
        </Grid>
        <Grid size={6}>
          <Stack gap={2} sx={{ height: '200px' }}>
            <Stack flexDirection='row' gap={4}>
              <Typography variant='h6'>Thống kê sản phẩm bán chạy</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Từ ngày"
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  format="DD/MM/YYYY"
                />
              </LocalizationProvider>
            </Stack>
            {dataStatisticRevenueByItem?.data?.total > 0 ? (
              <Pie data={dataStatisticRevenueByItemFormatForChart} options={optionsStatisticRevenueByItem} />
            )
              : <Typography variant='h5'>Không có dữ liệu</Typography>
            }
          </Stack>
        </Grid>
        <Grid size={12}>
          <Typography variant='h5' mb={2}>Hóa đơn gần đây</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Mã</StyledTableCell>
                  <StyledTableCell>Ngày bán</StyledTableCell>
                  <StyledTableCell>Người bán</StyledTableCell>
                  <StyledTableCell>Người mua</StyledTableCell>
                  <StyledTableCell>Phương thức thanh toán</StyledTableCell>
                  <StyledTableCell>Tổng giá tiền</StyledTableCell>
                  <StyledTableCell>Hình thức mua hàng</StyledTableCell>
                  <StyledTableCell>Trạng thái</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingReviewSaleInvocie
                  ? <TableRow>
                    <TableCell colSpan={5}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%', mt: 5 }}>
                        <CircularProgress size={20} />
                        <Typography variant='body1' sx={{ color: 'grey' }}>Đang tải dữ liệu...</Typography>
                      </Box>
                    </ TableCell>
                  </ TableRow>
                  : (dataReviewSaleInvocie?.data?.results?.length === 0
                    ? <TableRow>
                      <TableCell colSpan={5}>
                        <SearchResultNotFound message='Không tìm thấy hóa đơn' />
                      </TableCell>
                    </TableRow>
                    : (dataReviewSaleInvocie?.data?.total === 0
                      ? <TableRow>
                        <TableCell colSpan={5}>
                          <SearchResultNotFound message='Không tìm thấy hóa đơn' />
                        </TableCell>
                      </TableRow>
                      : dataReviewSaleInvocie?.data?.results?.map((invoice) => (
                        <StyledTableRow key={invoice.INVOICE_CODE}>
                          <StyledTableCell>{invoice.INVOICE_CODE}</StyledTableCell>
                          <StyledTableCell>{formatToVietnamTime(invoice.SELL_DATE)}</StyledTableCell>
                          <StyledTableCell>{invoice.SOLD_BY}</StyledTableCell>
                          <StyledTableCell>{invoice.CUSTOMER?.FULL_NAME ?? invoice.CUSTOMER?.USERNAME ?? 'Vãng lai'}</StyledTableCell>
                          <StyledTableCell align='center'>
                            <MUIToolTip title={invoice.PAYMENT_METHOD}>
                              <IconButton>
                                {invoice.PAYMENT_METHOD == 'Tiền mặt' && <PaidIcon color='success' />}
                                {invoice.PAYMENT_METHOD == 'Chuyển khoản' && <CreditCardIcon color='info' />}
                              </IconButton>
                            </MUIToolTip>
                          </StyledTableCell>
                          <StyledTableCell>{`${formatCurrency(invoice.TOTAL_WITH_TAX_EXTRA_FEE)} đ`}</StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={getLabelByValue(invoice.PURCHASE_METHOD, SALE_INVOICES_PURCHASE_METHODS)}
                              color={getColorByValue(invoice.PURCHASE_METHOD, SALE_INVOICES_PURCHASE_METHODS)}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            <MUIToolTip title={getLabelByValue(invoice.STATUS, SALE_INVOICE_STATUS)}>
                              {invoice.STATUS === 'DRAFT' && <ModeEditIcon color={getColorByValue(invoice.STATUS, SALE_INVOICE_STATUS)} />}
                              {invoice.STATUS === 'CONFIRMED' && <CheckCircleIcon color={getColorByValue(invoice.STATUS, SALE_INVOICE_STATUS)} />}
                              {invoice.STATUS === 'PAYMENTED' && <AttachMoneyIcon color={getColorByValue(invoice.STATUS, SALE_INVOICE_STATUS)} />}
                              {invoice.STATUS === 'CANCELLED' && <CancelIcon color={getColorByValue(invoice.STATUS, SALE_INVOICE_STATUS)} />}
                            </MUIToolTip>
                          </StyledTableCell>
                        </StyledTableRow>)
                      ))
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </div>
  )
}

export default Dashboard