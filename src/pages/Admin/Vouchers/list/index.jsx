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
import { CircularProgress, MenuItem, Select, TextField, TableFooter, FormControl, InputLabel, Pagination } from '@mui/material'
import { useState, useEffect } from 'react'
import useDebounce from '~/hooks/useDebounce'
import { useQuery } from '@tanstack/react-query'

import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import { Routes } from '~/config'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import InputAdornment from '@mui/material/InputAdornment'
import vouchersService from '~/service/admin/vouchers.service'
import useUserInfo from '~/hooks/useUserInfo'
import { useDeviceId } from '~/hooks/useDeviceId'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

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

const showdRecordOption = [2, 5, 10, 25]


export default function VouchersList() {
  const location = useLocation()

  const [searchValue, setSearchValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minUse, setMinUse] = useState('')
  const [maxUse, setMaxUse] = useState('')
  const searchValueDebounce = useDebounce(searchValue, 1000)
  const [showedRecord, setShowedRecord] = useState(5)
  const [page, setPage] = useState(1)

  const deviceId = useDeviceId()
  const { userId: user_id } = useUserInfo()


  useEffect(() => {
    setPage(1)
    //refetch()
  }, [startDate, endDate])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'vouchersList',
      page,
      showedRecord,
      searchValueDebounce,
      minUse,
      maxUse,
      startDate,
      endDate,
    ],
    enabled: !!deviceId && !!user_id,
    queryFn: () =>
      vouchersService.search(
        { user_id, device_id: deviceId },
        {
          limit: showedRecord,
          page,
          search: searchValueDebounce,
          minUse,
          maxUse,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }
      ),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const handleDeleteVoucher = async (voucherId) => {
    if (!deviceId || !user_id) return
    try {
      await vouchersService.deleteVoucher(
        { user_id, device_id: deviceId },
        voucherId
      )
      toast.success('Vô hiệu hóa voucher thành công!')
      refetch()
    } catch (err) {
      toast.error('Vô hiệu hóa voucher thất bại!')
      console.error(err)
    }
  }

  const handSetActiveVoucher = async (voucherId) => {
    if (!deviceId || !user_id) return
    try {
      await vouchersService.setActiveVoucher(
        { user_id, device_id: deviceId },
        voucherId
      )
      toast.success('Kích hoạt voucher thành công!')
      refetch()
    } catch (err) {
      toast.error('Kích hoạt voucher thất bại!')
      console.error(err)
    }
  }
  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)


  if (!deviceId || !user_id) {
    console.log('deviceId hoặc user_id chưa sẵn sàng:', { deviceId, user_id })
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%', minHeight: '700px', p: 3 }}>
        <CircularProgress/>
        <Typography variant='body1' sx={{ color: 'grey' }}>Đang tải dữ liệu...</Typography>
      </Box>
    )
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


      <Box>
        <Typography variant="h4">Danh sách khuyến mãi</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 5, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Từ ngày"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true
                }
              }}
            />
            <TextField
              label="Đến ngày"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Min use"
              type="number"
              size="small"
              sx={{ width: '15ch' }}
              value={minUse}
              onChange={(e) => setMinUse(e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true
                }
              }}
            />
            <TextField
              label="Max use"
              type="number"
              size="small"
              sx={{ width: '15ch' }}
              value={maxUse}
              onChange={(e) => setMaxUse(e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Tìm kiếm theo mã giảm giá"
              size='small'
              sx={{ width: '20ch' }}
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
              to={Routes.admin.vouchers.create}
              variant='contained'
              color='success'
              startIcon={<AddIcon />}
            >
              Thêm mới
            </Button>
          </Box>
        </Box>
      </Box>


      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="invoice table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Mã giảm giá</StyledTableCell>
              <StyledTableCell>Loại giảm giá</StyledTableCell>
              <StyledTableCell>Giá trị</StyledTableCell>
              <StyledTableCell>Phạm vi áp dụng</StyledTableCell>
              <StyledTableCell>Số lượng</StyledTableCell>
              <StyledTableCell>Lượt sử dụng</StyledTableCell>
              <StyledTableCell></StyledTableCell>
              <StyledTableCell align="center"></StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? <TableRow><TableCell colSpan={6} align='center'><CircularProgress size={20} /></TableCell></TableRow>
              : (data?.data?.vouchers?.length === 0
                ? <TableRow>
                  <TableCell colSpan={6}><SearchResultNotFound message='Không tìm thấy mã giảm giá' /></TableCell>
                </TableRow>
                : data?.data?.vouchers?.map((vouchers) => (
                  <StyledTableRow key={vouchers.VOUCHER_CODE} >
                    <StyledTableCell
                      sx={{
                        opacity: vouchers.IS_ACTIVE ? 1 : 0.5,
                        backgroundColor: vouchers.IS_ACTIVE ? 'inherit' : '#f5f5f5'
                      }}
                    >{vouchers.VOUCHER_CODE}</StyledTableCell>
                    <StyledTableCell>
                      <Box
                        sx={{
                          backgroundColor: vouchers.TYPE === 'PERCENTAGE' ? '#1976d2' : '#388e3c',
                          color: '#fff',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          p: 0.5,
                          borderRadius: 1,
                          textTransform: 'uppercase'
                        }}
                      >
                        {vouchers.TYPE === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền'}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>{vouchers.VALUE?.toLocaleString()}</StyledTableCell>
                    <StyledTableCell>
                      <Box
                        sx={{
                          backgroundColor: vouchers.APPLY_SCOPE === 'PRODUCT' ? '#f57c00' : '#7b1fa2',
                          color: '#fff',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          p: 0.5,
                          borderRadius: 1,
                          textTransform: 'uppercase'
                        }}
                      >
                        {vouchers.APPLY_SCOPE === 'PRODUCT' ? 'Sản phẩm' : 'Hóa đơn'}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>{vouchers.QUANTITY?.toLocaleString()}</StyledTableCell>
                    <StyledTableCell>{vouchers.NUMBER_USING?.toLocaleString()}</StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2">
                        <strong>Bắt đầu:</strong> {dayjs(vouchers.START_DATE).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Kết thúc:</strong> {dayjs(vouchers.END_DATE).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                    </StyledTableCell>

                    <StyledTableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ mr: 1 }}
                          color="info"
                          component={Link}
                          to={Routes.admin.vouchers.voucherDetail(vouchers.VOUCHER_CODE)}
                        >
                          Chi tiết
                        </Button>
                        {vouchers.IS_ACTIVE ?
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ mr: 1 }}
                            color={vouchers.IS_ACTIVE ? 'warning' : 'success'}
                            onClick={() => handleDeleteVoucher(vouchers.VOUCHER_CODE)}
                          >
                            Vô hiệu
                          </Button>
                          :
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ mr: 1 }}
                            color={vouchers.IS_ACTIVE ? 'warning' : 'success'}
                            onClick={() => handSetActiveVoucher(vouchers.VOUCHER_CODE)}
                          >
                            Kích hoạt
                          </Button>
                        }
                      </Box>
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
