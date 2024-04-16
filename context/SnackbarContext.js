//NOTE: Because of the simplcity of the web app, I didn't need to place the snackbar error within it's own context, but I wanted to practice using contexts further
import { createContext, useContext, useState } from "react"

export const SnackbarContext = createContext()

export const useSnackbar = () => useContext(SnackbarContext)

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState('info')

  const openSnackbar = ({ message, severity }) => {
    setOpen(true)
    setMessage(message)
    setSeverity(severity || 'info')
  }

  const closeSnackbar = () => {
    setOpen(false)
  }

  return (
    <SnackbarContext.Provider value={{ open, message, severity, openSnackbar, closeSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  )
}