import {
  Box, Typography, Checkbox, Button, Stack, Tooltip, Chip
} from '@mui/material'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import cartService from '~/service/customer/cart.service'
import vouchersService from '~/service/admin/vouchers.service'
import CartRow from './CartRow'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { removeItems } from '~/redux/slices/cart.slice'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const device_id = useDeviceId()
  const { userId } = useUserInfo()
  const cred = useMemo(() => ({ user_id: userId, device_id }), [userId, device_id])
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { data: cartRes, isLoading } = useQuery({
    queryKey: ['cart', cred],
    queryFn: () => cartService.getCarts(cred),
    enabled: !!cred.user_id,
  })

  const products = cartRes?.data?.items ?? []
  const { data: globalRes, isFetching: globalLoading } = useQuery({
    queryKey: ['global-vouchers', cred],
    enabled: !!userId,
    queryFn: () => vouchersService.search(cred, {
      isActive: true,
      filterByExpiration: true,
      applyScope: 'GLOBAL',
    }),
    staleTime: 5 * 60_000,
  })
  const globalVouchers = globalRes?.data?.vouchers ?? []
  const [selected, setSelected] = useState([])

  const toggleAll = () =>
    setSelected(selected.length === products.length ? [] : products.map(i => i.ITEM_CODE))

  const toggleOne = (code) =>
    setSelected(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code])

  const totalMoney = selected.reduce((sum, code) => {
    const p = products.find(i => i.ITEM_CODE === code)
    return sum + (p?.ITEM_DISCOUNTED_PRICE ?? 0) * (p?.QUANTITY ?? 1)
  }, 0)

  const handleDeleteSelected = async () => {
    if (selected.length === 0) {
      toast.info('Vui lòng chọn sản phẩm để xóa')
      return
    }

    try {
      const res = await cartService.removeItems(cred, selected)
      if (res.success) {
        toast.success('Xóa sản phẩm thành công!')
        dispatch(removeItems(selected))
        setSelected([])
        queryClient.invalidateQueries({ queryKey: ['cart', cred] })
      } else {
        toast.error(res.message || 'Xóa thất bại')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Lỗi không xác định!'
      toast.error(msg)
      console.error(err)
    }
  }

  const handleCheckout = () => {
    const items = products
      .filter(p => selected.includes(p.ITEM_CODE))
      .map(p => ({
        ITEM_CODE: p.ITEM_CODE,
        ITEM_NAME: p.ITEM_NAME,
        ITEM_TYPE_NAME: p.ITEM_TYPE_NAME,
        ITEM_IMAGE_URL: p.ITEM_AVATAR,
        ITEM_ORIGINAL_PRICE: p.ITEM_PRICE,
        ITEM_DISCOUNTED_PRICE: p.ITEM_DISCOUNTED_PRICE,
        PRODUCT_VOUCHER_ID: p.PRODUCT_VOUCHER_ID ?? null,
        VOUCHER_CODE: p.VOUCHER_CODE ?? '',
        VOUCHER_TYPE: p.VOUCHER_TYPE ?? '',
        VOUCHER_VALUE: p.VOUCHER_VALUE ?? 0,
        VOUCHER_MAX_DISCOUNT: p.VOUCHER_MAX_DISCOUNT ?? 0,
        QUANTITY: p.QUANTITY
      }))
    console.log('item: ', items)

    if (items.length === 0) {
      toast.info('Vui lòng chọn ít nhất 1 sản phẩm để mua hàng')
      return
    }

    navigate('/customer/order', {
      state: { selectedItems: items }
    })
  }


  return (
    <Box
      position="sticky"
      bottom={0}
      py={2}
      px={2}
      mt={2}
      bgcolor="background.paper"
      borderTop={1}
      borderColor="#eee"
    >
      {isLoading ? 'Đang tải…' : products.map((item) => (
        <CartRow
          key={item.ITEM_CODE}
          item={item}
          checked={selected.includes(item.ITEM_CODE)}
          onToggle={() => toggleOne(item.ITEM_CODE)}
        />
      ))}

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        border={1}
        borderColor="#eee"
        p={2}
        mt={2}
        flexWrap="wrap"
      >
        {globalLoading ? (
          <Typography variant="body2">Đang tải voucher...</Typography>
        ) : globalVouchers.length === 0 ? (
          <Typography variant="body2">Hiện chưa có voucher cho hóa đơn</Typography>
        ) : (
          globalVouchers.map((v) => {
            const isPct = v.TYPE === 'PERCENTAGE'
            const label = `${v.VOUCHER_CODE} - ${isPct ? `Giảm ${v.VALUE}%` : `Giảm ₫${v.VALUE.toLocaleString()}`}`
            const tooltip = isPct
              ? `Áp dụng giảm ${v.VALUE}% tối đa ₫${v.MAX_DISCOUNT?.toLocaleString() ?? 0}`
              : `Giảm trực tiếp ₫${v.VALUE.toLocaleString()}`

            return (
              <Tooltip key={v._id} title={tooltip} arrow>
                <Chip
                  label={label}
                  size="small"
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                    fontWeight: 700,
                  }}
                />
              </Tooltip>
            )
          })
        )}
      </Stack>

      <Box
        position="sticky" bottom={0} py={2} px={2} mt={2}
        bgcolor="background.paper" borderTop={1} borderColor="#eee"
        display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center"
      >
        <Stack
          direction="row" spacing={1} alignItems="center" flexWrap="wrap">

          <Checkbox size="small" checked={selected.length === products.length && products.length} onChange={toggleAll} />
          <Typography
            variant="body2"
            fontWeight={700}
            color="primary.main"
            sx={{ whiteSpace: 'nowrap' }}
          >
            Chọn tất cả ({products.length})
          </Typography>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', color: 'error.main', ml: 1 }}
            onClick={handleDeleteSelected}
          >
            Xóa
          </Typography>

        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="flex-end"
          mt={{ xs: 1, sm: 0 }}
        >
          <Typography variant="body2">Tổng cộng:</Typography>
          <Typography fontSize={22} fontWeight={700} color="primary.main">
            ₫{totalMoney.toLocaleString()}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleCheckout}>Mua hàng</Button>
        </Stack>
      </Box>
    </Box>
  )
}
