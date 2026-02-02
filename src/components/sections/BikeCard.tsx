import { Heart } from 'lucide-react'
import styled from 'styled-components'

interface BikeCardProps {
  id: number
  image: string
  title: string
  price: number
  originalPrice?: number
  year: number
  location: string
  mileage: number
  size?: string
  condition?: string
  isFeatured?: boolean
  brand?: string // Thêm brand để đồng bộ với bộ lọc
}

export default function BikeCard({
  image,
  title,
  price,
  originalPrice,
  year,
  location,
  mileage,
  size = 'M',
  condition = '99%',
  isFeatured = false,
}: BikeCardProps) {
  // Tính toán % giảm giá
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <Card featured={isFeatured}>
      <ImageWrap>
        <Placeholder>{image}</Placeholder>

        <FavoriteButton title="Yêu thích">
          <Heart size={18} />
        </FavoriteButton>

        <BadgeContainer>
          <ConditionBadge>{condition}</ConditionBadge>
          {discount > 0 && <DiscountBadge>-{discount}%</DiscountBadge>}
        </BadgeContainer>
      </ImageWrap>

      <Info>
        <Title className="bike-title" title={title}>{title}</Title>

        <Meta>
          <span>Size {size}</span>
          <span>•</span>
          <span>Đời {year}</span>
        </Meta>

        <PriceRow>
          <CurrentPrice>{price.toLocaleString('vi-VN')}₫</CurrentPrice>
          {originalPrice && (
            <OriginalPrice>{originalPrice.toLocaleString('vi-VN')}₫</OriginalPrice>
          )}
        </PriceRow>

        <Footer>
          <span>{mileage.toLocaleString('vi-VN')} km</span>
          <span>{location}</span>
        </Footer>
      </Info>
    </Card>
  )
}

const Card = styled.div<{featured?: boolean}>`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); border-color: #1db854; }
`

const ImageWrap = styled.div`
  position: relative;
  aspect-ratio: 4/3;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
`

const Placeholder = styled.div``

const FavoriteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  color: #666;
  display: flex;
  transition: all 0.2s;

  &:hover { color: #ff4d4f; transform: scale(1.1); }
`

const BadgeContainer = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  gap: 5px;
`

const ConditionBadge = styled.div`
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
`

const DiscountBadge = styled.div`
  background: #ff4d4f;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
`

const Info = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
`

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 4px;
`

const CurrentPrice = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #d0021b;
`

const OriginalPrice = styled.span`
  font-size: 12px;
  color: #bfbfbf;
  text-decoration: line-through;
`

const Footer = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8c8c8c;
`