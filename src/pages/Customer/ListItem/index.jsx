import {
  Box, Typography, InputBase, IconButton, Grid, Paper, FormControl,
  InputLabel, Select, MenuItem, Card, CardContent, CardMedia
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import { useState, useMemo } from 'react'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import OutlinedInput from '@mui/material/OutlinedInput'
import { useQuery } from '@tanstack/react-query'
import itemService from '~/service/admin/item.service'
import itemTypeService from '~/service/admin/itemType.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import { useNavigate } from 'react-router-dom'


export default function ListItemPage() {
  const theme = useTheme()
  const [keyword, setKeyword] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemTypeId, setItemTypeId] = useState('')
  const navigate = useNavigate()
  const pageSize = 10

  const { userId } = useUserInfo()
  const deviceId = useDeviceId()
  const credential = useMemo(() => ({ user_id: userId, device_id: deviceId }), [userId, deviceId])
  const { data: itemTypeRes } = useQuery({
    queryKey: ['item-types'],
    queryFn: () => itemTypeService.search(credential),
  })
  const { data, isLoading } = useQuery({
    queryKey: ['items', currentPage, keyword, priceMin, priceMax, itemTypeId],
    queryFn: () => itemService.search(credential, {
      page: currentPage,
      size: pageSize,
      search: keyword,
      minPrice: priceMin || null,
      maxPrice: priceMax || null,
      itemTypeId: itemTypeId || null,
      isProduct: true
    }),
    keepPreviousData: true
  })


  const items = data?.data?.items ?? []
  const total = data?.data?.total ?? 0
  const itemTypes = useMemo(() => {
    const list = itemTypeRes?.data?.itemTypes ?? []
    return list.filter(t => t._id !== '68301f9e3419c27dd30d89be')
  }, [itemTypeRes])

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Thanh tìm kiếm */}
      <Box sx={{ maxWidth: 1196, mx: 'auto', px:{ xs:1, md:0 } }}>
        <Paper component="form" sx={{ px: { xs:1, md:2 }, py: 0.5, display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 2 }}>
          <InputBase
            placeholder="Tìm sản phẩm..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            sx={{ ml: 1, flex: 1 }}
          />
          <IconButton type="submit" sx={{ p: 1 }} onClick={(e) => { e.preventDefault(); setCurrentPage(1) }}>
            <SearchIcon color="primary" />
          </IconButton>
        </Paper>
      </Box>

      {/* Bộ lọc */}
      <Box sx={{ px: { xs:1, md:4 }, mt: 2, mb: 4, display: 'flex', flexDirection:{ xs:'column', sm:'row' }, alignItems:{ xs:'stretch', sm:'center' }, gap:2 }}>
        <Typography variant="body1" sx={{ minWidth: { xs:'auto', sm:140 }, fontWeight: 500 }}>Sắp xếp theo loại</Typography>
        <FormControl size="small" sx={{ minWidth:{ xs:'100%', sm:160 } }}>
          <InputLabel>Loại sản phẩm</InputLabel>
          <Select
            label="Loại sản phẩm"
            value={itemTypeId}
            onChange={e => {
              setItemTypeId(e.target.value)
              setCurrentPage(1)
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {itemTypes.map(t => (
              <MenuItem key={t._id} value={t._id}>
                {t.ITEM_TYPE_NAME}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width:{ xs:'100%', sm:120 } }}>
          <InputLabel>Giá từ</InputLabel>
          <OutlinedInput
            label="Giá từ"
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
        </FormControl>
        <Typography sx={{ mx: 1 }}>-</Typography>
        <FormControl size="small" sx={{ width: { xs:'100%', sm:120 } }}>
          <InputLabel>Giá đến</InputLabel>
          <OutlinedInput
            label="Giá đến"
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </FormControl>
      </Box>

      {/* Danh sách sản phẩm */}
      <Box sx={{ px: { xs:1, md:4 }, mt: 3 }}>
        <Grid container columnSpacing={{ xs:2, md:3 }} rowSpacing={3} sx={{ maxWidth: 1196, mx: 'auto' }}>
          {isLoading ? 'Loading...' : items.map((p) => {
            const basePrice = p.PRICE?.at(-1)?.PRICE_AMOUNT ?? 0
            const bestVoucher = p.LIST_VOUCHER_ACTIVE?.[0]
            const discount = bestVoucher?.TYPE === 'PERCENTAGE'
              ? Math.min(basePrice * bestVoucher.VALUE / 100, bestVoucher.MAX_DISCOUNT ?? Infinity)
              : bestVoucher?.VALUE ?? 0
            const finalPrice = basePrice - discount
            return (
              <Grid item key={p.ITEM_CODE} xs={6} sm={4} md={3} lg={2}>
                <Card
                  onClick={() => navigate(`/customer/detail-Item/${p._id}`)}
                  sx={{ cursor: 'pointer', width: 197, height: { xs:260, md:300 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid', borderColor: theme.palette.primary.main, borderRadius: 2, position: 'relative', overflow: 'hidden', boxShadow: 3, bgcolor: theme.palette.background.default }}>
                  {discount > 0 && (
                    <Box sx={{ position: 'absolute', top: 10, right: -40, bgcolor: 'primary.main', color: 'white', transform: 'rotate(45deg)', fontSize: 12, fontWeight: 'bold', width: 120, textAlign: 'center', zIndex: 1 }}>
                      -{discount.toLocaleString()}₫
                    </Box>
                  )}
                  <CardMedia
                    component="img"
                    image={p.AVATAR_IMAGE_URL}
                    alt={p.ITEM_NAME}
                    sx={{ width: '100%', height: { xs:140, md:180 }, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flex: 1, px: 2, pt: 1.5, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ lineHeight: 1.4, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8em' }}>
                      {p.ITEM_NAME}
                    </Typography>
                    <Box sx={{ mt: 1, height: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      {discount > 0 ? (
                        <>
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#666', fontSize: 13 }}>
                            {basePrice.toLocaleString()}₫
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main', fontSize: 14 }}>
                            {finalPrice.toLocaleString()}₫
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main', fontSize: 14 }}>
                          {basePrice.toLocaleString()}₫
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(total / pageSize)}
            page={currentPage}
            onChange={(e, value) => {
              setCurrentPage(value)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            shape="rounded"
            color="primary"
          />
        </Box>
      </Box>
    </Box>
  )
}
