import React, { useMemo, useState } from 'react'
import {
  Box, Typography, Container, Card, CardActionArea,
  CardContent, CardMedia, Grid, Tabs, Tab, CircularProgress, useTheme, Pagination
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import Slider from 'react-slick'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import { banner1, banner2, banner3, defaultImage } from '~/assets/images'
import itemService from '~/service/admin/item.service'
import itemTypeService from '~/service/admin/itemType.service'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import { useNavigate } from 'react-router-dom'

const useSaleProducts = (cred) =>
  useQuery({
    queryKey: ['sale-products'],
    queryFn: async () => {
      const pageSize = 10
      const totalPages = 3

      const allPages = await Promise.all(
        Array.from({ length: totalPages }, (_, i) =>
          itemService.search(cred, {
            page: i + 1,
            size: pageSize,
            isActive: true,
            isProduct: true,
          })
        )
      )

      const allItems = allPages.flatMap((res) => res.data.items)

      return {
        items: allItems.filter((p) => p.LIST_VOUCHER_ACTIVE?.length > 0),
      }
    },
  })


const useCategories = (cred) =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => itemTypeService.search(cred),
  })

const useProductsByCategory = (cred, id, page) =>
  useQuery({
    queryKey: ['category-products', id ?? 'all', page],
    enabled: !!cred,
    queryFn: () =>
      itemService.search(cred, {
        page,
        size: 5,
        isProduct: true,
        isActive: true,
        ...(id ? { itemTypeId: id } : {}),
      }),
  })

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  autoplay: true,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  pauseOnHover: false,
}

