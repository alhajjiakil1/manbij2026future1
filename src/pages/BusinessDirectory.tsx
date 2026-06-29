import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Phone,
  Building2,
  Users,
  Factory,
  Wheat,
  Briefcase,
  Wrench,
  ChevronLeft,
  ChevronRight,
  X,
  Grid,
  List
} from 'lucide-react';
import { supabase, Merchant, Sector, SubRegion } from '../lib/supabase';

export default function BusinessDirectory() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subRegions, setSubRegions] = useState<SubRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [merchantsRes, sectorsRes, regionsRes] = await Promise.all([
        supabase
          .from('merchants')
          .select(`*, sector:sectors(*), sub_region:sub_regions(*)`)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase.from('sectors').select('*').order('sort_order'),
        supabase.from('sub_regions').select('*').order('sort_order')
      ]);

      setMerchants(merchantsRes.data || []);
      setSectors(sectorsRes.data || []);
      setSubRegions(regionsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter merchants
  const filteredMerchants = useMemo(() => {
    return merchants.filter((merchant) => {
      const matchesSearch = searchQuery === '' ||
        merchant.business_name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.owner_name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.address_ar.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector = selectedSector === '' || merchant.sector_id === selectedSector;
      const matchesRegion = selectedRegion === '' || merchant.sub_region_id === selectedRegion;

      return matchesSearch && matchesSector && matchesRegion;
    });
  }, [merchants, searchQuery, selectedSector, selectedRegion]);

  // Pagination
  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);
  const paginatedMerchants = filteredMerchants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSector, selectedRegion]);

  const getSectorIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Store':
        return <Building2 className="w-4 h-4" />;
      case 'Factory':
        return <Factory className="w-4 h-4" />;
      case 'Wheat':
        return <Wheat className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSector('');
    setSelectedRegion('');
  };

  const hasActiveFilters = searchQuery || selectedSector || selectedRegion;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B132B] to-[#1E293B] text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-4">دليل المنشآت التجارية</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            استعرض قائمة المنشآت المسجلة في غرفة التجارة والصناعة في منبج
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            {sectors.map((sector) => {
              const count = merchants.filter(m => m.sector_id === sector.id).length;
              return (
                <div
                  key={sector.id}
                  className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 flex items-center gap-2"
                >
                  <span className="text-[#D4AF37]">{getSectorIcon(sector.icon_name)}</span>
                  <span className="text-sm">{sector.name_ar}</span>
                  <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو الموقع..."
                  className="input-field pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
              </div>
            </div>

            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="input-field min-w-[180px]"
            >
              <option value="">جميع القطاعات</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name_ar}
                </option>
              ))}
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="input-field min-w-[180px]"
            >
              <option value="">جميع المناطق</option>
              {subRegions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name_ar}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                مسح الفلترة
              </button>
            )}

            <div className="flex items-center gap-2 mr-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#0B132B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#0B132B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-[#64748B]">
            <span>عرض {paginatedMerchants.length} من أصل {filteredMerchants.length} منشأة</span>
            {selectedSector && (
              <div className="flex items-center gap-2">
                <span className="bg-[#0B132B]/10 px-3 py-1 rounded-full">
                  {sectors.find(s => s.id === selectedSector)?.name_ar}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : paginatedMerchants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#0B132B] mb-2">لا توجد نتائج</h3>
            <p className="text-[#64748B] mb-4">لم نعثر على منشآت مطابقة لمعايير البحث</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-secondary">
                مسح الفلترة والمحاولة مجدداً
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
              >
                <div className="bg-gradient-to-r from-[#0B132B] to-[#1E293B] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <span className="text-xs text-white/60">رقم الغرفة</span>
                      <p className="text-white font-bold">{merchant.chamber_id}</p>
                    </div>
                  </div>
                  {merchant.sector && (
                    <span className="bg-[#D4AF37] text-[#0B132B] text-xs px-3 py-1 rounded-full font-medium">
                      {merchant.sector.name_ar}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-[#0B132B] mb-1 group-hover:text-[#D4AF37] transition-colors">
                    {merchant.business_name_ar}
                  </h3>
                  <p className="text-sm text-[#64748B] mb-4">{merchant.owner_name_ar}</p>

                  <div className="space-y-2 text-sm text-[#64748B]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{merchant.address_ar}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span dir="ltr" className="text-right">{merchant.phone_number}</span>
                    </div>
                  </div>

                  {merchant.main_products_ar && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-[#94A3B8] line-clamp-2">
                        {merchant.main_products_ar}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 flex items-center gap-6"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#0B132B] to-[#1E293B] rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-bold text-lg text-[#0B132B]">{merchant.business_name_ar}</h3>
                    <span className="text-[#D4AF37] font-medium text-sm shrink-0">{merchant.chamber_id}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
                    <span>{merchant.owner_name_ar}</span>
                    {merchant.sector && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{merchant.sector.name_ar}</span>
                    )}
                    {merchant.sub_region && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{merchant.sub_region.name_ar}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {merchant.address_ar}
                    </span>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <span className="flex items-center gap-1 text-sm">
                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                    <span dir="ltr">{merchant.phone_number}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-[#0B132B] text-white'
                      : 'bg-white shadow hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}