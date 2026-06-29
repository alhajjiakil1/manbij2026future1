import { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Menu,
  X,
  Sun,
  CloudRain,
  Thermometer,
  FileText,
  Users,
  Home,
  UserPlus,
  Settings,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Time and date update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hijri date calculation (approximate)
  const getHijriDate = () => {
    const today = new Date();
    const hijriDay = Math.floor((today.getTime() - new Date(1970, 0, 1).getTime()) / (1000 * 60 * 60 * 24) * 0.970224) % 30 + 1;
    const hijriMonths = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
    const hijriMonth = hijriMonths[Math.floor((Math.floor((today.getTime() - new Date(1970, 0, 1).getTime()) / (1000 * 60 * 60 * 24) * 0.970224) / 30) % 12)];
    const hijriYear = Math.floor(Math.floor((today.getTime() - new Date(1970, 0, 1).getTime()) / (1000 * 60 * 60 * 24) * 0.970224) / 354) + 1390;
    return `${hijriDay} ${hijriMonth} ${hijriYear}`;
  };

  const formatGregorianDate = () => {
    return currentTime.toLocaleDateString('ar-SY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('ar-SY', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'directory', label: 'دليل المنشآت', icon: Building2 },
    { id: 'news', label: 'المركز الإعلامي', icon: FileText },
    { id: 'register', label: 'تسجيل منشأة', icon: UserPlus },
    { id: 'admin', label: 'لوحة التحكم', icon: Settings },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`directory?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-dark shadow-lg' : 'nav-gradient'}`}>
      {/* Top bar with date/time/weather */}
      <div className="bg-[#0B132B]/80 text-white/90 text-xs py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>منبج</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-yellow-300" />
              <span>مشمس - 35°</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block">{getHijriDate()}</span>
            <span className="hidden sm:block">{formatGregorianDate()}</span>
            <span className="flex items-center gap-1 font-medium">
              <span className="text-[#D4AF37]">{formatTime()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <img
              src="https://i.ibb.co/5WL5B8gS/2026-06-29-174506-removebg-preview.png"
              alt="شعار غرفة التجارة والصناعة في منبج"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-lg"
            />
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-lg leading-tight">غرفة التجارة والصناعة</h1>
              <p className="text-white/70 text-xs">في منبج</p>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الدليل التجاري..."
                className="w-full bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-lg py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || (item.id === 'admin' && currentPage.startsWith('admin'));
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#D4AF37] text-white shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1E293B] border-t border-white/10 animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في الدليل التجاري..."
                  className="w-full bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
              </div>
            </form>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#D4AF37] text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}