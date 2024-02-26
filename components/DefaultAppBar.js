import { useState, useEffect } from "react";
import { AppBar, Toolbar, IconButton, MenuItem, Menu, Avatar, Typography, Tooltip } from '@mui/material';
import { useSession, signIn, signOut } from "next-auth/react";

export default function DefaultAppBar() {
  const { data: session } = useSession()
  const [anchorEl, setAnchorEl] = useState(null)
  const isMenuOpen = Boolean(anchorEl)
  const [signedIn, isSignedIn] = useState(true)

  useEffect(() => {
    if (session) {
      isSignedIn(false)
    }
  }, [session])

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget.parentNode)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = () => {
    localStorage.removeItem('uuid')
    signOut()
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h5">
          NA Alerts Site
        </Typography>
        <div style={{ flexGrow: 1 }} />
        <IconButton
          onClick={handleMenuOpen}
          edge="end"
        >
          <Tooltip open={signedIn} title={signedIn ? 'You must be logged in to view data' : ''} placement="left">
            <Avatar src={session?.user?.image} alt={session?.user?.name} />
          </Tooltip>
        </IconButton>
      </Toolbar>
      <Menu
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted
      >
        {session ? (
          <MenuItem onClick={handleSignOut}>Logout</MenuItem>
        ) : (
          <MenuItem onClick={() => signIn()}>Login</MenuItem>
        )}
      </Menu>
    </AppBar>
  );
}
