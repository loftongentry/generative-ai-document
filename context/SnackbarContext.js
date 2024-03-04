import { createContext, useContext, useState } from "react"

export const SnackbarContext = createContext()

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

export const useSnackbar = () => useContext(SnackbarContext)