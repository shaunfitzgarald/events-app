import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import AppHeader from './AppHeader';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <CssBaseline />
      <AppHeader />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 2, md: 4 },
          px: { xs: 2, md: 3 },
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout;
