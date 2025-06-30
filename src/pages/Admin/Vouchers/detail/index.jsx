import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip
} from '@mui/material'
import vouchersService from '~/service/admin/vouchers.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import { useSelector } from 'react-redux'
import { Routes } from '~/config'
import { toast } from 'react-toastify'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'

const getStatusColor = (isActive) => {
  return isActive ? 'success' : 'error'
}


export default function VoucherDetail() {
  const { id } = useParams()
  const deviceId = useDeviceId()
  const userId = useSelector(state => state.user.currentUser?.USER_ID)

  const { data, isLoading, error } = useQuery({
    enabled: !!deviceId,
    queryKey: ['invoiceDetail', id],
    queryFn: () => vouchersService.getVoucherDetail(id,
      {
        user_id: userId,
        device_id: deviceId
      },
    ),
    retry: false,
    refetchOnWindowFocus: false
  })

  const { data: productsData, isLoading: productsLoading, error: productsError, refetch } = useQuery({
    enabled: !!deviceId,
    queryKey: ['voucherProducts', id],
    queryFn: () => vouchersService.getItemsFromVoucher(
      {
        user_id: userId,
        device_id: deviceId
      },
      id)
  })

  const handleDeleteItem = async (itemId) => {
    try {
      await vouchersService.removeItemfromVoucher(
        {
          user_id: userId,
          device_id: deviceId
        },
        voucher.VOUCHER_CODE,
        { itemId }
      )
      toast.success('Xóa sản phẩm khỏi voucher thành công!')
      refetch()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Xóa sản phẩm thất bại!')
    }
  }


  if (isLoading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography>Đang tải thông tin voucher...</Typography>
      </Box>
    )
  }

  if (error) return (
    <Box sx={{ minHeight: '90vh' }}>
      <SearchResultNotFound message={error?.response?.data?.message || 'Lỗi khi lấy dữ liệu'} />
    </Box>
  )

  const voucher = data?.data
  if (!voucher || !voucher.VOUCHER_CODE) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">
          Không tìm thấy thông tin voucher hoặc voucher không hợp lệ!
        </Typography>
      </Box>
    )
  }
  const getLatestPrice = (product) => {
    if (!Array.isArray(product.PRICE) || product.PRICE.length === 0) return 0
    const latest = product.PRICE.reduce((latest, current) =>
      new Date(current.FROM_DATE) > new Date(latest.FROM_DATE) ? current : latest
    )
    return latest.PRICE_AMOUNT ?? 0
  }


  return (
    <Paper sx={{ p: 4, maxWidth: 700, mx: 'auto', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', background: 'linear-gradient(to right, #ffffff, #f9f9f9)' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 'bold', color: 'primary.main' }}
      >
        Voucher: {voucher.VOUCHER_CODE}
      </Typography>
      {/* <Divider sx={{ mb: 2 }} /> */}


      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Thông tin chi tiết
        </Typography>
        <Box sx={{ pl: 2, mt: 1 }}>
          <Typography><strong>Loại:</strong> {voucher.TYPE === 'PERCENTAGE' ? 'Phần trăm' : 'Giảm giá cố định'}</Typography>
          <Typography><strong>Giá trị:</strong> {voucher.TYPE === 'PERCENTAGE' ? `${voucher.VALUE}%` : `${voucher.VALUE.toLocaleString()} VND`}</Typography>
          {voucher.TYPE === 'PERCENTAGE' && voucher.MAX_DISCOUNT && (
            <Typography><strong>Giảm tối đa:</strong> {voucher.MAX_DISCOUNT.toLocaleString()} VND</Typography>
          )}
          <Typography><strong>Phạm vi áp dụng:</strong> {voucher.APPLY_SCOPE === 'PRODUCT' ? 'Sản phẩm' : 'Hóa đơn'}</Typography>
          <Typography><strong>Số lượng:</strong> {voucher.QUANTITY}</Typography>
          <Typography><strong>Đã sử dụng:</strong> {voucher.NUMBER_USING}</Typography>
          <Typography>
            <strong>Ngày bắt đầu:</strong> {dayjs(voucher.START_DATE).format('DD/MM/YYYY')}
          </Typography>
          <Typography>
            <strong>Ngày kết thúc:</strong> {dayjs(voucher.END_DATE).format('DD/MM/YYYY')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
              Trạng thái:
            </Typography>
            <Chip
              label={voucher.IS_ACTIVE ? 'Hoạt động' : 'Ngưng hoạt động'}
              color={getStatusColor(voucher.IS_ACTIVE)}
              size="small"
            />
          </Box>
        </Box>
      </Box>
      <Box textAlign="right">
        <Button
          variant="contained"
          color="info"
          component={Link}
          to={Routes.admin.vouchers.edit(voucher.VOUCHER_CODE)}
        >
          Cập nhật thông tin
        </Button>
      </Box>
      {/* Bảng sản phẩm */}
      {voucher.APPLY_SCOPE == 'PRODUCT' &&
        (
          <>
            <Box>
              <Typography variant="h6" gutterBottom>
                Danh sách sản phẩm áp dụng voucher:
              </Typography>
              {voucher.APPLY_SCOPE == 'PRODUCT' &&
                (<Button
                  variant="contained"
                  color="info"
                  component={Link}
                  to={Routes.admin.vouchers.addItems(voucher.VOUCHER_CODE)}
                >
                  Thêm sản phẩm
                </Button>)
              }
            </Box>

            {productsLoading ? (
              <Box textAlign="center" mt={2}>
                <CircularProgress />
                <Typography>Đang tải danh sách sản phẩm...</Typography>
              </Box>
            ) : productsError ? (
              <Typography color="error">
                Đã xảy ra lỗi khi tải danh sách sản phẩm!
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Hình ảnh</strong></TableCell>
                      <TableCell><strong>Mã sản phẩm</strong></TableCell>
                      <TableCell><strong>Tên sản phẩm</strong></TableCell>
                      <TableCell><strong>Số lượng tồn kho</strong></TableCell>
                      <TableCell><strong>Giá bán</strong></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productsData?.data?.items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <img
                            src={item.AVATAR_IMAGE_URL}
                            alt={item.ITEM_NAME}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </TableCell>
                        <TableCell>{item.ITEM_CODE}</TableCell>
                        <TableCell>{item.ITEM_NAME}</TableCell>
                        <TableCell>{item.ITEM_STOCKS?.QUANTITY ?? 0}</TableCell>
                        <TableCell>
                          {getLatestPrice(item).toLocaleString()} VND
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteItem(item._id)}
                          >
                            Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )
      }
    </Paper>
  )
}
