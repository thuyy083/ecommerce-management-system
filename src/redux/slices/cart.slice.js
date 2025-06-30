import { createSlice } from '@reduxjs/toolkit'
import { addCartThunk } from '../thunks/cart.thunk'

const initialState = { items: [] }

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, { payload }) => {
      state.items = payload
    },
    upsertItem: (state, { payload }) => {
      const idx = state.items.findIndex(i => i.ITEM_CODE === payload.ITEM_CODE)
      if (idx > -1) {
        state.items[idx].QUANTITY += payload.QUANTITY
      } else {
        state.items.push(payload)
      }
    },
    updateQuantity: (state, { payload }) => {
      const idx = state.items.findIndex(i => i.ITEM_CODE === payload.itemCode)
      if (idx > -1) {
        state.items[idx].QUANTITY = payload.quantity
      }
    },
    removeItem: (state, { payload }) => {
      state.items = state.items.filter(i => i.ITEM_CODE !== payload)
    },
    removeItems: (state, { payload }) => {
      state.items = state.items.filter(i => !payload.includes(i.ITEM_CODE))
    },
    clearCart: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addCartThunk.fulfilled, (state, { payload }) => {
      state.items = payload.items ?? [payload]
    })
  }

})

export const {
  setCart, upsertItem, updateQuantity,
  removeItem, removeItems, clearCart
} = cartSlice.actions

export default cartSlice.reducer
