import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PomodoroProvider } from './context/PomodoroContext';
import { LibraryProvider } from './context/LibraryContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <PomodoroProvider>
          <LibraryProvider>
            <App />
          </LibraryProvider>
        </PomodoroProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
