import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  CardMedia,
  Stack,
  Tooltip
} from '@mui/material'
import { Add, Remove, ShoppingCart, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import itemService from '~/service/admin/item.service'
import cartService from '~/service/customer/cart.service'
import { defaultImage } from '~/assets/images'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import { useNavigate } from 'react-router-dom'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useEffect } from 'react'
import { useTheme } from '@mui/material'
import DOMPurify from 'dompurify'
import { toast } from 'react-toastify'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { addCartThunk } from '~/redux/thunks/cart.thunk'

export default function DetailItem() {
  const theme = useTheme()
  const { id } = useParams()
  const [qty, setQty] = useState(1)
  const dec = () => setQty((n) => Math.max(1, n - 1))
  const inc = () => setQty((n) => n + 1)
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const cleanHTML = (html) => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [id])
  const { data, isLoading } = useQuery({
    queryKey: ['item-detail', id],
    queryFn: () => itemService.search({
      user_id,
      device_id,
    }, {
      itemId: id
    }),
    enabled: !!id,
  })
  // console.log('data: ', data)
  const handleAddToCart = () => {
    dispatch(addCartThunk({
      itemCode: item.ITEM_CODE,
      quantity: qty,
      credential: { user_id, device_id }
    }))
      .unwrap()
      .then(() => toast.success('Đã thêm vào giỏ hàng!'))
      .catch((err) => {
        console.error('Lỗi thêm giỏ hàng:', err)
        toast.error(typeof err === 'string' ? err : 'Thêm vào giỏ hàng thất bại!')
      })

  }


  const item = data?.data?.items?.[0] || {}
  
  const avatar = item.AVATAR_IMAGE_URL || null
  console.log(avatar)
  const thumbnails = avatar ? [avatar] : []
  item.LIST_IMAGE?.map(i => thumbnails.push(i.URL))
  const price = item.PRICE?.at(-1)?.PRICE_AMOUNT ?? 0
  // console.log('avatar: ', avatar)
  console.log('thumbnails', thumbnails)
  const vouchers = item.LIST_VOUCHER_ACTIVE || []
  const bestDiscount = vouchers.reduce((max, v) => {
    let d = v.TYPE === 'FIXED_AMOUNT'
      ? (v.MAX_DISCOUNT ? Math.min(v.VALUE, v.MAX_DISCOUNT) : v.VALUE)
      : (v.MAX_DISCOUNT ? Math.min((price * v.VALUE / 100), v.MAX_DISCOUNT) : price * v.VALUE / 100)
    return Math.max(max, d)
  }, 0)

  const finalPrice = Math.max(price - bestDiscount, 0)

  const [selectedImage, setSelectedImage] = useState(defaultImage)
  useEffect(() => {
    setSelectedImage(avatar)
  }, [id, avatar])
  const scrollRef = useRef(null)
  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -100 : 100, behavior: 'smooth' })
    }
  }
  const { data: relatedData, isFetching: relatedLoading, } = useQuery({
    queryKey: ['related-products', item?.ITEM_TYPE, item?._id],
    enabled: !!item?._id && !!item?.ITEM_TYPE,
    queryFn: () =>
      itemService.search({}, {
        page: 1,
        size: 8,
        isProduct: true,
        isActive: true,
        itemTypeId: item.ITEM_TYPE,
      }),
    staleTime: 0,
  })
  const relatedItems = relatedData?.data?.items?.filter(p => p._id !== item._id) || []

  const queryClient = useQueryClient()
  const addCartMutation = useMutation({
    mutationFn: (payload) => cartService.addCart({ user_id, device_id, }, payload),
    onSuccess: () => {
      // toast.success('Đã thêm vào giỏ hàng!')
      queryClient.invalidateQueries({ queryKey: ['cart', user_id, device_id,] })
    },
    // onError: () => toast.error('Thêm vào giỏ hàng thất bại!'),
  })
  const getLatestPrice = (product) => {
    if (!Array.isArray(product.PRICE) || product.PRICE.length === 0) return 0
    const latest = product.PRICE.reduce((latest, current) =>
      new Date(current.FROM_DATE) > new Date(latest.FROM_DATE) ? current : latest
    )
    return latest.PRICE_AMOUNT ?? 0
  }


  const IMG_H = { xs: 280, md: 400 }
  const THUMB = { xs: 48, sm: 60 }
  console.log(item)
  return (
    <>
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 4 },
          maxWidth: 1200,
          mx: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 4 },
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Box sx={{ width: { xs: '100%', md: 400 } }}>
          <Box sx={{ width: '100%', height: { xs:240, md:400 }, maxHeight: { xs: '60vh', md: 400 }, borderRadius: 2, overflow: 'hidden', mb: { xs: 0.5, md: 1 } }}>
            <CardMedia
              component="img"
              image={selectedImage }
              alt={item.ITEM_NAME}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: 2,
              }}
            />
          </Box>

          <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
            <IconButton onClick={() => scroll('left')} sx={navBtnStyle}><ArrowBackIos fontSize="small" /></IconButton>

            <Box
              ref={scrollRef}
              sx={{
                overflowX: 'auto',
                display: 'flex',
                gap: 1,
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
              }}
            >
              {thumbnails.map((url, i) => (
                <Box
                  key={i}
                  onClick={() => setSelectedImage(url)}
                  sx={{
                    width: THUMB, height: THUMB,
                    border: selectedImage === url
                      ? `2px solid ${theme.palette.primary.main}`
                      : `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    flexShrink: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <img src={url} alt={`thumb-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>

            <IconButton onClick={() => scroll('right')} sx={{ ...navBtnStyle, right: 0, left: 'auto' }}>
              <ArrowForwardIos fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>{item.ITEM_NAME}</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h5" fontWeight={700} color="error.main">
              ₫{finalPrice.toLocaleString()}
            </Typography>
            {bestDiscount > 0 && (
              <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                ₫{price.toLocaleString()}
              </Typography>
            )}
          </Box>

          {/* Voucher */}
          {vouchers.length > 0 && (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
              my={2} >
              <Typography variant="body2" color="text.secondary" mb={1} sx={{ whiteSpace: 'nowrap' }}>Voucher Của Shop</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {vouchers.map((v) => {
                  const isPct = v.TYPE === 'PERCENTAGE'
                  const label = isPct
                    ? `Giảm ${v.VALUE}%`
                    : `Giảm ${v.VALUE.toLocaleString()}₫`

                  const tip = isPct
                    ? `Giảm tối đa ${v.MAX_DISCOUNT?.toLocaleString() ?? 0}₫`
                    : `Giảm trực tiếp ${v.VALUE.toLocaleString()}₫`

                  return (
                    <Tooltip key={v._id} title={tip} arrow>
                      <Chip
                        label={label}
                        clickable
                        size="small"
                        sx={{
                          bgcolor: 'secondary.main',
                          color: 'secondary.contrastText',
                          fontWeight: 700,
                          borderRadius: 20,
                          lineHeight: 1,
                          cursor: 'pointer',
                        }}
                      />
                    </Tooltip>
                  )
                })}
              </Stack>
            </Stack>
          )}

          {/* Mô tả */}
          {item.DESCRIPTION && (
            <Box
              sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6, maxHeight:{ xs:160, md:'none' }, overflowY:{ xs:'auto', md:'visible' } }}
              dangerouslySetInnerHTML={{ __html: cleanHTML(item.DESCRIPTION) }}
            />
          )}

          {/* Số lượng */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography sx={{ minWidth: 80, color: 'text.secondary', }}>Số Lượng</Typography>
            <Box sx={{
              display: 'flex', alignItems: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 20,
              height: 36,
            }}>
              <IconButton onClick={dec} disabled={qty === 1} size="small"><Remove fontSize="small" /></IconButton>
              <Typography sx={{ width: 40, textAlign: 'center', fontWeight: 700, color: 'error.main' }}>{qty}</Typography>
              <IconButton onClick={inc} size="small"><Add fontSize="small" /></IconButton>
            </Box>
          </Box>

          {/* Nút hành động */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ShoppingCart />}
              color="primary"
              fullWidth
              sx={{ py: 1, fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 700 }}
              onClick={handleAddToCart}
              disabled={addCartMutation.isLoading}
            >
              {addCartMutation.isLoading ? 'Đang thêm…' : 'Thêm Vào Giỏ Hàng'}
            </Button>
            {/*
            <Button variant="contained" size="large" color="primary" sx={{ px: 5, width:{ xs:'100%', md:'auto' },whiteSpace:'nowrap' }}>
              Mua Ngay
            </Button> */}
          </Box>
        </Box>

      </Box>
      { /*các sản phẩm liên  quan*/}
      {!relatedLoading && relatedItems.length > 0 && (
        <Box sx={{ py: 5, bgcolor: theme.palette.background.default }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 0 } }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              SẢN PHẨM LIÊN QUAN
            </Typography>

            <Slider
              key={item._id}
              dots={false}
              infinite={false}
              speed={500}
              slidesToShow={4}
              slidesToScroll={1}
              responsive={[
                { breakpoint: 960, settings: { slidesToShow: 2 } },
                { breakpoint: 600, settings: { slidesToShow: 1 } },
              ]}
            >
              {relatedItems.map(p => {
                const base = getLatestPrice(p)

                const bestDisc = (p.LIST_VOUCHER_ACTIVE ?? []).reduce((max, v) => {
                  let d = 0
                  if (v.TYPE === 'FIXED_AMOUNT') {
                    d = v.MAX_DISCOUNT ? Math.min(v.VALUE, v.MAX_DISCOUNT) : v.VALUE
                  } else if (v.TYPE === 'PERCENTAGE') {
                    const raw = base * v.VALUE / 100
                    d = v.MAX_DISCOUNT ? Math.min(raw, v.MAX_DISCOUNT) : raw
                  }
                  return Math.max(max, d)
                }, 0)

                const final = Math.max(base - bestDisc, 0)

                return (
                  <Box key={p._id} sx={{ px: 1, height: { xs:220, sm:240 }, display: 'flex' }}>
                    <Box
                      onClick={() => navigate(`/customer/detail-Item/${p._id}`)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        flexGrow: 1,
                      }}
                    >
                      <Box
                        sx={{
                          height: 160,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={p.AVATAR_IMAGE_URL || p.LIST_IMAGE?.[0]?.URL || defaultImage}
                          alt={p.ITEM_NAME}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </Box>

                      {/* NỘI DUNG */}
                      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <Typography variant="body2" noWrap>{p.ITEM_NAME}</Typography>

                        <Box sx={{ mt: 'auto' }}>
                          {bestDisc > 0 ? (
                            <>
                              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                ₫{base.toLocaleString()}
                              </Typography>
                              <Typography variant="subtitle2" fontWeight={700} color="error.main">
                                ₫{final.toLocaleString()}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="subtitle2" fontWeight={700} color="error.main">
                              ₫{base.toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )
              })}

            </Slider>
          </Box>
        </Box>
      )}

    </>
  )
}
const navBtnStyle = {
  position: 'absolute',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  width: 32,
  height: 32,
  backgroundColor: 'rgba(255,255,255,0.9)',
  border: '1px solid #ddd',
  display:{ xs:'none', md:'flex' }
}
