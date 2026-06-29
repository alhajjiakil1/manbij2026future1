/*
# Chamber of Commerce and Industry - Manbij Platform Schema

1. New Tables
- `sectors`: Business sectors (Commercial, Industrial, Agricultural, Professional, Services)
- `sub_regions`: Sub-regions/markets within Manbij (Central Market, Aleppo Road, Security Square, etc.)
- `merchants`: Registered and verified businesses in the public directory
- `merchant_applications`: Pending applications for registration
- `news`: Chamber news, press releases, decrees, and development projects
- `commodities`: Economic ticker data for commodity and fuel prices
- `admin_users`: Admin panel users for authentication

2. Security
- Enable RLS on all tables
- Public tables (sectors, sub_regions, merchants, news, commodities) allow anon + authenticated read
- Admin tables restricted to authenticated users
- Application tables allow anon insert (for public registration) but restricted read/write

3. Notes
- All text fields support Arabic content
- Status fields use Arabic values for display
- Phone validation handled at application level
- Geospatial data stored as text addresses for Manbij locations
*/

-- Sectors lookup table
CREATE TABLE IF NOT EXISTS sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  icon_name text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Sub-regions/markets within Manbij
CREATE TABLE IF NOT EXISTS sub_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Verified merchants (public directory)
CREATE TABLE IF NOT EXISTS merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id text UNIQUE NOT NULL,
  business_name_ar text NOT NULL,
  business_name_en text,
  sector_id uuid REFERENCES sectors(id),
  sub_region_id uuid REFERENCES sub_regions(id),
  owner_name_ar text NOT NULL,
  owner_name_en text,
  national_id text NOT NULL,
  phone_number text NOT NULL,
  whatsapp_number text,
  address_ar text NOT NULL,
  establishment_date date,
  employee_count integer DEFAULT 0,
  main_products_ar text,
  license_doc_url text,
  id_doc_url text,
  is_active boolean DEFAULT true,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Merchant applications (registration wizard submissions)
CREATE TABLE IF NOT EXISTS merchant_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_token text UNIQUE NOT NULL,
  business_name_ar text NOT NULL,
  business_registry_number text,
  establishment_date date,
  sector_id uuid REFERENCES sectors(id),
  owner_name_ar text NOT NULL,
  national_id text NOT NULL,
  phone_number text NOT NULL,
  whatsapp_number text,
  sub_region_id uuid REFERENCES sub_regions(id),
  address_ar text NOT NULL,
  cross_streets text,
  employee_count integer DEFAULT 0,
  main_products_ar text,
  license_doc_url text,
  id_doc_url text,
  status text NOT NULL DEFAULT 'قيد التدقيق',
  rejection_reason text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News and media center
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text,
  content_ar text NOT NULL,
  content_en text,
  category text NOT NULL DEFAULT 'أخبار',
  image_url text,
  is_published boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Commodity prices for economic ticker
CREATE TABLE IF NOT EXISTS commodities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  unit_ar text NOT NULL,
  current_price numeric NOT NULL,
  previous_price numeric,
  change_percentage numeric,
  category text NOT NULL DEFAULT 'سلع',
  updated_at timestamptz DEFAULT now()
);

-- Admin users for authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name_ar text NOT NULL,
  role text NOT NULL DEFAULT 'مشرف',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Sectors: Public read, admin write
DROP POLICY IF EXISTS "anon_read_sectors" ON sectors;
CREATE POLICY "anon_read_sectors" ON sectors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_sectors" ON sectors;
CREATE POLICY "admin_write_sectors" ON sectors FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Sub-regions: Public read, admin write
DROP POLICY IF EXISTS "anon_read_sub_regions" ON sub_regions;
CREATE POLICY "anon_read_sub_regions" ON sub_regions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_sub_regions" ON sub_regions;
CREATE POLICY "admin_write_sub_regions" ON sub_regions FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Merchants: Public read active only, admin full access
DROP POLICY IF EXISTS "anon_read_merchants" ON merchants;
CREATE POLICY "anon_read_merchants" ON merchants FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "admin_all_merchants" ON merchants;
CREATE POLICY "admin_all_merchants" ON merchants FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Merchant applications: Anon insert, admin read/write
DROP POLICY IF EXISTS "anon_insert_applications" ON merchant_applications;
CREATE POLICY "anon_insert_applications" ON merchant_applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_applications" ON merchant_applications;
CREATE POLICY "admin_applications" ON merchant_applications FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- News: Public read published, admin all
DROP POLICY IF EXISTS "anon_read_news" ON news;
CREATE POLICY "anon_read_news" ON news FOR SELECT
  TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "admin_news" ON news;
