import { createSlice } from '@reduxjs/toolkit'

import { login, logout, updateProfile, verifyUser } from '../thunks/user.thunk'

const initState = {
  currentUser: null,
  status: '',
}

const userSlice = createSlice({
  name: 'user',
  initialState: initState,
  reducers: {
    removeRoles : (state) => {
      if (state.currentUser) {
        state.currentUser.ROLE = null
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'success'
        state.currentUser = action.payload || null
        state.__persisted_at = Date.now()
      })
      .addCase(login.rejected, (state) => {
        state.status = 'error'
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(logout.rejected, (state) => {
        state.status = 'error'
      })
      .addCase(logout.fulfilled, () => {
        return initState
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'success'
        state.currentUser = action.payload
      })
      .addCase(updateProfile.rejected, (state) => {
        state.status = 'error'
      })
      .addCase(verifyUser.pending, (state) => {
        state.status = 'success'
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.status = 'success'
        state.currentUser = action.payload
      })
      .addCase(verifyUser.rejected, (state) => {
        state.status = 'error'
      })
  }
})
export const { removeRoles } = userSlice.actions
export default userSlice.reducer