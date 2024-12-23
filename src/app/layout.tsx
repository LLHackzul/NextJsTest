'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import Navbar from '@/components/Navbar/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar/>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
