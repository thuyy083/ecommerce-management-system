import createApiClient from '../api.service'

class LocationService {
  constructor () {
    const baseURL = 'https://vn-public-apis.fpo.vn/'
    this.api = createApiClient(baseURL)
  }

  async getAllProvinces() {
    return (await this.api.get('/provinces/getAll?limit=-1')).data
  }

  async getProvincesByName(name) {
    return (await this.api.get(`/provinces/getAll?limit=-1&q=${name}&cols=name,name_with_type`)).data
  }

  async getDistrictByProvince(provinceCode) {
    return (await this.api.get(`districts/getByProvince?provinceCode=${provinceCode}&limit=-1`)).data
  }

  async getWardByDistrict(districtCode) {
    return (await this.api.get(`wards/getByDistrict?districtCode=${districtCode}&limit=-1`)).data
  }
}

export default new LocationService