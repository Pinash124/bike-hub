
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import HomePage from './pages/HomePage'
import UserInfo from './pages/UserInfo'


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/user-info" element={<UserInfo />} />
    </Routes>
  )
}

export default App
