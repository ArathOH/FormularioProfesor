import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Uploads from './pages/Uploads'
import Certificates from './pages/Certificates'
import Reports from './pages/Reports'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Forbidden from './pages/Forbidden'
import AuthGate from './components/AuthGate'
import NavBar from './components/NavBar'


export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/403" element={<Forbidden />} />
        
        {/* Todas las rutas protegidas por AuthGate */}
        <Route element={<AuthGate />}>
          <Route path="/" element={
            <>
              <NavBar />
              <main id="main" className="max-w-5xl mx-auto p-4">
                <Home />
              </main>
            </>
          } />
          <Route path="/profile" element={
            <>
              <NavBar />
              <main id="main" className="max-w-5xl mx-auto p-4">
                <Profile />
              </main>
            </>
          } />
          <Route path="/uploads" element={
            <>
              <NavBar />
              <main id="main" className="max-w-5xl mx-auto p-4">
                <Uploads />
              </main>
            </>
          } />
          <Route path="/certificates" element={
            <>
              <NavBar />
              <main id="main" className="max-w-5xl mx-auto p-4">
                <Certificates />
              </main>
            </>
          } />
          <Route path="/reports" element={
            <>
              <NavBar />
              <main id="main" className="max-w-6xl mx-auto p-4">
                <Reports />
              </main>
            </>
          } />
          <Route path="/admin" element={
            <>
              <NavBar />
              <main id="main" className="max-w-6xl mx-auto p-4">
                <Admin />
              </main>
            </>
          } />
        </Route>
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
