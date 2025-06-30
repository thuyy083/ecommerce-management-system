import { ColorSwatchButton, ColorPicker } from 'mui-tiptap'
import Popper from '@mui/material/Popper'
import { useState, useRef } from 'react'

import './ColorSelector.css'

const ColorSelector = ({ editor }) => {
  const [color, setColor] = useState('#000000') // Màu mặc định
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

  const handleChangeColor = (newColor) => {
    setColor(newColor)
    editor.chain().focus().setColor(newColor).run()
  }


  return (
    <>
      <ColorSwatchButton value={color} ref={anchorRef} onClick={() => setOpen(!open)} />
      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start" modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 15], // Điều chỉnh khoảng cách theo trục Y (10px xuống dưới)
          },
        },
      ]}
      >
        <div style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '8px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <ColorPicker onChange={handleChangeColor} classes={{ gradientPicker: 'custom-color-picker', swatchContainer: 'custom-swatch-container', }} />
        </div>

      </Popper>
    </>
  )
}

export default ColorSelector