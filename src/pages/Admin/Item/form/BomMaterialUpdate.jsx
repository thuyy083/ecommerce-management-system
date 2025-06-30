import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { useState } from 'react'
import SearchItemInput from '~/components/Admin/SearchItemInput'
import { IconButton, TextField } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import itemService from '~/service/admin/item.service'
import useUserInfo from '~/hooks/useUserInfo'
import { useDeviceId } from '~/hooks/useDeviceId'
import { toast } from 'react-toastify'

export default function BomMaterialUpdate({ data, itemId, viewOnly }) {
  const [itemMaterials, setItemMaterials] = useState(data ?? [])
  const { userId: user_id } = useUserInfo()
  const device_id = useDeviceId()

  const handleAddItem = async (item) => {
    try {
      const isItemInserted = itemMaterials.find(itemMaterial => itemMaterial.ITEM_CODE === item.ITEM_CODE)
      let newItemMarterial
      if (isItemInserted) {
        isItemInserted.QUANTITY += 1
        newItemMarterial = [...itemMaterials]
        await itemService.updateBomMaterial({
          user_id,
          device_id,
        },
        itemId,
        { itemCode: isItemInserted.ITEM_CODE, quantity: isItemInserted.QUANTITY }
        )
      } else {
        newItemMarterial = [...itemMaterials, { ...item, QUANTITY: 1 }]
        await itemService.addBomMaterial({
          user_id,
          device_id,
        },
        itemId,
        [{ ITEM_CODE: item.ITEM_CODE, QUANTITY: 1 }]
        )
      }
      setItemMaterials(newItemMarterial)
    } catch (error) {
      console.log(error)
      toast.error('Có lỗi xảy ra trong quá trình thêm nguyên liệu')
    }
  }

  const handleQuantityChange = async (e, itemCode) => {
    try {
      const targetItem = itemMaterials.find(item => item.ITEM_CODE === itemCode)
      targetItem.QUANTITY = e.target.value
      let newItemMaterials = [...itemMaterials]
      await itemService.updateBomMaterial({
        user_id,
        device_id,
      },
      itemId,
      { itemCode: targetItem.ITEM_CODE, quantity: targetItem.QUANTITY })
      setItemMaterials(newItemMaterials)
    } catch (error) {
      console.log(error)
      toast.error('Có lỗi xảy ra trong quá trình cập nhật nguyên liệu')
    }
  }

  const handleRemove = async (itemCode) => {
    try {
      const filteredItemMaterials = itemMaterials.filter(item => item.ITEM_CODE !== itemCode)
      await itemService.deleteBomMaterial({
        user_id,
        device_id,
      },
      itemId,
      { itemCode }
      )
      setItemMaterials(filteredItemMaterials)
    } catch (error) {
      console.log(error)
      toast.error('Có lỗi xảy ra trong quá trình xóa nguyên liệu')
    }
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
            <TableRow key={item.ITEM_CODE ?? index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.ITEM_CODE}</TableCell>
              <TableCell>{item.ITEM_NAME}</TableCell>
              <TableCell>{item.UNIT_NAME}</TableCell>
              <TableCell>
                <TextField
                  disabled={viewOnly}
                  type='number'
                  name='bomMaterials'
                  slotProps={{
                    htmlInput: { min: 1 }
                  }}
                  value={item.QUANTITY}
                  onChange={(e) => handleQuantityChange(e, item.ITEM_CODE)}
                />
              </TableCell>
              {!viewOnly && <TableCell>
                <IconButton aria-label="delete" size="large" onClick={() => handleRemove(item.ITEM_CODE)}>
                  <DeleteIcon color='error' />
                </IconButton>
              </TableCell>}
            </TableRow>
          ))}
          {!viewOnly && <TableRow>
            <TableCell >{itemMaterials?.length + 1}</TableCell>
            <TableCell colSpan={3}>
              <SearchItemInput onItemClick={handleAddItem} />
            </TableCell>
          </TableRow>}
        </TableBody>
      </Table>
    </TableContainer>
  )
}