//TODO: Forcing layout properly: New image batch at top, list of preview documents, name and icon at bottom
//TODO: Settings modal
//TODO: Feedback modal
//TODO: Change name
//TODO: Delete file
//TODO: Make it so that the list of files doesn't avatar at the bottom
import { useState } from "react";
import { IconButton, Avatar, Drawer, Box, Popover, Typography, MenuItem, ListItemIcon, ListItemText, Divider, MenuList, Toolbar, ListItem, ListItemButton, List } from '@mui/material';
import { useSession, signIn, signOut } from "next-auth/react";
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateIcon from '@mui/icons-material/Create';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { TestItems } from "@/test/TestItems";

const DefaultAppDrawer = (props) => {
  const { drawerWidth } = props
  const { data: session } = useSession()
  const [profileAnchorEl, profileProfileAnchorEl] = useState(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [listItemAnchorEl, setListItemAnchorEl] = useState(null)
  const [listItemMenuOpen, setListItemMenuOpen] = useState(false)

  const handleProfileMenuOpen = (event) => {
    setProfileMenuOpen(true)
    profileProfileAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuOpen(false)
    profileProfileAnchorEl(null)
  }

  const handleListItemMenuOpen = (event) => {
    setListItemMenuOpen(true)
    setListItemAnchorEl(event.currentTarget)
  }

  const handleListItemMenuClose = () => {
    setListItemMenuOpen(false)
    setListItemAnchorEl(null)
  }

  const handleSignOut = async () => {
    localStorage.removeItem('uuid')
    signOut()
  }

  return (
    <Drawer
      open={true}
      variant='persistent'
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
        },
        display: 'flex',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
        disableGutters
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
        >
          <InsertDriveFileIcon />
          <Typography>
            New Upload
          </Typography>
        </IconButton>
      </Toolbar>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
        }}
      >
        <List>
          {TestItems.map((item, index) => (
            <ListItem
              key={item.name}
              sz={{
                marginBottom: index !== TestItems.length - 1 ? '8px' : 0
              }}
              secondaryAction={
                <IconButton onClick={handleListItemMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <ListItemButton
                sx={{
                  borderRadius: '5px'
                }}
              >
                <ListItemText
                  primary={item.name}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
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
          <MenuItem>
            <ListItemIcon>
              <CreateIcon />
            </ListItemIcon>
            <ListItemText>Change Name</ListItemText>
          </MenuItem>
          <MenuItem sx={{ color: '#ff7f7f' }}>
            <ListItemIcon sx={{ color: '#ff7f7f' }}>
              <DeleteForeverIcon />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </MenuList>
      </Popover>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          margin: '5px',
          position: 'absolute',
          bottom: 0
        }}
      >
        <IconButton
          onClick={handleProfileMenuOpen}
        >
          <Avatar
            src={session?.user?.image}
            alt={session?.user?.name}
          />
        </IconButton>
        <Typography>
          {session?.user?.name}
        </Typography>
      </Box>
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
    </Drawer>
  )
}

export default DefaultAppDrawer