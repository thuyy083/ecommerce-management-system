import { Box, Button, Card, Container, Typography } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'

import { Error404, logo } from '~/assets/images'
import { Link } from 'react-router-dom'
import routes from '~/config/routes'

function NotFound404() {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f3f8fc, #eaf1f8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            boxShadow: 0.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{
            backgroundImage: `url(${logo})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '150px',
            height: '100px'
          }} />
          <div style={{
            backgroundImage: `url(${Error404})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '300px',
            height: '300px'
          }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
            <Typography variant='h4' color='primary'>Page not found</Typography>
            <Typography variant='body2'>Something's Missing...! This page is not available</Typography>
            <Button variant='contained' endIcon={<HomeIcon />} LinkComponent={Link} to={routes.auth.login}>Back to Login</Button>
          </Box>
        </Card>
      </Container>
    </Box>
  )
}

export default NotFound404