import DetailItem from '~/pages/Customer/DetailItem'
import CustomerLayout from '~/layouts/CustomerLayout'
import HomePage from '~/pages/Customer/Home'
import ListItem from '~/pages/Customer/ListItem'
import ProfileCustomer from '~/pages/Customer/Profile'
import EditProfile from '~/pages/Customer/Profile/edit'
import ListItemPage from '~/pages/Customer/ListItem'
import Cart from '~/pages/Customer/Cart'
import Order from '~/pages/Customer/Order'
import OrderInfo from '~/pages/Customer/Order/info'
import OrderDetail from '~/pages/Customer/Order/detail'
export default [
  {
    path: '/customer',
    element: <CustomerLayout />,
    children: [
      {
        // path: 'detail-Item',
        path: 'detail-Item/:id',
        element: <DetailItem />,
        //loader: composeLoaders(isAuthenticate),item/:id/detail
      },
      {
        path: 'home',
        element: <HomePage />
      },
      {
        path: 'cart',
        element: <Cart />
      },
      {
        path: 'list-Item',
        element: <ListItemPage />
      },
      {
        path: 'order',
        element: <Order />
      },
      {
        path: 'profileCustomer',
        element: <ProfileCustomer />
      },
      {
        path: 'editProfile',
        element: <EditProfile />
      },
      {
        path: 'orderInfo',
        element: <OrderInfo />
      },
      {
        path: 'order/:id',
        element: <OrderDetail />
      },
    ]
  },
]