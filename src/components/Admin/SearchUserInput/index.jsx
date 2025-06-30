import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
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

import SearchResultNotFound from '~/components/Error/SearchResultNotFond'
import userService from '~/service/user.service'


function SearchUserInput({ onItemClick, properPosition = 'bottom-start', inputSize = 'small', placeholder = '' }) {
  const [searchValue, setSearchValue] = useState('')
  const searchValueDebounce = useDebounce(searchValue, 1000)
  const searchAreaRef = useRef(null)
  const [isResultPropperOpen, setIsResultPropperOpen] = useState(false)
  const { userId: user_id } = useUserInfo()
  const device_id = useDeviceId()

  const { data: searchedItem, isLoading: isLoadingSearchedItem, isError: isErrorSearch, } = useQuery({
    enabled: !!user_id && !!device_id && !!searchValueDebounce,
    queryKey: ['searchedUsers', searchValueDebounce],
    queryFn: () => userService.search({
      user_id,
      device_id,
    }, {
      search: searchValueDebounce,
      size: 5
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
                    <Box width={30} sx={{ display: 'flex', alignItems: 'center' }}>
                      {searchValue && (
                        isLoadingSearchedItem
                          ? <CircularProgress />
                          : <IconButton onClick={handleClear}>
                            <CloseIcon />
                          </IconButton>
                      )}
                    </Box>
                  </InputAdornment>
                )
              }
            }}
            size={inputSize}
            value={searchValue}
            onChange={handleSearchInput}
            onFocus={() => setIsResultPropperOpen(true)}
            fullWidth
            placeholder={placeholder}
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
                        <TableCell></TableCell>
                        <TableCell>Tên</TableCell>
                        <TableCell>Email</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchedItem?.data?.users?.map((item) => (
                        <TableRow
                          key={item._id}
                          onClick={() => {
                            console.log(item)
                            onItemClick(item)
                            setIsResultPropperOpen(false)
                          }}
                          sx={{
                            cursor: 'pointer', // Biến thành con trỏ khi hover
                            '&:hover': { backgroundColor: '#b3b3b3cc' }, // Đổi màu khi hover
                          }}
                        >
                          <TableCell><Avatar alt={item.LIST_NAME?.at(-1).FIRST_NAME} src={item.AVATAR_IMG_URL} /></TableCell>
                          <TableCell>{item.LIST_NAME?.at(-1).FULL_NAME}</TableCell>
                          <TableCell>{item.LIST_EMAIL?.at(-1).EMAIL}</TableCell>
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

export default SearchUserInput