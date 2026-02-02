import { Filter, X } from 'lucide-react'
import { useState } from 'react'
import styled from 'styled-components'

const Section = styled.section`
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e8e8e8;
`

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`

const Toggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #bbf7d0;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #1db854;
  transition: all 0.2s ease;

  &:hover { background: #f0fdf4; border-color: #1db854; }
`

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #e8e8e8;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label { font-weight: 500; font-size: 0.9rem; color: #1a1a1a; }

  select, input[type="range"] {
    padding: 0.5rem 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #1a1a1a;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  select:hover, select:focus { border-color: #999; outline: none; }
`

export default function FilterSection() {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <Section>
      <Container>
        <Toggle onClick={() => setShowFilters(!showFilters)}>
          <Filter size={18} />
          <span>Filters</span>
          {showFilters && <X size={18} />}
        </Toggle>

        {showFilters && (
          <FiltersGrid>
            <Group>
              <label>Discipline</label>
              <select>
                <option>All</option>
                <option>MTB</option>
                <option>Road</option>
                <option>E-Bike</option>
                <option>City</option>
              </select>
            </Group>

            <Group>
              <label>Brand</label>
              <select>
                <option>All Brands</option>
                <option>Trek</option>
                <option>Giant</option>
                <option>Specialized</option>
                <option>Merida</option>
              </select>
            </Group>

            <Group>
              <label>Condition</label>
              <select>
                <option>All</option>
                <option>New</option>
                <option>Refurbished</option>
                <option>Used</option>
              </select>
            </Group>

            <Group>
              <label>Price Range</label>
              <input type="range" min="0" max="10000" />
            </Group>
          </FiltersGrid>
        )}
      </Container>
    </Section>
  )
}
