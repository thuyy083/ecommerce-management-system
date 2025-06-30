import { api } from '~/config'
import createApiClient from '../api.service'

class UnitInvoiceService {
  constructor() {
    const baseUrl = `${api.baseUrl}/api/unit-invoices`
    this.api = createApiClient(baseUrl)
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

  async create(credential, data) {
    return (await this.api.post('/', data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }

  async getById(credential, id) {
    return (await this.api.get(`/${id}`, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }

  async update(credential, id, data) {
    return (await this.api.put(`/${id}`, data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }

  async delete(credential, id) {
    return (await this.api.delete(`/${id}`, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
}

export default new UnitInvoiceService