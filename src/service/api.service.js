import axios from 'axios'

import { api } from '~/config'
// import { interceptorLoadingElements } from '~/utils/contant'


const getUserId = () => {
  const state = JSON.parse(localStorage.getItem('persist:root'))
  if (!state) return null
  const user = state.user
  if (!user) return null
  const currentUser = JSON.parse(user).currentUser
  if (!currentUser) return null

  return currentUser.USER_ID
}


const commonConfig = {
  header: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

const apiService = (baseURL) => {
  const API = axios.create({
    baseURL,
    ...commonConfig,
  })

  API.interceptors.response.use(
    (response) => {
      // interceptorLoadingElements(false)
      return response
    },
    async (error) => {
      const originalRequest = error.config
      // interceptorLoadingElements(false)
      // Nếu lỗi 401 và chưa từng gửi request refresh toke
      if (
        error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
      ) {
        originalRequest._retry = true // Đánh dấu request đang được retry

        try {
          // Gửi request refresh token
          const deviceId = localStorage.getItem('device_id')
          const userId = getUserId()
          if (!userId) {
            console.error('Không tìm thấy userId để refresh token.')
            // Có thể logout hoặc reject ngay:
            return Promise.reject(error)
          }
          const { data } = await API.post(`${api.baseUrl}/api/auth/refresh-token`, {
            deviceId,
            userId: getUserId()
          },
          {
            withCredentials: true
          }
          )

          console.log(data)

          // Lưu Access Token mới
          // localStorage.setItem('accessToken', data.accessToken);

          // Cập nhật header Authorization cho request cũ
          // originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          // Gửi lại request cũ
          return API(originalRequest)
        } catch (err) {
          console.error('Refresh token failed:', err)
          return Promise.reject(err)
        }
      }

      return Promise.reject(error)
    }
  )

  API.interceptors.request.use((config) => {
    // Danh sách các route cần trì hoãn
    const delayedRoutes = ['https://vn-public-apis.fpo.vn/']
    // Kiểm tra nếu URL thuộc danh sách cần trì hoãn
    if (delayedRoutes.some(route => config.baseURL.includes(route))) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(config), 1000) // Trì hoãn 2 giây
      })
    }
    // interceptorLoadingElements(true)

    return config
  })


  return API
}

export default apiService