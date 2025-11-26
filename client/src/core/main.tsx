import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DateFormatProvider } from '../context/DateFormatContext' 
import { AuthProvider } from '../context/AuthContext' 
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DateFormatProvider>
          <App />
        </DateFormatProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
