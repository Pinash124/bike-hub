import styled from 'styled-components'

const categories = [
  { id: 1, name: 'Yamaha', icon: '🇯🇵' },
  { id: 2, name: 'Honda', icon: '🏎️' },
  { id: 3, name: 'Trek', icon: '🇺🇸' },
  { id: 4, name: 'Giant', icon: '🚲' },
  { id: 5, name: 'Specialized', icon: '⚡' },
  { id: 6, name: 'Khác', icon: '➕' },
]

interface CategoriesProps {
  onSelectCategory: (name: string) => void;
  selectedCategory: string;
}

export default function Categories({ onSelectCategory, selectedCategory }: CategoriesProps) {
  return (
    <Card>
      <Title>Các loại xe đạp thể thao</Title>
      <Grid>
        {categories.map((cat) => (
          <Tag
            key={cat.id}
            active={selectedCategory === cat.name}
            onClick={() => onSelectCategory(cat.name)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
          </Tag>
        ))}
      </Grid>
    </Card>
  )
}

const Card = styled.section`
  background: white;
  padding: 2rem;
  border-bottom: 1px solid #e8e8e8;
`

const Title = styled.h3`
  margin: 0 0 1rem 0;
`

const Grid = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`

const Tag = styled.div<{active?: boolean}>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
  color: #1db854;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  background: ${props => props.active ? '#f0fdf4' : 'transparent'};
`