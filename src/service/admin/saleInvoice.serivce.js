import { api } from '~/config'
import createApiClient from '../api.service'

class SaleInvoiceService {
  constructor() {
    const baseUrl = `${api.baseUrl}/api/sales-invoices`
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
    console.log('data create: ', data)
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

  async updateListDescImages(credential, id, data) {
    return (await this.api.put(`/images/${id}`, data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }

  async updatePrice(credential, id, price) {
    return (await this.api.put(`/price/${id}`, { price }, {
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

  async addBomMaterial(credential, id, data) {
    return (await this.api.post(`/bom-materials/${id}`, data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }

  async updateBomMaterial(credential, id, data) {
    return (await this.api.put(`/bom-materials/${id}`, data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }

  async deleteBomMaterial(credential, id, data) {
    return (await this.api.post(`/delete-bom-materials/${id}`, data, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }

  // Statistic
  async statisticBaseOnStatus(credential, query = {}) {
    return (await this.api.get('/statistic-based-on-status', {
      headers: {
        ...credential
      },
      params: {
        ...query
      },
      withCredentials: true,
    })).data
  }

  async statisticRevenueLastFourWeeks(credential, query = {}) {
    return (await this.api.get('/statistic-revenue-last-four-weeks', {
      headers: {
        ...credential
      },
      params: {
        ...query
      },
      withCredentials: true,
    })).data
  }

  async statisticRevenueOfEachPurchaseMethodPerWeek(credential, query = {}) {
    return (await this.api.get('/statistic-revenue-last-seven-days', {
      headers: {
        ...credential
      },
      params: {
        ...query
      },
      withCredentials: true,
    })).data
  }

  async statisticTotalRevenuePerItem(credential, query = {}) {
    return (await this.api.get('/statistic-sales-items', {
      headers: {
        ...credential
      },
      params: {
        ...query
      },
      withCredentials: true,
    })).data
  }

  async statisticRevenueLastFourMonths(credential) {
    return (await this.api.get('/statistic-revenue-last-four-months', {
      headers: {
        ...credential
      },
      withCredentials: true,
    })).data
  }

  async cancellingOrder(credential, id) {
    console.log('data nè: ', credential, id)
    return (await this.api.put(`/cancelling-order/${id}`, {}, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
}

export default new SaleInvoiceService