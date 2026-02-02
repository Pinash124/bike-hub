import '../../styles/sections/Banner.css'

export default function Banner() {
  return (
    <section className="banner-card">
      <div className="banner-image-container">
        <img 
          src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=2000" 
          alt="Bicycle Banner" 
          className="banner-img"
        />
        <div className="banner-overlay">
          <h2>Tìm Kiếm Chiếc Xe Hoàn Hảo</h2>
          <p>Hàng ngàn xe đạp chất lượng từ những người bán uy tín</p>
          <button className="btn-explore">Khám phá ngay</button>
        </div>
      </div>
    </section>
  )
}