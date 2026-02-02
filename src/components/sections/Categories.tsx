import '../../styles/sections/Categories.css'

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
    <section className="categories-card">
      <h3>Các loại xe đạp thể thao</h3>
      <div className="categories-grid">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className={`category-item ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.name)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}