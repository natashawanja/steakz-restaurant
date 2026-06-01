import CashierPage from './pages/CashierPage'
import WaiterPage from './pages/WaiterPage'
import ChefPage from './pages/ChefPage'
import HMPage from './pages/HMPage'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          } />

          <Route path="/hm" element={
            <ProtectedRoute allowedRoles={['HM']}>
              <HMPage />
            </ProtectedRoute>
          } />

          <Route path="/bm" element={
            <ProtectedRoute allowedRoles={['BM']}>
              <div className="p-8 text-2xl font-bold">Branch Manager Dashboard — coming soon</div>
            </ProtectedRoute>
          } />

          <Route path="/chef" element={
            <ProtectedRoute allowedRoles={['CHEF']}>
              <ChefPage />
            </ProtectedRoute>
          } />

          <Route path="/cashier" element={
            <ProtectedRoute allowedRoles={['CASHIER']}>
              <CashierPage />
            </ProtectedRoute>
          } />

          <Route path="/waiter" element={
            <ProtectedRoute allowedRoles={['WAITER']}>
              <WaiterPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}