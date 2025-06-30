import Uploady, { useBatchAddListener } from '@rpldy/uploady'
import UploadDropZone from '@rpldy/upload-drop-zone'
import { FaCloudUploadAlt } from 'react-icons/fa'
import UploadButton from '@rpldy/upload-button'
import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Typography } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

import classNames from 'classnames/bind'

import styles from './ImagesUploader.module.css'
import { toast } from 'react-toastify'

const cx = classNames.bind(styles)

const UploadListener = ({ uploadyFiles, setUploadyFiles, limit }) => {
  useBatchAddListener((batch) => {
    const hasInvalidFile = batch.items.some((file) => !file.file.type.startsWith('image/'))

    if (hasInvalidFile) {
      toast.warn('Chỉ chấp nhận tệp hình ảnh! Vui lòng chọn lại.')
      return
    }

    if (uploadyFiles?.length + batch.items.length > limit) {
      toast.warn(`Vượt quá giới hạn ${limit} tệp. Vui lòng chọn lại.`)
      return
    }

    const uploadedFileNames = batch.items.map(item => item?.file?.name)
    const oldUploadedFileNames = uploadyFiles?.map(file => file?.file?.name) || []
    if (oldUploadedFileNames.some((oldUploadedFileName) => uploadedFileNames.includes(oldUploadedFileName))) {
      toast.warn('Tệp đã tồn tại trong danh sách. Vui lòng chọn tệp khác.')
      return
    }
    // Tạo URL preview cho từng tệp
    const updatedFiles = batch.items.map((uploadyFile) => ({
      ...uploadyFile,
      previewUrl: URL.createObjectURL(uploadyFile.file),
    }))

    const newFilesList = [...uploadyFiles, ...updatedFiles]
    setUploadyFiles(newFilesList)
  })

  return null
}

const ImagesUploader = ({ handleChange, limit, data, }) => {
  const [uploadyFiles, setUploadyFiles] = useState([])
  const [oldImages, setOldImage] = useState(data?.filter(oldImg => !!oldImg?.url) ?? [])

  const removePreview = (id) => {
    setUploadyFiles((prevFiles) => prevFiles.filter((file) => file.id !== id))
  }

  useEffect(() => {
    handleChange({ uploadyFiles: uploadyFiles.map(uploadyFile => uploadyFile.file), oldImages })
  }, [uploadyFiles, oldImages, handleChange])

  return (
    <Uploady autoUpload={false}>
      <Typography variant='body1' color='textDisabled'>Định dạng(.jpg, .jpeg, .png) và dung lượng &lt; 2MB</Typography>
      <UploadListener uploadyFiles={uploadyFiles} setUploadyFiles={setUploadyFiles} limit={limit}/>
      <UploadDropZone
        onDragOverClassName={cx('drag-over')}
        grouped
        maxGroupSize={3}
      >
        <div
          className={cx('drop-zone')}
        >
          <FaCloudUploadAlt size={50} color="#888" />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Typography variant="body1" color='textDisabled'>
                          Thả file vào hoặc
            </Typography>
            <UploadButton type='button' className={cx('custom-upload-button')} onClick={(e) => e.preventDefault()}>
              Browse
            </UploadButton>
          </Box>
        </div>
      </UploadDropZone>

      {/* Old image */}
      {oldImages?.length > 0 && <div style={{ marginTop: '20px' }}>
        <Typography variant='h6'>Ảnh cũ</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {oldImages.map((oldImage, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', border: '1px solid #d8e2ef', borderRadius: '8px', padding: '5px', marginBottom: '10px' }} className={cx('preview-container')}>
              <div style={{ backgroundImage: `url(${oldImage.url})` }} className={cx('preview-image')} />
              <IconButton sx={{ position: 'absolute', right: '-2px', top: '-2px' }} onClick={() => {
                const newArr = [...oldImages]
                newArr.splice(index, 1)
                setOldImage(newArr)
              }}>
                <ClearIcon></ClearIcon>
              </IconButton>
            </Box>
          ))}
        </Box>
      </div>}

      {/* New image upload */}
      <div style={{ marginTop: '20px' }}>
        {uploadyFiles.length > 0 && <Typography variant='h6'>Ảnh mới</Typography>}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {uploadyFiles.map((uploadyFile) => (
            <Box key={uploadyFile.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', border: '1px solid #d8e2ef', borderRadius: '8px', padding: '5px', }}>
              <div style={{ backgroundImage: `url(${uploadyFile.previewUrl})` }} className={cx('preview-image')} />
              <IconButton sx={{ position: 'absolute', right: '-2px', top: '-2px' }} onClick={() => removePreview(uploadyFile.id)}>
                <ClearIcon></ClearIcon>
              </IconButton>
            </Box>
          ))}
        </Box>
      </div>

    </Uploady>
  )
}

export default ImagesUploader