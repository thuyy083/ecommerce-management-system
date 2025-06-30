import { api } from '~/config'
import createApiClient from './api.service'

class AuthService {
  constructor() {
    const baseUrl = `${api.baseUrl}/api/auth`
    this.api = createApiClient(baseUrl)
  }

  async login(formData) {
    return (await this.api.post('/login', formData, {
      withCredentials: true
    })).data
  }

  async google_login(token, deviceId) {
    // console.log('token: ', token)
    // console.log('deviceId: ', deviceId)
    return (await this.api.post('/google', { token, deviceId }, {
      withCredentials: true
    })).data
  }

  async logout(credential) {
    return (await this.api.post('/logout', {}, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }

  async refreshToken(formData) {
    console.log(formData)
    return (await this.api.post('/refresh-token', formData, {
      withCredentials: true
    })).data
  }

  async register(formData) {
    return (await this.api.post('/register', formData)).data
  }

  async forgetPassword(email) {
    return (await this.api.post('/forget-password', { email })).data
  }

  async resetPassword(token, newPassword) {
    return (await this.api.post('/reset-password', { token, newPassword })).data
  }

  async changePassword(credential, oldPassword, newPassword) {
    console.log('service1: ', oldPassword, newPassword, credential)

    return (
      await this.api.put(
        '/change-password',
        { oldPassword, newPassword },
        {
          headers: {
            ...credential
          },
          withCredentials: true
        }
      )
    ).data
  }

  async createStaff(payload, headers) {
    console.log('payload từ service: ', payload)
    return await this.api.post('/staffs', payload, {
      headers,
      withCredentials: true
    }).then(res => res.data)
  }

  async verify(credential) {
    return (await this.api.get('/verify-role', {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }

}

export default new AuthService