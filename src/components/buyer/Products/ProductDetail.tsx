import React, { useState } from 'react';
import { ShoppingCart, MessageSquare, Heart, Share2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import '../../../styles/ProductDetail.css';

export interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    price: number;
    condition: string;
    image: string;
    seller: string;
    sellerId: string;
    rating: number;
    reviews: number;
    brand: string;
    material: string;
    size: string;
    description: string;
  };
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: `cart_${product.id}`,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      image: product.image,
      sellerId: product.sellerId,
      sellerName: product.seller,
    });
    // Show success message
    alert('Product added to cart!');
  };

  const handleContact = () => {
    alert('Chat with seller feature coming soon');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Product link copied to clipboard!');
  };

  // Mock images
  const images = [product.image, product.image, product.image];

  return (
    <div className="product-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} /> Back
        </button>
      </div>

      <div className="detail-content">
        {/* Image Gallery */}
        <div className="image-section">
          <div className="main-image">
            <span className="image-icon">{images[selectedImage]}</span>
            <span className="condition-badge-large">{product.condition}</span>
          </div>
          <div className="thumbnail-gallery">
            {images.map((img, index) => (
              <div
                key={index}
                className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <span>{img}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="info-section">
          {/* Title & Condition */}
          <div className="product-header">
            <div>
              <h1>{product.name}</h1>
              <p className="brand-info">{product.brand} • {product.size} • {product.material}</p>
            </div>
            <button
              className={`btn-favorite ${isFavorite ? 'active' : ''}`}
              onClick={() => setIsFavorite(!isFavorite)}
              title="Add to favorites"
            >
              <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Rating & Reviews */}
          <div className="rating-section">
            <span className="rating-star">⭐ {product.rating}</span>
            <span className="reviews-count">({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="price-section">
            <h2 className="price">{(product.price / 1000000).toFixed(1)}M VND</h2>
          </div>

          {/* Description */}
          <div className="description-section">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Specifications */}
          <div className="specs-section">
            <h3>Specifications</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <label>Brand</label>
                <p>{product.brand}</p>
              </div>
              <div className="spec-item">
                <label>Frame Size</label>
                <p>{product.size}</p>
              </div>
              <div className="spec-item">
                <label>Material</label>
                <p>{product.material}</p>
              </div>
              <div className="spec-item">
                <label>Condition</label>
                <p>{product.condition}</p>
              </div>
            </div>
          </div>

          {/* Seller Info Card */}
          <div className="seller-card">
            <div className="seller-header">
              <div className="seller-avatar">👤</div>
              <div className="seller-info">
                <h4>{product.seller}</h4>
                <p className="seller-rating">⭐ 4.6 (128 reviews)</p>
              </div>
            </div>
            <p className="seller-joined">Member since 2023</p>
            <button className="btn-view-store">View Store</button>
          </div>

          {/* Action Buttons */}
          <div className="quantity-section">
            <label>Quantity</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-add-cart" onClick={handleAddToCart}>
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button className="btn-contact" onClick={handleContact}>
              <MessageSquare size={20} />
              Chat with Seller
            </button>
          </div>

          {/* Share Button */}
          <button className="btn-share" onClick={handleShare}>
            <Share2 size={18} />
            Share this product
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Customer Reviews ({product.reviews})</h2>
        <div className="reviews-list">
          <div className="review-item">
            <div className="review-header">
              <span className="reviewer-name">Nguyễn Văn A</span>
              <span className="review-rating">⭐⭐⭐⭐⭐</span>
            </div>
            <p className="review-text">
              Great bike! Exactly as described. Seller was very responsive and helpful. Highly recommended!
            </p>
            <span className="review-date">Verified Buyer • 2 weeks ago</span>
          </div>

          <div className="review-item">
            <div className="review-header">
              <span className="reviewer-name">Trần Thị B</span>
              <span className="review-rating">⭐⭐⭐⭐</span>
            </div>
            <p className="review-text">
              Good condition bike. Shipping was fast and well-packaged.
            </p>
            <span className="review-date">Verified Buyer • 1 month ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
