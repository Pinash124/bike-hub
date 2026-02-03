import { useNavigate } from 'react-router-dom';
import ProductSearch from '../components/buyer/Products/ProductSearch';
import type { Product } from '../components/buyer/Products/ProductSearch';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Trek FX 3 Hybrid Bike',
    price: 1500000,
    condition: 'Like New (99%)',
    image: '🚲',
    seller: 'John Bike Store',
    sellerId: 'seller_1',
    rating: 4.8,
    brand: 'Trek',
    material: 'Aluminum',
    size: 'M (52cm)',
    reviews: 156,
    description: 'Perfect hybrid bike for casual riding'
  },
  {
    id: '2',
    name: 'Giant Escape 3',
    price: 1200000,
    condition: 'Good (90%)',
    image: '🚲',
    seller: 'Bike World',
    sellerId: 'seller_2',
    rating: 4.6,
    brand: 'Giant',
    material: 'Aluminum',
    size: 'L (54cm)',
    reviews: 89,
    description: 'Reliable hybrid bike for everyday use'
  },
  {
    id: '3',
    name: 'Specialized Rockhopper',
    price: 2500000,
    condition: 'New',
    image: '🚲',
    seller: 'Specialized Shop',
    sellerId: 'seller_3',
    rating: 4.9,
    brand: 'Specialized',
    material: 'Aluminum',
    size: 'M (52cm)',
    reviews: 245,
    description: 'Mountain bike for off-road adventures'
  },
  {
    id: '4',
    name: 'Cannondale Quick 5',
    price: 1800000,
    condition: 'Like New (99%)',
    image: '🚲',
    seller: 'Pro Cycles',
    sellerId: 'seller_4',
    rating: 4.7,
    brand: 'Cannondale',
    material: 'Aluminum',
    size: 'S (50cm)',
    reviews: 112,
    description: 'Quick and responsive hybrid bike'
  },
  {
    id: '5',
    name: 'Scott Aspect 40',
    price: 2000000,
    condition: 'Fair (75%)',
    image: '🚲',
    seller: 'Scott Authorized',
    sellerId: 'seller_5',
    rating: 4.5,
    brand: 'Scott',
    material: 'Aluminum',
    size: 'L (54cm)',
    reviews: 67,
    description: 'Versatile mountain bike for trails'
  }
];

export default function SearchPage() {
  const navigate = useNavigate();

  const handleSelectProduct = (product: Product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  return <ProductSearch products={MOCK_PRODUCTS} onSelectProduct={handleSelectProduct} />;
}
