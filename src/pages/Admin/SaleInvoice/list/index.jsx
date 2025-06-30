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
import AddIcon from '@mui/icons-material/Add'
import PaidIcon from '@mui/icons-material/Paid'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CancelIcon from '@mui/icons-material/Cancel'

import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import { Routes } from '~/config'
import { useQuery } from '@tanstack/react-query'
import saleInvoiceService from '~/service/admin/saleInvoice.serivce'
import { useDeviceId } from '~/hooks/useDeviceId'
import { Chip, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Pagination, Select, TableFooter, TextField, Tooltip } from '@mui/material'
import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import useDebounce from '~/hooks/useDebounce'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'
import useUserInfo from '~/hooks/useUserInfo'
import PriceRangeInput from '~/components/Admin/PriceRangeInput'
import { formatCurrency, formatToVietnamTime } from '~/utils/formatter'
import { getColorByValue, getLabelByValue } from '~/utils/mapper'
import { SALE_INVOICES_PURCHASE_METHODS, SALE_INVOICE_STATUS } from '~/utils/contant'
import ActionMenu from '~/components/Admin/ActionMenu'
import { toast } from 'react-toastify'
import useAuth from '~/hooks/useAuth'
import { hasAnyPermission } from '~/utils/rolePermission'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}))

const showdRecordOption = [5, 10, 25]

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

