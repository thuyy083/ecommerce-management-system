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

import itemService from '~/service/admin/item.service'
import itemTypeService from '~/service/admin/itemType.service'
import { formatCurrency } from '~/utils/formatter'
import SearchResultNotFound from '~/components/Error/SearchResultNotFond'


function SearchItemInput({ onItemClick, properPosition = 'bottom-start', inputSize = 'small', searchOption = 'all' }) {
  const [option, setOption] = useState(searchOption)
  const [searchValue, setSearchValue] = useState('')
  const searchValueDebounce = useDebounce(searchValue, 1000)
  const searchAreaRef = useRef(null)
  const [isResultPropperOpen, setIsResultPropperOpen] = useState(false)
  const { userId: user_id } = useUserInfo()
  const device_id = useDeviceId()
  const { data: dataMaterialItemType } = useQuery({
    enabled: !!user_id && !!device_id,
    queryKey: ['materialItems'],
    queryFn: () => itemTypeService.findOneByName({
      user_id,
      device_id
    }, 'Nguyên liệu'),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5
  })

  const { data: searchedItem, isLoading: isLoadingSearchedItem, isError: isErrorSearch, } = useQuery({
    enabled: !!user_id && !!device_id && !!dataMaterialItemType && !!searchValueDebounce,
    queryKey: ['searchedItem', searchValueDebounce],
    queryFn: () => itemService.search({
      user_id,
      device_id,
    }, {
      itemTypeId: option === 'material' ? dataMaterialItemType?.data?._id : undefined,
      search: searchValueDebounce,
      size: 5,
      isProduct: option === 'product' ? true : undefined
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
    <ClickAwayListener onClickAway={handleClickAway} >
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
                        <MenuItem value="all">Tất cả </MenuItem>
                        <MenuItem value="material">Nguyên liệu</MenuItem>
                        <MenuItem value="product">Sản phẩm</MenuItem>
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
            placeholder='Nhập tên hoặc mã hàng'
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
          open={isResultPropperOpen && !!searchedItem?.data}
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
              searchedItem?.data?.total > 0
                ? <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table >
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Giá</TableCell>
                        <TableCell>Tồn kho</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchedItem?.data?.items?.map((item) => (
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
                          <TableCell>{item.ITEM_CODE}</TableCell>
                          <TableCell>{item.ITEM_NAME}</TableCell>
                          <TableCell>{`${formatCurrency(item.PRICE[item.PRICE.length - 1]?.PRICE_AMOUNT)} ${item.PRICE[item.PRICE.length - 1]?.UNIT_ABB}`}</TableCell>
                          <TableCell>{`${item.ITEM_STOCKS.QUANTITY} ${item.UNIT_NAME}`}</TableCell>
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

export default SearchItemInput