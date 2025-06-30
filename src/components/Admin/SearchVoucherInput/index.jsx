import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import useDebounce from '~/hooks/useDebounce'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import ClickAwayListener from '@mui/material/ClickAwayListener'

import voucherService from '~/service/admin/vouchers.service'
import { formatCurrency } from '~/utils/formatter'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'
import { VOUCHER_SCOPES } from '~/utils/contant'

// notExpired: thời điểm mua vẫn nằm trong ngày áp dụng của voucher
// available: Số lượng voucher đã được khách hàng sử dụng nhỏ hơn số lương cho phép
function SearchVoucherInput({ onItemClick, properPosition = 'bottom-start', inputSize = 'small', searchOption = 'ALL', notExpired, available }) {
  const [option, setOption] = useState(searchOption)
  const [searchValue, setSearchValue] = useState('')
  const searchValueDebounce = useDebounce(searchValue, 1000)
  const searchAreaRef = useRef(null)
  const [isResultPropperOpen, setIsResultPropperOpen] = useState(false)
  const { userId: user_id } = useUserInfo()
  const device_id = useDeviceId()

  const { data: searchedItems, isLoading: isLoadingSearchedItem, isError: isErrorSearch, } = useQuery({
    enabled: !!user_id && !!device_id && !!searchValueDebounce,
    queryKey: ['searchedVouchers', searchValueDebounce],
    queryFn: () => voucherService.search({
      user_id,
      device_id,
    }, {
      search: searchValueDebounce,
      limit: 5,
      applyScope: option === 'ALL' ? null : option,
      isActive: true,
      filterByExpiration: notExpired,
      filterByUsage: available,
    }),
    retry: false,
    refetchOnWindowFocus: false,
  })

  const handleSearchInput = (e) => {
    setSearchValue(e.target.value)
  }

  const handleClear = () => {
    setSearchValue('')
    setIsResultPropperOpen(false)
  }

  const handleClickAway = () => {
    setIsResultPropperOpen(false)
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
        <Box ref={searchAreaRef}>
          <TextField
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <Box width={30} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {searchValue && (
                        isLoadingSearchedItem
                          ? <CircularProgress />
                          : <IconButton onClick={handleClear}>
                            <CloseIcon />
                          </IconButton>
                      )}
                    </Box>
                    <FormControl variant="standard">
                      <Select
                        value={option}
                        onChange={(e) => setOption(e.target.value)}
                        disableUnderline
                        sx={{ minWidth: 100 }}
                      >
                        <MenuItem value="ALL">Tất cả </MenuItem>
                        {VOUCHER_SCOPES.map(scope => (
                          <MenuItem key={scope.value} value={scope.value} disabled={scope.disable}>
                            {scope.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </InputAdornment>
                )
              }
            }}
            size={inputSize}
            value={searchValue}
            onChange={handleSearchInput}
            onFocus={() => setIsResultPropperOpen(true)}
            fullWidth
            placeholder='Nhập mã khuyến mãi'
            sx={{
              maxWidth: '380px',
            }}
          // sx={{
          //   '& .MuiOutlinedInput-root': {
          //     '&.Mui-focused': { backgroundColor: 'white' },
          //     '& fieldset': { borderColor: 'rgba(0 0 0)' },
          //     '&:hover fieldset': { borderColor: 'rgba(0 0 0)' },
          //     '&.Mui-focused fieldset': { borderColor: 'rgba(0 0 0)', borderWidth: '1px' },
          //   }
          // }}
          />
        </Box>
        <Popper
          open={isResultPropperOpen && !!searchedItems?.data}
          anchorEl={searchAreaRef.current}
          placement={properPosition}
          disablePortal
          modifiers={[
            {
              name: 'zIndex',
              enabled: true,
              phase: 'write',
              fn({ state }) {
                state.styles.popper.zIndex = 2000 // có thể dùng bất kỳ số nào bạn muốn
              },
            },
          ]}
        >
          {isErrorSearch
            ? <Typography variant='body1'>Đã có lỗi xảy ra khi tìm kiếm, vui lòng thử lại sau</Typography>
            : (
              searchedItems?.data?.total > 0
                ? <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table >
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã</TableCell>
                        <TableCell>Giá trị</TableCell>
                        <TableCell>Còn lại</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchedItems?.data?.vouchers?.map((item) => (
                        <TableRow
                          key={item._id}
                          onClick={() => {
                            onItemClick(item)
                            setIsResultPropperOpen(false)
                          }}
                          sx={{
                            cursor: 'pointer', // Biến thành con trỏ khi hover
                            '&:hover': { backgroundColor: '#b3b3b3cc' }, // Đổi màu khi hover
                          }}
                        >
                          <TableCell>{item.VOUCHER_CODE}</TableCell>
                          <TableCell>{`${item.TYPE === 'PERCENTAGE' ? `${item.VALUE}% (tối đa: ${formatCurrency(item.MAX_DISCOUNT)})` : `${formatCurrency(item.VALUE)} VND`} `}</TableCell>
                          <TableCell>{item.QUANTITY - item.NUMBER_USING}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                : <Box sx={{ backgroundColor: 'white', mt: 1, minWidth: '300px' }}>
                  <SearchResultNotFound message='Không tìm thấy kết quả' />
                </Box>
            )
          }
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}

export default SearchVoucherInput