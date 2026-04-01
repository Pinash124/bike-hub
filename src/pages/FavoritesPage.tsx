import { useEffect, useMemo, useState } from "react";
import { Heart, Loader2, RefreshCcw } from "lucide-react";
import BikeCard from "../components/sections/BikeCard";
import { favoriteService, type Favorite } from "../services/favorite.service";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(
    null,
  );

  const fetchFavorites = async (force = false) => {
    setIsLoading(true);
    try {
      const data = await favoriteService.getMyFavorites({ force });
      setFavorites(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchFavorites();
  }, []);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((item) => String(item.listing.id))),
    [favorites],
  );

  const handleToggleFavorite = async (listingId: string) => {
    if (togglingFavoriteId) return;

    setTogglingFavoriteId(listingId);
    try {
      const success = await favoriteService.removeFavorite(listingId);
      if (success) {
        setFavorites((prev) =>
          prev.filter((item) => String(item.listing.id) !== listingId),
        );
      }
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      alert("Không thể cập nhật yêu thích. Vui lòng thử lại.");
    } finally {
      setTogglingFavoriteId(null);
    }
  };

  return (
    <section className="min-h-[calc(100vh-160px)] bg-slate-50/40 py-10 sm:py-14">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-green-600">
              Bộ sưu tập cá nhân
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Xe yêu thích
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Nơi lưu lại những mẫu xe bạn quan tâm để quay lại xem nhanh.
            </p>
          </div>

          <button
            onClick={() => void fetchFavorites(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:border-green-300 hover:text-green-700"
          >
            <RefreshCcw size={14} />
            Làm mới
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-slate-100 bg-white">
            <Loader2 size={28} className="animate-spin text-green-600" />
            <p className="text-sm font-semibold text-slate-500">
              Đang tải danh sách yêu thích...
            </p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Heart size={28} />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Bạn chưa có xe yêu thích
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Hãy bấm biểu tượng tim ở danh sách sản phẩm để lưu xe vào bộ sưu
              tập này.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((item) => {
              const listing = item.listing;
              return (
                <BikeCard
                  key={listing.id}
                  id={listing.id}
                  image={
                    listing.images?.[0]?.secureUrl ||
                    "https://images.unsplash.com/photo-1532298229144-0ee050c99d2b?q=80&w=800"
                  }
                  title={listing.title}
                  price={listing.price}
                  year={new Date(listing.createdAt).getFullYear()}
                  location={listing.location || "Toàn quốc"}
                  mileage={listing.usageDuration || 0}
                  mileageUnit="nam"
                  size="N/A"
                  condition={listing.condition || "Đã qua sử dụng"}
                  description={listing.description}
                  brand={listing.brand?.name || "Khác"}
                  isFavorite={favoriteIds.has(String(listing.id))}
                  onToggleFavorite={handleToggleFavorite}
                  favoriteDisabled={togglingFavoriteId === String(listing.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
