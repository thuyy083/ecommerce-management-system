import * as MuiTiptap from 'mui-tiptap'

const {
  RichTextEditor,
  MenuSelectHeading,
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonUnderline,
  MenuSelectFontFamily,
  MenuSelectTextAlign,
  MenuDivider,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuButtonAddTable,
  TableBubbleMenu,
} = MuiTiptap


import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import Heading from '@tiptap/extension-heading'

import { Box, IconButton } from '@mui/material'
import InsertLinkIcon from '@mui/icons-material/InsertLink'
import ColorSelector from './ColorSelector'
import { useState } from 'react'
import LinkDialog from './LinkDialog'


import './MyEditor.css'

const MyEditor = ({ content, handleChange, isDisable }) => {
  const [openLinkDialog, setOpenLinkDialog] = useState(false)

  const fontFamilyExtension = FontFamily.configure({
    types: ['textStyle'],
  })

  return (
    <RichTextEditor
      editable={!isDisable}
      extensions={[
        Heading,
        fontFamilyExtension,
        StarterKit.configure({
          heading: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
          link: false,
        }),
        TextStyle,
        Underline,
        Color,
        TextAlign.configure({
          types: ['heading', 'paragraph'], // Đảm bảo áp dụng cho cả tiêu đề và đoạn văn
          alignments: ['left', 'center', 'right', 'justify'], // Các tùy chọn căn chỉnh
        }),
        BulletList,
        OrderedList,
        ListItem,
        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
        }),
        Table,
        TableRow,
        TableCell,
        TableHeader,
      ]}
      content={content ?? ''}
      editorProps={{
        attributes: {
          style: 'min-height: 250px;'
        }
      }}
      onUpdate={({ editor }) => {
        handleChange(editor.getHTML())
      }}
      renderControls={(editor) => (
        <Box className='custom-editor' sx={{ display: 'flex', gap: 1, alignItems: 'center', overflowX: 'auto' }}>
          <MenuSelectHeading />
          <MenuDivider />
          <MenuSelectFontFamily options={[
            { label: 'Arial', value: 'Arial, sans-serif' },
            { label: 'Times New Roman', value: '\'Times New Roman\', serif' },
            { label: 'Courier New', value: '\'Courier New\', monospace' }
          ]} />
          <MenuDivider />
          <MenuButtonBold />
          <MenuButtonItalic />
          <MenuButtonUnderline />
          <ColorSelector editor={editor} />
          <MenuDivider />
          <MenuSelectTextAlign />
          <MenuDivider />
          <MenuButtonBulletedList />
          <MenuButtonOrderedList />
          <MenuDivider />
          <IconButton
            onClick={() => setOpenLinkDialog(true)}
          >
            <InsertLinkIcon />
          </IconButton>
          <LinkDialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)} editor={editor} />
          <MenuButtonAddTable rows={5} cols={4} />
          <TableBubbleMenu editor={editor} />
          <TableBubbleMenu/>

        </Box>
      )}
    />
  )
}

export default MyEditor