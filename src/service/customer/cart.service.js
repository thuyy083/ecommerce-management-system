import { api } from '~/config'
import createApiClient from '../api.service'
class CartsService {
  constructor() {
    const baseUrl = `${api.baseUrl}/api/carts`
    this.api = createApiClient(baseUrl)
  }
  async getCarts(credential) {
    console.log('device: ', credential)
    return (await this.api.get('', {
      headers: {
        ...credential
      },
      withCredentials: true,
    },)).data
  }
  async addCart(credential, data) {
    console.log('data voucher: ', data, credential)
    return (await this.api.post('/', data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
  async updateQuantity(credential, data) {
    console.log('data update quantity: ', data)
    return (await this.api.put('/quantity', data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
  async removeItem(credential, data) {
    console.log('data: ', data)
    return (await this.api.put('/item', data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
  async removeItems(credential, itemsCodeArray) {
    const payload = {
      itemsCode: itemsCodeArray
    }

    console.log('payload gửi lên:', payload)

    return (await this.api.put('/items', payload, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
}
export default new CartsService