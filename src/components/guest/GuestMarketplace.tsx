import React, { useState, useEffect } from "react";
import Banner from "../sections/Banner";
import Categories from "../sections/Categories";
import BikeCard from "../sections/BikeCard";
import { brandService, type Brand } from "../../services/brand.service";
import { listingService, type Listing } from "../../services/listing.service";
import { favoriteService } from "../../services/favorite.service";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  Sparkles,
  Bike,
} from "lucide-react";

export const GuestMarketplace: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedBrand, setSelectedBrand] = useState("Tất cả");
  const [bikes, setBikes] = useState<Listing[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) {
        setFavoriteIds(new Set());
        return;
      }

      const favorites = await favoriteService.getMyFavorites();
      setFavoriteIds(new Set(favorites.map((item) => String(item.listing.id))));
    };

    void fetchFavorites();
  }, [isAuthenticated]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [listingsData, brandsData] = await Promise.all([
        listingService.getListings(),
        brandService.getAllBrands(),
      ]);
      setBikes(listingsData.filter((b) => b.status === "LIVE"));
      setBrands(brandsData);
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (listingId: string) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích");
      return;
    }

    if (togglingFavoriteId) return;

    setTogglingFavoriteId(listingId);
    try {
      if (favoriteIds.has(listingId)) {
        const success = await favoriteService.removeFavorite(listingId);
        if (success) {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(listingId);
            return next;
          });
        }
      } else {
        const res = await favoriteService.addFavorite(listingId);
        if (res) {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.add(listingId);
            return next;
          });
        }
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      alert("Không thể cập nhật yêu thích. Vui lòng thử lại.");
    } finally {
      setTogglingFavoriteId(null);
    }
  };

  const filteredBikes = bikes
    .filter((bike) => {
      const matchesBrand =
        selectedBrand === "Tất cả" || bike.brand?.name === selectedBrand;
      const matchesSearch =
        searchQuery === "" ||
        bike.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.brand?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBrand && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <Banner />

        {/* Search and Filter Bar */}
        <div className="sticky top-24 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 mb-8 rounded-b-2xl shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm xe đạp, thương hiệu, mô tả..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-sm font-medium"
                >
                  <Filter size={16} className="text-slate-500" />
                  <span>
                    {sortBy === "newest"
                      ? "Mới nhất"
                      : sortBy === "price-low"
                        ? "Giá thấp → cao"
                        : "Giá cao → thấp"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>

                {showFilters && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setSortBy("newest");
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-green-50 transition-colors ${
                        sortBy === "newest"
                          ? "bg-green-50 text-green-700"
                          : "text-slate-700"
                      }`}
                    >
                      Mới nhất
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("price-low");
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-green-50 transition-colors ${
                        sortBy === "price-low"
                          ? "bg-green-50 text-green-700"
                          : "text-slate-700"
                      }`}
                    >
                      Giá thấp → cao
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("price-high");
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-green-50 transition-colors ${
                        sortBy === "price-high"
                          ? "bg-green-50 text-green-700"
                          : "text-slate-700"
                      }`}
                    >
                      Giá cao → thấp
                    </button>
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <Categories
          brands={brands}
          selectedBrand={selectedBrand}
          onSelectBrand={(brand: string) =>
            setSelectedBrand(brand === selectedBrand ? "Tất cả" : brand)
          }
        />

        {/* Results Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-green-600" />
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedBrand === "Tất cả"
                    ? "Tất cả sản phẩm"
                    : `Xe ${selectedBrand}`}
                </h3>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                {filteredBikes.length} xe
              </span>
            </div>

            {searchQuery && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Kết quả cho:</span>
                <span className="font-semibold text-green-600">
                  "{searchQuery}"
                </span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-green-200 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-green-600 animate-spin"></div>
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600">
                Đang tải danh sách xe...
              </p>
            </div>
          ) : filteredBikes.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Bike size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Không tìm thấy xe phù hợp
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? `Không có kết quả cho "${searchQuery}". Thử tìm kiếm với từ khóa khác.`
                  : "Không có xe nào trong danh mục này. Thử xem các danh mục khác!"}
              </p>
              <button
                onClick={() => {
                  setSelectedBrand("Tất cả");
                  setSearchQuery("");
                  setSortBy("newest");
                }}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all"
              >
                Xem tất cả xe
              </button>
            </div>
          ) : (
            <div
              className={`gap-6 ${
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col space-y-4"
              }`}
            >
              {filteredBikes.map((bike) => {
                const mappedProps = {
                  id: bike.id,
                  image:
                    bike.images?.[0]?.secureUrl ||
                    "https://images.unsplash.com/photo-1532298229144-0ee050c99d2b?q=80&w=800",
                  title: bike.title,
                  price: bike.price,
                  year: new Date(bike.createdAt).getFullYear(),
                  location: bike.location || "Toàn quốc",
                  mileage: bike.usageDuration || 0,
                  mileageUnit: "nam" as const,
                  size: "N/A",
                  condition: bike.condition || "Đã qua sử dụng",
                  description: bike.description,
                  brand: bike.brand?.name || "Khác",
                };
                return (
                  <BikeCard
                    key={bike.id}
                    {...mappedProps}
                    isFavorite={favoriteIds.has(String(bike.id))}
                    onToggleFavorite={handleToggleFavorite}
                    favoriteDisabled={togglingFavoriteId === String(bike.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
