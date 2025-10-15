-- Add sample Medicare pricing data (Option C - Public Medicare data)
-- This is a starter set of common CPT codes with Medicare rates

INSERT INTO public.medicare_prices (cpt_code, description, medicare_facility_rate) VALUES
-- Office Visits
('99201', 'Office visit, new patient, level 1', 45.00),
('99202', 'Office visit, new patient, level 2', 76.00),
('99203', 'Office visit, new patient, level 3', 109.00),
('99204', 'Office visit, new patient, level 4', 167.00),
('99205', 'Office visit, new patient, level 5', 211.00),
('99211', 'Office visit, established patient, level 1', 23.00),
('99212', 'Office visit, established patient, level 2', 55.00),
('99213', 'Office visit, established patient, level 3', 92.00),
('99214', 'Office visit, established patient, level 4', 131.00),
('99215', 'Office visit, established patient, level 5', 183.00),

-- Emergency Room
('99281', 'ER visit, level 1', 95.00),
('99282', 'ER visit, level 2', 188.00),
('99283', 'ER visit, level 3', 285.00),
('99284', 'ER visit, level 4', 429.00),
('99285', 'ER visit, level 5', 627.00),

-- Lab Tests
('80053', 'Comprehensive metabolic panel', 14.00),
('80061', 'Lipid panel', 16.00),
('82947', 'Glucose blood test', 3.00),
('85025', 'Complete blood count', 10.00),
('85027', 'Complete blood count with differential', 13.00),

-- Imaging
('70450', 'CT head without contrast', 189.00),
('70460', 'CT head with contrast', 253.00),
('71010', 'Chest X-ray, single view', 37.00),
('71020', 'Chest X-ray, two views', 45.00),
('73610', 'Ankle X-ray', 34.00),
('74177', 'CT abdomen with contrast', 377.00),

-- Procedures
('10060', 'Drainage of skin abscess', 97.00),
('12001', 'Simple wound repair, face, 2.5cm or less', 145.00),
('29125', 'Short arm splint application', 89.00),
('36415', 'Routine venipuncture', 3.00),
('45378', 'Colonoscopy', 350.00),
('93000', 'Electrocardiogram (EKG)', 17.00),
('96372', 'Injection, subcutaneous or intramuscular', 22.00),
('J1885', 'Injection, ketorolac (Toradol)', 8.00)
ON CONFLICT (cpt_code) DO UPDATE SET
  description = EXCLUDED.description,
  medicare_facility_rate = EXCLUDED.medicare_facility_rate;

-- Create table for regional pricing adjustments
CREATE TABLE IF NOT EXISTS public.regional_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL,
  region_name TEXT NOT NULL,
  adjustment_factor NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(state_code)
);

ALTER TABLE public.regional_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Regional pricing is viewable by everyone"
ON public.regional_pricing FOR SELECT
USING (true);

-- Add sample regional adjustments (US states with different healthcare costs)
INSERT INTO public.regional_pricing (state_code, region_name, adjustment_factor) VALUES
('CA', 'California', 1.15),
('NY', 'New York', 1.20),
('TX', 'Texas', 0.95),
('FL', 'Florida', 1.05),
('IL', 'Illinois', 1.08),
('PA', 'Pennsylvania', 1.02),
('OH', 'Ohio', 0.92),
('GA', 'Georgia', 0.98),
('NC', 'North Carolina', 0.95),
('MI', 'Michigan', 0.97)
ON CONFLICT (state_code) DO UPDATE SET
  adjustment_factor = EXCLUDED.adjustment_factor,
  region_name = EXCLUDED.region_name;

-- Create table for external API configurations (for Option B)
CREATE TABLE IF NOT EXISTS public.pricing_api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name TEXT NOT NULL UNIQUE,
  api_endpoint TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  rate_limit INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pricing_api_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authenticated users can view API configs"
ON public.pricing_api_configs FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create table for bulk pricing imports (for Option A)
CREATE TABLE IF NOT EXISTS public.custom_pricing_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpt_code TEXT NOT NULL,
  description TEXT,
  custom_rate NUMERIC,
  source TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cpt_code, source, region)
);

ALTER TABLE public.custom_pricing_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Custom pricing is viewable by everyone"
ON public.custom_pricing_data FOR SELECT
USING (true);