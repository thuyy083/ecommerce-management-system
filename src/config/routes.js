
export default {
  admin : {
    dashboard: '/admin/dashboard',
    staticticRevenue: '/admin/statistic-revenue',
    staticticExpense: '/admin/statistic-expense',
    user: {
      list: '/admin/user',
      create: '/admin/user/create',
      edit: (id = '') => `/admin/user/${id || ':id'}/edit`,
    },
    supplier: {
      list: '/admin/supplier',
      create: '/admin/supplier/create',
      edit: (id = '') => `/admin/supplier/${id || ':id'}/edit`,
    },
    itemType: {
      list : '/admin/item-type',
      create: '/admin/item-type/create',
      edit: (id = '') => `/admin/item-type/${id || ':id'}/edit`,
    },
    itemUnit: {
      list : '/admin/item-unit',
      create: '/admin/item-unit/create',
      edit: (id = '') => `/admin/item-unit/${id || ':id'}/edit`,
    },
    purchaseInvoices: {
      list : '/admin/purchase-invoices',
      invoiceDetailPath: '/admin/purchase-invoices/:id',
      invoiceDetail: (id) => `/admin/purchase-invoices/${id}`,
      create: '/admin/purchase-invoices/create',
      edit: (id) => `/admin/purchase-invoices/${id || ''}/edit`
    },
    saleInvoices: {
      list: '/admin/sale-invoices',
      create : '/admin/sale-invoices/create',
      edit: (id) => `/admin/sale-invoices/${id || ':id'}/edit`,
      detail: (id) => `/admin/sale-invoices/${id || ':id'}/detail`,
    },
    item : {
      list : '/admin/item',
      create : '/admin/item/create',
      edit: (id = '') => `/admin/item/${id || ':id'}/edit`,
      detail: (id = '') => `/admin/item/${id || ':id'}/detail`,
    },
    unitInvoice: {
      list : '/admin/invoice-unit',
      create: '/admin/invoice-unit/create',
      edit: (id = '') => `/admin/invoice-unit/${id || ':id'}/edit`,
    },
    vouchers: {
      list : '/admin/vouchers',
      voucherDetail: (id) => `/admin/vouchers/${id}`,
      create: '/admin/vouchers/create',
      edit: (id = '') => `/admin/vouchers/${id || ':id'}/edit`,
      statistics: '/admin/vouchers/statistics',
      addItems: (id) => `/admin/vouchers/${id || ':id'}/add-items`
    },
    orders: {
      list: '/admin/orders',
      edit: (id = '') => `/admin/orders/${id || ':id'}/edit`,
      detail: (id = '') => `/admin/orders/${id || ':id'}/detail`,
    }
  },
  auth: {
    login: '/login',
    register: '/register',
    forgetPassword: '/forgetPassword',
    resetPassword: '/resetPassword',
    changePassword: '/changePassword'
  },
  user: {
    profile: '/profile',
    userDetailPath: '/admin/user/:id',
    userDetail: (id) => `/admin/user/${id}`
  },
  error: {
    notFound404: '*',
    forbidden403: '/forbidden'
  },
  customer: {
    // detailItem: '/detail-Item',
    detailItem: (id) => `/detail-Item/${id}`,
    home: '/home',
    cart: '/cart',
    order: '/order',
    profile: '/customer/profileCustomer',
    listItem: '/list-Item'
  }
}