import BikeCard from './BikeCard'
import styled from 'styled-components'

const featuredBikes = [
  {
    id: 1,
    image: '🚴',
    title: 'Trek X-Caliber 8 2023',
    price: 25000000,
    originalPrice: 28000000,
    year: 2023,
    location: 'Hà Nội',
    mileage: 500,
    size: 'L',
    condition: 'New',
    isFeatured: true,
  },
  {
    id: 2,
    image: '🚴',
    title: 'Giant Escape 3 2022',
    price: 8000000,
    originalPrice: 9500000,
    year: 2022,
    location: 'TP.HCM',
    mileage: 2500,
    size: 'M',
    condition: 'Almost new',
    isFeatured: true,
  },
  {
    id: 3,
    image: '🚴',
    title: 'Specialized Rockhopper 2023',
    price: 18000000,
    originalPrice: 20000000,
    year: 2023,
    location: 'Đà Nẵng',
    mileage: 800,
    size: 'M',
    condition: 'New',
    isFeatured: true,
  },
  {
    id: 4,
    image: '🚴',
    title: 'Merida Big Nine XT 2021',
    price: 15000000,
    originalPrice: 17500000,
    year: 2021,
    location: 'Hải Phòng',
    mileage: 5000,
    size: 'L',
    condition: 'Used',
    isFeatured: false,
  },
  {
    id: 5,
    image: '🚴',
    title: 'Xe Đạp Cơ Bản Tốt 2020',
    price: 3000000,
    originalPrice: 4500000,
    year: 2020,
    location: 'Hà Nội',
    mileage: 8000,
    size: 'M',
    condition: 'Refurbished',
    isFeatured: false,
  },
  {
    id: 6,
    image: '🚴',
    title: 'Cannondale Quick 4 2022',
    price: 12000000,
    originalPrice: 14000000,
    year: 2022,
    location: 'TP.HCM',
    mileage: 3500,
    size: 'L',
    condition: 'Almost new',
    isFeatured: false,
  },
]

export default function FeaturedBikes() {
  return (
    <Section>
      <Container>
        <Title>Selected for you</Title>
        <Grid>
          {featuredBikes.map((bike) => (
            <BikeCard key={bike.id} {...bike} />
          ))}
        </Grid>
        <SeeAll>
          <a href="#/bikes">See all bikes →</a>
        </SeeAll>
      </Container>
    </Section>
  )
}

const Section = styled.section`
  background: white;
  padding: 2rem 0;
  border-bottom: 1px solid #f0f0f0;
`

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1db854;
  margin: 0 0 1.5rem 0;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const SeeAll = styled.div`
  text-align: center;
  padding: 1rem 0;

  a { color: #1a1a1a; text-decoration: none; font-size: 0.95rem; font-weight: 500; }
  a:hover { color: #666; }
`
