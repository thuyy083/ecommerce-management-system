import React from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import { Popper } from '@mui/material'

const PriceRangeInput = ({ minPrice = '', maxPrice = '', onChange }) => {
  const [min, setMin] = React.useState(minPrice)
  const [max, setMax] = React.useState(maxPrice)
  const [error, setError] = React.useState('')
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleMinChange = (e) => {
    const value = e.target.value
    setMin(value)
    // Kiểm tra nếu giá tối thiểu lớn hơn giá tối đa
    if (max && parseFloat(value) > parseFloat(max)) {
      setAnchorEl(e.currentTarget)
      setError('Giá tối thiểu không được vượt quá giá tối đa.')
    } else {
      setError('')
      onChange && onChange({ minPrice: value, maxPrice: max })
    }
  }

  const handleMaxChange = (e) => {
    const value = e.target.value
    setMax(value)
    // Kiểm tra nếu giá tối thiểu vượt quá giá tối đa
    if (min && parseFloat(min) > parseFloat(value)) {
      setAnchorEl(e.currentTarget)
      setError('Giá tối thiểu không được vượt quá giá tối đa.')
    } else {
      setError('')
      onChange && onChange({ minPrice: min, maxPrice: value })
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          size='small'
          label="Giá tối thiểu"
          type="number"
          value={min}
          onChange={handleMinChange}
          onWheel={(e) => e.target.blur()} // Prevents scroll on input
          placeholder="Nhập giá tối thiểu"
          slotProps={{
            htmlInput: { min: 1 },
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }
          }}
          fullWidth
        />
        <TextField
          size='small'
          label="Giá tối đa"
          type="number"
          value={max}
          onChange={handleMaxChange}
          onWheel={(e) => e.target.blur()} // Prevents scroll on inputs
          placeholder="Nhập giá tối đa"
          slotProps={{
            htmlInput: { min: 1 },
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }
          }}
          fullWidth
        />
        <Popper open={!!error} anchorEl={anchorEl}>
          <Alert severity="error">{error}</Alert>
        </Popper>
      </Box>
    </Box>
  )
}

export default PriceRangeInput