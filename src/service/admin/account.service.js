import { api } from '~/config'
import createApiClient from '../api.service'

class AccountService {
  constructor() {
    const baseUrl = `${api.baseUrl}/api/account`
    this.api = createApiClient(baseUrl)
  }

  async updateAccountActiveStatus(username, isActive, banReason, headers = {}) {
    console.log('username từ account service: ', username)
    console.log('isActive từ account service: ', isActive)
    console.log('banReason từ account service: ', banReason)
    const response = await this.api.put('/active', { username, isActive, banReason }, {
      headers: {
        ...headers
      },
      withCredentials: true
    })
    return response.data
  }

  async suspendAccountPermanently(username, isSuspended, banReason, headers = {}) {
    console.log('username từ account service: ', username)
    console.log('isActive từ account service: ', isSuspended)
    console.log('banReason từ account service: ', banReason)
    const response = await this.api.put('/suspended', { username, isSuspended, banReason }, {
      headers: {
        ...headers
      },
      withCredentials: true
    })
    return response.data
  }

}

export default new AccountService