import { redirect } from 'react-router-dom'
import { Routes } from '~/config'
import authService from '~/service/auth.service'

const getUserId = () => {
  const state = JSON.parse(localStorage.getItem('persist:root'))
  if (!state) return null
  const user = state.user
  if (!user) return null
  const currentUser = JSON.parse(user).currentUser
  if (!currentUser) return null

  return currentUser.USER_ID
}

export const isAuthenticate = async () => {
  const state = JSON.parse(localStorage.getItem('persist:root'))
  if (!state) throw redirect(Routes.auth.login)
  const user = state.user
  if (!user) throw redirect(Routes.auth.login)
  const currentUser = JSON.parse(user).currentUser
  if (!currentUser) {
    const device_id = localStorage.getItem('device_id')
    const user_id = getUserId()
    console.log('user id', user_id, 'device id', device_id)
    try {
      const verifiedUser = await authService.verify({ device_id, user_id })
      if (verifiedUser == null)
        throw redirect(Routes.auth.login)
    } catch (error) {
      console.log(error)
      throw redirect(Routes.auth.login)
    }
  }

  return null
}

export const isHaveOneOfRoles = async (roles = []) => {
  if (roles.length === 0)
    return null

  try {
    const device_id = localStorage.getItem('device_id')
    const user_id = getUserId()

    const verifiedUser = await authService.verify({ device_id, user_id })
    const verifyRoles = []
    if (verifiedUser?.data?.ROLE.IS_ADMIN) {
      verifyRoles.push('admin')
    }
    if (verifiedUser?.data?.ROLE.IS_MANAGER) {
      verifyRoles.push('manager')
    }
    if (verifiedUser?.data?.ROLE.IS_SERVICE_STAFF) {
      verifyRoles.push('service staff')
    }
    if (verifiedUser?.data?.ROLE.IS_CUSTOMER) {
      verifyRoles.push('customer')
    }

    if (verifyRoles.some(role => roles.includes(role))) {
      return null
    }
    else throw redirect(Routes.error.forbidden403)

  } catch (error) {
    console.log(error)
    throw redirect(Routes.error.forbidden403)
  }

}