const HomePage = () => {
  const device_id = useDeviceId()
  const { userId } = useUserInfo()
  const cred = useMemo(() => ({ user_id: userId ?? '', device_id }), [userId, device_id])
  const navigate = useNavigate()

  const theme = useTheme()
  const CARD_W = { xs: 140, md: 200 }
  const CARD_H = { xs: 250, md: 300 }
  const IMG_H = { xs: 150, md: 180 }
  const { data: saleData, isLoading: saleLoading } = useSaleProducts(cred)
  const { data: catData, isLoading: catLoading } = useCategories(cred)

  const categories = useMemo(() => {
    if (!catData?.data?.itemTypes) return []
    return catData.data.itemTypes.filter(
      (t) => t._id !== '68301f9e3419c27dd30d89be'
    )
  }, [catData])


  const [activeCat, setActiveCat] = useState('')
  const [catPage, setCatPage] = useState(1)
  const { data: catProdData, isLoading: catProdLoading } =
    useProductsByCategory(cred, activeCat, catPage)

  const getBasePrice = (product) => {
    if (!Array.isArray(product.PRICE) || product.PRICE.length === 0) return 0

    const latest = product.PRICE.reduce((latest, current) => {
      const latestDate = new Date(latest.FROM_DATE)
      const currentDate = new Date(current.FROM_DATE)
      return currentDate > latestDate ? current : latest
    })

    return latest.PRICE_AMOUNT ?? 0
  }


  const applyVoucher = (price, voucher) => {
    if (!voucher) return { final: price, discount: 0 }

    let discount = 0
    if (voucher.TYPE === 'FIXED_AMOUNT') {
      discount = voucher.MAX_DISCOUNT
        ? Math.min(voucher.VALUE, voucher.MAX_DISCOUNT)
        : voucher.VALUE
    } else if (voucher.TYPE === 'PERCENTAGE') {
      const raw = price * (voucher.VALUE / 100)
      discount = voucher.MAX_DISCOUNT ? Math.min(raw, voucher.MAX_DISCOUNT) : raw
    }
    return { final: Math.max(price - discount, 0), discount }
  }

  const getBestPriceInfo = (product) => {
    const price = getBasePrice(product)
    const vouchers = product.LIST_VOUCHER_ACTIVE ?? []

    if (vouchers.length === 0) return { finalPrice: price, bestDiscount: 0 }

    return vouchers.reduce(
      (best, v) => {
        const { final, discount } = applyVoucher(price, v)
        return final < best.finalPrice
          ? { finalPrice: final, bestDiscount: discount }
          : best
      },
      { finalPrice: price, bestDiscount: 0 }
    )
  }


  /* product card */
  const renderCard = (p) => {
    const basePrice = getBasePrice(p)

    const { finalPrice, bestDiscount } = getBestPriceInfo(p)

    return (
      <Grid
        item
        sx={{
          flex: `0 0 ${CARD_W}`,
          maxWidth: CARD_W,
        }}
        key={p._id}
      >
        <Card
          sx={{
            width: CARD_W,
            height: CARD_H,
            // borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.03)',
            },
            position: 'relative',
            overflow: 'hidden',
            border: `2px solid ${theme.palette.primary.main}`,
            backgroundColor: theme.palette.background.whiteSpace,
            boxShadow: bestDiscount > 0 ? 6 : 2,
            p: 0
          }}
        >
          <CardActionArea onClick={() => navigate(`/customer/detail-Item/${p._id}`)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              height: '100%',
            }}
          >
            {bestDiscount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: -40,
                  bgcolor: '#FF90BB',
                  color: theme.palette.secondary.contrastText,
                  // px: 1.5,
                  // py: 0.5,
                  transform: 'rotate(45deg)',
                  fontSize: 12,
                  fontWeight: 'bold',
                  width: 125,
                  textAlign: 'center',
                  zIndex: 1,
                  // boxShadow: 3,
                }}
              >
                -{bestDiscount.toLocaleString()}₫
              </Box>
            )}


            {/* Hình ảnh sản phẩm */}
            <CardMedia
              component="img"
              image={p.AVATAR_IMAGE_URL || p.LIST_IMAGE?.[0]?.URL || defaultImage}
              alt={p.ITEM_NAME}
              sx={{
                width: '100%',
                height: IMG_H,
                objectFit: 'cover',
              }}
            />

            {/* Nội dung */}
            <CardContent
              sx={{
                flexGrow: 1,
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: theme.palette.background.default,
              }}
            >
              {/* Tên sản phẩm */}
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color="primary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.25,
                  height: '2.5em',
                }}
              >
                {p.ITEM_NAME}
              </Typography>

              {/* Giá */}
              <Box mt={1}>
                {bestDiscount > 0 ? (
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: 'line-through',
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {basePrice.toLocaleString()}₫
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.success.main,
                      }}
                    >
                      {finalPrice.toLocaleString()}₫
                    </Typography>
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {basePrice.toLocaleString()}₫
                  </Typography>
                )}
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    )
  }


  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* ---------- Banner carousel ---------- */}
      <Slider {...sliderSettings}>
        {[banner1, banner2, banner3].map((src) => (
          <Box key={src} sx={{ width: '100%' }}>
            <Box
              component="img"
              src={src}
              alt="banner"
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                maxHeight: { xs: 300, md: 500 },
              }}
            />
          </Box>
        ))}
      </Slider>

      {/* ---------- Marquee ---------- */}
      <Box sx={{ bgcolor: theme.palette.secondary.main, py: 1 }}>
        <Typography
          component="marquee"
          sx={{ color: '#fff', fontWeight: 600, fontSize: { xs: 13, md: 16 }, whiteSpace: 'nowrap' }}
        >
          5TRENDZ là shop thời trang trẻ trung, năng động, chuyên cập nhật các xu hướng mới nhất. Sản phẩm đa dạng từ streetwear cá tính đến đồ thanh lịch, đảm bảo chất lượng và giá cả hợp lý cho giới trẻ.
        </Typography>
      </Box>

      {/* ---------- Sale products ---------- */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography
          variant="h5"
          fontWeight={700}
          mb={3}
          color="primary.main"
          textAlign={{ xs: 'center', md: 'left' }}
        >
          Sản phẩm đang khuyến mãi
        </Typography>

        {saleLoading ? (
          <Box textAlign="center"><CircularProgress /></Box>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {saleData?.items?.slice(0, 8).map(renderCard)
            }
          </Grid>

        )}
      </Container>

      {/* ---------- Category products ---------- */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography
          variant="h5"
          fontWeight={700}
          mb={3}
          color="primary.main"
          textAlign={{ xs: 'center', md: 'left' }}
        >
          Sản phẩm theo danh mục
        </Typography>

        {catLoading ? (
          <Box textAlign="center"><CircularProgress /></Box>
        ) : (
          <Tabs
            value={activeCat}
            onChange={(_, v) => {
              setActiveCat(v)
              setCatPage(1)
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, '.MuiTab-root': { fontSize: { xs: 12, md: 14 } } }}
          >
            <Tab value="" label="Tất cả" />
            {categories.map((c) => (
              <Tab key={c._id} value={c._id} label={c.ITEM_TYPE_NAME} />
            ))}
          </Tabs>
        )}

        {catProdLoading ? (
          <Box textAlign="center"><CircularProgress /></Box>
        ) : (
          <>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {catProdData?.data?.items?.map(renderCard)}
            </Grid>

            {catProdData?.data?.total > catProdData.data.limit && (
              <Box mt={4} display="flex" justifyContent="center">
                <Pagination
                  count={Math.ceil(catProdData.data.total / catProdData.data.limit)}
                  page={catPage}
                  onChange={(_, value) => setCatPage(value)}
                  color="primary"
                  siblingCount={1}
                  boundaryCount={1}
                />
              </Box>
            )}


          </>
        )}
      </Container>


    </Box>
  )
}

export default HomePage
