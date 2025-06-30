import * as React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import ForgetPasswordForm from './ForgetPasswordForm'

const ForgetPasswordPage = () => {
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
            Forgot Password
          </Typography>

          <Typography variant="body2" sx={{ mb: 3 }}>
            Please enter the email address associated with your account.
          </Typography>

          <ForgetPasswordForm />

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider>

          <Typography textAlign="center" fontWeight={400} color="text.primary" variant="subtitle1">
            Remembered your password?
          </Typography>

          <Button
            component={Link}
            href="/login"
            fullWidth
            size="large"
            type="button"
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: '#1E00FF',
              color: '#fff',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#1400cc',
              },
            }}
          >
            Back to Sign-in
          </Button>
        </Card>
      </Container>
    </Box>
  )
}

export default ForgetPasswordPage
