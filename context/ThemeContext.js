import { CssBaseline, MenuItem, Select, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState } from "react"

const ThemeModeContext = createContext()

const useThemeContext = () => useContext(ThemeModeContext)

export const ThemeModeProvider = ({ children }) => {
  //Check system preference for dark mode
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState('light')

  //Check local storage for theme preference on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMode(window.localStorage.getItem('theme') || 'light')
    }
  }, [])

  //Toggle theme mode function
  const toggleThemeMode = (event) => {
    const newMode = event.target.value
    window.localStorage.setItem('theme', newMode)
    setMode(newMode)
  }

  //Create theme based on color mode state
  const theme = useMemo(() => (
    createTheme({
      palette: {
        mode: mode === 'dark' || (mode === 'auto' && isDarkMode) ? 'dark' : 'light'
      }
    })
  ), [mode, isDarkMode])

  //Value for the ThemeModeContext.Provider
  const themeModeValue = useMemo(() => ({ mode, toggleThemeMode }), [mode, toggleThemeMode])

  return (
    <ThemeModeContext.Provider value={themeModeValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

export const ThemeSelector = () => {
  const { mode, toggleThemeMode } = useThemeContext()

  return (
    <Select
      value={mode}
      onChange={(e) => toggleThemeMode(e)}
      size='small'
    >
      <MenuItem value='dark'>Dark</MenuItem>
      <MenuItem value='light'>Light</MenuItem>
    </Select>
  )
}