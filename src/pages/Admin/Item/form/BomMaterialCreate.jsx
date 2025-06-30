import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { useEffect, useState } from 'react'
import SearchItemInput from '~/components/Admin/SearchItemInput'
import { IconButton, TextField } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

export default function BomMaterialCreate({ data = [], changeBomMaterials }) {
  const [itemMaterials, setItemMaterials] = useState(data)

  useEffect(() => {
    const form = document.getElementById('form-create-update-item')
    const handleSubmit = () => {
      changeBomMaterials(itemMaterials)
    }

    if (form) {
      form.addEventListener('submit', handleSubmit)
    }

    return () => {
      form?.removeEventListener('submit', handleSubmit)
    }
  }, [changeBomMaterials, itemMaterials])

  const handleAddItem = (item) => {
    const isItemInserted = itemMaterials.find(itemMaterial => itemMaterial.ITEM_CODE === item.ITEM_CODE)
    let newItemMarterial
    if (isItemInserted) {
      isItemInserted.QUANTITY += 1
      newItemMarterial = [...itemMaterials]
    } else {
      newItemMarterial = [...itemMaterials, { ...item, QUANTITY: 1 }]
    }
    setItemMaterials(newItemMarterial)
    // changeBomMaterials(newItemMarterial)
  }

  const handleQuantityChange = (e, itemCode) => {
    const targetItem = itemMaterials.find(item => item.ITEM_CODE === itemCode)
    targetItem.QUANTITY = e.target.value
    let newItemMaterials = [...itemMaterials]
    setItemMaterials(newItemMaterials)
    // changeBomMaterials(newItemMaterials)
  }

  const handleRemove = (itemCode) => {
    const filteredItemMaterials = itemMaterials.filter(item => item.ITEM_CODE !== itemCode)
    setItemMaterials(filteredItemMaterials)
    // changeBomMaterials(filteredItemMaterials)
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650, backgroundColor: '#f5f5f5' }} aria-label="simple table" size="small">
        <TableHead>
          <TableRow >
            <TableCell >STT</TableCell>
            <TableCell >Mã</TableCell>
            <TableCell>Tên</TableCell>
            <TableCell>Đơn vị tính</TableCell>
            <TableCell>Số lượng</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itemMaterials?.map((item, index) => (
            <TableRow key={item.ITEM_CODE}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.ITEM_CODE}</TableCell>
              <TableCell>{item.ITEM_NAME}</TableCell>
              <TableCell>{item.UNIT_NAME}</TableCell>
              <TableCell>
                <TextField
                  size='small'
                  type='number'
                  name='bomMaterials'
                  slotProps={{
                    htmlInput: { min: 1 }
                  }}
                  value={item.QUANTITY}
                  onChange={(e) => handleQuantityChange(e, item.ITEM_CODE)}
                />
              </TableCell>
              <TableCell>
                <IconButton aria-label="delete" size="large" onClick={() => handleRemove(item.ITEM_CODE)}>
                  <DeleteIcon color='error'/>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell >{itemMaterials?.length + 1}</TableCell>
            <TableCell colSpan={2}>
              <SearchItemInput onItemClick={handleAddItem} searchOption='material'/>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}