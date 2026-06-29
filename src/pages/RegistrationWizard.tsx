import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  User,
  MapPin,
  FileStack,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Upload,
  X,
  FileText,
  Phone,
  Calendar,
  Hash,
  Users,
  Briefcase,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { supabase, Sector, SubRegion } from '../lib/supabase';

interface FormData {
  // Step 1: Legal Entity
  business_name_ar: string;
  business_registry_number: string;
  establishment_date: string;
  sector_id: string;
  // Step 2: Proprietor
  owner_name_ar: string;
  national_id: string;
  phone_number: string;
  whatsapp_number: string;
  // Step 3: Location
  sub_region_id: string;
  address_ar: string;
  cross_streets: string;
  // Step 4: Assets
  employee_count: number;
  main_products_ar: string;
  license_doc_url: string;
  id_doc_url: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  business_name_ar: '',
  business_registry_number: '',
  establishment_date: '',
  sector_id: '',
  owner_name_ar: '',
  national_id: '',
  phone_number: '',
  whatsapp_number: '',
  sub_region_id: '',
  address_ar: '',
  cross_streets: '',
  employee_count: 0,
  main_products_ar: '',
  license_doc_url: '',
  id_doc_url: ''
};

const steps = [
  { id: 1, title: 'الكيان القانوني', icon: Building2 },
  { id: 2, title: 'معلومات المالك', icon: User },
  { id: 3, title: 'العنوان والموقع', icon: MapPin },
  { id: 4, title: 'الأصول والنشاط', icon: FileStack }
];

