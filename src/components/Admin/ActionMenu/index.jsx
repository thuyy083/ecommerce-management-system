import React, { useState } from 'react'
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'

const ActionMenu = ({ onEdit, onDelete, onDetail }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open && (!!onEdit || !!onDetail || !!onDelete)} onClose={handleClose}>
        {!!onEdit && (
          <MenuItem onClick={() => { handleClose(); onEdit() }}>
            <ListItemIcon>
              <EditIcon fontSize="small" color='primary'/>
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {!!onDetail && (
          <MenuItem onClick={() => { handleClose(); onDetail() }}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small"/>
            </ListItemIcon>
            <ListItemText>Detail</ListItemText>
          </MenuItem>
        )}
        {!!onDelete && (
          <MenuItem onClick={() => { handleClose(); onDelete() }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color='error' />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

export default ActionMenu
