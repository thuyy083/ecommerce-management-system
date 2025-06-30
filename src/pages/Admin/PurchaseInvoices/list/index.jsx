import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
import invoicesService from '~/service/admin/invoices.service'
import useUserInfo from '~/hooks/useUserInfo'
import { useDeviceId } from '~/hooks/useDeviceId'
import dayjs from 'dayjs'
import ActionMenu from '~/components/Admin/ActionMenu'
import { toast } from 'react-toastify'
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

const showdRecordOption = [5, 10, 25]


export default function InvoiceList() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [thruDate, setThruDate] = useState('')
  const searchValueDebounce = useDebounce(searchValue, 1000)
  const [showedRecord, setShowedRecord] = useState(5)
  const [page, setPage] = useState(1)

  const deviceId = useDeviceId()
  const { roles } = useAuth()
  const { userId: user_id } = useUserInfo()

  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)

  useEffect(() => {
    setPage(1)
    //refetch()
  }, [fromDate, thruDate])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'invoiceList',
      page,
      showedRecord,
      searchValueDebounce,
      fromDate,
      thruDate,
    ],
    enabled: !!deviceId && !!user_id,
    queryFn: () =>
      invoicesService.search(
        { user_id, device_id: deviceId },
        {
          limit: showedRecord,
          page,
          search: searchValueDebounce,
          fromDate: fromDate || undefined,
          toDate: thruDate || undefined,
        }
      ),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const handleDelete = (itemCode) => {
    invoicesService.delete({
      user_id,
      device_id: deviceId
    }, itemCode)
      .then(res => {
        console.log(res)
        toast.success('Xóa hóa đơn thành công')
      })
      .catch(err => {
        console.log(err)
        toast.error(err.response.data.message)
        refetch()
      })
  }

  
  const getStatusColor = (status) => {
    switch (status) {
    case 'DRAFT':
      return '#9e9e9e'
    case 'PENDING_APPROVAL':
      return '#ff9800'
    case 'CONFIRMED':
      return '#2196f3'
    case 'REJECTED':
      return '#f44336'
    case 'PAYMENTED':
      return '#4caf50'
    default:
      return '#757575'
    }
  }

  // Nếu deviceId hoặc user_id chưa sẵn sàng, có thể hiển thị loading spinner (tuỳ bạn)
  if (!deviceId || !user_id || isLoading) {
    console.log('deviceId hoặc user_id chưa sẵn sàng:', { deviceId, user_id })
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%', minHeight: '700px', p: 3 }}>
        <CircularProgress />
        <Typography variant='body1' sx={{ color: 'grey' }}>Đang tải dữ liệu...</Typography>
      </Box>
    )
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


      <Box>
        <Typography variant="h4">Danh sách hóa đơn</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 5, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Từ ngày"
              type="date"
              size="small"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
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
              value={thruDate}
              onChange={(e) => setThruDate(e.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Nhập mã hóa đơn hoặc người lập hóa đơn "
              size='small'
              sx={{ width: '29ch' }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  endAdornment: <InputAdornment position="end">{isLoading && <CircularProgress />}</InputAdornment>,
                },
              }}
              // InputProps={{
              //   startAdornment: (
              //     <InputAdornment position="start">
              //       <SearchIcon />
              //     </InputAdornment>
              //   )
              // }}
            />
            <Button
              LinkComponent={Link}
              to={Routes.admin.purchaseInvoices.create}
              variant='contained'
              color='success'
              startIcon={<AddIcon />}
              sx={{ display: !hasAnyPermission(roles, 'purchaseInvoice', 'create') ? 'none' : '' }}
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
              <StyledTableCell>Mã hóa đơn</StyledTableCell>
              <StyledTableCell>Ngày tạo</StyledTableCell>
              <StyledTableCell>Người lập hóa đơn</StyledTableCell>
              <StyledTableCell>Tổng tiền</StyledTableCell>
              <StyledTableCell>Trạng thái</StyledTableCell>
              <StyledTableCell align="center"></StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? <TableRow><TableCell colSpan={6} align='center'><CircularProgress size={20} /></TableCell></TableRow>
              : (data?.data?.invoices?.length === 0
                ? <TableRow>
                  <TableCell colSpan={6}><SearchResultNotFound message='Không tìm thấy hóa đơn' /></TableCell>
                </TableRow>
                : data?.data?.results?.map((invoice) => (
                  <StyledTableRow key={invoice.INVOICE_CODE}>
                    <StyledTableCell>{invoice.INVOICE_CODE}</StyledTableCell>
                    <StyledTableCell>{dayjs(invoice.IMPORT_DATE).format('DD/MM/YYYY HH:mm')}</StyledTableCell>
                    <StyledTableCell>{invoice.IMPORTED_BY}</StyledTableCell>
                    <StyledTableCell>{invoice.TOTAL_WITH_TAX_EXTRA_FEE?.toLocaleString()} đ</StyledTableCell>
                    <StyledTableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.5,
                          backgroundColor: getStatusColor(invoice.STATUS[invoice.STATUS.length - 1].STATUS_NAME),
                          color: '#fff',
                          borderRadius: 2,
                          fontSize: '0.75rem',
                          display: 'inline-block',
                          textTransform: 'uppercase',
                          fontWeight: 'bold'
                        }}
                      >
                        {invoice.STATUS[invoice.STATUS.length - 1].STATUS_NAME}
                      </Typography>
                    </StyledTableCell>

                    <StyledTableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <ActionMenu
                          onDetail={hasAnyPermission(roles, 'purchaseInvoice', 'read') ? () => navigate(Routes.admin.purchaseInvoices.invoiceDetail(invoice.INVOICE_CODE)) : null}
                          onEdit={invoice.STATUS?.at(-1)?.STATUS_NAME === 'DRAFT' && hasAnyPermission(roles, 'purchaseInvoice', 'update') ? () => navigate(Routes.admin.purchaseInvoices.edit(invoice.INVOICE_CODE)) : null}
                          onDelete={invoice.STATUS?.at(-1)?.STATUS_NAME === 'DRAFT' && hasAnyPermission(roles, 'purchaseInvoice', 'delete') ? () => handleDelete(invoice.INVOICE_CODE) : null}
                        />
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
