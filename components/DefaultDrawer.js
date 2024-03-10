//TODO: Make it so, when editing the input, places you inside the input to type immediately
//TODO: Settings modal
//TODO: Feedback modal
//TODO: Change styling of scrollbar
//TODO: If you're viewing that document's analysis, highlight that icon button with that item
//TODO: Make transition of item moving to the top of the list smoother
import { useEffect, useState } from "react";
import { IconButton, Avatar, Drawer, Popover, Typography, MenuItem, ListItemIcon, ListItemText, Divider, MenuList, Toolbar, ListItem, ListItemButton, List, Box, Input, Icon, CssBaseline } from '@mui/material';
import { useSession, signIn, signOut } from "next-auth/react";
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateIcon from '@mui/icons-material/Create';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TestItems } from "@/test/TestItems";

const DefaultDrawer = (props) => {
  const { drawerOpen, handleDrawerOpen, drawerWidth, viewportWidth, valid } = props
  const { data: session } = useSession()
  const [listItems, setListItems] = useState(TestItems)
  const [profileAnchorEl, profileProfileAnchorEl] = useState(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [listItemAnchorEl, setListItemAnchorEl] = useState(null)
  const [listItemMenuOpen, setListItemMenuOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editedName, setEditedName] = useState('')

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

  const handleSignOut = async () => {
    localStorage.removeItem('uuid')
    signOut()
  }

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

  //This is done to set the edited item to the top of the list after it's name has been changed
  const handleSaveEdit = () => {
    const filteredList = listItems.filter(item => item !== selectedItem)
    const updatedList = [{ ...selectedItem, name: editedName }, ...filteredList]

    setListItems(updatedList)
    setEditing(false)
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
        >
          <InsertDriveFileIcon />
          <Typography>
            New Upload
          </Typography>
        </IconButton>
        <IconButton onClick={handleDrawerOpen}>
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
          {listItems.map((item, index) => (
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
              onClick={() => handleListItem("Delete")}
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
              <MenuItem>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <FeedbackIcon />
                </ListItemIcon>
                <ListItemText>Feedback</ListItemText>
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
    </Drawer>
  )
}

export default DefaultDrawer