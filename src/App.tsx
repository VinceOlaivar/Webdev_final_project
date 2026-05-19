﻿import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <div>
        <Header />
        <Outlet />
      </div>
    </AuthProvider>
  )
}
