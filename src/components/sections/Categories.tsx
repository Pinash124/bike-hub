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
    <section className="bg-white py-8 border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider">
          Các loại xe đạp thể thao
        </h3>
        
        <div className="flex gap-3 flex-wrap items-center">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`flex items-center gap-3 px-5 py-2.5 border rounded-xl text-sm font-bold cursor-pointer transition-all duration-200
                ${selectedCategory === cat.name 
                  ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' 
                  : 'border-green-100 text-green-600 hover:bg-green-50 hover:border-green-300'
                }`}
            >
              <span className="text-xl leading-none">{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}