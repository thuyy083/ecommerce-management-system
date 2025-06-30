import React, { useState, useRef } from 'react'
import {
  Badge, IconButton, Popper, Typography, Box, Divider, Button, Paper, useMediaQuery
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { defaultImage } from '~/assets/images'
import { createSelector } from '@reduxjs/toolkit'
import { useTheme } from '@mui/material/styles'

export default function MiniCart() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const selectCartItems = createSelector(
    state => state.cart.items,
    items => items ?? []
  )

  const cartItems = useSelector(selectCartItems)
  const totalQty = cartItems.reduce((sum, i) => sum + (i.QUANTITY ?? 0), 0)

  const anchorRef = useRef(null)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleMouseEnter = () => !isMobile && setOpen(true)
  const handleMouseLeave = () => !isMobile && setOpen(false)

  const handleClick = () => {
    if (isMobile) {
      navigate('/customer/cart')
    } else {
      setOpen(false)
      navigate('/customer/cart')
    }
  }

  return (
    <Box sx={{ display: 'inline-block' }} onMouseLeave={handleMouseLeave}>
      {/* ICON CART */}
      <Box ref={anchorRef} onMouseEnter={handleMouseEnter}>
        <IconButton color="inherit" onClick={handleClick}>
          <Badge badgeContent={totalQty} color="success">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Box>

      {/* POPOVER CART */}
      {!isMobile && (
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-end"
          disablePortal
          style={{ zIndex: 1300 }}
        >
          <Paper
            onClick={() => {
              setOpen(false)
              navigate('/customer/cart')
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
              width: 320,
              mt: 1,
              maxWidth: '90vw', // responsive fallback
            }}
          >
            <Box p={2} maxHeight={350} overflow="auto">
              <Typography variant="subtitle2" mb={1}>
                Giỏ hàng ({totalQty})
              </Typography>
              <Divider />
              {cartItems.length === 0 ? (
                <Typography my={2} textAlign="center" color="text.secondary">
                  Giỏ hàng trống
                </Typography>
              ) : (
                cartItems.slice(0, 5).map((p, idx) => (
                  <Box key={`${p.ITEM_CODE}-${idx}`} display="flex" my={1.5}>
                    <Box
                      component="img"
                      src={p.ITEM_AVATAR || defaultImage}
                      alt={p.ITEM_NAME}
                      sx={{
                        width: 56,
                        height: 56,
                        objectFit: 'cover',
                        mr: 1,
                        borderRadius: 1,
                      }}
                    />
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" noWrap>{p.ITEM_NAME}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        x{p.QUANTITY}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>
                      ₫{p.ITEM_DISCOUNTED_PRICE.toLocaleString()}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>

            {cartItems.length > 0 && (
              <>
                <Divider />
                <Box p={1.5}>
                  <Button
                    fullWidth variant="contained" size="small"
                    onClick={() => {
                      setOpen(false)
                      navigate('/customer/cart')
                    }}
                  >
                    Xem giỏ hàng
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Popper>
      )}
    </Box>
  )
}
