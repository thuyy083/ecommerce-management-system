import { useEffect } from 'react'
import { useLocation, useNavigation } from 'react-router-dom'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false }) // Ẩn spinner, tùy chọn

function RouteChangeProgress() {
  const navigation = useNavigation()

  useEffect(() => {
    if (navigation.state === 'loading') {
      NProgress.start()
    } else {
      NProgress.done()
    }
  }, [navigation.state])

  return null
}

export default RouteChangeProgress