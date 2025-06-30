import { Icon } from '@iconify/react'
import { Box } from '@mui/material'

const IconifyIcon = ({ icon, sx, ...other }) => (
  <Box component={Icon} icon={icon} sx={{ ...sx }} {...other} />
)

export default IconifyIcon
