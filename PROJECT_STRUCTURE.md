# BikeHub - Project Structure

## 📁 Cấu Trúc Thư Mục

```
src/
├── components/              # Tất cả React components
│   ├── common/             # Components dùng chung (Header, Footer)
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── sections/           # Components cho các section (Banner, BikeCard, etc)
│   │   ├── Banner.tsx
│   │   ├── BikeCard.tsx
│   │   ├── Categories.tsx
│   │   ├── FeaturedBikes.tsx
│   │   ├── Features.tsx
│   │   └── FilterSection.tsx
│   ├── auth/               # Components cho authentication
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── KYC.tsx
│   └── dashboards/         # Dashboard components
│       ├── SellerDashboard.tsx
│       ├── BuyerDashboard.tsx
│       ├── AdminDashboard.tsx
│       └── InspectorDashboard.tsx
├── styles/                 # CSS files (organized like components)
│   ├── common/
│   │   ├── Header.css
│   │   └── Footer.css
│   ├── sections/
│   │   ├── Banner.css
│   │   ├── BikeCard.css
│   │   ├── Categories.css
│   │   ├── FeaturedBikes.css
│   │   ├── Features.css
│   │   └── FilterSection.css
│   ├── auth/
│   │   ├── Auth.css        # Dùng cho Login & Register
│   │   └── KYC.css
│   └── dashboards/
│       └── Dashboard.css   # Dùng cho tất cả dashboards
├── types/                  # TypeScript types & interfaces
├── utils/                  # Utility functions
├── contexts/               # React Context (nếu cần)
├── assets/                 # Images, icons, etc
├── pages/                  # (Ready for future use)
├── App.tsx                 # Main app component
├── App.css                 # Global app styles
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## 📂 Hướng Dẫn Tìm Và Sửa File

### Cần sửa component Button?
→ Tìm trong `src/components/common/` hoặc `src/components/sections/`

### Cần sửa style của Header?
→ Mở `src/styles/common/Header.css`

### Cần thêm KYC component?
→ Thêm file vào `src/components/auth/`

### Cần thêm Dashboard mới?
→ Thêm vào `src/components/dashboards/`

### Cần utility function?
→ Thêm vào `src/utils/`

## 🎯 Nguyên Tắc Tổ Chức

1. **Components & Styles Song Song**: Mỗi component .tsx có file .css tương ứng ở cùng loại folder
2. **Phân Loại Rõ Ràng**:
   - `common/`: Components tái sử dụng (Header, Footer)
   - `sections/`: Các section trang chủ (Banner, Featured bikes, etc)
   - `auth/`: Login, Register, KYC
   - `dashboards/`: Seller, Buyer, Admin, Inspector dashboards
3. **Dễ Bảo Trì**: Khi có lỗi, dễ dàng tìm file liên quan

## 🔍 Cách Tìm File

### Tìm component:
```bash
# Tìm Header component
src/components/common/Header.tsx

# Tìm KYC form
src/components/auth/KYC.tsx

# Tìm BikeCard component
src/components/sections/BikeCard.tsx
```

### Tìm CSS:
```bash
# CSS cho Header
src/styles/common/Header.css

# CSS cho KYC
src/styles/auth/KYC.css

# CSS cho BikeCard
src/styles/sections/BikeCard.css
```

## 🚀 Build & Run

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview
```

## 📝 Thêm Component Mới

1. **Xác định loại component**: common, sections, auth, hay dashboards?
2. **Tạo file .tsx** trong folder tương ứng
3. **Tạo file .css** trong folder styles tương ứng
4. **Import CSS**: `import '../../styles/{folder}/{filename}.css'`
5. **Import component** ở App.tsx hoặc nơi cần dùng

Ví dụ - Thêm component UserProfile:
```
src/components/common/UserProfile.tsx
src/styles/common/UserProfile.css
```

---

**Status**: ✅ Organized & Production Ready
**Build**: Success (0 errors)
