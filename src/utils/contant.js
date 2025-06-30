export const SALE_INVOICES_PURCHASE_METHODS = [
  { value: 'IN_STORE', label: 'Mua tại cửa hàng', color: 'success',
    validate: (currentMethod) => currentMethod !== 'ONLINE'
  },
  { value: 'DELIVERY', label: 'Mua hàng từ xa', color: 'warning',
    validate: (currentMethod) => currentMethod !== 'ONLINE'
  },
  { value: 'ONLINE', label : 'Mua hàng trực tuyến', color: 'primary',
    validate: () => true
  },
  { value: 'PRE_ORDER', label: 'Đặt hàng trước', color: 'secondary',
    validate: (currentMethod) => currentMethod !== 'ONLINE'
  }
]

export const PAYMENT_STATUS = [
  { value: 'Tiền mặt', label : 'Tiền mặt' },
  { value: 'Chuyển khoản', label: 'Chuyển khoản' }
]

export const SALE_INVOICE_STATUS = [
  { value: 'DRAFT', label : 'Nháp', color: 'action',
    validate: (currentStatus) => currentStatus !== 'CONFIRMED' && currentStatus !== 'PAYMENTED' && currentStatus !== 'CANCELLED'
  },
  { value: 'CONFIRMED', label: 'Hoàn thành', color: 'success',
    validate: (currentStatus) => currentStatus !== 'PAYMENTED' && currentStatus !== 'CANCELLED'
  },
  { value: 'PAYMENTED', label: 'Đã thanh toán', color: 'primary',
    validate: (currentStatus) => currentStatus !== 'CANCELLED'
  },
  { value: 'CANCELLED', label: 'Đã hủy', color: 'error',
    validate: (currentStatus) => currentStatus !== 'CONFIRMED' && currentStatus !== 'PAYMENTED'
  }
]

export const VOUCHER_TYPES = [
  { value: 'PERCENTAGE', label: 'Giảm giá phần trăm' },
  { value: 'FIXED_AMOUNT', label: 'Giảm giá số tiền' },
]

export const VOUCHER_SCOPES = [
  { value: 'GLOBAL', label: 'Hóa đơn' },
  { value: 'PRODUCT', label: 'Sản phẩm' },
]

export const PURCHASE_INVOICE_STATUS = [
  { label: 'Nháp', value: 'DRAFT',
    validate: (currentStatus) => currentStatus !== 'PENDING_APPROVAL' && currentStatus !== 'CONFIRMED' && currentStatus !== 'REJECTED' && currentStatus !== 'PAYMENTED'
  },
  { label: 'Chờ xác nhận', value: 'PENDING_APPROVAL',
    validate: (currentStatus) => currentStatus !== 'CONFIRMED' && currentStatus !== 'REJECTED' && currentStatus !== 'PAYMENTED'
  },
  { label: 'Đã hoàn thành', value: 'CONFIRMED', needPermission: 'approve',
    validate: (currentStatus) => currentStatus !== 'REJECTED' && currentStatus !== 'PAYMENTED'
  },
  { label: 'Từ chối', value: 'REJECTED', needPermission: 'cancel',
    validate: (currentStatus) => currentStatus !== 'PAYMENTED'
  },
  { label: 'Đã thanh toán', value: 'PAYMENTED', needPermission: 'approve',
    validate: (currentStatus) => currentStatus !== 'REJECTED'
  }
]

export const PURCHASE_INVOICE_PAYMENT_METHODS = [
  { label: 'Tiền mặt', value: 'Tiền mặt' },
  { label: 'Chuyển khoản', value: 'Chuyển khoản' }
]

export const interceptorLoadingElements = (calling) => {
  // DOM lấy ra toàn bộ phần tử trên page hiện tại có className là 'interceptor-loading'
  const elements = document.querySelectorAll('.interceptor-loading')
  for (let i = 0; i < elements.length; i++) {
    if (calling) {
      // Nếu đang trong thời gian chờ gọi API (calling === true) thì sẽ làm mờ phần tử và chặn click bằng css pointer-events
      elements[i].style.opacity = '0.5'
      elements[i].style.pointerEvents = 'none'
    } else {
      // Ngược lại thì trả về như ban đầu, không làm gì cả
      elements[i].style.opacity = 'initial'
      elements[i].style.pointerEvents = 'initial'
    }
  }
}