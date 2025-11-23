import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DateFormatProvider } from '../context/DateFormatContext.tsx';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DateFormatProvider>
      <App />
    </DateFormatProvider>
  </StrictMode>,
)
