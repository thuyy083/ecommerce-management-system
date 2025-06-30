import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'

import userReducer from './slices/user.slice'
import cartReducer from './slices/cart.slice'
import { configureStore } from '@reduxjs/toolkit'
import expireReducer from 'redux-persist-expire'

const persistConfig = {
  key: 'root',
  storage,
  transforms: [
    expireReducer('user', {
      expireSeconds: 604800, // 1 tuần
      expiredState: null, // Reset state khi hết hạn
      autoExpire: false, // Tự động kiểm tra khi lấy state
    }),
  ],
}

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Bỏ kiểm tra serialize của redux-persist
    })
})

const persistor = persistStore(store)

export { store, persistor }
