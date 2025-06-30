import * as React from 'react'
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
import dayjs from 'dayjs'

import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import { Routes } from '~/config'

import { useQuery } from '@tanstack/react-query'
import userService from '~/service/user.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import { CircularProgress, FormControl, InputAdornment, InputLabel, MenuItem, Pagination, Select, TableFooter, TextField } from '@mui/material'
import { useState } from 'react'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'
import useUserInfo from '~/hooks/useUserInfo'
import { Tooltip, IconButton, Avatar } from '@mui/material'
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

const showdRecordOption = [2, 5, 10, 25]

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))


export default function UserList() {
  const [showedRecord, setShowedRecord] = useState(5)
  const [page, setPage] = useState(1)
  const [selectedRole, setSelectedRole] = useState('all')
  const location = useLocation()
  const deviceId = useDeviceId()
  const { roles } = useAuth()
  const { userId: user_id } = useUserInfo()
  console.log('deviceId1: ',deviceId)
  console.log('userId1: ', user_id)

  const roleParam = selectedRole !== 'all' ? { role: selectedRole } : {}

  console.log('Vai trò đã chọn:', selectedRole)
  console.log('Query gửi lên:', roleParam)
  React.useEffect(() => { setPage(1) }, [selectedRole])
  const { data, isLoading, error } = useQuery({
    queryKey: ['userList', page, showedRecord, selectedRole],
    enabled: !!deviceId,
    queryFn: () => userService.search(
      { user_id, device_id: deviceId },
      { limit: showedRecord, page, ...roleParam }
    ),
    retry: false,
    refetchOnWindowFocus: false, // Khi chuyển màn hình sẽ k bị refetch dữ liệu
    // staleTime: 1000 * 60 * 3
  })

  if (error) return (
    <Box sx={{ minHeight: '90vh' }}>
      <SearchResultNotFound message={error?.response?.data?.message || 'Lỗi khi lấy dữ liệu'} />
    </Box>
  )
  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)
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
          Danh sách người dùng
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small">
            <InputLabel id="role-select-label">Vai trò</InputLabel>
            <Select
              labelId="role-select-label"
              value={selectedRole}
              label="Vai trò"
              onChange={(e) => setSelectedRole(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="admin">Quản trị viên</MenuItem>
              <MenuItem value="manager">Người quản lý</MenuItem>
              <MenuItem value="staff">Nhân viên</MenuItem>
              <MenuItem value="customer">Khách hàng</MenuItem>
            </Select>
          </FormControl>
          <Button
            LinkComponent={Link}
            to={Routes.admin.user.create}
            variant='contained'
            color='success'
            startIcon={<AddIcon />}
            sx={{ display: !hasAnyPermission(roles, 'user', 'create') ? 'none' : '' }}
          >
            Thêm người dùng
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="user table">
          <TableHead>
            <TableRow>
              <StyledTableCell>STT</StyledTableCell>
              <StyledTableCell>Ảnh</StyledTableCell>
              <StyledTableCell>Họ tên</StyledTableCell>
              <StyledTableCell>Giới tính</StyledTableCell>
              <StyledTableCell>Ngày sinh</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Số điện thoại</StyledTableCell>
              <StyledTableCell align="center"></StyledTableCell>
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
              : (data?.data?.users?.length === 0
                ? <TableRow>
                  <TableCell colSpan={5}>
                    <SearchResultNotFound message='Không tìm thấy người dùng'/>
                  </TableCell>
                </TableRow>
                : data?.data?.users.map((user, index) => (
                  <StyledTableRow key={user._id}>
                    <StyledTableCell>{(page - 1) * showedRecord + index + 1}</StyledTableCell>
                    <StyledTableCell>
                      <Avatar
                        src={user.AVATAR_IMG_URL}
                        alt={user.USER_NAME}
                        sx={{ width: 40, height: 40 }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      {user.LIST_NAME?.at(-1)?.LAST_NAME || ''} {user.LIST_NAME?.at(-1)?.FIRST_NAME || ''}
                    </StyledTableCell>

                    <StyledTableCell>{user.CURRENT_GENDER}</StyledTableCell>
                    <StyledTableCell>
                      {user.BIRTH_DATE ? dayjs(user.BIRTH_DATE).format('DD/MM/YYYY') : ''}
                    </StyledTableCell>
                    <StyledTableCell>
                      {user.LIST_EMAIL?.[0]?.EMAIL || ''}
                    </StyledTableCell>
                    <StyledTableCell>
                      {user.LIST_PHONE_NUMBER?.[0]?.PHONE_NUMBER || ''}
                    </StyledTableCell>
                    {/* <StyledTableCell>{user.ROLE}</StyledTableCell> */}
                    <StyledTableCell align="center">
                      <Tooltip title="Chi tiết" arrow>
                        <IconButton
                          size="small"
                          color="info"
                          component={Link}
                          to={Routes.user.userDetail(user._id)}
                          sx={{
                            width: 35,
                            height: 35,
                            borderRadius: '50%',
                            display: 'flex',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            '&:hover': { backgroundColor: '#1565c0' },
                          }}
                        >
                          {/* <InfoIcon fontSize="small" /> */}
                          <Box component="span" sx={{ fontWeight: 'bold', fontSize: 14 }}>i</Box>
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                )))}
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
