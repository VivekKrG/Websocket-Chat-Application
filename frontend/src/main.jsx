import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Import Bootstrap CSS here
import 'bootstrap/dist/css/bootstrap.min.css';
// Import Bootstrap Icons CSS
import 'bootstrap-icons/font/bootstrap-icons.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
