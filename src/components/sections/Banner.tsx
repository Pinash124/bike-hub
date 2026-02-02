import 'antd/dist/reset.css'
import { Button } from 'antd'
import styled from 'styled-components'

const BannerCard = styled.section`
  margin: 15px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`

const ImageContainer = styled.div`
  position: relative;
  height: 350px;
  width: 100%;
`

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const Overlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 20px;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 10px;
  }
`

const ExploreButton = styled(Button)`
  margin-top: 20px;
  padding: 12px 30px;
  border-radius: 25px;
  background: #1db854;
  color: white;
  font-weight: bold;
  border: none;

  &:hover, &:focus {
    background: #17a64a;
    color: white;
  }
`

export default function Banner() {
  return (
    <BannerCard>
      <ImageContainer>
        <Img
          src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=2000"
          alt="Bicycle Banner"
        />
        <Overlay>
          <h2>Tìm Kiếm Chiếc Xe Hoàn Hảo</h2>
          <p>Hàng ngàn xe đạp chất lượng từ những người bán uy tín</p>
          <ExploreButton type="primary">Khám phá ngay</ExploreButton>
        </Overlay>
      </ImageContainer>
    </BannerCard>
  )
}