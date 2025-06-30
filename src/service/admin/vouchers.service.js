import { api } from '~/config'
import createApiClient from '../api.service'
class VouchersService {
  constructor() {
    const baseUrl = `${api.baseUrl}/api/vouchers`
    this.api = createApiClient(baseUrl)
  }
  async search(credential, options = {}) {
    console.log('option: ', options)
    console.log('credential: ', credential)
    // console.log('deviceId1: ', credential.device_id)
    // console.log('userId1: ', credential.user_id)
    return (await this.api.get('', {
      params: {
        ...options
      },
      headers: {
        ...credential
      },
      withCredentials: true,
    },)).data
  }
  async getVoucherDetail(id, headers = {}) {
    console.log('id voucher: ', id)
    const response = await this.api.get(`/${id}`, {
      headers: {
        ...headers
      },
      withCredentials: true,
    })
    return response.data
  }
  async deleteVoucher(credential, id) {
    console.log('id voucher deleted: ', id)
    console.log('deviceId1: ', credential)
    const response = await this.api.put(`/${id}`, {}, {
      headers: {
        ...credential
      },
      withCredentials: true,
    })
    return response.data
  }
  async setActiveVoucher(credential, id) {
    const response = await this.api.put(`restore/${id}`, {}, {
      headers: {
        ...credential
      },
      withCredentials: true,
    })
    return response.data
  }
  async createVoucher(credential, data) {
    console.log('data voucher: ', data)
    return (await this.api.post('/', data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
  async updateVoucher(credential, id, data) {
    console.log('data1: ', data)
    return (await this.api.put(`update/${id}`, data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
  async getStatistics(credential) {
    console.log('thống kê: ', credential)
    return (await this.api.get('statistics', {
      headers: {
        ...credential
      },
      withCredentials: true
    }
    )).data
  }
  async getItemsFromVoucher(credential, id) {
    console.log('get item: ', credential)
    return (await this.api.get(`${id}/items`, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
  async addItemsforVoucher(credential, id, itemIds) {
    return (await this.api.put(`add-item/voucher-code/${id}`, itemIds, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
  async removeItemfromVoucher(credential, id, itemId) {
    return (await this.api.put(`remove-item/voucher-code/${id}`, itemId, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }

}
export default new VouchersService