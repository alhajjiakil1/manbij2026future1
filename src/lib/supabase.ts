import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Sector {
  id: string;
  name_ar: string;
  name_en: string;
  icon_name: string | null;
  sort_order: number;
  created_at: string;
}

export interface SubRegion {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  sort_order: number;
  created_at: string;
}

export interface Merchant {
  id: string;
  chamber_id: string;
  business_name_ar: string;
  business_name_en: string | null;
  sector_id: string | null;
  sub_region_id: string | null;
  owner_name_ar: string;
  owner_name_en: string | null;
  national_id: string;
  phone_number: string;
  whatsapp_number: string | null;
  address_ar: string;
  establishment_date: string | null;
  employee_count: number;
  main_products_ar: string | null;
  license_doc_url: string | null;
  id_doc_url: string | null;
  is_active: boolean;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  sector?: Sector;
  sub_region?: SubRegion;
}

export interface MerchantApplication {
  id: string;
  application_token: string;
  business_name_ar: string;
  business_registry_number: string | null;
  establishment_date: string | null;
  sector_id: string | null;
  owner_name_ar: string;
  national_id: string;
  phone_number: string;
  whatsapp_number: string | null;
  sub_region_id: string | null;
  address_ar: string;
  cross_streets: string | null;
  employee_count: number;
  main_products_ar: string | null;
  license_doc_url: string | null;
  id_doc_url: string | null;
  status: 'قيد التدقيق' | 'مرفوض لتعديل البيانات' | 'معتمد رسمياً';
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  sector?: Sector;
  sub_region?: SubRegion;
}

export interface News {
  id: string;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  category: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface Commodity {
  id: string;
  name_ar: string;
  name_en: string;
  unit_ar: string;
  current_price: number;
  previous_price: number | null;
  change_percentage: number | null;
  category: string;
  updated_at: string;
}

// Dashboard stats type
export interface DashboardStats {
  totalMerchants: number;
  pendingApplications: number;
  activeFactories: number;
  monthlyGrowth: number;
  sectorBreakdown: Array<{ sector: string; count: number }>;
  recentApplications: MerchantApplication[];
}
