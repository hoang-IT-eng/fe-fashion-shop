import { Routes, Route, Navigate } from 'react-router-dom'
import UsersPage from './pages/UsersPage.jsx'
import ParallaxHero from './components/ParallaxHero';
import AppleStyleProduct from './components/AppleStyleProduct';

function App() {
  return (
    <Routes>
      <Route path="/" element={<><ParallaxHero /><AppleStyleProduct /></>} />
      <Route path="/users" element={<UsersPage />} />
    </Routes>
  )
}

export default App
