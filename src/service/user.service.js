import { api } from '~/config'
import createApiClient from './api.service'

class UserService {
  constructor() {
    const baseUrl = `${api.baseUrl}/api/user`
    this.api = createApiClient(baseUrl)
  }

  async updateProfile(payload, credentials) {
    console.log('Payload gửi về server từ service:', payload)
    console.log('credentials:', credentials)


    return (await this.api.put('/profile', payload, {
      headers: {
        ...credentials
      },
      withCredentials: true
    })).data
  }

  async search(credential, options = {}) {
    return (await this.api.get('/', {
      params: {
        ...options
      },
      headers: {
        ...credential
      },
      withCredentials: true,
    },)).data
  }
  async getUserDetail(id, headers = {}) {
    console.log('id: ', id)
    const response = await this.api.get(`/${id}`, {
      headers: {
        ...headers
      },
      withCredentials: true,
    })
    return response.data
  }
  async updateUserRole(id, headers = {}, roleData = {}) {
    console.log('role: ', roleData)
    console.log('id: ', id)

    const response = await this.api.put(
      `/role/${id}`,
      roleData,
      {
        headers: {
          ...headers
        },
        withCredentials: true
      }
    )

    return response.data
  }


}

export default new UserService
