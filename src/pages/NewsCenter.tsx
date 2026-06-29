import { useState, useEffect } from 'react';
import {
  Newspaper,
  Calendar,
  Tag,
  Search,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { supabase, News } from '../lib/supabase';

export default function NewsCenter() {
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, searchQuery, selectedCategory]);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
      setFilteredNews(data || []);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = news;
    if (searchQuery) {
      filtered = filtered.filter(
        (article) =>
          article.title_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content_ar.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter((article) => article.category === selectedCategory);
    }
    setFilteredNews(filtered);
  };

  const categories = [...new Set(news.map((article) => article.category))];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'أخبار':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'فعاليات':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'مشاريع':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'قرارات':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else if (diffInDays < 7) {
      return `منذ ${diffInDays} يوم`;
    } else {
      return date.toLocaleDateString('ar-SY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const featuredArticle = filteredNews[0];
  const otherArticles = filteredNews.slice(1);

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-12">
        <div className="bg-gradient-to-r from-[#0B132B] to-[#1E293B] text-white py-12 mb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              العودة للقائمة
            </button>
            <span className={`${getCategoryColor(selectedArticle.category)} text-xs px-3 py-1 rounded-full border inline-block mb-4`}>
              {selectedArticle.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mb-4">{selectedArticle.title_ar}</h1>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(selectedArticle.published_at).toLocaleDateString('ar-SY', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatTimeAgo(selectedArticle.published_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {selectedArticle.image_url && (
              <img
                src={selectedArticle.image_url}
                alt={selectedArticle.title_ar}
                className="w-full h-64 object-cover rounded-lg mb-8"
              />
            )}
            <div className="prose prose-lg max-w-none">
              {selectedArticle.content_ar.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-[#334155] leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B132B] to-[#1E293B] text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="text-3xl sm:text-4xl font-black">المركز الإعلامي</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl">
            آخر الأخبار والإعلانات الصادرة عن غرفة التجارة والصناعة في منبج
          </p>

          {/* Search */}
          <div className="mt-6 max-w-xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأخبار..."
              className="w-full bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-[#D4AF37] text-[#0B132B]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              الكل
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#D4AF37] text-[#0B132B]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#0B132B] mb-2">لا توجد أخبار</h3>
            <p className="text-[#64748B] mb-4">لم نعثر على أخبار مطابقة</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="btn-secondary"
            >
              مسح الفلترة
            </button>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featuredArticle && (
              <div
                onClick={() => setSelectedArticle(featuredArticle)}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer mb-8 group"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="h-64 md:h-auto bg-gradient-to-br from-[#0B132B] to-[#1E293B] relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Newspaper className="w-24 h-24 text-white/10" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`${getCategoryColor(featuredArticle.category)} text-xs px-3 py-1 rounded-full border font-medium`}>
                        {featuredArticle.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-sm text-[#94A3B8] mb-3">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredArticle.published_at).toLocaleDateString('ar-SY', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <h2 className="text-2xl font-bold text-[#0B132B] mb-4 group-hover:text-[#D4AF37] transition-colors">
                      {featuredArticle.title_ar}
                    </h2>
                    <p className="text-[#64748B] leading-relaxed line-clamp-3">
                      {featuredArticle.content_ar}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[#D4AF37] font-medium">
                      اقرأ المزيد
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other articles grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherArticles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="h-40 bg-gradient-to-br from-[#0B132B] to-[#1E293B] relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Newspaper className="w-12 h-12 text-white/10" />
                    </div>
                    <div className={`absolute top-3 right-3 ${getCategoryColor(article.category)} text-xs px-3 py-1 rounded-full border font-medium`}>
                      {article.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimeAgo(article.published_at)}
                    </div>
                    <h3 className="font-bold text-lg text-[#0B132B] mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                      {article.title_ar}
                    </h3>
                    <p className="text-[#64748B] text-sm line-clamp-2">
                      {article.content_ar}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}