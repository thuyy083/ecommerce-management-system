import * as React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import ResetPasswordForm from './ResetPasswordForm'

const ResetPasswordPage = () => {
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
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Reset Password
          </Typography>

          <Typography variant="body2" sx={{ mb: 3 }}>
            Please enter your new password and confirm it below.
          </Typography>

          <ResetPasswordForm />
        </Card>
      </Container>
    </Box>
  )
}

export default ResetPasswordPage
