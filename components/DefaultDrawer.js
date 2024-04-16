//TODO: Functionality for the options in the settings modal
//TODO: Menu item only disappears for the item whose name is being changed
//TODO: Pressing enter is the same as clicking out of the input box
//TODO: If document that is selected's results are showing, then clear results, otherwise don't clear results
//TODO: If name is unchanged, then don't call API route
import { useState } from "react";
import { IconButton, Avatar, Drawer, Popover, Typography, MenuItem, ListItemIcon, ListItemText, Divider, MenuList, Toolbar, ListItem, ListItemButton, List, Box, Input, CssBaseline } from '@mui/material';
import { useSession, signIn, signOut } from "next-auth/react";
import SettingsModal from "./DrawerComponents/SettingsModal";
import DeleteModal from "./DrawerComponents/DeleteModal"
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateIcon from '@mui/icons-material/Create';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const DefaultDrawer = (props) => {
  const { drawerOpen, handleDrawer, drawerWidth, viewportWidth, results, setResults, listItems, fetchFirestoreAnalysis, openSnackbar } = props
  const { data: session } = useSession()
  const [profileAnchorEl, profileProfileAnchorEl] = useState(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [listItemAnchorEl, setListItemAnchorEl] = useState(null)
  const [listItemMenuOpen, setListItemMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const valid = session?.user

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

  const handleChangeName = () => {
    setEditing(true)
    setEditedName(selectedItem.file_name)
    handleListItemMenuClose()
  }

  const handleSetResults = (item) => {
    if (!editing) {
      setResults(item)
    }
  }

  const handleSaveEdit = async () => {
    setLoading(true)

    try {
      const payload = JSON.stringify({
        doc_id: selectedItem.id,
        newName: editedName
      })

      const res = await fetch(`/api/firestore/update-name/${payload}`)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(`${res.status} - ${res.statusText} - ${data.error}`)
      }

      setSelectedItem(null)
      setEditing(false)
      setEditedName('')
      fetchFirestoreAnalysis()
    } catch (error) {
      console.error(`There was an error updating document's name in google firestore: ${error}`)
      openSnackbar({ message: `There was an error updating your document's analysis, please try again later`, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsModalOpen = () => {
    setSettingsModalOpen(true)
    handleProfileMenuClose()
  }

  const handleSettingsModalClose = () => {
    setSettingsModalOpen(false)
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
          disabled={!valid || results === null}
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
              key={item.id}
              sx={{
                marginBottom: index !== listItems.length - 1 ? '8px' : 0,
              }}
              secondaryAction={
                (!editing && (
                  <IconButton
                    onClick={(event) => handleListItemMenuOpen(event, item)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                ))
              }
            >
              <ListItemButton
                sx={{
                  borderRadius: '5px'
                }}
                onClick={() => handleSetResults(item)}
                selected={results?.id === item?.id}
                disableRipple={editing}
              >
                {editing && selectedItem === item ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleSaveEdit}
                    disableUnderline
                    size={"small"}
                    sx={{
                      '& .MuiInput-input': {
                        paddingTop: '0px',
                        paddingBottom: '0px'
                      }
                    }}
                  />
                ) : (
                  <Typography noWrap>
                    {item.file_name}
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
              onClick={handleChangeName}
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
        fetchFirestoreAnalysis={fetchFirestoreAnalysis}
        openSnackbar={openSnackbar}
      />
      <DeleteModal
        openDeleteModal={deleteModal}
        onClose={handleDeleteModalClose}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        fetchFirestoreAnalysis={fetchFirestoreAnalysis}
        openSnackbar={openSnackbar}
      />
    </Drawer>
  )
}

export default DefaultDrawer