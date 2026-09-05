import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import AppRoutes from './routes/AppRoutes'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
