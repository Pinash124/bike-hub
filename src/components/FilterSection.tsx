import { Filter } from 'lucide-react'
import '../styles/FilterSection.css'

export default function FilterSection() {
  return (
    <section className="filter-section">
      <div className="filter-container">
        <div className="filter-header">
          <Filter size={24} />
          <h3>Lọc Theo Tiêu Chí</h3>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Loại Xe</label>
            <select>
              <option>Tất Cả</option>
              <option>Xe Đạp Thường</option>
              <option>Xe Đạp Địa Hình</option>
              <option>Xe Đạp Tốc Độ</option>
              <option>Xe Đạp Điện</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Hãng</label>
            <select>
              <option>Tất Cả Hãng</option>
              <option>Trek</option>
              <option>Giant</option>
              <option>Specialized</option>
              <option>Merida</option>
              <option>Cannondale</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Năm Sản Xuất</label>
            <select>
              <option>Tất Cả</option>
              <option>2024 - 2025</option>
              <option>2022 - 2023</option>
              <option>2020 - 2021</option>
              <option>2019 Trở Xuống</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Giá (Triệu VNĐ)</label>
            <div className="price-range">
              <input type="number" placeholder="Từ" min="0" />
              <span>-</span>
              <input type="number" placeholder="Đến" min="0" />
            </div>
          </div>

          <button className="btn-filter">Tìm Kiếm</button>
          <button className="btn-reset">Đặt Lại</button>
        </div>
      </div>
    </section>
  )
}
