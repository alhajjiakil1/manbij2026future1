import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Factory,
  Wheat,
  FileText,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Award,
  Globe,
  Newspaper,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { supabase, News, Merchant, Sector } from '../lib/supabase';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [news, setNews] = useState<News[]>([]);
  const [stats, setStats] = useState({
    merchants: 0,
    sectors: 0,
    factories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [newsRes, merchantsRes, sectorsRes] = await Promise.all([
        supabase
          .from('news')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(3),
        supabase
          .from('merchants')
          .select('id', { count: 'exact' })
          .eq('is_active', true),
        supabase
          .from('sectors')
          .select('id', { count: 'exact' })
      ]);

      setNews(newsRes.data || []);
      setStats({
        merchants: merchantsRes.count || 0,
        sectors: sectorsRes.count || 0,
        factories: 0
      });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'أخبار':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'فعاليات':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'مشاريع':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230B132B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 relative">
          <div className="text-center mb-12">
            {/* Official Logo */}
            <div className="mb-6">
              <img
                src="https://i.ibb.co/5WL5B8gS/2026-06-29-174506-removebg-preview.png"
                alt="شعار غرفة التجارة والصناعة في منبج"
                className="h-24 sm:h-32 w-auto object-contain mx-auto drop-shadow-xl"
              />
            </div>

            {/* Decorative badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37]/20 to-[#B45309]/20 border border-[#D4AF37]/30 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-[#B45309] font-medium">المنصة الرقمية الرسمية</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B132B] mb-6 leading-tight">
              غرفة التجارة والصناعة
              <span className="block text-[#D4AF37] mt-2">في منبج</span>
            </h1>

            <p className="text-xl text-[#64748B] max-w-2xl mx-auto mb-8 leading-relaxed">
              بوابتكم الرسمية للتسجيل التجاري ودليل المنشآت الاقتصادية والخدمات الاستثمارية في المنطقة
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onNavigate('register')}
                className="btn-secondary flex items-center gap-2 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <Building2 className="w-5 h-5" />
                تسجيل منشأة جديدة
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('directory')}
                className="btn-outline flex items-center gap-2 text-lg"
              >
                <Users className="w-5 h-5" />
                استعرض الدليل التجاري
              </button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="stat-card text-center group hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0B132B] to-[#1E293B] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-shadow">
                <Users className="w-7 h-7 text-[#D4AF37]" />
              </div>
              <p className="text-3xl font-black text-[#0B132B]">{stats.merchants}+</p>
              <p className="text-[#64748B] font-medium">تاجر مسجل</p>
            </div>

            <div className="stat-card text-center group hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B45309] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-shadow">
                <Factory className="w-7 h-7 text-white" />
              </div>
              <p className="text-3xl font-black text-[#0B132B]">{stats.sectors}</p>
              <p className="text-[#64748B] font-medium">قطاعات اقتصادية</p>
            </div>

            <div className="stat-card text-center group hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-shadow">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <p className="text-3xl font-black text-[#0B132B]">24/7</p>
              <p className="text-[#64748B] font-medium">خدمة متواصلة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-12 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0B132B] mb-8 text-center">خدمات الغرفة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Building2, label: 'تسجيل منشأة', color: 'from-[#0B132B] to-[#1E293B]', page: 'register' },
              { icon: Users, label: 'دليل التجار', color: 'from-[#D4AF37] to-[#B45309]', page: 'directory' },
              { icon: Newspaper, label: 'المركز الإعلامي', color: 'from-[#3B82F6] to-[#1D4ED8]', page: 'news' },
              { icon: FileText, label: 'لوحة التحكم', color: 'from-[#10B981] to-[#059669]', page: 'admin' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => onNavigate(item.page)}
                  className="group bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-6 text-center hover:shadow-lg transition-all hover:scale-105"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-bold text-[#0B132B]">{item.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#0B132B] flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-[#D4AF37]" />
              آخر الأخبار والإعلانات
            </h2>
            <button
              onClick={() => onNavigate('news')}
              className="flex items-center gap-1 text-[#0B132B] hover:text-[#D4AF37] transition-colors font-medium"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden card-shadow hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className="h-40 bg-gradient-to-br from-[#0B132B] to-[#1E293B] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#D4AF37]/10"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Newspaper className="w-16 h-16 text-white/20" />
                    </div>
                    <div className={`absolute top-3 right-3 ${getCategoryColor(item.category)} text-xs px-3 py-1 rounded-full border font-medium`}>
                      {item.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-[#0B132B] mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                      {item.title_ar}
                    </h3>
                    <p className="text-[#64748B] text-sm line-clamp-3 mb-3">
                      {item.content_ar}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.published_at).toLocaleDateString('ar-SY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#0B132B] to-[#1E293B] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://i.ibb.co/5WL5B8gS/2026-06-29-174506-removebg-preview.png"
                  alt="شعار غرفة التجارة والصناعة في منبج"
                  className="h-14 w-auto object-contain"
                />
                <div>
                  <h3 className="font-bold">غرفة التجارة والصناعة</h3>
                  <p className="text-white/60 text-sm">في منبج</p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                مؤسسة رسمية تعنى بتطوير قطاع الأعمال والاستثمار في منطقة منبج
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#D4AF37]">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><button onClick={() => onNavigate('directory')} className="hover:text-[#D4AF37] transition-colors">دليل المنشآت</button></li>
                <li><button onClick={() => onNavigate('register')} className="hover:text-[#D4AF37] transition-colors">تسجيل منشأة</button></li>
                <li><button onClick={() => onNavigate('news')} className="hover:text-[#D4AF37] transition-colors">المركز الإعلامي</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#D4AF37]">تواصل معنا</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>منبج - سوريا</li>
                <li>info@manbij-chamber.sy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/40 text-sm">
            جميع الحقوق محفوظة © {new Date().getFullYear()} غرفة التجارة والصناعة في منبج
          </div>
        </div>
      </footer>
    </div>
  );
}