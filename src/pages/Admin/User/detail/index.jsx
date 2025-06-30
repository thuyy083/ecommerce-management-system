import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Box, Typography, Paper, Avatar, Grid, Chip, CircularProgress, Button, FormControlLabel, Switch, TextField } from '@mui/material'
import userService from '~/service/user.service'
import accountService from '~/service/admin/account.service'
import dayjs from 'dayjs'
import { useDeviceId } from '~/hooks/useDeviceId'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const UserDetailPage = () => {
  const { id } = useParams()
  console.log('ID từ URL:', id)

  const deviceId = useDeviceId()
  const userId = useSelector(state => state.user.currentUser?.USER_ID)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userDetail', id],
    queryFn: () =>
      userService.getUserDetail(id, {
        user_id: userId,
        device_id: deviceId
      }),
    enabled: !!deviceId && !!userId
  })
  const user = data?.data?.user_data
  const name = user?.NAME || {}
  const phone = user?.PHONE_NUMBER || {}
  const address = user?.ADDRESS || {}
  const role = user?.ROLE || {}
  const [deactivationReason, setDeactivationReason] = useState('')
  const [suppendedReason, setSuppendedReason] = useState('')
  const [confirmSuspend, setConfirmSuspend] = useState('')

  console.log('user: ', user)

  const [roles, setRoles] = useState({
    isManager: role.IS_MANAGER || false,
    isServiceStaff: role.IS_SERVICE_STAFF || false,
    isCustomer: role.IS_CUSTOMER || false
  })
  useEffect(() => {
    if (role) {
      setRoles({
        isManager: role.IS_MANAGER || false,
        isServiceStaff: role.IS_SERVICE_STAFF || false,
        isCustomer: role.IS_CUSTOMER || false
      })
    }
  }, [role])
  console.log(' roles.isManager: ', roles.isManager, ' roles.isCustomer: ', roles.isCustomer, ' roles.isServiceStaff: ', roles.isServiceStaff)

  const toggleRole = (key) => {
    setRoles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const updateRoleMutation = useMutation({
    mutationFn: () =>
      userService.updateUserRole(id,
        {
          user_id: userId,
          device_id: deviceId
        },
        {
          isManager: roles.isManager.toString(),
          isServiceStaff: roles.isServiceStaff.toString(),
          isCustomer: roles.isCustomer.toString()
        }),
    onSuccess: () => {
      toast.success('Cập nhật vai trò thành công')
      refetch()
    },
    onError: () => {
      toast.error('Cập nhật vai trò thất bại')
    }
  })

  const mutation = useMutation({
    mutationFn: ({ isActive, banReason }) =>
      accountService.updateAccountActiveStatus(
        user?.USERNAME,
        isActive,
        banReason,
        {
          user_id: userId,
          device_id: deviceId
        }
      ),
    onSuccess: (res) => {
      toast.success(res.message || 'Cập nhật trạng thái thành công')
      refetch()
    },
    onError: () => {
      toast.error('Cập nhật trạng thái thất bại')
    }
  })
  const suspendMutation = useMutation({
    mutationFn: ({ isSuspended, banReason }) =>
      accountService.suspendAccountPermanently(
        user?.USERNAME,
        isSuspended,
        banReason,
        {
          user_id: userId,
          device_id: deviceId
        }
      ),
    onSuccess: (res) => {
      toast.success(res.message || 'Cập nhật thành công')
      refetch()
    },
    onError: () => {
      toast.error('Cập nhật thất bại')
    }
  })

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="body1">Đang tải thông tin...</Typography>
      </Box>
    )
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body1" color="error">
          Không tìm thấy thông tin người dùng.
        </Typography>
      </Box>
    )
  }


  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Avatar
            src={user.AVATAR_IMG_URL}
            sx={{ width: 120, height: 120 }}
          />
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography variant="h5">{name.FULL_NAME}</Typography>
          <Typography variant="body1"><strong>Id:</strong> {user.USER_ID}</Typography>
          <Typography variant="body1"><strong>Username:</strong> {user.USERNAME}</Typography>
          <Typography variant="body1"><strong>Giới tính:</strong> {user.CURRENT_GENDER}</Typography>
          <Typography variant="body1"><strong>Ngày sinh:</strong> {dayjs(user.BIRTH_DATE).format('DD/MM/YYYY')}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {user.EMAIL}</Typography>
          <Typography variant="body1"><strong>Điện thoại:</strong> {phone.FULL_PHONE_NUMBER}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={6}>
            {address?.ADDRESS_1 && (
              <Typography>Địa chỉ 1: {address.ADDRESS_1}</Typography>
            )}
            {address?.ADDRESS_2 && (
              <Typography>Địa chỉ 2: {address.ADDRESS_2}</Typography>
            )}
            {[
              address?.WARD,
              address?.DISTRICT,
              address?.CITY,
              address?.STATE
            ]
              .filter(part => part && part.trim() !== '')
              .length > 0 && (
              <Typography>
                {[
                  address?.WARD,
                  address?.DISTRICT,
                  address?.CITY,
                  address?.STATE
                ]
                  .filter(part => part && part.trim() !== '')
                  .join(', ')}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Vai trò</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {role.IS_ADMIN && <Chip label="Admin" color="primary" />}
              {role.IS_MANAGER && <Chip label="Manager" color="success" />}
              {role.IS_SERVICE_STAFF && <Chip label="Staff" color="warning" />}
              {role.IS_CUSTOMER && <Chip label="Customer" color="info" />}
              {!user.IS_ACTIVE && <Chip label="Ngừng hoạt động" color="error" />}
            </Box>

            <FormControlLabel
              control={<Switch checked={roles.isManager} onChange={() => toggleRole('isManager')} />}
              label="Manager"
            />
            <FormControlLabel
              control={<Switch checked={roles.isServiceStaff} onChange={() => toggleRole('isServiceStaff')} />}
              label="Service Staff"
            />
            <FormControlLabel
              control={<Switch checked={roles.isCustomer} onChange={() => toggleRole('isCustomer')} />}
              label="Customer"
            />
            <Box mt={1}>
              <Button
                variant="outlined"
                onClick={() => updateRoleMutation.mutate()}
                disabled={updateRoleMutation.isLoading}
              >
                {updateRoleMutation.isLoading ? 'Đang cập nhật...' : 'Cập nhật vai trò'}
              </Button>
            </Box>
          </Grid>
          <Grid item xs={6}>
            {user.IS_ACTIVE && (
              <TextField
                label="Lý do vô hiệu hóa"
                multiline
                fullWidth
                rows={3}
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                sx={{ mt: 2 }}
              />
            )}
            <Box mt={1}>
              <Button
                variant='contained'
                color={user.IS_ACTIVE ? 'error' : 'success'}
                onClick={() => {
                  if (user.IS_ACTIVE && !deactivationReason.trim()) {
                    toast.error('Vui lòng nhập lý do vô hiệu hóa!')
                    return
                  }

                  mutation.mutate({
                    isActive: !user.IS_ACTIVE,
                    banReason: deactivationReason.trim()
                  })
                }}
              >
                {user.IS_ACTIVE ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
              </Button>
            </Box>
            {!user.IS_SUSPENDED && (
              <Box mt={2}>
                {!confirmSuspend ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setConfirmSuspend(true)}
                  >
                    Cấm vĩnh viễn tài khoản
                  </Button>
                ) : (
                  <Box>
                    <Typography color="error" sx={{ mb: 1 }}>
                      Bạn có chắc chắn muốn **cấm vĩnh viễn** tài khoản này? Hành động này không thể hoàn tác!
                    </Typography>
                    <TextField
                      label="Lý do cấm tài khoản"
                      multiline
                      fullWidth
                      rows={3}
                      value={suppendedReason}
                      onChange={(e) => setSuppendedReason(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        if (!suppendedReason.trim()) {
                          toast.error('Vui lòng nhập lý do cấm tài khoản!')
                          return
                        }

                        suspendMutation.mutate({
                          isSuspended: true,
                          banReason: suppendedReason.trim()
                        })
                      }}

                      disabled={suspendMutation.isLoading}
                      sx={{ mr: 1 }}
                    >
                      {suspendMutation.isLoading ? 'Đang xử lý...' : 'Xác nhận cấm'}
                    </Button>
                    <Button variant="text" onClick={() => setConfirmSuspend(false)}>
                      Hủy
                    </Button>
                  </Box>
                )}
              </Box>
            )}

          </Grid>
        </Grid>

      </Grid>
    </Paper>
  )
}

export default UserDetailPage
