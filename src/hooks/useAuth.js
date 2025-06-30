import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const user = useSelector((state) => state.user.currentUser)

  const haveOneOfRoles = useCallback((requireRoles = []) => {
    return roles.some(role => requireRoles.includes(role))
  }, [roles])

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
    const newRoles = []
    setRoles(() => [])
    if (user?.ROLE?.IS_ADMIN) {
      newRoles.push('admin')
    }
    if (user?.ROLE?.IS_MANAGER) {
      newRoles.push('manager')
    }
    if (user?.ROLE?.IS_SERVICE_STAFF) {
      newRoles.push('service_staff')
    }
    if (user?.ROLE?.IS_CUSTOMER) {
      newRoles.push('customer')
    }
    setRoles(newRoles)
    setIsLoading(false)

    return () => setRoles([])
  }, [user])

  return { isAuthenticated, roles, isLoading, haveOneOfRoles }
}

export default useAuth
