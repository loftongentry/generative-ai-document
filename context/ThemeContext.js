import { FormControl, MenuItem, Select, ThemeProvider, createTheme } from "@mui/material";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext()

const useTheme = () => useContext(ThemeContext)

export const ThemeModeProviderComponent = ({ children }) => {
  const systemTheme = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  const [selectedTheme, setSelectedTheme] = useState(() =>
    typeof localStorage !== 'undefined' && localStorage.getItem('theme') || 'system'
  )

  const themes = {
    light: createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#0065bd'
        },
        secondary: {
          main: '#00b6d3'
        }
      }
    }),
    dark: createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: '#0065bd'
        },
        secondary: {
          main: '#00b6d3'
        }
      }
    }),
    system: createTheme({
      palette: {
        mode: systemTheme,
        primary: {
          main: '#0065bd'
        },
        secondary: {
          main: '#00b6d3'
        }
      }
    })
  }

  useEffect(() => {
    if (selectedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      themes.system.palette.mode = systemTheme
    }
  }, [selectedTheme, themes.system])

  const handleThemeChange = (event) => {
    const { value } = event.target

    setSelectedTheme(value)
    localStorage.setItem('theme', value)
  }

  return (
    <ThemeContext.Provider value={{ selectedTheme, handleThemeChange }}>
      <ThemeProvider theme={themes[selectedTheme]}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export const ThemeSelector = () => {
  const { selectedTheme, handleThemeChange } = useTheme()

  return (
    <FormControl>
      <Select
        value={selectedTheme}
        onChange={handleThemeChange}
      >
        <MenuItem value='system'>System</MenuItem>
        <MenuItem value='dark'>Dark</MenuItem>
        <MenuItem value='light'>Light</MenuItem>
      </Select>
    </FormControl>
  )
}
