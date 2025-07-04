import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Link, useLocation } from 'react-router-dom'
import Button from '@mui/material/Button'
import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import UpdateProfileForm from './UpdateProfileForm'

function UpdateProfilePage() {
  const location = useLocation()
  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)

  return (
    <Box sx={{ minHeight: '700px' }}>
      <Box sx={{ mb: 2 }}>
        {breadcrumbs.map((item, index) => (
          <Button
            key={index}
            variant='text'
            color={location.pathname === item.path ? 'primary' : 'secondary'}
            disabled={location.pathname === item.path}
            component={Link}
            to={item.path}
          >
            {item.name}
            {location.pathname !== item.path && ' > '}
          </Button>
        ))}
      </Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Cập nhật thông tin cá nhân
      </Typography>
      <UpdateProfileForm />
    </Box>
  )
}

export default UpdateProfilePage
