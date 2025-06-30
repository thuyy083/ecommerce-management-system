// src/pages/Admin/Vouchers/create/index.jsx
import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import vouchersService from '~/service/admin/vouchers.service'
import VoucherForm from '../form'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'
import { toast } from 'react-toastify'
import { findBreadcrumbs, routeTree } from '~/config/routeTree'
import { Box, Button, Typography } from '@mui/material'


export default function VoucherCreate() {
  const location = useLocation()
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()
  const navigate = useNavigate()
  const breadcrumbs = findBreadcrumbs(location.pathname, routeTree)
  const mutation = useMutation({
    mutationFn: (data) => vouchersService.createVoucher({ device_id, user_id, }, data),
    onSuccess: (response) => {
      const createdVoucherCode = response.data.VOUCHER_CODE
      navigate(`/admin/vouchers/${createdVoucherCode}`)
      toast.success('Tạo voucher thành công!')
    },
    onError: (error) => {
      console.error(error)
      const message = error.response?.data?.message || 'Tạo voucher thất bại!'
      toast.error(message)
    }
  })


  const handleSubmitVoucher = async (data) => {
    mutation.mutate(data)
  }

  return (
    <Box sx={{ minHeight: '700px' }}>
      <Box sx={{ mb: 2 }}>
        {breadcrumbs.map((item, index) => (
          <Button
            key={index}
            variant="text"
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
      <VoucherForm
        submit={handleSubmitVoucher}
        isSubmitting={mutation.isLoading}
      />
    </Box>
  )
}
