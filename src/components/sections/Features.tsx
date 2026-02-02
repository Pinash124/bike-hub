import { Shield, TrendingUp, Users, Zap } from 'lucide-react'
import styled from 'styled-components'

const features = [
  {
    id: 1,
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Verified sellers and authentic bikes',
  },
  {
    id: 2,
    icon: TrendingUp,
    title: 'Best Prices',
    description: 'Compare prices from thousands of listings',
  },
  {
    id: 3,
    icon: Users,
    title: 'Large Community',
    description: 'Connect with thousands of bike lovers',
  },
  {
    id: 4,
    icon: Zap,
    title: 'Quick Process',
    description: 'Fast and easy buying and selling',
  },
]

export default function Features() {
  return (
    <Section>
      <Container>
        <Title>Why Choose BikeHub</Title>

        <Grid>
          {features.map(({ id, icon: Icon, title, description }) => (
            <Item key={id}>
              <IconBox><Icon size={24} /></IconBox>
              <h3>{title}</h3>
              <p>{description}</p>
            </Item>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}

const Section = styled.section`
  background: white;
  padding: 3rem 2rem;
  border-bottom: 1px solid #e8e8e8;
`

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`

const Title = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 2rem 0;
  color: #1db854;
  font-weight: 600;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`

const Item = styled.div`
  text-align: center;
  padding: 1.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover { background: #f0fdf4; }

  h3 { margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600; color: #1db854; }
  p { margin: 0; font-size: 0.9rem; color: #666; line-height: 1.5; }
`

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  background: #d1fae5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #1db854;
`
