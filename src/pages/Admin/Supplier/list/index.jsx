
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
import supplierService from '~/service/admin/supplier.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import { toast } from 'react-toastify'
import { CircularProgress, FormControl, InputAdornment, InputLabel, MenuItem, Pagination, Select, TableFooter, TextField } from '@mui/material'
import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import useDebounce from '~/hooks/useDebounce'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'
import useUserInfo from '~/hooks/useUserInfo'
import { Tooltip, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { hasAnyPermission } from '~/utils/rolePermission'
import useAuth from '~/hooks/useAuth'

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

const showdRecordOption = [2, 5, 10, 25]

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

export default function SupplierList() {
  const [showedRecord, setShowedRecord] = useState(2)
  const [searchValue, setSearchValue] = useState('')
  const searchValueDebounce = useDebounce(searchValue, 1000)
  const [page, setPage] = useState(1)
  const location = useLocation()
  const deviceId = useDeviceId()
  const { roles } = useAuth()
  const { userId: user_id } = useUserInfo()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['supplierList', page, showedRecord, searchValueDebounce],
    enabled: !!deviceId,
    queryFn: () => supplierService.search({
      user_id,
      device_id: deviceId
    }, {
      limit: showedRecord,
      page,
      search: searchValueDebounce,
    }),
    retry: false,
    refetchOnWindowFocus: false, // Khi chuyển màn hình sẽ k bị refetch dữ liệu
    // staleTime: 1000 * 60 * 3
  })
  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)

  const handleDelete = async (id) => {
    supplierService.delete({
      user_id,
      device_id: deviceId
    }, id)
      .then(() => {
        toast.success('Xóa nhà cung ứng thành công')
        refetch()
      })
      .catch(err => {
        console.log(err)
        toast.error(err.response.data.message)
      })
  }

  if (error) return (
    <Box sx={{ minHeight: '90vh' }}>
      <SearchResultNotFound message={error?.response?.data?.message || 'Lỗi khi lấy dữ liệu'} />
    </Box>
  )

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
          Danh sách nhà cung cấp
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Tìm kiếm theo tên"
            size='small'
            sx={{ m: 1, width: '25ch' }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                endAdornment: <InputAdornment position="end">{isLoading && <CircularProgress />}</InputAdornment>,
              },
            }}
          />
          <Button
            LinkComponent={Link}
            to={Routes.admin.supplier.create}
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
        <Table sx={{ minWidth: 700 }} aria-label="supplier table">
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>Tên</StyledTableCell>
              <StyledTableCell>Số điện thoại</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell align="center">Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%', mt: 5 }}>
                    <CircularProgress size={20}/>
                    <Typography variant='body1' sx={{ color: 'grey' }}>Đang tải dữ liệu...</Typography>
                  </Box>
                </ TableCell>
              </ TableRow>
              : (data?.data?.suppliers?.length === 0
                ? <TableRow>
                  <TableCell colSpan={5}>
                    <SearchResultNotFound message='Không tìm thấy nhà cung ứng'/>
                  </TableCell>
                </TableRow>
                : data?.data?.suppliers?.map((supplier) => (
                  <StyledTableRow key={supplier._id}>
                    <StyledTableCell>{supplier._id}</StyledTableCell>
                    <StyledTableCell>{supplier.SUPPLIER_NAME}</StyledTableCell>
                    <StyledTableCell>{supplier.SUPPLIER_PHONE}</StyledTableCell>
                    <StyledTableCell>{supplier.SUPPLIER_EMAIL}</StyledTableCell>
                    {/* <StyledTableCell align="center">
                      <Button variant="outlined" size="small" sx={{ mr: 1 }} LinkComponent={Link} to={Routes.admin.supplier.edit(supplier._id)}>Edit</Button>
                      <Button variant="contained" size="small" color="error" onClick={() => handleDelete(supplier._id)}>Delete</Button>
                    </StyledTableCell> */}
                    <StyledTableCell align="center">

                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          disabled={!hasAnyPermission(roles, 'supplier', 'update')}
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
                          to={Routes.admin.supplier.edit(supplier._id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Xóa">
                        <IconButton
                          disabled={!hasAnyPermission(roles, 'supplier', 'delete')}
                          size="small"
                          color="error"
                          sx={{
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#c62828',
                            },
                          }}
                          onClick={() => handleDelete(supplier._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ m: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <InputLabel id="showedRecord-select-standard-label">Số dòng:</InputLabel>
                    <FormControl variant="standard" >
                      <Select
                        labelId="showedRecord-select-standard-label"
                        id="showedRecord-select-standard"
                        value={showedRecord}
                        onChange={(event) => {
                          const v = event.target.value
                          setShowedRecord(v)
                          setPage(1)
                        }}
                        label="Số dòng"
                      >
                        {showdRecordOption.map((value, index) => (
                          <MenuItem key={index} value={value}>{value}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Pagination
                    page={page}
                    defaultPage={data?.data?.page}
                    count={Math.ceil(data?.data?.total / showedRecord)}
                    color="primary" sx={{ my: 1, }}
                    onChange={(event, value) => {
                      console.log('Trang mới:', value)
                      setPage(value)
                    }}
                  />
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  )
}
