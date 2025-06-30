export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

export function formatCurrency(amount) {
  return amount?.toLocaleString('vi-VN') ?? ''
}

export function formatUrl(baseUrl, queryParams = {}) {
  const url = new URL(baseUrl)

  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.set(key, value)
  }

  return url.toString()
}

export function capitalizeOnlyFirstLetter(str) {
  if (!str) return ''

  // Chuyển toàn bộ chuỗi sang chữ thường
  const lowerCased = str.toLowerCase()

  // Viết hoa chữ cái đầu tiên
  return lowerCased.charAt(0).toUpperCase() + lowerCased.slice(1)
}

export function formatToVietnamTime(isoString) {
  const date = new Date(isoString)
  const options = { timeZone: 'Asia/Ho_Chi_Minh' }

  const year = date.toLocaleString('en-CA', { ...options, year: 'numeric' })
  const month = date.toLocaleString('en-CA', { ...options, month: '2-digit' })
  const day = date.toLocaleString('en-CA', { ...options, day: '2-digit' })

  const hour = date.toLocaleString('en-CA', { ...options, hour: '2-digit', hour12: false })
  const minute = date.toLocaleString('en-CA', { ...options, minute: '2-digit' })
  const second = date.toLocaleString('en-CA', { ...options, second: '2-digit' })

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}
