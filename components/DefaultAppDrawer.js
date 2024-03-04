//TODO: Forcing layout properly: New image batch at top, list of preview documents, name and icon at bottom
//TODO: Settings modal
//TODO: Feedback modal
import { useState } from "react";
import { IconButton, Avatar, Drawer, Box, Popover, Typography, MenuItem, ListItemIcon, ListItemText, Divider, MenuList } from '@mui/material';
import { useSession, signIn, signOut } from "next-auth/react";
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';

const DefaultAppDrawer = (props) => {
  const { drawerWidth } = props
  const { data: session } = useSession()
  const [anchorEl, setAnchorEl] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuOpen = (event) => {
    setIsMenuOpen(true)
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setIsMenuOpen(false)
    setAnchorEl(null)
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
        display: 'flex'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          margin: '5px',
          position: 'absolute',
          bottom: 0
        }}
      >
        <IconButton
          onClick={handleMenuOpen}
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
        open={isMenuOpen}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
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