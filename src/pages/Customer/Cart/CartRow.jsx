import {
  Box, Typography, IconButton, Checkbox, Chip, Tooltip, TextField
} from '@mui/material'
import { Add, Remove, DeleteOutline } from '@mui/icons-material'
import { useState } from 'react'
import cartService from '~/service/customer/cart.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { upsertItem, removeItem as removeItemFromRedux } from '~/redux/slices/cart.slice'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function CartRow({ item, checked, onToggle }) {
  const {
    ITEM_CODE,
    ITEM_NAME,
    ITEM_AVATAR,
    ITEM_PRICE,
    ITEM_DISCOUNTED_PRICE,
    VOUCHER_CODE,
    VOUCHER_TYPE,
    VOUCHER_VALUE,
    VOUCHER_MAX_DISCOUNT,
    QUANTITY,
  } = item

  const [qty, setQty] = useState(String(QUANTITY ?? 1))
  const device_id = useDeviceId()
  const { userId } = useUserInfo()
  const credential = { user_id: userId, device_id }
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  useEffect(() => {
    setQty(QUANTITY != null ? QUANTITY.toString() : '1')
  }, [QUANTITY])

  const handleUpdate = async (body, restorePrev = false) => {
    try {
      const res = await cartService.updateQuantity(credential, {
        itemCode: ITEM_CODE,
        ...body
      })

      if (!res.success) {
        toast.error(res.message || 'Đã xảy ra lỗi!')
        if (restorePrev) {
          setQty(QUANTITY != null ? QUANTITY.toString() : '1')
        }
        return
      }
      if (body.quantity != null) {
        dispatch(upsertItem({
          ITEM_CODE,
          QUANTITY: body.quantity,
        }))
      } else if (body.increase) {
        dispatch(upsertItem({
          ITEM_CODE,
          QUANTITY: 1,
        }))
      } else if (body.decrease) {
        dispatch(upsertItem({
          ITEM_CODE,
          QUANTITY: -1,
        }))
      }

      queryClient.invalidateQueries({ queryKey: ['cart', credential] })
    } catch (err) {
      const message = err?.response?.data?.message || 'Lỗi không xác định!'
      toast.error(message)
      if (restorePrev) {
        setQty(QUANTITY != null ? QUANTITY.toString() : '1')
      }
    }
  }

  const dec = () => {
    const parsed = parseInt(qty)
    if (parsed > 1) {
      const newQty = (parsed - 1).toString()
      setQty(newQty)
      handleUpdate({ decrease: true }, true)
    }
  }

  const inc = () => {
    const parsed = parseInt(qty)
    const newQty = (parsed + 1).toString()
    setQty(newQty)
    handleUpdate({ increase: true }, true)
  }

  const handleInputChange = (e) => {
    setQty(e.target.value)
  }

  const commitQuantity = () => {
    const parsed = parseInt(qty)
    if (!isNaN(parsed) && parsed > 0) {
      handleUpdate({ quantity: parsed }, true)
    } else {
      setQty(QUANTITY != null ? QUANTITY.toString() : '1')
    }
  }
  const handleRemove = async () => {
    try {
      const res = await cartService.removeItem(credential, { itemCode: ITEM_CODE })

      if (!res.success) {
        toast.error(res.message || 'Xóa sản phẩm thất bại!')
        return
      }

      toast.success('Đã xóa sản phẩm khỏi giỏ hàng!')
      dispatch(removeItemFromRedux(ITEM_CODE))
      queryClient.invalidateQueries({ queryKey: ['cart', credential] })
    } catch (err) {
      const message = err?.response?.data?.message || 'Lỗi không xác định!'
      toast.error(message)
      console.error('Remove failed:', err)
    }
  }

  const goToDetail = () => {
    const id =
      item.ITEM_ID

    navigate(`/customer/detail-Item/${id}`)
  }


  const tooltip = VOUCHER_TYPE === 'PERCENTAGE'
    ? `Giảm ${VOUCHER_VALUE}% (tối đa ${VOUCHER_MAX_DISCOUNT ?? 0}₫)`
    : `Giảm trực tiếp ${VOUCHER_VALUE}₫`

  return (
    <Box sx={{ border: '1px solid #eee', mb: 2, p: 1.5, display: 'flex', alignItems: 'center', columnGap: 2, }}>
      <Checkbox checked={checked} onChange={onToggle} sx={{ p: 0.5 }} />

      <Box onClick={goToDetail} component="img" src={ITEM_AVATAR} alt={ITEM_NAME} sx={{ cursor: 'pointer', width: 90, height: 90, objectFit: 'cover', borderRadius: 1 }} />

      <Box onClick={goToDetail} sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <Typography noWrap sx={{ fontWeight: 600 }}>{ITEM_NAME}</Typography>

        {VOUCHER_CODE && (
          <Tooltip title={tooltip} arrow>
            <Chip
              label={VOUCHER_CODE}
              size="small"
              sx={{ mt: 0.5, bgcolor: 'secondary.main', color: 'secondary.contrastText', fontWeight: 700 }}
            />
          </Tooltip>
        )}
      </Box>

      <Box sx={{ textAlign: 'right', minWidth: 120 }}>
        {ITEM_DISCOUNTED_PRICE < ITEM_PRICE && (
          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
            ₫{ITEM_PRICE.toLocaleString()}
          </Typography>
        )}
        <Typography variant="subtitle2" fontWeight={700} color="primary">
          ₫{ITEM_DISCOUNTED_PRICE.toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ mx: 2, display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', height: 32 }}>
        <IconButton onClick={dec} size="small"><Remove fontSize="small" /></IconButton>
        <TextField
          value={qty}
          onChange={handleInputChange}
          onBlur={commitQuantity}
          size="small"
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              width: 40,
              textAlign: 'center',
              justifyContent: 'center',
              '& input': {
                textAlign: 'center',
                p: 0,
              }
            }
          }}
          inputProps={{ inputMode: 'numeric' }}
        />

        <IconButton onClick={inc} size="small"><Add fontSize="small" /></IconButton>
      </Box>

      <Typography sx={{ minWidth: 110, fontWeight: 700, color: 'primary.main' }}>
        ₫{(ITEM_DISCOUNTED_PRICE * parseInt(qty || 0)).toLocaleString()}
      </Typography>

      <IconButton color="error" onClick={handleRemove}>
        <DeleteOutline />
      </IconButton>

    </Box>
  )
}
