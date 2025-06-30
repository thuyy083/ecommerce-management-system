import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Avatar,
  IconButton
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import vouchersService from '~/service/admin/vouchers.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import SearchItemInput from '~/components/Admin/SearchItemInput'
import { useNavigate } from 'react-router-dom'

export default function VoucherAddItem() {
  const { id } = useParams()
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const navigate = useNavigate()


  const [selectedItems, setSelectedItems] = useState([])

  // Fetch existing items
  const { data: existingItemsData, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['voucherItems', id],
    enabled: !!device_id && !!user_id,
    queryFn: () =>
      vouchersService.getItemsFromVoucher({ device_id, user_id }, id),
    retry: false
  })

  const existingItems = existingItemsData?.data?.items || []

  const mutation = useMutation({
    mutationFn: (itemIds) =>
      vouchersService.addItemsforVoucher(
        { device_id, user_id },
        id,
        { itemIds }
      ),
    onSuccess: () => {
      navigate(`/admin/vouchers/${id}`)
      toast.success('Thêm sản phẩm thành công!')
      setSelectedItems([])
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Thêm sản phẩm thất bại!')
    }
  })

  const handleItemSelect = (item) => {
    if (!selectedItems.some((i) => i._id === item._id)) {
      setSelectedItems([...selectedItems, item])
    } else {
      toast.warn('Sản phẩm đã tồn tại trong danh sách.')
    }
  }

  const handleDeleteItem = (id) => {
    setSelectedItems(selectedItems.filter((item) => item._id !== id))
  }

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      toast.warn('Vui lòng chọn ít nhất 1 sản phẩm.')
      return
    }
    const itemIds = selectedItems.map((item) => item._id)
    mutation.mutate(itemIds)
  }
  const getLatestPrice = (product) => {
    if (!Array.isArray(product.PRICE) || product.PRICE.length === 0) return 0
    const latest = product.PRICE.reduce((latest, current) =>
      new Date(current.FROM_DATE) > new Date(latest.FROM_DATE) ? current : latest
    )
    return latest.PRICE_AMOUNT ?? 0
  }


  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Thêm sản phẩm cho Voucher {id}
      </Typography>

      <Box mb={2}>
        <SearchItemInput onItemClick={handleItemSelect} searchOption="product" />
      </Box>

      {/* Danh sách sản phẩm đã có trong voucher */}
      <Typography variant="subtitle1" gutterBottom>
        Sản phẩm đã có trong voucher:
      </Typography>
      {isLoadingExisting ? (
        <Typography>Đang tải dữ liệu...</Typography>
      ) : existingItems.length === 0 ? (
        <Typography>Chưa có sản phẩm nào được áp dụng voucher.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Mã SP</TableCell>
                <TableCell>Tên SP</TableCell>
                <TableCell>Giá (VNĐ)</TableCell>
                <TableCell>Tồn kho</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {existingItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <Avatar
                      src={item.AVATAR_IMAGE_URL}
                      alt={item.ITEM_NAME}
                      variant="square"
                    />
                  </TableCell>
                  <TableCell>{item.ITEM_CODE}</TableCell>
                  <TableCell>{item.ITEM_NAME}</TableCell>
                  <TableCell>
                    {getLatestPrice(item).toLocaleString()} VND
                  </TableCell>
                  <TableCell>
                    {item.ITEM_STOCKS?.QUANTITY || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Danh sách sản phẩm mới chọn */}
      <Typography variant="subtitle1" gutterBottom>
        Sản phẩm mới thêm:
      </Typography>
      {selectedItems.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Mã SP</TableCell>
                <TableCell>Tên SP</TableCell>
                <TableCell>Giá (VNĐ)</TableCell>
                <TableCell>Tồn kho</TableCell>
                <TableCell>Xóa</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <Avatar
                      src={item.AVATAR_IMAGE_URL}
                      alt={item.ITEM_NAME}
                      variant="square"
                    />
                  </TableCell>
                  <TableCell>{item.ITEM_CODE}</TableCell>
                  <TableCell>{item.ITEM_NAME}</TableCell>
                  <TableCell>
                    {item.PRICE?.[0]?.PRICE_AMOUNT?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell>
                    {item.ITEM_STOCKS?.QUANTITY || 0}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteItem(item._id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box textAlign="right">
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? 'Đang thêm...' : 'Thêm sản phẩm'}
        </Button>
      </Box>
    </Paper>
  )
}
