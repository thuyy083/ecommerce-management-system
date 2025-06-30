import { Stack, Typography } from '@mui/material'

const UserInfoItem = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography variant="subtitle2" color="text.secondary">
        {label}:
      </Typography>
    </Stack>
    <Typography>{value}</Typography>
  </Stack>
)

export default UserInfoItem