import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import { ProtectedRoute, AdminRoute } from './components/Auth/ProtectedRoute';

import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyListingsPage from './pages/MyListingsPage';
import MessagesPage from './pages/MessagesPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-listings" element={
            <ProtectedRoute><MyListingsPage /></ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute><MessagesPage /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute><AdminPage /></AdminRoute>
          } />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '10px',
              background: '#fff',
              color: '#2c2c2c',
              boxShadow: '0 8px 24px rgba(26,46,26,0.12)',
            },
            success: { iconTheme: { primary: '#4a7c59', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
