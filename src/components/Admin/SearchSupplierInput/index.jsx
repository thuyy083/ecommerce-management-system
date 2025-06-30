import React, { useState } from 'react'
import { TextField, MenuItem, Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import supplierService from '~/service/admin/supplier.service'
import useDebounce from '~/hooks/useDebounce'
import { useDeviceId } from '~/hooks/useDeviceId'
import useUserInfo from '~/hooks/useUserInfo'

export default function SearchSupplierInput({ index, selectedSupplier, onSelect, needInitialFetch }) {
  const [supplierSearch, setSupplierSearch] = useState('')
  const supplierSearchDebounced = useDebounce(supplierSearch, 500)
  const device_id = useDeviceId()
  const { userId: user_id } = useUserInfo()

  const { data: supplierData } = useQuery({
    enabled: !!device_id && !!user_id && (!!supplierSearchDebounced || !!needInitialFetch),
    queryKey: ['searchSupplier', supplierSearchDebounced],
    queryFn: () =>
      supplierService.search(
        { user_id, device_id },
        { search: supplierSearchDebounced }
      ),
    retry: false,
    refetchOnWindowFocus: false
  })

  return (
    <Box>
      <TextField
        id={`supplier-search-${index}`}
        label="Tìm nhà cung cấp"
        size="small"
        value={supplierSearch}
        onChange={(e) => setSupplierSearch(e.target.value)}
        fullWidth
      />
      {supplierData?.data?.suppliers?.length > 0 && (
        <TextField
          id={`supplier-select-${index}`}
          select
          size="small"
          label="Chọn nhà cung cấp"
          value={selectedSupplier}
          onChange={(e) => onSelect(e.target.value)}
          sx={{ mt: 1, minWidth: 200 }}
        >
          <MenuItem value=''>--</MenuItem>
          {supplierData.data.suppliers.map((supplier) => (
            <MenuItem key={supplier._id} value={supplier._id}>
              <Box>
                <Typography>{supplier.SUPPLIER_NAME}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  {supplier.SUPPLIER_EMAIL}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </TextField>
      )}
    </Box>
  )
}
