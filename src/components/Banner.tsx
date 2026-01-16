import '../styles/Banner.css'

export default function Banner() {
  return (
    <section className="banner">
      <div className="banner-content">
        <h2>Tìm Chiếc Xe Đạp Yêu Thích Của Bạn</h2>
        <p>Cộng đồng hơn 100,000 người yêu xe đạp Việt Nam</p>
        
        <div className="banner-stats">
          <div className="stat">
            <h3>25K+</h3>
            <p>Xe Đạp Đang Bán</p>
          </div>
          <div className="stat">
            <h3>100K+</h3>
            <p>Người Dùng</p>
          </div>
          <div className="stat">
            <h3>4.8★</h3>
            <p>Đánh Giá Trung Bình</p>
          </div>
        </div>

        <button className="btn-primary-large">Khám Phá Ngay</button>
      </div>
      <div className="banner-image">
        <div className="placeholder-image">🚴</div>
      </div>
    </section>
  )
}
