

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
import itemService from '~/service/admin/item.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import { toast } from 'react-toastify'
import { CircularProgress, FormControl, InputAdornment, InputLabel, MenuItem, Pagination, Select, TableFooter, TextField } from '@mui/material'
import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import useDebounce from '~/hooks/useDebounce'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'
import useUserInfo from '~/hooks/useUserInfo'
import itemTypeService from '~/service/admin/itemType.service'
import PriceRangeInput from '~/components/Admin/PriceRangeInput'
import { Tooltip, IconButton } from '@mui/material'
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

const showdRecordOption = [5, 10, 25]

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

export default function ItemList() {
  const { roles } = useAuth()
  const [showedRecord, setShowedRecord] = useState(showdRecordOption[0])
  const [searchValue, setSearchValue] = useState('')
  const searchValueDebounce = useDebounce(searchValue, 1000)
  const [itemTypeId, setItemTypeId] = useState('')
  const [filter, setFilter] = useState({})
  const [priceRange, setPriceRange] = useState(null)
  const priceRangeDebounce = useDebounce(priceRange, 1000)
  const [page, setPage] = useState(1)
  const location = useLocation()
  const deviceId = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['itemList', page, showedRecord, searchValueDebounce, itemTypeId, filter, priceRangeDebounce],
    enabled: !!deviceId,
    queryFn: () => itemService.search({
      user_id,
      device_id: deviceId
    }, {
      size: showedRecord,
      page,
      search: searchValueDebounce,
      itemTypeId,
      ...filter,
      ...priceRangeDebounce,
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const { data: dataQuantityAll, isLoading: isLoadingQuantityAll, isError: isErrorQuantityAll } = useQuery({
    queryKey: ['itemList',],
    enabled: !!deviceId,
    queryFn: () => itemService.search({
      user_id,
      device_id: deviceId
    }, {
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const { data: dataQuantityIsUnAvailableStock, isLoading: isLoadingIsUnAvailableStock, isError: isErrorIsUnAvailableStock } = useQuery({
    queryKey: ['itemQuantityIsUnAvailableStock',],
    enabled: !!deviceId,
    queryFn: () => itemService.search({
      user_id,
      device_id: deviceId
    }, {
      stock: 0
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const { data: dataQuantityIsActive, isLoading: isLoadingQuantityIsActive, isError: isErrorQuantityIsActive } = useQuery({
    queryKey: ['itemQuantityIsActive',],
    enabled: !!deviceId,
    queryFn: () => itemService.search({
      user_id,
      device_id: deviceId
    }, {
      isActive: true
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const { data: dataItemType, isLoading : isLoadingItemType, error: errorItemType } = useQuery({
    queryKey: ['itemTypeList'],
    enabled: !!deviceId,
    queryFn: () => itemTypeService.search({
      user_id,
      device_id: deviceId
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)

  const getFullPrice = (item) => {
    return `${item.PRICE?.at(-1)?.PRICE_AMOUNT?.toLocaleString()} ${item.PRICE?.at(-1)?.PRICE_AMOUNT ? item.PRICE?.at(-1)?.UNIT_ABB || '' : ''}`
  }

  console.log(roles, hasAnyPermission(roles, 'item', 'delete'))

  const handleDelete = async (id) => {
    itemService.delete({
      user_id,
      device_id: deviceId
    }, id)
      .then(() => {
        toast.success('Xóa Hàng hóa thành công')
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
      <Typography variant="h4" sx={{ mb: 5 }}>
          Item List
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {!isLoadingQuantityAll && !isErrorQuantityAll && (
          <Button
            color={!Object.keys(filter).length ? 'info' : 'inherit'}
            onClick={() => setFilter({})}
          >
            Tất cả <span style={{ color: 'gray', marginLeft: '3px' }}>{`(${dataQuantityAll?.data?.total})`}</span>
          </Button>
        )}
        {dataQuantityIsUnAvailableStock?.data?.total > 0 && !isLoadingIsUnAvailableStock && !isErrorIsUnAvailableStock && (
          <Button
            color={filter?.stock === 0 ? 'info' : 'inherit'}
            onClick={() => setFilter({
              stock: 0,
            })}
          >
            Hết hàng <span style={{ color: 'gray', marginLeft: '3px' }}>{`(${dataQuantityIsUnAvailableStock?.data?.total})`}</span>
          </Button>
        )}
        {dataQuantityAll?.data?.total > dataQuantityIsUnAvailableStock?.data?.total && !isLoadingIsUnAvailableStock && !isErrorIsUnAvailableStock && (
          <Button
            color={filter?.stock && filter?.stock !== 0 ? 'info' : 'inherit'}
            onClick={() => setFilter({
              stock: 1,
            })}
          >
            Còn hàng<span style={{ color: 'gray', marginLeft: '3px' }}>{`(${dataQuantityAll?.data?.total - dataQuantityIsUnAvailableStock?.data?.total})`}</span>
          </Button>
        )}
        {dataQuantityIsActive?.data?.total > 0 && !isLoadingQuantityIsActive && !isErrorQuantityIsActive && (
          <Button
            color={filter?.isActive ? 'info' : 'inherit'}
            onClick={() => setFilter({
              isActive: true,
            })}
          >
            Còn bán<span style={{ color: 'gray', marginLeft: '3px' }}>{`(${dataQuantityIsActive?.data?.total})`}</span>
          </Button>
        )}
        {dataQuantityAll?.data?.total > dataQuantityIsActive?.data?.total ** !isLoadingQuantityIsActive && !isErrorQuantityIsActive && (
          <Button
            color={filter?.isActive && !filter?.isActive !== false ? 'info' : 'inherit'}
            onClick={() => setFilter({
              isActive: false,
            })}
          >
            Not active<span style={{ color: 'gray', marginLeft: '3px' }}>{`(${dataQuantityAll?.data?.total - dataQuantityIsActive?.data?.total})`}</span>
          </Button>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Tìm kiếm tên, tên tiếng anh, mã"
            size='small'
            sx={{ m: 1, minWidth: '25ch' }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                endAdornment: <InputAdornment position="end">{isLoading && <CircularProgress size={20}/>}</InputAdornment>,
              },
            }}
          />
          {!isLoadingItemType && !errorItemType && <TextField
            select
            size="small"
            label="Loại"
            value={itemTypeId}
            onChange={(e) => setItemTypeId(e.target.value)}
            sx={{ minWidth: 120, m: 1 }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"></InputAdornment>,
                endAdornment: <InputAdornment position="end">{isLoading && <CircularProgress size={20}/>}</InputAdornment>,
              },
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {dataItemType?.data?.itemTypes?.map((itemType) => (
              <MenuItem key={itemType._id} value={itemType._id}>
                {itemType.ITEM_TYPE_NAME}
              </MenuItem>
            ))}
          </TextField>}
          <PriceRangeInput onChange={priceRange => setPriceRange(priceRange)}/>
        </Box>
        <Button
          LinkComponent={Link}
          to={Routes.admin.item.create}
          variant='contained'
          color='success'
          startIcon={<AddIcon />}
          size='small'
          sx={{ fontSize: '0.75rem', px: 2, py: 1, display: !hasAnyPermission(roles, 'item', 'create') ? 'none' : '' }}
        >
            Thêm mới
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="supplier table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Mã</StyledTableCell>
              <StyledTableCell>Tên</StyledTableCell>
              <StyledTableCell>Tên tiếng Anh</StyledTableCell>
              <StyledTableCell>Loại</StyledTableCell>
              <StyledTableCell>Giá</StyledTableCell>
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
                : (data?.data?.total === 0
                  ? <TableRow>
                    <TableCell colSpan={5}>
                      <SearchResultNotFound message='Không tìm thấy hàng hóa'/>
                    </TableCell>
                  </TableRow>
                  : data?.data?.items?.map((item) => (
                    <StyledTableRow key={item._id}>
                      <StyledTableCell>{item.ITEM_CODE}</StyledTableCell>
                      <StyledTableCell>{item.ITEM_NAME}</StyledTableCell>
                      <StyledTableCell>{item.ITEM_NAME_EN ?? ''}</StyledTableCell>
                      <StyledTableCell>{item.ITEM_TYPE_NAME}</StyledTableCell>
                      <StyledTableCell>{getFullPrice(item)}</StyledTableCell>
                      {/* <StyledTableCell align="center">
                        <Button variant="contained" size="small" sx={{ mr: 1 }} color="info" LinkComponent={Link} to={Routes.admin.item.detail(item._id)}>Detail</Button>
                        <Button variant="outlined" size="small" sx={{ mr: 1 }} LinkComponent={Link} to={Routes.admin.item.edit(item._id)}>Edit</Button>
                        <Button variant="contained" size="small" color="error" onClick={() => handleDelete(item._id)}>Delete</Button>
                      </StyledTableCell> */}
                      <StyledTableCell sx={{ width: 160 }} align="center">
                        <Tooltip title="Chi tiết">
                          <IconButton
                            disabled={!hasAnyPermission(roles, 'item', 'read')}
                            size="small"
                            sx={{
                              backgroundColor: '#1976d2',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: 14,
                              '&:hover': {
                                backgroundColor: '#1565c0',
                              },
                              mr: 1,
                              width: 35,
                              height: 35,
                            }}
                            component={Link}
                            to={Routes.admin.item.detail(item._id)}
                          >
                            <Box component="span" sx={{ fontWeight: 'bold', fontSize: 14 }}>i</Box>
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            disabled={!hasAnyPermission(roles, 'item', 'update')}
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
                            to={Routes.admin.item.edit(item._id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Xóa">
                          <IconButton
                            disabled={!hasAnyPermission(roles, 'item', 'delete')}
                            size="small"
                            color="error"
                            sx={{
                              backgroundColor: '#d32f2f',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#c62828',
                              },
                            }}
                            onClick={() => handleDelete(item._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </StyledTableCell>
                    </StyledTableRow>)
                  ))
              )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Typography variant='body1'>{`${(page - 1) * data?.data?.limit + 1} to ${page * data?.data?.limit} items of ${data?.data?.total}`}</Typography>
                  <Box sx={{ m: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
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
                            // setShowedRecord(event.target.value)
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
