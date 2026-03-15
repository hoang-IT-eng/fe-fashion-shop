import { Routes, Route, Navigate } from 'react-router-dom'
import UsersPage from './pages/UsersPage.jsx'
import ParallaxHero from './components/ParallaxHero';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ParallaxHero />} />
      <Route path="/users" element={<UsersPage />} />
    </Routes>
  )
}

export default App
