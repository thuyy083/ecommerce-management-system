import { Box, Grid } from '@mui/material'

function ShowImagePanel({ images }) {
  return (
    <Grid container spacing={2}>
      {images?.map((image, index) => (
        <Grid size={3} key={index}>
          <Box sx={{
            height: '150px',
            width: '150px',
            borderRadius: '5px',
            boxShadow: (theme) => theme.shadows[1],
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundImage: `url(${image.URL})`
          }}></Box>
        </Grid>
      ))}
    </Grid>
  )
}

export default ShowImagePanel