
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import { Link, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'

import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import { Routes } from '~/config'
import { useQuery } from '@tanstack/react-query'
import itemTypeService from '~/service/admin/itemType.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import { toast } from 'react-toastify'
import { CircularProgress } from '@mui/material'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'
import useUserInfo from '~/hooks/useUserInfo'
import { Tooltip, IconButton } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import useAuth from '~/hooks/useAuth'
import { hasAnyPermission } from '~/utils/rolePermission'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

export default function ItemTypeList() {
  const location = useLocation()
  const deviceId = useDeviceId()
  const { roles } = useAuth()
  const { userId: user_id } = useUserInfo()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['itemTypeList'],
    enabled: !!deviceId,
    queryFn: () => itemTypeService.search({
      user_id,
      device_id: deviceId
    }),
    retry: false,
    refetchOnWindowFocus: false, // Khi chuyển màn hình sẽ k bị refetch dữ liệu
    // staleTime: 1000 * 60 * 3
  })
  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)

  const handleDelete = async (id) => {
    itemTypeService.delete({
      user_id,
      device_id: deviceId
    }, id)
      .then(() => {
        toast.success('Xóa Loại hàng hóa thành công')
        refetch()
      })
      .catch(err => {
        console.log(err)
        toast.error(err.response.data.message)
      })
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '90vh' }}>
        <SearchResultNotFound message={error?.response?.data?.message || 'Lỗi khi lấy dữ liệu'} />
      </Box>
    )
  }

  return (
    <Box>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Danh sách loại hàng
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            LinkComponent={Link}
            to={Routes.admin.itemType.create}
            variant='contained'
            color='success'
            startIcon={<AddIcon />}
            sx={{ display: !hasAnyPermission(roles, 'itemType', 'create') ? 'none' : '' }}
          >
            Thêm mới
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="itemType table">
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>Tên</StyledTableCell>
              <StyledTableCell>Tên tiếng Anh</StyledTableCell>
              <StyledTableCell align="center">Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%', mt: 5 }}>
                    <CircularProgress size={20} />
                    <Typography variant='body1' sx={{ color: 'grey' }}>Đang tải dữ liệu...</Typography>
                  </Box>
                </ TableCell>
              </ TableRow>
              : (data?.data?.itemTypes.length === 0
                ? <SearchResultNotFound />
                : data?.data?.itemTypes?.map((itemType) => (
                  <StyledTableRow key={itemType._id}>
                    <StyledTableCell>{itemType._id}</StyledTableCell>
                    <StyledTableCell>{itemType.ITEM_TYPE_NAME}</StyledTableCell>
                    <StyledTableCell>{itemType.ITEM_TYPE_NAME_EN}</StyledTableCell>
                    {/* <StyledTableCell align="center">
                      <Button variant="contained" size="small" sx={{ mr: 1 }} color="info">Detail</Button>
                      <Button variant="outlined" size="small" sx={{ mr: 1 }} LinkComponent={Link} to={Routes.admin.itemType.edit(itemType._id)}>Edit</Button>
                      <Button variant="contained" size="small" color="error" onClick={() => handleDelete(itemType._id)}>Delete</Button>
                    </StyledTableCell> */}
                    <StyledTableCell align="center">

                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          disabled={!hasAnyPermission(roles, 'itemType', 'update')}
                          size="small"
                          sx={{
                            backgroundColor: '#fbc02d',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#f9a825',
                            },
                            mr: 1,
                          }}
                          component={Link}
                          to={Routes.admin.itemType.edit(itemType._id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Xóa">
                        <IconButton
                          disabled={!hasAnyPermission(roles, 'itemType', 'delete')}
                          size="small"
                          color="error"
                          sx={{
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#c62828',
                            },
                          }}
                          onClick={() => handleDelete(itemType._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
