-- Popular dados regionais (ajustes de custo por estado)
INSERT INTO public.regional_pricing (state_code, region_name, adjustment_factor) VALUES
('CA', 'California - High Cost', 1.25),
('NY', 'New York - High Cost', 1.20),
('MA', 'Massachusetts - High Cost', 1.18),
('TX', 'Texas - Moderate Cost', 1.05),
('FL', 'Florida - Moderate Cost', 1.08),
('IL', 'Illinois - Moderate Cost', 1.10),
('PA', 'Pennsylvania - Average Cost', 1.00),
('OH', 'Ohio - Lower Cost', 0.95),
('GA', 'Georgia - Lower Cost', 0.92),
('NC', 'North Carolina - Lower Cost', 0.90)
ON CONFLICT (state_code) DO UPDATE SET
  region_name = EXCLUDED.region_name,
  adjustment_factor = EXCLUDED.adjustment_factor;