import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DateFormatProvider } from '../context/DateFormatContext.tsx';
import { DarkModeProvider } from '../context/DarkModeContext.tsx';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DateFormatProvider>
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </DateFormatProvider>
  </StrictMode>,
)