export default function SaleInvoiceList() {
  const navigate = useNavigate()
  const [showedRecord, setShowedRecord] = useState(showdRecordOption[0])
  const [searchValue, setSearchValue] = useState('')
  const [optionSearch, setOptionSearch] = useState('all')
  const [status, setStatus] = useState()
  const [fromDate, setFromDate] = useState('')
  const [thruDate, setThruDate] = useState('')
  const searchValueDebounce = useDebounce(searchValue, 1000)
  const [priceRange, setPriceRange] = useState(null)
  const priceRangeDebounce = useDebounce(priceRange, 1000)
  const [page, setPage] = useState(1)
  const location = useLocation()
  const deviceId = useDeviceId()
  const { roles } = useAuth()
  const { userId: user_id } = useUserInfo()
  const { data, isLoading, error, refetch: refetchList } = useQuery({
    queryKey: ['saleInvoiceList', page, showedRecord, searchValueDebounce, status, fromDate, thruDate, priceRangeDebounce],
    enabled: !!deviceId,
    queryFn: () => saleInvoiceService.search({
      user_id,
      device_id: deviceId
    }, {
      limits: showedRecord,
      page,
      search: searchValueDebounce,
      [optionSearch] : true,
      status,
      fromDate,
      toDate: thruDate,
      ...priceRange
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const { data: statisticStatusData, isLoading: isLoadingStatisticData, isError: isErrorStatisticData, refetch: refetchSatistic } = useQuery({
    queryKey: ['saleStatisticStatus'],
    enabled: !!deviceId,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => saleInvoiceService.statisticBaseOnStatus({
      user_id,
      device_id: deviceId
    })
  })

  const handleDelete = (invoiceCode) => {
    saleInvoiceService.delete({
      user_id,
      device_id: deviceId
    }, invoiceCode)
      .then(async res => {
        console.log(res)
        toast.success('Lưu hóa đơn thành công')
        await refetchList()
        await refetchSatistic()
      })
      .catch(err => {
        console.log(err)
        toast.error(err.response.data.message)
      })
  }

  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)

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
      <Typography variant="h4" sx={{ mb: 5 }}>
          Danh sách hóa đơn
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 4 }}>
        <TextField
          label="Tìm kiếm"
          size='small'
          sx={{ m: 1, minWidth: '25ch' }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              endAdornment: <InputAdornment position="end">
                <Box width={30} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  {isLoading && <CircularProgress size={20} />}
                </Box>
                <FormControl variant="standard">
                  <Select
                    value={optionSearch}
                    onChange={(e) => setOptionSearch(e.target.value)}
                    disableUnderline
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="invoiceCode">Mã hóa đơn</MenuItem>
                    <MenuItem value="buyer">Khách hàng</MenuItem>
                    <MenuItem value="seller">Nhân viên</MenuItem>
                  </Select>
                </FormControl>
              </InputAdornment>,
            },
          }}
        />
        {!isLoadingStatisticData && !isErrorStatisticData && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color={!status ? 'info' : 'inherit'}
              onClick={() => setStatus('')}
            >
              Tất cả <span style={{ color: 'gray', marginLeft: '3px' }}>{`(${statisticStatusData?.data?.reduce((acc, cur) => acc + cur.count, 0)})`}</span>
            </Button>
            {statisticStatusData?.data?.map(data => (
              <Button
                key={data.status}
                color={status === data.status ? 'info' : 'inherit'}
                onClick={() => setStatus(data.status)}
              >
                {getLabelByValue(data.status, SALE_INVOICE_STATUS)} <span style={{ color: 'gray', marginLeft: '3px' }}>{`(${data.count})`}</span>
              </Button>
            ))}
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
          <PriceRangeInput onChange={priceRange => setPriceRange(priceRange)}/>
        </Box>
        <Button
          LinkComponent={Link}
          to={Routes.admin.saleInvoices.create}
          variant='contained'
          color='success'
          startIcon={<AddIcon />}
          sx={{ display: !hasAnyPermission(roles, 'itemType', 'create') ? 'none' : '' }}
        >
            Thêm mới
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Mã</StyledTableCell>
              <StyledTableCell>Ngày bán</StyledTableCell>
              <StyledTableCell>Người bán</StyledTableCell>
              <StyledTableCell>Người mua</StyledTableCell>
              <StyledTableCell>Phương thức thanh toán</StyledTableCell>
              <StyledTableCell>Tổng giá tiền</StyledTableCell>
              <StyledTableCell>Hình thức mua hàng</StyledTableCell>
              <StyledTableCell>Trạng thái</StyledTableCell>
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
              : (data?.data?.results?.length === 0
                ? <TableRow>
                  <TableCell colSpan={5}>
                    <SearchResultNotFound message='Không tìm thấy hóa đơn'/>
                  </TableCell>
                </TableRow>
                : (data?.data?.total === 0
                  ? <TableRow>
                    <TableCell colSpan={5}>
                      <SearchResultNotFound message='Không tìm thấy hóa đơn'/>
                    </TableCell>
                  </TableRow>
                  : data?.data?.results?.map((invoice) => (
                    <StyledTableRow key={invoice.INVOICE_CODE}>
                      <StyledTableCell>{invoice.INVOICE_CODE}</StyledTableCell>
                      <StyledTableCell>{formatToVietnamTime(invoice.SELL_DATE)}</StyledTableCell>
                      <StyledTableCell>{invoice.SOLD_BY}</StyledTableCell>
                      <StyledTableCell>{invoice.CUSTOMER?.FULL_NAME ?? invoice.CUSTOMER?.USERNAME ?? 'Vãng lai'}</StyledTableCell>
                      <StyledTableCell align='center'>
                        <Tooltip title={invoice.PAYMENT_METHOD}>
                          <IconButton>
                            {invoice.PAYMENT_METHOD == 'Tiền mặt' && <PaidIcon color='success'/>}
                            {invoice.PAYMENT_METHOD == 'Chuyển khoản' && <CreditCardIcon color='info' />}
                          </IconButton>
                        </Tooltip>
                      </StyledTableCell>
                      <StyledTableCell>{`${formatCurrency(invoice.TOTAL_WITH_TAX_EXTRA_FEE)} đ`}</StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={getLabelByValue(invoice.PURCHASE_METHOD, SALE_INVOICES_PURCHASE_METHODS)}
                          color={getColorByValue(invoice.PURCHASE_METHOD, SALE_INVOICES_PURCHASE_METHODS)}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Tooltip title={getLabelByValue(invoice.STATUS, SALE_INVOICE_STATUS)}>
                          {invoice.STATUS === 'DRAFT' && <ModeEditIcon color={getColorByValue(invoice.STATUS, SALE_INVOICE_STATUS)} />}
                          {invoice.STATUS === 'CONFIRMED' && <CheckCircleIcon color={getColorByValue(invoice.STATUS, SALE_INVOICE_STATUS)} />}
                          {invoice.STATUS === 'PAYMENTED' && <AttachMoneyIcon color={getColorByValue(invoice.STATUS, SALE_INVOICE_STATUS)} />}
                          {invoice.STATUS === 'CANCELLED' && <CancelIcon color={getColorByValue(invoice.STATUS, SALE_INVOICE_STATUS)} />}
                        </Tooltip>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <ActionMenu
                          onEdit={invoice.STATUS !== 'PAYMENTED' && invoice.STATUS !== 'CANCELLED' && invoice.PURCHASE_METHOD !== 'ONLINE' && hasAnyPermission(roles, 'saleInvoice', 'update') ? () => navigate(Routes.admin.saleInvoices.edit(invoice.INVOICE_CODE)): null}
                          onDelete={invoice.STATUS !== 'PAYMENTED' && invoice.STATUS !== 'CANCELLED' && invoice.PURCHASE_METHOD !== 'ONLINE' && hasAnyPermission(roles, 'saleInvoice', 'delete') ? () => handleDelete(invoice.INVOICE_CODE): null}
                          onDetail={() => navigate(Routes.admin.saleInvoices.detail(invoice.INVOICE_CODE))}
                        />
                      </StyledTableCell>
                    </StyledTableRow>)
                  ))
              )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Typography variant='body1'>{`${(page - 1) * data?.data?.limits + 1} to ${page * data?.data?.limits} items of ${data?.data?.total}`}</Typography>
                  <Box sx={{ m: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ m: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <InputLabel id="showedRecord-select-standard-label">Số dòng:</InputLabel>
                      <FormControl variant="standard" >
                        <Select
                          labelId="showedRecord-select-standard-label"
                          id="showedRecord-select-standard"
                          value={showedRecord}
                          onChange={(event) => {
                            setShowedRecord(event.target.value)
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
                      count={Math.ceil(data?.data?.total / showedRecord)}
                      color="primary" sx={{ my: 1, }}
                      onChange={(event, value) => {
                        console.log('Trang mới:', value)
                        setPage(value)
                      }}
                    />
                  </Box>
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  )
}
