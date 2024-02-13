import { SessionProvider } from "next-auth/react"
import '../styles/globals.css'
import { ThemeProvider, createTheme } from "@mui/material"

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
