import React, { useState } from 'react';
import { ShoppingCart, MessageSquare, Heart, Share2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import styled from 'styled-components';

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
    <Page>
      <HeaderBar>
        <Back onClick={() => navigate(-1)}><ChevronLeft size={20} /> Back</Back>
      </HeaderBar>

      <Content>
        <ImageSection>
          <MainImage>
            <span className="image-icon">{images[selectedImage]}</span>
            <ConditionLarge>{product.condition}</ConditionLarge>
          </MainImage>
          <ThumbnailGallery>
            {images.map((img, index) => (
              <Thumbnail key={index} active={index === selectedImage} onClick={() => setSelectedImage(index)}><span>{img}</span></Thumbnail>
            ))}
          </ThumbnailGallery>
        </ImageSection>

        <InfoSection>
          <ProductHeader>
            <div>
              <h1>{product.name}</h1>
              <p className="brand-info">{product.brand} • {product.size} • {product.material}</p>
            </div>
            <FavBtn className={isFavorite ? 'active' : ''} onClick={() => setIsFavorite(!isFavorite)} title="Add to favorites"><Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} /></FavBtn>
          </ProductHeader>

          <Rating><span className="rating-star">⭐ {product.rating}</span><span className="reviews-count">({product.reviews} reviews)</span></Rating>

          <Price><h2 className="price">{(product.price / 1000000).toFixed(1)}M VND</h2></Price>

          <Description><h3>Description</h3><p>{product.description}</p></Description>

          <Specs>
            <h3>Specifications</h3>
            <SpecsGrid>
              <Spec><label>Brand</label><p>{product.brand}</p></Spec>
              <Spec><label>Frame Size</label><p>{product.size}</p></Spec>
              <Spec><label>Material</label><p>{product.material}</p></Spec>
              <Spec><label>Condition</label><p>{product.condition}</p></Spec>
            </SpecsGrid>
          </Specs>

          <SellerCard>
            <SellerHeader>
              <Avatar>👤</Avatar>
              <SellerInfo>
                <h4>{product.seller}</h4>
                <p className="seller-rating">⭐ 4.6 (128 reviews)</p>
              </SellerInfo>
            </SellerHeader>
            <p className="seller-joined">Member since 2023</p>
            <StoreBtn>View Store</StoreBtn>
          </SellerCard>

          <Quantity>
            <label>Quantity</label>
            <QuantityControl>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min={1} />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </QuantityControl>
          </Quantity>

          <ActionRow>
            <AddCart onClick={handleAddToCart}><ShoppingCart size={20} /> Add to Cart</AddCart>
            <Contact onClick={handleContact}><MessageSquare size={20} /> Chat with Seller</Contact>
          </ActionRow>

          <ShareBtn onClick={handleShare}><Share2 size={18} /> Share this product</ShareBtn>
        </InfoSection>
      </Content>

      <Reviews>
        <h2>Customer Reviews ({product.reviews})</h2>
        <ReviewsList>
          <ReviewItem>
            <ReviewHeader><span className="reviewer-name">Nguyễn Văn A</span><span className="review-rating">⭐⭐⭐⭐⭐</span></ReviewHeader>
            <p className="review-text">Great bike! Exactly as described. Seller was very responsive and helpful. Highly recommended!</p>
            <span className="review-date">Verified Buyer • 2 weeks ago</span>
          </ReviewItem>

          <ReviewItem>
            <ReviewHeader><span className="reviewer-name">Trần Thị B</span><span className="review-rating">⭐⭐⭐⭐</span></ReviewHeader>
            <p className="review-text">Good condition bike. Shipping was fast and well-packaged.</p>
            <span className="review-date">Verified Buyer • 1 month ago</span>
          </ReviewItem>
        </ReviewsList>
      </Reviews>
    </Page>
  );
};

export default ProductDetail;

