import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react'
import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>BikeHub</h4>
          <p>Nền tảng mua bán xe đạp cũ uy tín nhất Việt Nam</p>
          <div className="social-links">
            <a href="#"><Facebook size={20} /></a>
            <a href="#"><Instagram size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Về Chúng Tôi</h4>
          <ul>
            <li><a href="#">Trang Chủ</a></li>
            <li><a href="#">Về BikeHub</a></li>
            <li><a href="#">Điều Khoản Dịch Vụ</a></li>
            <li><a href="#">Chính Sách Bảo Mật</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Hỗ Trợ</h4>
          <ul>
            <li><a href="#">Câu Hỏi Thường Gặp</a></li>
            <li><a href="#">Hướng Dẫn Sử Dụng</a></li>
            <li><a href="#">Liên Hệ Hỗ Trợ</a></li>
            <li><a href="#">Báo Cáo Vấn Đề</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên Hệ</h4>
          <div className="contact-info">
            <div className="contact-item">
              <Phone size={18} />
              <span>1900 1234</span>
            </div>
            <div className="contact-item">
              <Mail size={18} />
              <span>support@bikehub.vn</span>
            </div>
            <div className="contact-item">
              <MapPin size={18} />
              <span>Hà Nội, Việt Nam</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 BikeHub. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  )
}
