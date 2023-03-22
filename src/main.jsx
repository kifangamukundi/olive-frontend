import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import './index.css';

import StateProvider from './state/StateProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StateProvider>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StateProvider>
  </React.StrictMode>
);
