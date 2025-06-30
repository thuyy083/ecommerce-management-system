import { Box, Typography } from '@mui/material'

import { Error400 } from '~/assets/images'

function SearchResultNotFound({ message = '' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <img src={Error400} alt='not found' style={{ width: '200px', height: '200px' }}/>
      <Typography variant='body1'>{message}</Typography>
    </Box>
  )
}

export default SearchResultNotFound