import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import invoicesService from '~/service/admin/invoices.service'
import CheckIcon from '@mui/icons-material/Check'
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Menu,
  MenuItem
} from '@mui/material'
import dayjs from 'dayjs'
import { useDeviceId } from '~/hooks/useDeviceId'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { PURCHASE_INVOICE_STATUS } from '~/utils/contant'
import { hasAnyPermission } from '~/utils/rolePermission'
import useAuth from '~/hooks/useAuth'

export default function InvoiceDetail() {
  const { id } = useParams()
  const deviceId = useDeviceId()
  const { roles } = useAuth()
  const userId = useSelector(state => state.user.currentUser?.USER_ID)

  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  const { data, isLoading, error, refetch } = useQuery({
    enabled: !!deviceId,
    queryKey: ['invoiceDetail', id],
    queryFn: () => invoicesService.getInvoiceDetail(id,
      {
        user_id: userId,
        device_id: deviceId
      },
    ),
    retry: false,
    refetchOnWindowFocus: false
  })
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleChangeStatus = async (newStatus) => {
    try {
      await invoicesService.update(
        { user_id: userId, device_id: deviceId },
        invoice?.INVOICE_CODE,
        { statusName: newStatus }
      )
      toast.success(`Đổi trạng thái sang ${newStatus} thành công!`)
      await refetch()
    } catch (err) {
      console.log(err)
      toast.error('Đổi trạng thái thất bại!')
    } finally {
      handleMenuClose()
    }
  }

  if (isLoading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography>Đang tải thông tin hóa đơn...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">Lỗi khi tải dữ liệu: {error.message}</Typography>
      </Box>
    )
  }

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

  const invoice = data?.data
  const status = invoice?.STATUS?.[invoice?.STATUS?.length - 1]

  const fullAddress = [
    invoice?.USER_CONTACT?.ADDRESS_1,
    invoice?.USER_CONTACT?.ADDRESS_2,
    invoice?.USER_CONTACT?.WARD,
    invoice?.USER_CONTACT?.DISTRICT,
    invoice?.USER_CONTACT?.CITY,
    invoice?.USER_CONTACT?.STATE,
    invoice?.USER_CONTACT?.COUNTRY
  ]
    .filter(part => part && part.trim() !== '')
    .join(', ')

  return (
    <Paper sx={{ p: 4, maxWidth: 1000, mx: 'auto', borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff, #f9f9f9)' }}>
      <Typography variant="h4" gutterBottom
        sx={{
          fontWeight: 'bold',
          color: 'primary.main',
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
        }}
      >
        Chi tiết hóa đơn {invoice?.INVOICE_CODE}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box mb={2}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Thông tin chung:</Typography>
          {status?.STATUS_NAME !== 'PAYMENTED' && status?.STATUS_NAME !== 'REJECTED' && (
            <Box>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={handleMenuClick}
              >
                Đổi trạng thái
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
              >
                {PURCHASE_INVOICE_STATUS.map((option) => (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleChangeStatus(option.value)}
                    sx={{
                      display: !hasAnyPermission(roles, 'purchaseInvoice', option.needPermission) ||
                        !option.validate(status?.STATUS_NAME)? 'none' : ''
                    }}
                    selected={status?.STATUS_NAME === option.value}
                  >
                    {status?.STATUS_NAME === option.value && (
                      <CheckIcon fontSize="small" style={{ marginRight: 8 }} />
                    )}
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Box>
        <Box sx={{ pl: 2 }}>
          <Typography><strong>Mã hóa đơn:</strong> {invoice?.INVOICE_CODE}</Typography>
          <Typography><strong>Ngày nhập:</strong> {dayjs(invoice?.IMPORT_DATE).format('DD/MM/YYYY HH:mm:ss')}</Typography>
          <Typography><strong>Người nhập:</strong> {invoice?.IMPORTED_BY}</Typography>
          <Typography component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <strong>Trạng thái:</strong>&nbsp;
            <Chip
              label={status?.STATUS_NAME}
              sx={{
                backgroundColor: getStatusColor(status?.STATUS_NAME),
                color: '#fff',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            />
          </Typography>
          <Typography><strong>Phí phát sinh:</strong> {invoice?.EXTRA_FEE?.toLocaleString()} VND</Typography>
          <Typography><strong>Lý do phát sinh:</strong> {invoice?.EXTRA_FEE_NOTE}</Typography>
          <Typography><strong>Thanh toán:</strong> {invoice?.PAYMENTED ? 'Đã thanh toán' : 'Chưa thanh toán'}</Typography>
          <Typography><strong>Thuế:</strong> {invoice?.TAX}%</Typography>
          <Typography><strong>Tổng cộng:</strong> {invoice?.TOTAL_WITH_TAX_EXTRA_FEE?.toLocaleString()} VND</Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box mb={2}>
        <Typography variant="h6">Thông tin người liên hệ:</Typography>
        <Box sx={{ pl: 2 }}>
          <Typography><strong>Họ tên:</strong> {invoice?.USER_CONTACT?.NAME}</Typography>
          <Typography><strong>Số điện thoại:</strong> {invoice?.USER_CONTACT?.PHONE_NUMBER || 'Không rõ'}</Typography>
          <Typography><strong>Email:</strong> {invoice?.USER_CONTACT?.EMAIL}</Typography>
          <Typography component="div">
            <strong>Địa chỉ:</strong> {fullAddress || 'Không rõ'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>Danh sách sản phẩm:</Typography>
        <TableContainer component={Paper}>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Mã sản phẩm</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Tên nhà cung ứng</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Tên sản phẩm</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Số lượng</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Đơn giá</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Thành tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice?.ITEMS?.map((item, index) => (
                  <TableRow key={index}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                      '&:hover': { backgroundColor: '#f0f8ff' }
                    }}>
                    <TableCell>{item.ITEM_CODE}</TableCell>
                    <TableCell>{item?.SUPPLIER?.SUPPLIER_NAME}</TableCell>
                    <TableCell>{item.ITEM_DETAIL?.ITEM_NAME}</TableCell>
                    <TableCell>{item.QUANTITY}</TableCell>
                    <TableCell>{item.UNIT_PRICE?.toLocaleString()} VND</TableCell>
                    <TableCell>{item.TOTAL_PRICE?.toLocaleString()} VND</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TableContainer>
      </Box>
    </Paper>
  )
}
