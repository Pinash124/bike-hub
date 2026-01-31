import Header from '../components/Header'
import Banner from '../components/Banner'
import FilterSection from '../components/FilterSection'
import FeaturedBikes from '../components/FeaturedBikes'
import Categories from '../components/Categories'
import Features from '../components/Features'
import Footer from '../components/Footer'
export default function HomePage() {
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