export default function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subRegions, setSubRegions] = useState<SubRegion[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationToken, setApplicationToken] = useState('');

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      const [sectorsRes, regionsRes] = await Promise.all([
        supabase.from('sectors').select('*').order('sort_order'),
        supabase.from('sub_regions').select('*').order('sort_order')
      ]);
      setSectors(sectorsRes.data || []);
      setSubRegions(regionsRes.data || []);
    } catch (err) {
      console.error('Error fetching reference data:', err);
    }
  };

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.business_name_ar.trim()) {
      newErrors.business_name_ar = 'اسم المنشأة مطلوب';
    } else if (formData.business_name_ar.length < 3) {
      newErrors.business_name_ar = 'اسم المنشأة يجب أن يكون 3 أحرف على الأقل';
    }
    if (!formData.sector_id) {
      newErrors.sector_id = 'يرجى اختيار القطاع';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.owner_name_ar.trim()) {
      newErrors.owner_name_ar = 'اسم المالك مطلوب';
    } else if (formData.owner_name_ar.length < 3) {
      newErrors.owner_name_ar = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }
    if (!formData.national_id.trim()) {
      newErrors.national_id = 'رقم الهوية مطلوب';
    } else if (!/^\d{11}$/.test(formData.national_id)) {
      newErrors.national_id = 'رقم الهوية يجب أن يتكون من 11 رقم';
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'رقم الهاتف مطلوب';
    } else if (!/^09\d{8}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام';
    }
    if (formData.whatsapp_number && !/^09\d{8}$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = 'رقم واتساب يجب أن يبدأ بـ 09 ويتكون من 10 أرقام';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.sub_region_id) {
      newErrors.sub_region_id = 'يرجى اختيار المنطقة';
    }
    if (!formData.address_ar.trim()) {
      newErrors.address_ar = 'العنوان التفصيلي مطلوب';
    } else if (formData.address_ar.length < 10) {
      newErrors.address_ar = 'يرجى إدخال عنوان أكثر تفصيلاً';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.employee_count < 0) {
      newErrors.employee_count = 'عدد العمال لا يمكن أن يكون سالباً';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      case 4:
        return validateStep4();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      // Generate application token
      const token = `APP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { error } = await supabase
        .from('merchant_applications')
        .insert([{
          application_token: token,
          business_name_ar: formData.business_name_ar,
          business_registry_number: formData.business_registry_number || null,
          establishment_date: formData.establishment_date || null,
          sector_id: formData.sector_id,
          owner_name_ar: formData.owner_name_ar,
          national_id: formData.national_id,
          phone_number: formData.phone_number,
          whatsapp_number: formData.whatsapp_number || null,
          sub_region_id: formData.sub_region_id,
          address_ar: formData.address_ar,
          cross_streets: formData.cross_streets || null,
          employee_count: formData.employee_count,
          main_products_ar: formData.main_products_ar || null,
          license_doc_url: formData.license_doc_url || null,
          id_doc_url: formData.id_doc_url || null,
          status: 'قيد التدقيق'
        }]);

      if (error) throw error;

      setApplicationToken(token);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setErrors({ submit: 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.' });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Progress calculation
  const progress = ((currentStep - 1) / 3) * 100;

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-[#0B132B] mb-4">تم إرسال طلبك بنجاح!</h1>
          <p className="text-[#64748B] mb-6">
            شكراً لتسجيلك في غرفة التجارة والصناعة في منبج. سيتم مراجعة طلبك من قبل فريقنا.
          </p>
          <div className="bg-gradient-to-r from-[#0B132B] to-[#1E293B] rounded-xl p-6 mb-6">
            <p className="text-white/70 text-sm mb-2">رقم الطلب المرجعي</p>
            <p className="text-2xl font-bold text-[#D4AF37] font-mono tracking-wider">{applicationToken}</p>
          </div>
          <p className="text-sm text-[#94A3B8] mb-6">
            يرجى الاحتفاظ بهذا الرقم لمتابعة حالة طلبك. سيتم التواصل معك خلال 3-5 أيام عمل.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(1);
              setFormData(initialFormData);
            }}
            className="btn-primary w-full"
          >
            تسجيل منشأة جديدة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="https://i.ibb.co/5WL5B8gS/2026-06-29-174506-removebg-preview.png"
            alt="شعار غرفة التجارة والصناعة في منبج"
            className="h-20 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl font-black text-[#0B132B] mb-2">تسجيل منشأة جديدة</h1>
          <p className="text-[#64748B]">أكمل البيانات التالية لتسجيل منشأتك في الغرفة التجارية</p>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-[#D4AF37] to-[#B45309] text-white shadow-lg'
                          : isCompleted
                          ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isActive ? 'text-[#0B132B]' : isCompleted ? 'text-[#10B981]' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 sm:w-24 h-1 rounded mx-2 ${
                        step.id < currentStep ? 'bg-[#10B981]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {/* Progress indicator */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B45309] transition-all duration-500"
              style={{ width: `${progress + (currentStep === 4 ? (validateCurrentStep() ? 25 : 0) : 25)}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {/* Step 1: Legal Entity */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0B132B]">بيانات الكيان القانوني</h2>
                  <p className="text-sm text-[#64748B]">أدخل معلومات منشأتك التجارية</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">
                    اسم المنشأة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.business_name_ar}
                    onChange={(e) => updateField('business_name_ar', e.target.value)}
                    className={`input-field ${errors.business_name_ar ? 'input-error' : ''}`}
                    placeholder="الاسم التجاري للمنشأة"
                  />
                  {errors.business_name_ar && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.business_name_ar}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">رقم السجل التجاري (إن وجد)</label>
                    <input
                      type="text"
                      value={formData.business_registry_number}
                      onChange={(e) => updateField('business_registry_number', e.target.value)}
                      className="input-field"
                      placeholder="اختياري"
                    />
                  </div>
                  <div>
                    <label className="label">تاريخ التأسيس</label>
                    <input
                      type="date"
                      value={formData.establishment_date}
                      onChange={(e) => updateField('establishment_date', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">
                    القطاع <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.sector_id}
                    onChange={(e) => updateField('sector_id', e.target.value)}
                    className={`input-field ${errors.sector_id ? 'input-error' : ''}`}
                  >
                    <option value="">اختر القطاع</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name_ar}
                      </option>
                    ))}
                  </select>
                  {errors.sector_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.sector_id}
                    </p>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                    {sectors.map((sector) => (
                      <button
                        key={sector.id}
                        type="button"
                        onClick={() => updateField('sector_id', sector.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          formData.sector_id === sector.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#B45309]'
                            : 'border-gray-200 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        {sector.name_ar}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Proprietor Info */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0B132B]">معلومات المالك / الممثل</h2>
                  <p className="text-sm text-[#64748B]">بيانات صاحب المنشأة أو ممثلها</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.owner_name_ar}
                    onChange={(e) => updateField('owner_name_ar', e.target.value)}
                    className={`input-field ${errors.owner_name_ar ? 'input-error' : ''}`}
                    placeholder="الاسم الرباعي"
                  />
                  {errors.owner_name_ar && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.owner_name_ar}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">
                    رقم الهوية الوطنية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.national_id}
                    onChange={(e) => updateField('national_id', e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className={`input-field ${errors.national_id ? 'input-error' : ''}`}
                    placeholder="11 رقم"
                    maxLength={11}
                  />
                  {errors.national_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.national_id}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">
                      رقم الهاتف <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => updateField('phone_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={`input-field ${errors.phone_number ? 'input-error' : ''}`}
                      placeholder="09XXXXXXXX"
                      dir="ltr"
                    />
                    {errors.phone_number && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone_number}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label">رقم واتساب</label>
                    <input
                      type="tel"
                      value={formData.whatsapp_number}
                      onChange={(e) => updateField('whatsapp_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={`input-field ${errors.whatsapp_number ? 'input-error' : ''}`}
                      placeholder="09XXXXXXXX"
                      dir="ltr"
                    />
                    {errors.whatsapp_number && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.whatsapp_number}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0B132B]">موقع المنشأة</h2>
                  <p className="text-sm text-[#64748B]">أدخل عنوان منشأتك في منبج</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">
                    المنطقة / السوق <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.sub_region_id}
                    onChange={(e) => updateField('sub_region_id', e.target.value)}
                    className={`input-field ${errors.sub_region_id ? 'input-error' : ''}`}
                  >
                    <option value="">اختر المنطقة</option>
                    {subRegions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name_ar}
                        {region.description_ar && ` - ${region.description_ar}`}
                      </option>
                    ))}
                  </select>
                  {errors.sub_region_id && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.sub_region_id}
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
                    {subRegions.map((region) => (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => updateField('sub_region_id', region.id)}
                        className={`p-2 rounded-lg border-2 transition-all text-sm ${
                          formData.sub_region_id === region.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#B45309]'
                            : 'border-gray-200 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        {region.name_ar}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">
                    العنوان التفصيلي <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.address_ar}
                    onChange={(e) => updateField('address_ar', e.target.value)}
                    className={`input-field min-h-[100px] resize-none ${errors.address_ar ? 'input-error' : ''}`}
                    placeholder="الشارع، رقم المبنى، أي معالم قريبة..."
                  />
                  {errors.address_ar && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.address_ar}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">التقاطعات القريبة</label>
                  <input
                    type="text"
                    value={formData.cross_streets}
                    onChange={(e) => updateField('cross_streets', e.target.value)}
                    className="input-field"
                    placeholder="مثال: بين شارع الحرية وشارع الرئيسي"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Assets & Scale */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <FileStack className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0B132B]">الأصول والنشاط</h2>
                  <p className="text-sm text-[#64748B]">معلومات عن حجم ونشاط المنشأة</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">عدد العمال التقريبي</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {['0', '1-5', '6-10', '11-20', '21-50', '+50'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => {
                          const count = range === '+50' ? 51 : range === '0' ? 0 : parseInt(range.split('-')[0]);
                          updateField('employee_count', count);
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          (range === '+50' && formData.employee_count >= 51) ||
                          (range === '0' && formData.employee_count === 0) ||
                          (range !== '+50' && range !== '0' && formData.employee_count >= parseInt(range.split('-')[0]) && formData.employee_count <= parseInt(range.split('-')[1] || '51'))
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#B45309]'
                            : 'border-gray-200 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">المنتجات / الخدمات الرئيسية</label>
                  <textarea
                    value={formData.main_products_ar}
                    onChange={(e) => updateField('main_products_ar', e.target.value)}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="اذكر المنتجات أو الخدمات التي تقدمها منشأتك..."
                  />
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-4 border border-dashed border-[#D4AF37]/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Upload className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <p className="font-medium text-[#0B132B]">رفع المرفقات</p>
                      <p className="text-xs text-[#64748B]">صور عن الترخيص أو الهوية (اختياري)</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="url"
                        value={formData.license_doc_url}
                        onChange={(e) => updateField('license_doc_url', e.target.value)}
                        className="input-field"
                        placeholder="رابط صورة الترخيص"
                      />
                    </div>
                    <div>
                      <input
                        type="url"
                        value={formData.id_doc_url}
                        onChange={(e) => updateField('id_doc_url', e.target.value)}
                        className="input-field"
                        placeholder="رابط صورة الهوية"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-2">
                    * يمكنك لاحقاً إرسال الوثائق عبر واتساب أو شخصياً
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {errors.submit && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {errors.submit}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-[#0B132B] hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
              السابق
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="btn-secondary flex items-center gap-2"
              >
                التالي
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-secondary flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    إرسال الطلب
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Summary card */}
        {Object.values(formData).some((v) => v) && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-[#0B132B] mb-4">ملخص البيانات المُدخلة</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[#94A3B8]">اسم المنشأة</p>
                <p className="font-medium text-[#0B132B]">{formData.business_name_ar || '-'}</p>
              </div>
              <div>
                <p className="text-[#94A3B8]">القطاع</p>
                <p className="font-medium text-[#0B132B]">
                  {sectors.find(s => s.id === formData.sector_id)?.name_ar || '-'}
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8]">المالك</p>
                <p className="font-medium text-[#0B132B]">{formData.owner_name_ar || '-'}</p>
              </div>
              <div>
                <p className="text-[#94A3B8]">المنطقة</p>
                <p className="font-medium text-[#0B132B]">
                  {subRegions.find(r => r.id === formData.sub_region_id)?.name_ar || '-'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}