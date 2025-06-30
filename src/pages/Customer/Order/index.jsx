import {
  Box,
  Typography,
  Paper,
  Divider,
  Avatar,
  Link,
  Button,
  Select,
  MenuItem
} from '@mui/material'
import ConfirmationNumberOutlined from '@mui/icons-material/ConfirmationNumberOutlined'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import vouchersService from '~/service/admin/vouchers.service'
import saleInvoiceSerivce from '~/service/admin/saleInvoice.serivce'
import cartService from '~/service/customer/cart.service'
import { useQuery } from '@tanstack/react-query'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { removeItems } from '~/redux/slices/cart.slice'

export default function OrderSummary() {
  const location = useLocation()
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const selectedItems = location.state?.selectedItems ?? []
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [useAddress2, setUseAddress2] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + (item.ITEM_DISCOUNTED_PRICE ?? 0) * (item.QUANTITY ?? 1),
    0
  )

  const user = useSelector(state => state.user.currentUser)
  const fullName = `${user?.NAME?.LAST_NAME ?? ''} ${user?.NAME?.FIRST_NAME ?? ''}`.trim()
  const phone = user?.PHONE_NUMBER.FULL_PHONE_NUMBER ?? ''
  const selectedAddress = useAddress2 ? user?.ADDRESS?.ADDRESS_2 : user?.ADDRESS?.ADDRESS_1
  const address = [
    selectedAddress,
    user?.ADDRESS?.WARD,
    user?.ADDRESS?.DISTRICT,
    user?.ADDRESS?.CITY,
    user?.ADDRESS?.COUNTRY
  ].filter(Boolean).join(', ')
  const { data: voucherData } = useQuery({
    queryKey: ['vouchers'],
    enabled: !!user_id && !!device_id,
    queryFn: () => vouchersService.search({
      user_id,
      device_id,
    }, {
      isActive: true,
      filterByExpiration: true,
      filterByUsage: true,
      applyScope: 'GLOBAL'
    })
  })
  const vouchers = voucherData?.data?.vouchers ?? []
  const voucherDiscount =
    selectedVoucher?.TYPE === 'PERCENTAGE'
      ? Math.min((selectedVoucher.VALUE / 100) * totalPrice, selectedVoucher.MAX_DISCOUNT ?? Infinity)
      : selectedVoucher?.TYPE === 'FIXED_AMOUNT'
        ? selectedVoucher.VALUE
        : 0

  const finalTotal = Math.max(totalPrice - voucherDiscount, 0)
  const totalPrice1 = Math.min(totalPrice , voucherDiscount)
  const handleOrder = async () => {
    try {
      const payload = {
        status: 'DRAFT',
        customerId: user_id,
        voucherGlobalId: selectedVoucher?._id ?? null,
        items: selectedItems.map(i => ({
          ITEM_CODE: i.ITEM_CODE,
          QUANTITY: i.QUANTITY,
          PRODUCT_VOUCHER_ID: i.PRODUCT_VOUCHER_ID ?? null
        })),
        paymentMethod: 'Tiền mặt',
        purchaseMethod: 'ONLINE',
        name: fullName,
        country: user?.ADDRESS?.COUNTRY,
        city: user?.ADDRESS?.CITY,
        district: user?.ADDRESS?.DISTRICT,
        ward: user?.ADDRESS?.WARD,
        detail: selectedAddress,
        phoneNumber: phone
      }
      console.log('payload: ', payload)

      await saleInvoiceSerivce.create({ user_id, device_id }, payload)
      const itemCodes = selectedItems.map(i => i.ITEM_CODE)
      await cartService.removeItems({ user_id, device_id }, itemCodes)

      dispatch(removeItems(itemCodes))
      toast.success('Đặt hàng thành công!')
      navigate('/customer/orderInfo')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error
      toast.error(msg)
    }
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 10000,
          mx: 'auto',
          borderRadius: 2,
          p: 2,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Địa chỉ nhận hàng */}
        <Box sx={{ mb: 3.5, pb: 1.5, borderBottom: '1px solid #eee' }}>
          <Typography variant="subtitle2" color="error" fontWeight={600}>
            📍 Địa Chỉ Nhận Hàng
          </Typography>
          <Typography fontWeight={600}>
            {fullName} (+84) {phone}{' '}
            {/* <Chip label="Mặc Định" size="small" color="primary" sx={{ ml: 1 }} /> */}
            <Link
              underline="hover"
              sx={{ ml: 2, fontSize: 14, cursor: 'pointer' }}
              onClick={() => setUseAddress2(prev => !prev)}
            >
              Dùng địa chỉ {useAddress2 ? '1' : '2'}
            </Link>
          </Typography>
          <Typography fontSize={14}>{address}</Typography>
        </Box>

        {/* Danh sách sản phẩm */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          Sản phẩm
        </Typography>

        {/* Header bảng */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '4fr 1fr 1fr 1fr',
            fontWeight: 600,
            color: 'gray',
            mb: 1,
          }}
        >
          <Box> </Box>
          <Box textAlign="center">Đơn giá</Box>
          <Box textAlign="center">Số lượng</Box>
          <Box textAlign="right">Thành tiền</Box>
        </Box>

        {selectedItems.map((item) => (
          <Box
            key={item.ITEM_CODE}
            sx={{
              display: 'grid',
              gridTemplateColumns: '4fr 1fr 1fr 1fr',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={item.ITEM_IMAGE_URL}
                variant="square"
                sx={{ width: 60, height: 60, mr: 2 }}
              />
              <Box>
                <Typography fontWeight={500} noWrap maxWidth={280}>
                  {item.ITEM_NAME}
                </Typography>
                <Typography fontSize={13} color="gray">
                  {item.ITEM_TYPE_NAME ?? '---'}
                </Typography>
                {item.PRODUCT_VOUCHER_ID && (
                  <Typography fontSize={13} color="green">
                    Đã áp dụng mã giảm giá
                  </Typography>
                )}
              </Box>
            </Box>
            <Box textAlign="center">
              {item.ITEM_DISCOUNTED_PRICE < item.ITEM_ORIGINAL_PRICE ? (
                <>
                  <Typography
                    variant="body2"
                    sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                  >
                    ₫{item.ITEM_ORIGINAL_PRICE.toLocaleString()}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="primary">
                    ₫{item.ITEM_DISCOUNTED_PRICE.toLocaleString()}
                  </Typography>
                </>
              ) : (
                <Typography fontWeight={700}>
                  ₫{item.ITEM_ORIGINAL_PRICE.toLocaleString()}
                </Typography>
              )}
            </Box>

            <Typography textAlign="center">{item.QUANTITY}</Typography>
            <Typography textAlign="right">
              ₫{(
                (item.ITEM_DISCOUNTED_PRICE ?? item.ITEM_ORIGINAL_PRICE) * (item.QUANTITY ?? 1)
              ).toLocaleString()}
            </Typography>

          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        {/* Voucher */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ConfirmationNumberOutlined color="error" fontSize="small" />
            <Typography fontWeight={600}>Shop Voucher</Typography>
          </Box>

          <Select
            value={selectedVoucher?._id ?? ''}
            size="small"
            displayEmpty
            onChange={(e) => {
              const found = vouchers.find(v => v._id === e.target.value)
              setSelectedVoucher(found)
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Không áp dụng</MenuItem>
            {vouchers.map(v => (
              <MenuItem key={v._id} value={v._id}>
                {v.VOUCHER_CODE} - Giảm {v.VALUE}
                {v.TYPE === 'PERCENTAGE' ? `% (tối đa ₫${v.MAX_DISCOUNT?.toLocaleString()})` : ''}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Phương thức thanh toán */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Phương thức thanh toán
          </Typography>
          <Box>
            <Typography display="inline" fontWeight={500}>
              Thanh toán khi nhận hàng
            </Typography>
            {/* <Link underline="hover" sx={{ ml: 2, fontWeight: 500, color: 'primary' }}>
              THAY ĐỔI
            </Link> */}
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Tổng kết chi phí */}
        <Box
          sx={{
            maxWidth: 400,
            ml: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Tổng tiền hàng</Typography>
            <Typography>₫{totalPrice.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Tổng cộng Voucher giảm giá</Typography>
            <Typography color="primary">
              -₫{totalPrice1.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography fontWeight={600}>Tổng thanh toán</Typography>
            <Typography fontWeight={700} color="primary" fontSize="1.5rem">
              ₫{finalTotal.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Nút đặt hàng + điều khoản */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 3,
            flexWrap: 'wrap',
            rowGap: 1,
          }}
        >
          <Typography fontSize={13}>
            Nhấn <strong>"Đặt hàng"</strong> đồng nghĩa với việc bạn đồng ý tuân theo{' '}
            <Link href="" underline="hover">
              Điều khoản 5Trendz
            </Link>
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOrder}
            sx={{ px: 4, borderRadius: 0, fontWeight: 600 }}
          >
            Đặt hàng
          </Button>

        </Box>
      </Paper>
    </Box>
  )
}
