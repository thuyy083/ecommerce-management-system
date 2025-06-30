export const routeTree = [
  {
    path: '/admin/dashboard', name: 'Admin', children: [
      {
        path: '/admin/user', name: 'User', children: [
          { path: '/admin/user/create', name: 'Create' },
          { path: '/admin/user', name: 'List' }
        ]
      },
      {
        path: '/admin/supplier', name: 'Supplier', children: [
          { path: '/admin/supplier', name: 'List' },
          { path: '/admin/supplier/create', name: 'Create' },
          { path: '/admin/supplier/:id/edit', name: 'Edit' }
        ]
      },
      {
        path: '/admin/item-type', name: 'Item type', children: [
          { path: '/admin/item-type', name: 'List' },
          { path: '/admin/item-type/create', name: 'Create' },
          { path: '/admin/item-type/:id/edit', name: 'Edit' }
        ]
      },
      {
        path: '/admin/purchase-invoices', name: 'Invoices', children: [
          { path: '/admin/purchase-invoices', name: 'List' },
          { path: '/admin/purchase-invoices/create', name: 'Create' },
          { path: '/admin/purchase-invoices/:id/edit', name: 'Edit' }
        ]
      },
      {
        path: '/admin/vouchers', name: 'Vouchers', children: [
          { path: '/admin/vouchers', name: 'List' },
          { path: '/admin/vouchers/create', name: 'Create' },
          { path: '/admin/vouchers/:id/edit', name: 'Edit' },
          { path: '/admin/vouchers/:id/detail', name: 'Detail' },
        ]
      },
      {
        path: '/admin/sale-invoices', name: 'Invoices', children: [
          { path: '/admin/sale-invoices', name: 'List' },
          { path: '/admin/sale-invoices/create', name: 'Create' },
          { path: '/admin/sale-invoices/:id/edit', name: 'Edit' }
        ]
      },
    ]
  }
]

export function findBreadcrumbs(path, tree) {
  const result = []
  function traverse(node, currentPath) {
    if (node.path === path) {
      result.push(...currentPath)
      result.push(node)
      return true
    }
    if (node.children) {
      for (const child of node.children) {
        if (traverse(child, [...currentPath, node])) return true
      }
    }
    return false
  }
  tree.forEach(node => traverse(node, []))
  return result
}