//TODO: Need to adjust global styling so it's not so bright AND/OR make it so that on button click switches between dark and light mode
import { SessionProvider } from "next-auth/react"
import { ThemeProvider, createTheme } from "@mui/material"
import { SnackbarProvider } from "@/context/SnackbarContext"
import '../styles/globals.css'
import '../styles/globals.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0065bd'
    },
    secondary: {
      main: '#00b6d3'
    }
  }
})

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SnackbarProvider>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </SnackbarProvider>
  )
}
