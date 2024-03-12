import { SessionProvider } from 'next-auth/react';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { ThemeModeProviderComponent } from '@/context/ThemeContext';
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {

  return (
    <SnackbarProvider>
      <SessionProvider session={session}>
        <ThemeModeProviderComponent>
          <Component {...pageProps} />
        </ThemeModeProviderComponent>
      </SessionProvider>
    </SnackbarProvider>
  )
}
