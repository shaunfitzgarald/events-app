import { createTheme } from '@mui/material/styles';

// Create a light theme with fun, modern colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5E60CE', // Vibrant purple
      light: '#7B78E5',
      dark: '#4D4DB7',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#48BFE3', // Bright blue
      light: '#72EFDD',
      dark: '#5390D9',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#4CC9F0',
      light: '#80FFDB',
      dark: '#4895EF',
    },
    error: {
      main: '#F72585',
      light: '#FF5C8D',
      dark: '#B5179E',
    },
    warning: {
      main: '#FF9E00',
      light: '#FFCA3A',
      dark: '#FF6B00',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
          boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

export default theme;
