import { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Factory,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  MessageCircle,
  CheckSquare,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Upload,
  Download,
  RefreshCw,
  X,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Briefcase,
  User,
  Building,
  ExternalLink,
  Copy,
  Send
} from 'lucide-react';
import { supabase, MerchantApplication, Sector, SubRegion, DashboardStats } from '../lib/supabase';

export default function AdminDashboard() {
  const [applications, setApplications] = useState<MerchantApplication[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subRegions, setSubRegions] = useState<SubRegion[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMerchants: 0,
    pendingApplications: 0,
    activeFactories: 0,
    monthlyGrowth: 0,
    sectorBreakdown: [],
    recentApplications: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<MerchantApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications'>('dashboard');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [appsRes, sectorsRes, regionsRes, merchantsCount, pendingCount] = await Promise.all([
        supabase
          .from('merchant_applications')
          .select(`*, sector:sectors(*), sub_region:sub_regions(*)`)
          .order('created_at', { ascending: false }),
        supabase.from('sectors').select('*').order('sort_order'),
        supabase.from('sub_regions').select('*').order('sort_order'),
        supabase.from('merchants').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('merchant_applications').select('id', { count: 'exact' }).eq('status', 'قيد التدقيق')
      ]);

      setApplications(appsRes.data || []);
      setSectors(sectorsRes.data || []);
      setSubRegions(regionsRes.data || []);

      // Calculate stats
      const sectorBreakdown = sectorsRes.data?.map(sector => ({
        sector: sector.name_ar,
        count: appsRes.data?.filter(a => a.sector_id === sector.id).length || 0
      })) || [];

      setStats({
        totalMerchants: merchantsCount.count || 0,
        pendingApplications: pendingCount.count || 0,
        activeFactories: appsRes.data?.filter(a => a.status === 'معتمد رسمياً').length || 0,
        monthlyGrowth: 12.5, // Simulated
        sectorBreakdown,
        recentApplications: (appsRes.data || []).slice(0, 5)
      });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesSearch = !searchQuery ||
      app.business_name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.owner_name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.application_token.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApps = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const updateApplicationStatus = async (appId: string, newStatus: 'قيد التدقيق' | 'مرفوض لتعديل البيانات' | 'معتمد رسمياً', rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from('merchant_applications')
        .update({
          status: newStatus,
          rejection_reason: rejectionReason || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin'
        })
        .eq('id', appId);

      if (error) throw error;

      // If approved, add to merchants table
      if (newStatus === 'معتمد رسمياً') {
        const app = applications.find(a => a.id === appId);
        if (app) {
          const chamberId = `MBJ-${Date.now().toString().slice(-6)}`;
          await supabase
            .from('merchants')
            .insert([{
              chamber_id: chamberId,
              business_name_ar: app.business_name_ar,
              sector_id: app.sector_id,
              sub_region_id: app.sub_region_id,
              owner_name_ar: app.owner_name_ar,
              national_id: app.national_id,
              phone_number: app.phone_number,
              whatsapp_number: app.whatsapp_number,
              address_ar: app.address_ar,
              establishment_date: app.establishment_date,
              employee_count: app.employee_count,
              main_products_ar: app.main_products_ar,
              license_doc_url: app.license_doc_url,
              id_doc_url: app.id_doc_url,
              is_active: true,
              approved_at: new Date().toISOString()
            }]);
        }
      }

      // Update local state
      setApplications(prev => prev.map(app =>
        app.id === appId
          ? { ...app, status: newStatus, rejection_reason: rejectionReason || null }
          : app
      ));
      setSelectedApp(null);
      fetchAllData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'قيد التدقيق':
        return 'status-pending';
      case 'معتمد رسمياً':
        return 'status-approved';
      case 'مرفوض لتعديل البيانات':
        return 'status-rejected';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'قيد التدقيق':
        return <Clock className="w-4 h-4" />;
      case 'معتمد رسمياً':
        return <CheckCircle className="w-4 h-4" />;
      case 'مرفوض لتعديل البيانات':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const generateWhatsAppLink = (phone: string, businessName: string, token: string) => {
    const message = encodeURIComponent(
      `السلام عليكم،\n\nيسر غرفة التجارة والصناعة في منبج إبلاغكم بأن طلب التسجيل رقم ${token} المنشأة "${businessName}" قيد المراجعة.\n\nللاستفسار يرجى التواصل على هذا الرقم.\n\nمع تحيات\nغرفة التجارة والصناعة في منبج`
    );
    return `https://wa.me/${phone.replace(/^0/, '963')}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[76px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === 'dashboard'
                  ? 'text-[#0B132B] border-[#D4AF37]'
                  : 'text-[#64748B] border-transparent hover:text-[#0B132B]'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              لوحة التحليلات
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === 'applications'
                  ? 'text-[#0B132B] border-[#D4AF37]'
                  : 'text-[#64748B] border-transparent hover:text-[#0B132B]'
              }`}
            >
              <FileText className="w-5 h-5" />
              طلبات التسجيل
              {stats.pendingApplications > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingApplications}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <img
                src="https://i.ibb.co/5WL5B8gS/2026-06-29-174506-removebg-preview.png"
                alt="شعار غرفة التجارة والصناعة في منبج"
                className="h-14 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#0B132B]">لوحة التحليلات التنفيذية</h1>
                <p className="text-[#64748B]">نظرة عامة على أداء الغرفة التجارية</p>
              </div>
            </div>
            <button
              onClick={fetchAllData}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0B132B] to-[#1E293B] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  +{stats.monthlyGrowth}%
                </span>
              </div>
              <p className="text-3xl font-black text-[#0B132B]">{stats.totalMerchants}</p>
              <p className="text-[#64748B] text-sm">إجمالي التجار المسجلين</p>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-[#0B132B] to-[#1E293B] rounded-full"></div>
              </div>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="text-amber-500 text-sm font-medium animate-pulse">جديد</span>
              </div>
              <p className="text-3xl font-black text-[#0B132B]">{stats.pendingApplications}</p>
              <p className="text-[#64748B] text-sm">طلبات قيد الانتظار</p>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
              </div>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Factory className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                  <Activity className="w-4 h-4" />
                  نشط
                </span>
              </div>
              <p className="text-3xl font-black text-[#0B132B]">{stats.activeFactories}</p>
              <p className="text-[#64748B] text-sm">منشآت معتمدة</p>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
              </div>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B45309] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-[#D4AF37] text-sm font-medium">شهري</span>
              </div>
              <p className="text-3xl font-black text-[#0B132B]">+{stats.monthlyGrowth}%</p>
              <p className="text-[#64748B] text-sm">نمو شهري</p>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-gradient-to-r from-[#D4AF37] to-[#B45309] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Charts and recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="font-bold text-[#0B132B]">توزيع القطاعات</h2>
              </div>
              <div className="space-y-4">
                {stats.sectorBreakdown.map((item, index) => {
                  const colors = [
                    'from-[#0B132B] to-[#1E293B]',
                    'from-[#D4AF37] to-[#B45309]',
                    'from-[#3B82F6] to-[#1D4ED8]',
                    'from-[#10B981] to-[#059669]',
                    'from-[#8B5CF6] to-[#6D28D9]'
                  ];
                  const maxCount = Math.max(...stats.sectorBreakdown.map(s => s.count));
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#0B132B] font-medium">{item.sector}</span>
                        <span className="text-[#64748B]">{item.count}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent applications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="font-bold text-[#0B132B]">آخر الطلبات</h2>
                </div>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="text-sm text-[#D4AF37] hover:underline"
                >
                  عرض الكل
                </button>
              </div>
              <div className="space-y-3">
                {stats.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      setActiveTab('applications');
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0B132B] to-[#1E293B] rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0B132B] truncate">{app.business_name_ar}</p>
                      <p className="text-xs text-[#64748B]">{app.owner_name_ar}</p>
                    </div>
                    <span className={`${getStatusStyle(app.status)} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </div>
                ))}
                {stats.recentApplications.length === 0 && (
                  <div className="text-center py-8 text-[#64748B]">
                    لا توجد طلبات حديثة
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو رقم الطلب..."
                    className="input-field pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter('')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === ''
                      ? 'bg-[#0B132B] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setStatusFilter('قيد التدقيق')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    statusFilter === 'قيد التدقيق'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  قيد التدقيق
                </button>
                <button
                  onClick={() => setStatusFilter('معتمد رسمياً')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    statusFilter === 'معتمد رسمياً'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  معتمد
                </button>
                <button
                  onClick={() => setStatusFilter('مرفوض لتعديل البيانات')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    statusFilter === 'مرفوض لتعديل البيانات'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  مرفوض
                </button>
              </div>
            </div>
            <p className="text-sm text-[#64748B] mt-4">
              عرض {paginatedApps.length} من أصل {filteredApplications.length} طلب
            </p>
          </div>

          {/* Applications table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-4 text-right font-medium">رقم الطلب</th>
                    <th className="px-6 py-4 text-right font-medium">اسم المنشأة</th>
                    <th className="px-6 py-4 text-right font-medium">المالك</th>
                    <th className="px-6 py-4 text-right font-medium">القطاع</th>
                    <th className="px-6 py-4 text-right font-medium">التاريخ</th>
                    <th className="px-6 py-4 text-right font-medium">الحالة</th>
                    <th className="px-6 py-4 text-right font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(7).fill(0).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : paginatedApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        لا توجد طلبات مطابقة
                      </td>
                    </tr>
                  ) : (
                    paginatedApps.map((app) => (
                      <tr key={app.id} className="table-row-hover">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-[#D4AF37]">{app.application_token}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-[#0B132B]">{app.business_name_ar}</p>
                            {app.business_registry_number && (
                              <p className="text-xs text-[#94A3B8]">سجل: {app.business_registry_number}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-[#0B132B]">{app.owner_name_ar}</p>
                            <p className="text-xs text-[#94A3B8]" dir="ltr">{app.phone_number}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {app.sector?.name_ar || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#64748B]">
                          {new Date(app.created_at).toLocaleDateString('ar-SY')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${getStatusStyle(app.status)} px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit`}>
                            {getStatusIcon(app.status)}
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="flex items-center gap-1.5 text-[#0B132B] hover:text-[#D4AF37] transition-colors font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            عرض
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#0B132B] text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Modal header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#0B132B] to-[#1E293B] text-white p-6 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">طلب تسجيل</p>
                <p className="text-2xl font-bold text-[#D4AF37] font-mono">{selectedApp.application_token}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Status badge */}
              <div className="mb-6">
                <span className={`${getStatusStyle(selectedApp.status)} px-4 py-2 rounded-full font-medium flex items-center gap-2 w-fit`}>
                  {getStatusIcon(selectedApp.status)}
                  {selectedApp.status}
                </span>
                {selectedApp.rejection_reason && (
                  <p className="mt-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    سبب الرفض: {selectedApp.rejection_reason}
                  </p>
                )}
              </div>

              {/* Tabs for info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-[#0B132B] mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#D4AF37]" />
                    بيانات المنشأة
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[#94A3B8]">اسم المنشأة</p>
                      <p className="font-medium text-[#0B132B]">{selectedApp.business_name_ar}</p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8]">القطاع</p>
                      <p className="font-medium text-[#0B132B]">{selectedApp.sector?.name_ar || '-'}</p>
                    </div>
                    {selectedApp.business_registry_number && (
                      <div>
                        <p className="text-[#94A3B8]">رقم السجل التجاري</p>
                        <p className="font-medium text-[#0B132B]">{selectedApp.business_registry_number}</p>
                      </div>
                    )}
                    {selectedApp.establishment_date && (
                      <div>
                        <p className="text-[#94A3B8]">تاريخ التأسيس</p>
                        <p className="font-medium text-[#0B132B]">
                          {new Date(selectedApp.establishment_date).toLocaleDateString('ar-SY')}
                        </p>
                      </div>
                    )}
                    {selectedApp.employee_count > 0 && (
                      <div>
                        <p className="text-[#94A3B8]">عدد العمال</p>
                        <p className="font-medium text-[#0B132B]">{selectedApp.employee_count}</p>
                      </div>
                    )}
                    {selectedApp.main_products_ar && (
                      <div>
                        <p className="text-[#94A3B8]">المنتجات/الخدمات</p>
                        <p className="font-medium text-[#0B132B]">{selectedApp.main_products_ar}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Owner info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-[#0B132B] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#D4AF37]" />
                    بيانات المالك
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[#94A3B8]">الاسم</p>
                      <p className="font-medium text-[#0B132B]">{selectedApp.owner_name_ar}</p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8]">رقم الهوية</p>
                      <p className="font-medium text-[#0B132B] font-mono" dir="ltr">{selectedApp.national_id}</p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8]">رقم الهاتف</p>
                      <p className="font-medium text-[#0B132B] font-mono" dir="ltr">{selectedApp.phone_number}</p>
                    </div>
                    {selectedApp.whatsapp_number && (
                      <div>
                        <p className="text-[#94A3B8]">واتساب</p>
                        <p className="font-medium text-[#0B132B] font-mono" dir="ltr">{selectedApp.whatsapp_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-[#0B132B] mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    الموقع
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[#94A3B8]">المنطقة</p>
                      <p className="font-medium text-[#0B132B]">{selectedApp.sub_region?.name_ar || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[#94A3B8]">العنوان</p>
                      <p className="font-medium text-[#0B132B]">{selectedApp.address_ar}</p>
                    </div>
                    {selectedApp.cross_streets && (
                      <div>
                        <p className="text-[#94A3B8]">التقاطعات</p>
                        <p className="font-medium text-[#0B132B]">{selectedApp.cross_streets}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-[#0B132B] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#D4AF37]" />
                    الوثائق
                  </h3>
                  <div className="space-y-3">
                    {selectedApp.license_doc_url ? (
                      <a
                        href={selectedApp.license_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="w-8 h-8 text-[#0B132B]" />
                        <div>
                          <p className="font-medium text-[#0B132B]">صورة الترخيص</p>
                          <p className="text-xs text-[#D4AF37]">عرض الوثيقة</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#64748B] mr-auto" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-[#94A3B8]">
                        <FileText className="w-8 h-8" />
                        <p>لم يتم إرفاق ترخيص</p>
                      </div>
                    )}
                    {selectedApp.id_doc_url ? (
                      <a
                        href={selectedApp.id_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="w-8 h-8 text-[#0B132B]" />
                        <div>
                          <p className="font-medium text-[#0B132B]">صورة الهوية</p>
                          <p className="text-xs text-[#D4AF37]">عرض الوثيقة</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#64748B] mr-auto" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-[#94A3B8]">
                        <FileText className="w-8 h-8" />
                        <p>لم يتم إرفاق هوية</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-[#64748B] flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  تاريخ التقديم: {new Date(selectedApp.created_at).toLocaleDateString('ar-SY')}
                </div>
                {selectedApp.reviewed_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    آخر مراجعة: {new Date(selectedApp.reviewed_at).toLocaleDateString('ar-SY')}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100">
                {/* WhatsApp */}
                <a
                  href={generateWhatsAppLink(
                    selectedApp.whatsapp_number || selectedApp.phone_number,
                    selectedApp.business_name_ar,
                    selectedApp.application_token
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  تواصل واتساب
                </a>

                {selectedApp.status === 'قيد التدقيق' && (
                  <>
                    <button
                      onClick={() => updateApplicationStatus(selectedApp.id, 'معتمد رسمياً')}
                      className="flex items-center gap-2 px-5 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B45309] transition-colors font-medium"
                    >
                      <CheckSquare className="w-5 h-5" />
                      اعتمد الطلب
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('سبب الرفض (اختياري):');
                        updateApplicationStatus(selectedApp.id, 'مرفوض لتعديل البيانات', reason || undefined);
                      }}
                      className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      <XCircle className="w-5 h-5" />
                      رفض الطلب
                    </button>
                  </>
                )}

                {selectedApp.status === 'مرفوض لتعديل البيانات' && (
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'قيد التدقيق')}
                    className="flex items-center gap-2 px-5 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                  >
                    <RefreshCw className="w-5 h-5" />
                    إعادة للتدقيق
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}