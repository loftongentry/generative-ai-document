//TODO: If you're viewing that document's analysis, highlight that icon button with that item
//TODO: Functionality for the options in the settings modal
//TODO: For each of the ListItems, the onBlur should send an API request to google cloud, which changes the name (should also make the mouse non-clickable and spinning logo)
//NOTE: To get them to appear in order, have it sort the list of items based on last edited, and then by creation date (it that's possible)
import { useEffect, useState } from "react";
import { IconButton, Avatar, Drawer, Popover, Typography, MenuItem, ListItemIcon, ListItemText, Divider, MenuList, Toolbar, ListItem, ListItemButton, List, Box, Input, Icon, CssBaseline, Dialog, DialogContent, DialogTitle, DialogActions, Button } from '@mui/material';
import { useSession, signIn, signOut } from "next-auth/react";
import SettingsModal from "./DrawerComponents/SettingsModal";
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateIcon from '@mui/icons-material/Create';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TestItems } from "@/test/TestItems";

const DeleteModal = (props) => {
  const { open, onClose, selectedItem } = props

  //Function to delete file analysis from firestore
  //Close modal upon success and setSelectedItem to null
  const handleDelete = async () => {
    try {

    } catch (error) {

    }
  }

  return (
    <Dialog
      open={open}
      maxWidth='sm'
      fullWidth={true}
    >
      <DialogTitle>
        Delete Analysis
      </DialogTitle>
      <DialogContent dividers>
        This will delete the analysis for <b>{selectedItem?.name}</b>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="error"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const DefaultDrawer = (props) => {
  const { drawerOpen, handleDrawer, drawerWidth, viewportWidth, setResults } = props
  const { data: session } = useSession()
  const [listItems, setListItems] = useState(TestItems)
  const [profileAnchorEl, profileProfileAnchorEl] = useState(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [listItemAnchorEl, setListItemAnchorEl] = useState(null)
  const [listItemMenuOpen, setListItemMenuOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const valid = session?.user

  useEffect(() => {
    if(valid){

    } else {
      setListItems(null)
    }
  }, [valid])

  const handleProfileMenuOpen = (event) => {
    setProfileMenuOpen(true)
    profileProfileAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(false)
    profileProfileAnchorEl(null)
  }

  const handleListItemMenuOpen = (event, item) => {
    setListItemMenuOpen(true)
    setListItemAnchorEl(event.currentTarget)
    setSelectedItem(item)
  }

  const handleListItemMenuClose = () => {
    setListItemMenuOpen(false)
    setListItemAnchorEl(null)
  }

  const handleOpenDeleteModalOpen = () => {
    setDeleteModal(true)
    handleListItemMenuClose()
  }

  const handleDeleteModalClose = () => {
    setDeleteModal(false)
    setSelectedItem(null)
  }

  const handleSignOut = async () => {
    localStorage.removeItem('uuid')
    handleProfileMenuClose()
    signOut()
  }

  //Temp
  const handleListItem = (action) => {
    if (action === 'Delete') {
      const updatedList = listItems.filter(item => item.name !== selectedItem.name)
      setListItems(updatedList)
    } else if (action === 'Change Name') {
      setEditing(true)
      setEditedName(selectedItem.name)
    }

    handleListItemMenuClose()
  }

  //Temp
  const handleSaveEdit = () => {
    const filteredList = listItems.filter(item => item !== selectedItem)
    const updatedList = [{ ...selectedItem, name: editedName }, ...filteredList]

    setListItems(updatedList)
    setEditing(false)
  }

  //Funtion to update name of file analysis in firestore
  //onBlur should execute this function
  //setSelectedItem to null upon success
  const saveEdit = async () => {
    try {

    } catch (error) {

    }
  }

  const handleSettingsModalOpen = () => {
    setSettingsModalOpen(true)
    handleProfileMenuClose()
  }

  const handleSettingsModalClose = () => {
    setSettingsModalOpen(false)
  }

  //Handle setting list items in dev versus production
  const handleSetListItems = () => {

  }

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant={viewportWidth >= 768 ? 'persistent' : 'temporary'}
      anchor="left"
      open={drawerOpen}
    >
      <CssBaseline />
      <Toolbar
        sx={{
          justifyContent: 'center',
        }}
      >
        <IconButton
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '95%',
            height: '80%',
            borderRadius: '5px',
            gap: '5px'
          }}
          disabled={!valid}
          onClick={() => setResults(null)}
        >
          <InsertDriveFileIcon />
          <Typography>
            New Upload
          </Typography>
        </IconButton>
        <IconButton onClick={handleDrawer}>
          <ArrowBackIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <Box
        sx={{
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '5px',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '8px',
            minHeight: '24px',
            backgroundColor: 'transparent'
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: '#b7b7b7'
          }
        }}
      >
        <List>
          {listItems?.map((item, index) => (
            <ListItem
              key={item.name}
              sx={{
                marginBottom: index !== listItems.length - 1 ? '8px' : 0,
              }}
              secondaryAction={
                <IconButton
                  onClick={(event) => handleListItemMenuOpen(event, item)}
                >
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <ListItemButton
                sx={{
                  borderRadius: '5px'
                }}
              >
                {editing && selectedItem === item ? (
                  <Input
                    focus='true'
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleSaveEdit}
                  />
                ) : (
                  <Typography noWrap>
                    {item.name}
                  </Typography>
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Popover
          open={listItemMenuOpen}
          anchorEl={listItemAnchorEl}
          onClose={handleListItemMenuClose}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
        >
          <MenuList>
            <MenuItem
              onClick={() => handleListItem('Change Name')}
            >
              <ListItemIcon>
                <CreateIcon />
              </ListItemIcon>
              <ListItemText>Change Name</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={handleOpenDeleteModalOpen}
              sx={{ color: '#ff7f7f' }}
            >
              <ListItemIcon sx={{ color: '#ff7f7f' }}>
                <DeleteForeverIcon />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </MenuList>
        </Popover>
      </Box>
      <Box
        sx={{
          marginTop: 'auto',
        }}
      >
        <Divider />
        <Toolbar disableGutters>
          <IconButton onClick={handleProfileMenuOpen}>
            <Avatar
              src={session?.user?.image}
              alt={session?.user?.name}
            />
          </IconButton>
          <Typography>
            {session?.user?.name}
          </Typography>
        </Toolbar>
        <Popover
          open={profileMenuOpen}
          anchorEl={profileAnchorEl}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
        >
          {session ? (
            <MenuList>
              <MenuItem onClick={handleSettingsModalOpen}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut} >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText>Log Out</ListItemText>
              </MenuItem>
            </MenuList>
          ) : (
            <MenuList>
              <MenuItem onClick={() => signIn()}>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText>Log In</ListItemText>
              </MenuItem>
            </MenuList>
          )}
        </Popover>
      </Box>
      <SettingsModal
        settingsModalOpen={settingsModalOpen}
        handleSettingsModalClose={handleSettingsModalClose}
        viewportWidth={viewportWidth}
      />
      <DeleteModal
        open={deleteModal}
        onClose={handleDeleteModalClose}
        selectedItem={selectedItem}
      />
    </Drawer>
  )
}

export default DefaultDrawer