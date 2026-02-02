import { useLocation, useNavigate } from 'react-router-dom';
import ProductDetail from '../components/buyer/Products/ProductDetail';

export default function ProductDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product;

  if (!product) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Sản phẩm không được tìm thấy</h2>
        <button onClick={() => navigate('/search')}>Quay lại tìm kiếm</button>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
