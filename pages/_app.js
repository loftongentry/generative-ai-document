//TODO: Need to adjust global styling so it's not so bright OR, make it so that on button click switches between dark and light mode
import { SessionProvider } from "next-auth/react"
import { ThemeProvider, createTheme } from "@mui/material"
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
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  )
}
