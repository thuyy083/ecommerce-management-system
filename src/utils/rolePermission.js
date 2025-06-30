const rolePermissions = {
  admin: {
    user: ['create', 'update', 'delete', 'read'],
    unitInvoice: ['create', 'update', 'delete', 'read'],
    unitItem: ['create', 'update', 'delete', 'read'],
    supplier: ['create', 'update', 'delete', 'read'],
    voucher: ['create', 'update', 'delete', 'read'],
    itemType: ['create', 'update', 'delete', 'read'],
    item: ['create', 'update', 'delete', 'read'],
    saleInvoice: ['create', 'update', 'delete', 'read'],
    purchaseInvoice: ['create', 'update', 'delete', 'read', 'approve', 'cancel'],
    order: ['create', 'update', 'delete', 'read'],
  },
  manager: {
    user: ['read'],
    unitInvoice: ['read'],
    unitItem: ['read'],
    supplier: ['read'],
    voucher: ['read'],
    itemType: ['create', 'update', 'delete', 'read'],
    item: ['create', 'read'],
    saleInvoice: ['create', 'update', 'delete', 'read'],
    purchaseInvoice: ['create', 'update', 'delete', 'read', 'approve', 'cancel'],
    order: ['create', 'update', 'delete', 'read'],
  },
  service_staff: {
    user: [],
    unitInvoice: ['read'],
    unitItem: ['read'],
    supplier: ['read'],
    voucher: ['read'],
    itemType: ['read'],
    item: ['create', 'read'],
    saleInvoice: ['create', 'update', 'read'],
    purchaseInvoice: ['create', 'update', 'read'],
    order: ['create', 'update', 'read'],
  }
}

export const hasAnyPermission = (roles, resource, action) => {
  if (!action) return true
  return roles.some(role =>
    rolePermissions[role]?.[resource]?.includes(action)
  )
}
