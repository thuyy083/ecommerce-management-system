import { api } from '~/config'
import createApiClient from '../api.service'

class ItemService {
  constructor() {
    const baseUrl = `${api.baseUrl}/api/items`
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

  async updateItemStock(credential, id, quantity) {
    return (await this.api.put(`/stock/${id}`, { quantity }, {
      headers: {
        ...credential
      },
      withCredentials: true
    })).data
  }
}

export default new ItemService