CREATE POLICY "admin_news" ON news FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Commodities: Public read, admin write
DROP POLICY IF EXISTS "anon_read_commodities" ON commodities;
CREATE POLICY "anon_read_commodities" ON commodities FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_commodities" ON commodities;
CREATE POLICY "admin_commodities" ON commodities FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Admin users: Authenticated only
DROP POLICY IF EXISTS "admin_users_access" ON admin_users;
CREATE POLICY "admin_users_access" ON admin_users FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Insert seed data for sectors
INSERT INTO sectors (name_ar, name_en, icon_name, sort_order) VALUES
  ('تجاري', 'Commercial', 'Store', 1),
  ('صناعي', 'Industrial', 'Factory', 2),
  ('زراعي', 'Agricultural', 'Wheat', 3),
  ('مهني', 'Professional', 'Briefcase', 4),
  ('خدمات', 'Services', 'Wrench', 5)
ON CONFLICT DO NOTHING;

-- Insert seed data for sub-regions
INSERT INTO sub_regions (name_ar, name_en, description_ar, sort_order) VALUES
  ('السوق المركزي', 'Central Market', 'السوق التجاري الرئيسي في وسط المدينة', 1),
  ('طريق حلب', 'Aleppo Road', 'المنطقة التجارية على طريق حلب', 2),
  ('ساحة الأمن', 'Security Square', 'المنطقة الإدارية والتجارية', 3),
  ('حي المحطة', 'Mahatta District', 'منطقة تجارية نشطة', 4),
  ('سوق النساء', 'Women''s Market', 'سوق متخصص بالملابس والمواد المنزلية', 5),
  ('سوق الخضار', 'Vegetable Market', 'سوق الجملة للخضروات والفواكه', 6),
  ('المنطقة الصناعية', 'Industrial Zone', 'منطقة المصانع ورش العمل', 7)
ON CONFLICT DO NOTHING;

-- Insert sample news
INSERT INTO news (title_ar, content_ar, category) VALUES
  ('افتتاح مركز التسجيل الإلكتروني', 'أعلنت غرفة التجارة والصناعة في منبج عن افتتاح مركز التسجيل الإلكتروني الجديد لتسهيل إجراءات تسجيل التجار والمستثمرين. يوفر المركز خدمات متكاملة تشمل إصدار البطاقات التجارية وتوثيق العقود.', 'أخبار'),
  ('ندوة تطوير الأعمال الصغيرة', 'تنظم الغرفة ندوة متخصصة في تطوير الأعمال الصغيرة والمتوسطة بمشاركة خبراء اقتصاديين ومستثمرين. ستتناول الندوة فرص التمويل والتحول الرقمي.', 'فعاليات'),
  ('مشروع تطوير البنية التحتية', 'انطلاق مشروع تطوير البنية التحتية للمنطقة الصناعية في منبج ضمن خطة التحول الاقتصادي وإعادة الإعمار.', 'مشاريع')
ON CONFLICT DO NOTHING;

-- Insert sample commodities
INSERT INTO commodities (name_ar, name_en, unit_ar, current_price, previous_price, category) VALUES
  ('قمح', 'Wheat', 'طن', 450000, 440000, 'سلع'),
  ('قطن', 'Cotton', 'طن', 850000, 820000, 'سلع'),
  ('ماشية (أغنام)', 'Livestock (Sheep)', 'رأس', 350000, 340000, 'سلع'),
  ('بنزين', 'Gasoline', 'لتر', 8500, 8200, 'وقود'),
  ('ديزل', 'Diesel', 'لتر', 6500, 6300, 'وقود'),
  ('غاز منزلي', 'Cooking Gas', 'أسطوانة', 45000, 42000, 'وقود')
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchants_sector ON merchants(sector_id);
CREATE INDEX IF NOT EXISTS idx_merchants_sub_region ON merchants(sub_region_id);
CREATE INDEX IF NOT EXISTS idx_merchants_active ON merchants(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_status ON merchant_applications(status);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_commodities_category ON commodities(category);