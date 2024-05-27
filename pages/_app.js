import { SessionProvider } from 'next-auth/react';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { ThemeModeProvider } from '@/context/ThemeContext';
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {

  return (
    <SnackbarProvider>
      <SessionProvider session={session}>
        <ThemeModeProvider>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <Component {...pageProps} />
        </ThemeModeProvider>
      </SessionProvider>
    </SnackbarProvider>
  );
}