import AdminLayout from '~/layouts/AdminLayout'
import Dashboard from '~/pages/Admin/Dashboard'
import SupplierList from '~/pages/Admin/Supplier/list'
import SupplierCreate from '~/pages/Admin/Supplier/create'
import UserCreate from '~/pages/Admin/User/Create'
import UserList from '~/pages/Admin/User/list'
import SupplierEdit from '~/pages/Admin/Supplier/edit'
import ItemTypeList from '~/pages/Admin/ItemType/list'
import ItemTypeCreate from '~/pages/Admin/ItemType/create'
import ItemTypeEdit from '~/pages/Admin/ItemType/edit'
import ItemUnitList from '~/pages/Admin/ItemUnit/list'
import ItemUnitCreate from '~/pages/Admin/ItemUnit/create'
import ItemUnitEdit from '~/pages/Admin/ItemUnit/edit'
import ItemCreate from '~/pages/Admin/Item/create'
import UnitInvoiceList from '~/pages/Admin/UnitInvoice/list'
import UnitInvoiceCreate from '~/pages/Admin/UnitInvoice/create'
import UnitInvoiceEdit from '~/pages/Admin/UnitInvoice/edit'
import ItemList from '~/pages/Admin/Item/list'
import ItemEdit from '~/pages/Admin/Item/edit'
import ItemDetail from '~/pages/Admin/Item/detail'
import UserDetailPage from '~/pages/Admin/User/detail'
import { isAuthenticate, isHaveOneOfRoles } from '~/middlewares/auth'
import { composeLoaders } from '~/utils/composeLoader'
import PurchaseInvoiceList from '~/pages/Admin/PurchaseInvoices/list'
import InvoiceDetail from '~/pages/Admin/PurchaseInvoices/detail'
import AddPurchaseInvoiceForm from '~/pages/Admin/PurchaseInvoices/create'
import VouchersList from '~/pages/Admin/Vouchers/list'
import VoucherDetail from '~/pages/Admin/Vouchers/detail'
import VoucherCreate from '~/pages/Admin/Vouchers/create'
import EditVoucher from '~/pages/Admin/Vouchers/edit'
import VoucherStatisticsPage from '~/pages/Admin/Vouchers/statistics'
import VoucherAddItem from '~/pages/Admin/Vouchers/addItemsForVoucher'
import SaleInvoiceCreate from '~/pages/Admin/SaleInvoice/create'
import { Navigate } from 'react-router-dom'
import SaleInvoiceList from '~/pages/Admin/SaleInvoice/list'
import SaleInvoiceEdit from '~/pages/Admin/SaleInvoice/edit'
import EditPurchaseInvoiceForm from '~/pages/Admin/PurchaseInvoices/edit'
import OrderList from '~/pages/Admin/Order/list'
import OrderEdit from '~/pages/Admin/Order/edit'
import RevenueStatistic from '~/pages/Admin/Dashboard/RevenueStatistics'
import ExpenseStatistics from '~/pages/Admin/Dashboard/ExpenseStatistics'

export default [
  {
    path: '/',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    loader: isAuthenticate,
    children : [
      {
        path: 'dashboard',
        element: <Dashboard />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'statistic-revenue',
        element: <RevenueStatistic />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'statistic-expense',
        element: <ExpenseStatistics />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'user',
        element: <UserList />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin'])),
      },
      {
        path: 'user/create',
        element: <UserCreate />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'user/:id',
        element: <UserDetailPage />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'supplier',
        element: <SupplierList />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'supplier/create',
        element: <SupplierCreate />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'supplier/:id/edit',
        element: <SupplierEdit />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'item-type',
        element: <ItemTypeList />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'item-type/create',
        element: <ItemTypeCreate />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'item-type/:id/edit',
        element: <ItemTypeEdit />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'item-unit',
        element: <ItemUnitList />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'item-unit/create',
        element: <ItemUnitCreate />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'item-unit/:id/edit',
        element: <ItemUnitEdit />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'item',
        element: <ItemList />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'item/create',
        element: <ItemCreate />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'service staff', 'admin'])),
      },
      {
        path: 'item/:id/edit',
        element: <ItemEdit />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'item/:id/detail',
        element: <ItemDetail />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'service staff', 'admin'])),
      },
      {
        path: 'invoice-unit',
        element: <UnitInvoiceList />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'invoice-unit/create',
        element: <UnitInvoiceCreate />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'invoice-unit/:id/edit',
        element: <UnitInvoiceEdit />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'purchase-invoices',
        element: <PurchaseInvoiceList />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'purchase-invoices/create',
        element: <AddPurchaseInvoiceForm />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'purchase-invoices/:id/edit',
        element: <EditPurchaseInvoiceForm />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'purchase-invoices/:id',
        element: <InvoiceDetail />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'vouchers',
        element: <VouchersList />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin', 'manager', 'service staff'])),
      },
      {
        path: 'vouchers/:id',
        element: <VoucherDetail/>,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin', 'service staff']))
      },
      {
        path: 'vouchers/create',
        element: <VoucherCreate />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'vouchers/:id/edit',
        element: <EditVoucher />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin'])),
      },
      {
        path: 'vouchers/statistics',
        element: <VoucherStatisticsPage />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['manager', 'admin', 'service staff'])),
      },
      {
        path: 'sale-invoices',
        element: <SaleInvoiceList />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin', 'manager', 'service staff'])),
      },
      {
        path: 'vouchers/:id/add-items',
        element: <VoucherAddItem />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin']))
      },
      {
        path: 'sale-invoices/create',
        element: <SaleInvoiceCreate />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin', 'manager', 'service staff'])),
      },
      {
        path: 'sale-invoices/:id/edit',
        element: <SaleInvoiceEdit />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin', 'manager', 'service staff'])),
      },
      {
        path: 'sale-invoices/:id/detail',
        element: <SaleInvoiceEdit />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin', 'manager', 'service staff'])),
      },
      {
        path: 'orders',
        element: <OrderList />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin', 'manager', 'service staff'])),
      },
      {
        path: 'orders/:id/edit',
        element: <OrderEdit />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin', 'manager', 'service staff'])),
      },
      {
        path: 'orders/:id/detail',
        element: <OrderEdit />,
        loader: composeLoaders(isAuthenticate, () => isHaveOneOfRoles(['admin', 'manager', 'service staff'])),
      }
    ]
  },
]