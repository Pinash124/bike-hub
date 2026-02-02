import { useNavigate } from 'react-router-dom'

export default function Banner() {
  const navigate = useNavigate()
  
  return (
    <section className="m-4 rounded-3xl overflow-hidden shadow-2xl relative h-[450px] group">
      <img
        src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=2000"
        alt="Bicycle Banner"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-6">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
          Tìm Kiếm Chiếc Xe Hoàn Hảo
        </h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl">
          Hàng ngàn xe đạp chất lượng từ những người bán uy tín trên toàn quốc
        </p>
        <button 
          onClick={() => navigate('/search')}
          className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-all hover:-translate-y-1 active:scale-95"
        >
          Khám phá ngay
        </button>
      </div>
    </section>
  )
}