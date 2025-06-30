import createApiClient from './api.service'
import { api } from '~/config'

class ImageService {
  constructor() {
    this.api = createApiClient(`${api.baseUrl}/api`)
  }

  async uploadAvatar(file, userId, avt_url) {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('type', 'AVATAR')
    formData.append('id', userId || '')
    formData.append('oldFileUrl', avt_url || '')

    const response = await this.api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  }

  async uploadAvatarItem(file, id = '', oldAvtItemUrl = '') {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('type', 'PRODUCT')
    formData.append('id', id)
    formData.append('oldFileUrl', oldAvtItemUrl)

    const response = await this.api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  }

  async upLoadListImage(files, type, id = '') {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    formData.append('type', type)
    formData.append('id', id)

    const response = await this.api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  }

  async delete(fileUrl) {
    const response = await this.api.post('/upload/delete', { fileUrl })

    return response.data
  }
}

export default new ImageService()
