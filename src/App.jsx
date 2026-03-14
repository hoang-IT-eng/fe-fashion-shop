import { Routes, Route, Navigate } from 'react-router-dom'
import UsersPage from './pages/UsersPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/users" replace />} />
      <Route path="/users" element={<UsersPage />} />
    </Routes>
  )
}

export default App
