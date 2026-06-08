import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';
import './fonts.css';

import { ThemeProvider } from '@mui/material';
import ReactDOM from 'react-dom/client';

import App from './app/App.tsx';
import { StoreProvider } from './app/providers/storeProvider/StoreProvider.tsx';
import { theme } from './shared/constants/theme.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StoreProvider>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StoreProvider>
);
