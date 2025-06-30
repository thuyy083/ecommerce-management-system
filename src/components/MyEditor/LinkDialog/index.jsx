import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material'
import { useState, useEffect } from 'react'

const LinkDialog = ({ open, onClose, editor }) => {
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (open) {
      const currentUrl = editor.getAttributes('link')?.href || ''
      setUrl(currentUrl)
    }
  }, [open, editor])

  const handleInsertLink = () => {
    if (url === '') {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} container={document.body} disableEnforceFocus disableRestoreFocus disableAutoFocus closeAfterTransition={false}>
      <DialogTitle>Chèn liên kết</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="URL"
          type="url"
          fullWidth
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleInsertLink} variant="contained">Chèn</Button>
      </DialogActions>
    </Dialog>
  )
}

export default LinkDialog
