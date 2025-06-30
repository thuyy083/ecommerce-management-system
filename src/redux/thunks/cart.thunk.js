import { createAsyncThunk } from '@reduxjs/toolkit'
import cartService from '~/service/customer/cart.service'
import { upsertItem, removeItem, updateQuantity } from '../slices/cart.slice'

export const addCartThunk = createAsyncThunk(
  'cart/add',
  async ({ itemCode, quantity, credential }, { rejectWithValue }) => {
    try {
      const res = await cartService.addCart(credential, { itemCode, quantity })

      if (!res.success) {
        return rejectWithValue(res.message || 'Lỗi thêm vào giỏ hàng!')
      }

      return res.data
    } catch (err) {
      console.error('API addToCart lỗi:', err)
      return rejectWithValue(err?.response?.data?.message || 'Lỗi mạng!')
    }
  }
)

export const updateCartQtyThunk = createAsyncThunk(
  'cart/updateQuantity',
  async ({ itemCode, quantity, credential }, { dispatch, rejectWithValue }) => {
    try {
      await cartService.updateQuantity(credential, { itemCode, quantity })
      dispatch(updateQuantity({ itemCode, quantity }))
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

export const removeCartItemThunk = createAsyncThunk(
  'cart/removeItem',
  async ({ itemCode, credential }, { dispatch, rejectWithValue }) => {
    try {
      await cartService.removeItem(credential, { itemCode })
      dispatch(removeItem(itemCode))
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)
