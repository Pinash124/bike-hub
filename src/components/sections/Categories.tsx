import '../../styles/sections/Categories.css'

const categories = [
  { id: 1, name: 'MTB', count: '8,540' },
  { id: 2, name: 'Road', count: '6,230' },
  { id: 3, name: 'E-Bike', count: '5,680' },
  { id: 4, name: 'City', count: '4,120' },
  { id: 5, name: 'Gravel', count: '2,890' },
  { id: 6, name: 'Kids', count: '3,450' },
]

export default function Categories() {
  return (
    <section className="categories">
      <div className="categories-header">
        <h2>Browse by Discipline</h2>
      </div>

      <div className="categories-list">
        {categories.map(({ id, name, count }) => (
          <a key={id} href={`#/bikes?category=${name.toLowerCase()}`} className="category-tag">
            <span className="category-name">{name}</span>
            <span className="category-count">{count}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
