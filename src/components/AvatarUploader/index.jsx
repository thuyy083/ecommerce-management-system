import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'

function ImageUploader({ onImageUpload }) {
  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result) // Cập nhật ảnh
        // Khi tải ảnh mới lên thì truyền đối tượng file mới để comp cha xử lý dữ liệu
        onImageUpload(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCancelUpload = () => {
    setSelectedImage(null)
    // Khi muốn xóa ảnh hiện tại upload thì truyền lại cho comp cha giá trị null để comp cha xử lý dữ liệu
    onImageUpload(null)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2, gap: 2 }}>
      <Avatar alt='Upload new Avatar' src={selectedImage ?? ''} sx={{ height: '200px', width: '200px' }}/>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" component="label" size='small'>
                Upload Avatar
          <input type="file" hidden onChange={handleImageChange}/>
        </Button>
        <Button variant="contained" color='error' size='small' onClick={handleCancelUpload}>
          Cancel
        </Button>
      </Box>
    </Box>
  )
}

export default ImageUploader