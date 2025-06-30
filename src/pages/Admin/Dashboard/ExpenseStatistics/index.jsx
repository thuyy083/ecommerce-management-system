import { Avatar, Box, Card, CardContent, CircularProgress, Grid, Paper, Stack, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { green, orange, red, yellow } from '@mui/material/colors'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import AllInboxIcon from '@mui/icons-material/AllInbox'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import invoicesService from '~/service/admin/invoices.service'
import { formatCurrency } from '~/utils/formatter'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import dayjs from 'dayjs'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'

const getStatusColor = (status) => {
  switch (status) {
  case 'DRAFT':
    return '#9e9e9e'
  case 'PENDING_APPROVAL':
    return '#ff9800'
  case 'CONFIRMED':
    return '#2196f3'
  case 'REJECTED':
    return '#f44336'
  case 'PAYMENTED':
    return '#4caf50'
  default:
    return '#757575'
  }
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
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

// Đăng ký các thành phần cần dùng trong ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

// Tuỳ chọn hiển thị
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 14,
        },
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: function (value) {
          return value.toLocaleString('vi-VN') // định dạng số theo VN
        },
        font: {
          size: 12,
        },
      },
    },
    x: {
      ticks: {
        font: {
          size: 12,
        },
      },
    },
  },
}

function ExpenseStatistics () {
  const { userId: user_id } = useUserInfo()
  const device_id = useDeviceId()
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


  const totalExpensePreviosMonth = results[0]?.data?.data?.total
  const totalExpenseThisMonth = results[1]?.data?.data?.total
  const dataQuantityPurchaseInvoiceThisMonth = results[2]?.data?.data?.total
  const dataQuantityPurchaseInvoicePreviousMonth = results[3]?.data?.data?.total

  const getPercentIncreaseExPense = useMemo(() => {
    if (!totalExpenseThisMonth || totalExpensePreviosMonth === 0) return null // tránh chia cho 0 hoặc undefined
    const growth = ((totalExpenseThisMonth - totalExpensePreviosMonth) / totalExpensePreviosMonth) * 100
    return Math.round(growth * 100) / 100 // làm tròn 2 chữ số thập phân
  }, [totalExpensePreviosMonth, totalExpenseThisMonth])

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
      queryFn: () => invoicesService.statisticRevenueLastFourWeeks({ user_id, device_id }, { date: key }),
      refetchOnWindowFocus: false,
      enabled: !!user_id && !!device_id,
    })),
  })

  const statisticTotalRevenueDataOfYearData = statisticTotalRevenueDataOfYear.map(data => data?.data?.data?.total)

  // Dữ liệu mẫu từ ảnh: doanh thu từ tháng 1 đến tháng 4
  const dataStatisticTotalExpenseYearGraphic = useMemo(() => ({
    labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 12 tháng
    datasets: [
      {
        label: 'Chi tiêu các tháng (triệu VND)',
        data: statisticTotalRevenueDataOfYearData, // chỉ 4 tháng đầu có dữ liệu
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderRadius: 5,
        barPercentage: 0.5,
      },
    ],
  }), [statisticTotalRevenueDataOfYearData])

  const { data: dataExpenseLast7Day, isLoading: isLoadingExpenseLast7day, isError: isErrorExpenseLast7day } = useQuery({
    enabled: !!device_id && !!user_id,
    refetchOnWindowFocus: false,
    queryKey: ['expense-last-7-Day'],
    queryFn: () => invoicesService.statisticstatisticRevenueLastSevenDays({ device_id, user_id })
  })

  const labelsExpenseLast7Day = dataExpenseLast7Day?.data?.listday?.map(item => item.date)
  const totalsExpenseLast7Day = dataExpenseLast7Day?.data?.listday?.map(item => item.total)
  const quantitiesExpenseLast7Day = dataExpenseLast7Day?.data?.listday?.map(item => item.quantity)

  const chartDataExpenseLast7Day = {
    labels: labelsExpenseLast7Day,
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: totalsExpenseLast7Day,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderRadius: 8,
      },
    ]
  }

  const optionsDataExpenseLast7Day = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex
            const total = totalsExpenseLast7Day[index]
            const quantity = quantitiesExpenseLast7Day[index]

            return [
              `Tổng chi: ${total.toLocaleString('vi-VN')} đ`,
              `Số đơn hàng: ${quantity}`
            ]
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            value.toLocaleString('vi-VN') + ' đ',
        }
      }
    }
  }


  const expense4MonthsLabels = results[1]?.data?.data?.listweek?.map(item => item.week)
  const expense4MonthsTotals = results[1]?.data?.data?.listweek?.map(item => item.total)
  const expense4MonthsQuantities = results[1]?.data?.data?.listweek?.map(item => item.quantity)

  const expense4MonthsChartData = {
    labels: expense4MonthsLabels,
    datasets: [
      {
        label: 'Tổng chi (VNĐ)',
        data: expense4MonthsTotals,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderRadius: 8,
      }
    ]
  }

  const expense4MonthsChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex
            const total = expense4MonthsTotals[index]
            const quantity = expense4MonthsQuantities[index]

            return [
              `Tổng chi: ${total.toLocaleString('vi-VN')} đ`,
              `Số đơn hàng: ${quantity}`
            ]
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            value.toLocaleString('vi-VN') + ' đ',
        }
      }
    }
  }

  const { data: dataPreviewPurchaseInvoice, isLoading: isLoadingPreviewPurchaseInvoice, isError: isErrorPreviewPurchaseInvoice } = useQuery({
    queryKey: [
      'invoiceList',
    ],
    enabled: !!device_id && !!user_id,
    queryFn: () =>
      invoicesService.search(
        { user_id, device_id: device_id },
        {
          limit: 5,
        }
      ),
    retry: false,
    refetchOnWindowFocus: false,
  })


  const isLoading = results.some(query => query.isLoading) || statisticTotalRevenueDataOfYear.some(res => res.isLoading)
    || isLoadingExpenseLast7day
    || isLoadingPreviewPurchaseInvoice
  const isError = results.some(query => query.isError)
    || statisticTotalRevenueDataOfYear.some(res => res.isError)
    || isErrorExpenseLast7day
    || isErrorPreviewPurchaseInvoice

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
      <SearchResultNotFound message='Lỗi xảy ra khi lấy dữ liệu thống kê'/>
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
      <Typography sx={{ mb: 4 }} variant='h4'>Thống kê chi tiêu</Typography>
      <Grid container spacing={10}>
        <Grid size={4}>
          <Stack gap={2} justifyContent='center' alignItems='center' sx={{ height: '100%' }}>
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
        <Grid size={8}>
          <Bar data={dataStatisticTotalExpenseYearGraphic} options={options} />
        </Grid>
        <Grid size={6}>
          <Stack gap={2} alignItems='center'>
            <Typography variant='h6'>Tổng chi tiêu tuần qua</Typography>
            <Bar data={chartDataExpenseLast7Day} options={optionsDataExpenseLast7Day} />
          </Stack>
        </Grid>
        <Grid size={6}>
          <Stack gap={2} alignItems='center'>
            <Typography variant='h6'>Tổng chi tiêu tháng qua</Typography>
            <Bar data={expense4MonthsChartData} options={expense4MonthsChartOptions} />
          </Stack>
        </Grid>
        <Grid size={12}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="invoice table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Mã hóa đơn</StyledTableCell>
                  <StyledTableCell>Ngày tạo</StyledTableCell>
                  <StyledTableCell>Người lập hóa đơn</StyledTableCell>
                  <StyledTableCell>Tổng tiền</StyledTableCell>
                  <StyledTableCell>Trạng thái</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? <TableRow><TableCell colSpan={6} align='center'><CircularProgress size={20} /></TableCell></TableRow>
                  : (dataPreviewPurchaseInvoice?.data?.invoices?.length === 0
                    ? <TableRow>
                      <TableCell colSpan={6}><SearchResultNotFound message='Không tìm thấy hóa đơn' /></TableCell>
                    </TableRow>
                    : dataPreviewPurchaseInvoice?.data?.results?.map((invoice) => (
                      <StyledTableRow key={invoice.INVOICE_CODE}>
                        <StyledTableCell>{invoice.INVOICE_CODE}</StyledTableCell>
                        <StyledTableCell>{dayjs(invoice.IMPORT_DATE).format('DD/MM/YYYY HH:mm')}</StyledTableCell>
                        <StyledTableCell>{invoice.IMPORTED_BY}</StyledTableCell>
                        <StyledTableCell>{invoice.TOTAL_WITH_TAX_EXTRA_FEE?.toLocaleString()} đ</StyledTableCell>
                        <StyledTableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              px: 1,
                              py: 0.5,
                              color: '#fff',
                              backgroundColor: getStatusColor(invoice.STATUS[invoice.STATUS.length - 1].STATUS_NAME),
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              display: 'inline-block',
                              textTransform: 'uppercase',
                              fontWeight: 'bold'
                            }}
                          >
                            {invoice.STATUS[invoice.STATUS.length - 1].STATUS_NAME}
                          </Typography>
                        </StyledTableCell>
                      </StyledTableRow>
                    )))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </div>
  )
}

export default ExpenseStatistics