import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Box, Paper, Typography, Grid, CircularProgress } from '@mui/material'
import { Doughnut, Pie } from 'react-chartjs-2'
import { toast } from 'react-toastify'
import vouchersService from '~/service/admin/vouchers.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

// Đăng ký ArcElement
ChartJS.register(ArcElement, Tooltip, Legend)


export default function VoucherStatisticsPage() {
  const deviceId = useDeviceId()
  const userInfo = useUserInfo()
  const user_id = userInfo?.userId

  console.log(user_id, deviceId)
  const { data, isLoading, error } = useQuery({
    enabled: !!deviceId && !!user_id,
    queryKey: ['voucherStatistics'],
    queryFn: () => vouchersService.getStatistics(
      { user_id, device_id: deviceId }
    ),
    retry: false,
    refetchOnWindowFocus: false
  })
  if (!deviceId || !user_id) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography>Đang khởi tạo thông tin thiết bị và người dùng...</Typography>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography>Đang tải thống kê voucher...</Typography>
      </Box>
    )
  }


  if (error) {
    toast.error('Lỗi khi tải dữ liệu thống kê')
    return <Typography color="error">Đã xảy ra lỗi khi tải dữ liệu!</Typography>
  }
  const statistics = data?.data ?? {}

  const typeData = {
    labels: ['Giảm phần trăm', 'Giảm cố định'],
    datasets: [
      {
        data: [
          statistics.type?.PERCENTAGE ?? 0,
          statistics.type?.FIXED_AMOUNT ?? 0
        ],
        backgroundColor: ['#42a5f5', '#66bb6a']
      }
    ]
  }

  const applyScopeData = {
    labels: ['Sản phẩm', 'Hóa đơn'],
    datasets: [
      {
        data: [
          statistics?.applyScope?.PRODUCT ?? 0,
          statistics?.applyScope?.GLOBAL ?? 0
        ],
        backgroundColor: ['#ffa726', '#ab47bc']
      }
    ]
  }


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Thống kê Voucher
      </Typography>

      {/* Tổng quan các chỉ số */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid >
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1">Tổng số voucher</Typography>
            <Typography variant="h5" fontWeight="bold">{statistics.totalVoucher}</Typography>
          </Paper>
        </Grid>
        <Grid >
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1">Đang hoạt động</Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">{statistics.activeVoucher}</Typography>
          </Paper>
        </Grid>
        <Grid >
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1">Ngừng hoạt động</Typography>
            <Typography variant="h5" fontWeight="bold" color="error.main">{statistics.inactiveVoucher}</Typography>
          </Paper>
        </Grid>
        <Grid >
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1">Tổng lượt sử dụng</Typography>
            <Typography variant="h5" fontWeight="bold">{statistics.allNumberUsing}</Typography>
          </Paper>
        </Grid>
        <Grid >
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1">Sắp hết hạn</Typography>
            <Typography variant="h5" fontWeight="bold" color="warning.main">{statistics.exprireSoon}</Typography>
          </Paper>
        </Grid>
        <Grid >
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1">Đã hết hạn</Typography>
            <Typography variant="h5" fontWeight="bold" color="error.main">{statistics.expired}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Biểu đồ */}
      <Grid container spacing={4}>
        <Grid>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Thống kê theo loại giảm giá
            </Typography>
            <Doughnut data={typeData} />
          </Paper>
        </Grid>
        <Grid>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Thống kê theo phạm vi áp dụng
            </Typography>
            <Pie data={applyScopeData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
