import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Banner from './components/Banner'
import FilterSection from './components/FilterSection'
import FeaturedBikes from './components/FeaturedBikes'
import Categories from './components/Categories'
import Features from './components/Features'
import Footer from './components/Footer'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

function Home() {
  return (
    <>
      <Header />
      <Banner />
      <FilterSection />
      <FeaturedBikes />
      <Categories />
      <Features />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<><Header /><Login /><Footer /></>} />
        <Route path="/register" element={<><Header /><Register /><Footer /></>} />
      </Routes>
    </Router>
  )
}

export default App