const Page = styled.div`background:white;min-height:calc(100vh - 80px)`
const HeaderBar = styled.div`background:#f9f9f9;padding:1rem 2rem;border-bottom:2px solid #e0e0e0`
const Back = styled.button`display:flex;align-items:center;gap:0.5rem;background:white;color:#1db854;border:2px solid #1db854;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-weight:600; &:hover{background:#f0fdf4}`
const Content = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:3rem;max-width:1400px;margin:0 auto;padding:2rem`
const ImageSection = styled.div`display:flex;flex-direction:column;gap:1rem`
const MainImage = styled.div`position:relative;width:100%;aspect-ratio:1;background:#f9f9f9;border:2px solid #e0e0e0;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden .image-icon{font-size:5rem}`
const ConditionLarge = styled.span`position:absolute;top:1rem;right:1rem;background:#1db854;color:white;padding:0.5rem 1rem;border-radius:6px;font-weight:600;font-size:0.9rem`
const ThumbnailGallery = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem`
const Thumbnail = styled.div<{active?: boolean}>`aspect-ratio:1;background:#f9f9f9;border:2px solid ${props=>props.active?'#1db854':'#e0e0e0'};border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s; &:hover{border-color:#bbf7d0}`
const InfoSection = styled.div`display:flex;flex-direction:column;gap:1.5rem`
const ProductHeader = styled.div`display:flex;justify-content:space-between;align-items:flex-start;gap:1rem h1{margin:0 0 0.5rem 0;color:#1db854;font-size:2rem;line-height:1.3} .brand-info{margin:0;color:#666;font-size:0.95rem}`
const FavBtn = styled.button`background:transparent;border:2px solid #e0e0e0;color:#666;width:50px;height:50px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer; &:hover{border-color:#1db854;color:#1db854} &.active{background:#ff6b6b;border-color:#ff6b6b;color:white}`
const Rating = styled.div`display:flex;align-items:center;gap:1rem;padding:1rem;background:#f0fdf4;border-radius:8px .rating-star{font-size:1.2rem;color:#1db854}`
const Price = styled.div`border-bottom:2px solid #e0e0e0;padding-bottom:1rem h2{margin:0;color:#1db854;font-size:2.5rem;font-weight:700}`
const Description = styled.div`h3{margin:0 0 0.75rem 0;color:#1db854;font-size:1.1rem} p{margin:0;color:#1a1a1a;line-height:1.6;font-size:0.95rem}`
const Specs = styled.div`h3{margin:0 0 1rem 0;color:#1db854;font-size:1.1rem}`
const SpecsGrid = styled.div`display:grid;grid-template-columns:repeat(2,1fr);gap:1rem`
const Spec = styled.div`background:#f9f9f9;padding:1rem;border-radius:6px;border:1px solid #e0e0e0 label{display:block;color:#1db854;font-weight:600;font-size:0.85rem;margin-bottom:0.5rem;text-transform:uppercase}`
const SellerCard = styled.div`background:white;border:2px solid #bbf7d0;border-radius:8px;padding:1.5rem`
const SellerHeader = styled.div`display:flex;gap:1rem;margin-bottom:1rem;align-items:flex-start`
const Avatar = styled.div`width:60px;height:60px;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0`
const SellerInfo = styled.div`h4{margin:0 0 0.25rem 0;color:#1db854;font-size:1.05rem} .seller-rating{margin:0;color:#666;font-size:0.9rem}`
const StoreBtn = styled.button`width:100%;background:#1db854;color:white;border:none;padding:0.75rem;border-radius:6px;cursor:pointer;font-weight:600; &:hover{background:#0da845}`
const Quantity = styled.div`display:flex;align-items:center;gap:1rem label{font-weight:600;color:#1db854;white-space:nowrap}`
const QuantityControl = styled.div`display:flex;align-items:center;gap:0.5rem;background:#f9f9f9;border:2px solid #e0e0e0;border-radius:6px;padding:0.25rem button{background:white;border:none;width:36px;height:36px;cursor:pointer;color:#1db854;font-weight:600;border-radius:4px} button:hover{background:#1db854;color:white} input{width:60px;text-align:center;border:none;background:transparent;font-weight:600;color:#1a1a1a}`
const ActionRow = styled.div`display:grid;grid-template-columns:1.5fr 1fr;gap:1rem`
const AddCart = styled.button`display:flex;align-items:center;justify-content:center;gap:0.75rem;padding:1rem;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:1rem;background:#1db854;color:white; &:hover{background:#0da845;transform:translateY(-2px);box-shadow:0 4px 12px rgba(29,184,84,0.2)}`
const Contact = styled.button`background:white;color:#1db854;border:2px solid #1db854;display:flex;align-items:center;justify-content:center;gap:0.75rem;padding:1rem;border-radius:8px;cursor:pointer`
const ShareBtn = styled.button`width:100%;background:transparent;color:#1db854;border:2px solid #bbf7d0;padding:0.75rem;border-radius:6px;cursor:pointer;font-weight:600;display:flex;align-items:center;justify-content:center;gap:0.5rem; &:hover{border-color:#1db854;background:#f0fdf4}`
const Reviews = styled.div`max-width:1400px;margin:0 auto;padding:2rem;border-top:2px solid #e0e0e0 h2{color:#1db854;margin:0 0 1.5rem 0}`
const ReviewsList = styled.div`display:flex;flex-direction:column;gap:1.5rem`
const ReviewItem = styled.div`background:#f9f9f9;border:1px solid #e0e0e0;border-radius:8px;padding:1.5rem`
const ReviewHeader = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem`

