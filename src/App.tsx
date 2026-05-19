import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import ClassMonitor from './pages/ClassMonitor'
import Secretary from './pages/Secretary'
import Cadre from './pages/Cadre'
import VicePresident from './pages/VicePresident'
import { useState } from 'react'
import { User } from './data'
import { ModalProvider } from './contexts/ModalContext'

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const handleLogin = (user: User) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  const getRedirectPath = (role: string) => {
    switch (role) {
      case 'classMonitor': return '/class-monitor'
      case 'secretary': return '/secretary'
      case 'cadre': return '/cadre'
      case 'vicePresident': return '/vice-president'
      default: return '/'
    }
  }

  return (
    <ModalProvider>
      <Router>
        <Routes>
          <Route path="/" element={currentUser ? <Navigate to={getRedirectPath(currentUser.role)} /> : <Login onLogin={handleLogin} />} />
          <Route path="/class-monitor" element={currentUser?.role === 'classMonitor' ? <ClassMonitor user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/secretary" element={currentUser?.role === 'secretary' ? <Secretary user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/cadre" element={currentUser?.role === 'cadre' ? <Cadre user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/vice-president" element={currentUser?.role === 'vicePresident' ? <VicePresident user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </ModalProvider>
  )
}

export default App
