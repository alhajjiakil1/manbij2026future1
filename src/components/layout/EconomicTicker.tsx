import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Fuel, Wheat, Coins } from 'lucide-react';
import { supabase, Commodity } from '../../lib/supabase';

export default function EconomicTicker() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    try {
      const { data, error } = await supabase
        .from('commodities')
        .select('*')
        .order('category')
        .order('name_ar');

      if (error) throw error;
      setCommodities(data || []);
    } catch (err) {
      console.error('Error fetching commodities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'سلع':
        return <Wheat className="w-4 h-4" />;
      case 'وقود':
        return <Fuel className="w-4 h-4" />;
      default:
        return <Coins className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SY').format(price);
  };

  const getChangeIndicator = (current: number, previous: number | null) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    const isUp = change > 0;
    return (
      <span className={`flex items-center gap-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span className="text-xs">{Math.abs(change).toFixed(1)}%</span>
      </span>
    );
  };

  if (loading || commodities.length === 0) {
    return (
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0B132B] text-white py-2.5 overflow-hidden">
        <div className="flex items-center gap-2 px-4">
          <span className="text-[#D4AF37]">جاري تحميل الأسعار...</span>
        </div>
      </div>
    );
  }

  // Split into two rows for better visibility
  const commoditiesRow = [...commodities, ...commodities]; // Duplicate for seamless loop

  return (
    <div className="bg-gradient-to-r from-[#1E293B] via-[#0B132B] to-[#1E293B] text-white py-2.5 overflow-hidden border-y border-[#D4AF37]/20">
      <div className="relative">
        {/* First ticker row */}
        <div className="animate-ticker whitespace-nowrap flex items-center gap-8">
          {commoditiesRow.map((commodity, index) => (
            <div
              key={`${commodity.id}-${index}`}
              className="inline-flex items-center gap-3 bg-white/5 rounded-lg px-4 py-1.5 border border-white/10"
            >
              <span className="text-[#D4AF37]">{getIcon(commodity.category)}</span>
              <span className="font-medium">{commodity.name_ar}</span>
              <span className="text-white/60 text-sm">{commodity.unit_ar}</span>
              <span className="font-bold text-[#D4AF37]">{formatPrice(commodity.current_price)} ل.س</span>
              {getChangeIndicator(commodity.current_price, commodity.previous_price)}
            </div>
          ))}
        </div>

        {/* Gradient overlays for smooth edges */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0B132B] to-transparent pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0B132B] to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}