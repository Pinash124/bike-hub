// src/components/sections/FeaturedBikes.tsx
import { useState, useEffect } from 'react';
import BikeCard from './BikeCard';
import { listingService, type Listing } from '../../services/listing.service';

export default function FeaturedBikes() {
  const [featuredBikes, setFeaturedBikes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const data = await listingService.getListings();
      const activeListings = data.filter((listing: Listing) => listing.status === 'LIVE' || listing.status === 'APPROVED');
      // Map API data to UI format
      const mappedBikes = activeListings.slice(0, 4).map((listing: Listing) => ({
        id: listing.id,
        image: listing.images?.[0]?.secureUrl || 'https://images.unsplash.com/photo-1532298229144-0ee050c99d2b?q=80&w=800',
        title: listing.title,
        price: listing.price,
        year: 2024, // Default or derived
        location: listing.location || 'Toàn quốc',
        mileage: listing.usageDuration || 0,
        size: 'N/A',
        condition: listing.condition || 'Used'
      }));
      setFeaturedBikes(mappedBikes);
    } catch (error) {
      console.error('Failed to fetch featured bikes', error);
      // Fallback to empty or skeletal state
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Sử dụng màu nền cực nhạt để tạo chiều sâu cho Card trắng
    <section className="bg-[#f8fafc] py-24 border-b border-slate-100">

      {/* Đảm bảo div bọc ngoài có class 'content-layout' 
        để margin-left và margin-right khớp hoàn toàn với FilterSection
      */}
      <div className="content-layout px-4 md:px-8 max-w-[1440px] mx-auto">

        {/* HEADER SECTION: Đẩy cao tính thẩm mỹ tạp chí (Editorial) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-green-500"></span>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em]">
                Sản phẩm nổi bật
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              Dành riêng <br className="hidden md:block" /> cho bạn
            </h2>
          </div>

          <a
            href="/search"
            className="group flex items-center gap-4 text-[11px] font-black text-slate-400 hover:text-green-600 uppercase tracking-widest transition-all"
          >
            <span>Khám phá tất cả mẫu xe</span>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all shadow-sm">
              <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </a>
        </div>

        {/* GRID SẢN PHẨM: Đồng bộ Gap 10 để tạo sự thoáng đãng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {featuredBikes.map((bike, index) => (
            <div
              key={bike.id}
              className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-both"
              style={{ animationDelay: `${index * 150}ms` }} // Hiệu ứng hiện lần lượt
            >
              <BikeCard {...bike} />
            </div>
          ))}
          {!isLoading && featuredBikes.length === 0 && (
            <p className="col-span-4 text-center text-slate-400">Chưa có sản phẩm nào nổi bật.</p>
          )}
        </div>
      </div>
    </section>
  )
}