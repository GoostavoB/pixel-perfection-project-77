-- Phase 3C: Advanced Analytics Dashboard - Database Enhancements

-- Create view for aggregated pricing metrics
CREATE OR REPLACE VIEW public.pricing_analytics_summary AS
SELECT 
  COUNT(*) as total_cached_codes,
  COUNT(*) FILTER (WHERE description IS NOT NULL AND description != '') as codes_with_descriptions,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recently_updated,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as updated_last_month,
  ROUND(AVG(medicare_facility_rate), 2) as avg_medicare_rate,
  MAX(created_at) as last_cache_update
FROM public.medicare_prices;

-- Create function to get trending CPT codes (most analyzed in last 7 days)
CREATE OR REPLACE FUNCTION public.get_trending_cpt_codes(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  cpt_code TEXT,
  usage_count BIGINT,
  avg_charged NUMERIC,
  description TEXT,
  medicare_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH code_usage AS (
    SELECT 
      jsonb_array_elements(cpt_codes)->>'code' as code,
      COUNT(*) as count,
      AVG((jsonb_array_elements(cpt_codes)->>'charged')::numeric) as avg_charge
    FROM public.analysis_results
    WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
      AND cpt_codes IS NOT NULL
    GROUP BY jsonb_array_elements(cpt_codes)->>'code'
    ORDER BY count DESC
    LIMIT 20
  )
  SELECT 
    cu.code,
    cu.count,
    ROUND(cu.avg_charge, 2),
    mp.description,
    mp.medicare_facility_rate
  FROM code_usage cu
  LEFT JOIN public.medicare_prices mp ON mp.cpt_code = cu.code
  ORDER BY cu.count DESC;
END;
$$;

-- Create function to analyze data quality by specialty
CREATE OR REPLACE FUNCTION public.get_pricing_coverage_stats()
RETURNS TABLE (
  specialty TEXT,
  total_codes INTEGER,
  cached_codes INTEGER,
  coverage_percent NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH specialty_mapping AS (
    SELECT 
      cpt_code,
      CASE 
        WHEN cpt_code BETWEEN '99281' AND '99285' THEN 'Emergency Medicine'
        WHEN cpt_code BETWEEN '99201' AND '99215' THEN 'Office Visits'
        WHEN cpt_code BETWEEN '99221' AND '99239' THEN 'Hospital Care'
        WHEN cpt_code BETWEEN '80047' AND '89398' THEN 'Laboratory'
        WHEN cpt_code BETWEEN '70010' AND '76499' THEN 'Radiology'
        WHEN cpt_code BETWEEN '90281' AND '99607' THEN 'Medicine'
        WHEN cpt_code BETWEEN '00100' AND '01999' THEN 'Anesthesia'
        WHEN cpt_code BETWEEN '10021' AND '69990' THEN 'Surgery'
        ELSE 'Other'
      END as specialty_name
    FROM public.medicare_prices
  ),
  all_requested AS (
    SELECT DISTINCT jsonb_array_elements(cpt_codes)->>'code' as code
    FROM public.analysis_results
    WHERE created_at >= NOW() - INTERVAL '30 days'
      AND cpt_codes IS NOT NULL
  ),
  requested_by_specialty AS (
    SELECT 
      CASE 
        WHEN ar.code BETWEEN '99281' AND '99285' THEN 'Emergency Medicine'
        WHEN ar.code BETWEEN '99201' AND '99215' THEN 'Office Visits'
        WHEN ar.code BETWEEN '99221' AND '99239' THEN 'Hospital Care'
        WHEN ar.code BETWEEN '80047' AND '89398' THEN 'Laboratory'
        WHEN ar.code BETWEEN '70010' AND '76499' THEN 'Radiology'
        WHEN ar.code BETWEEN '90281' AND '99607' THEN 'Medicine'
        WHEN ar.code BETWEEN '00100' AND '01999' THEN 'Anesthesia'
        WHEN ar.code BETWEEN '10021' AND '69990' THEN 'Surgery'
        ELSE 'Other'
      END as specialty_name,
      COUNT(DISTINCT ar.code) as total,
      COUNT(DISTINCT mp.cpt_code) as cached
    FROM all_requested ar
    LEFT JOIN public.medicare_prices mp ON mp.cpt_code = ar.code
    GROUP BY specialty_name
  )
  SELECT 
    specialty_name,
    total::INTEGER,
    COALESCE(cached, 0)::INTEGER,
    ROUND((COALESCE(cached, 0)::NUMERIC / NULLIF(total, 0)::NUMERIC * 100), 1)
  FROM requested_by_specialty
  WHERE total > 0
  ORDER BY total DESC;
END;
$$;

-- Create function to get performance metrics over time
CREATE OR REPLACE FUNCTION public.get_performance_trends(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
  time_bucket TIMESTAMP WITH TIME ZONE,
  avg_response_time NUMERIC,
  avg_cache_hit_rate NUMERIC,
  total_requests BIGINT,
  total_codes_processed BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('hour', created_at) as time_bucket,
    ROUND(AVG(response_time_ms), 0) as avg_response_time,
    ROUND(AVG(cache_hit_rate), 1) as avg_cache_hit_rate,
    COUNT(*) as total_requests,
    SUM(total_codes) as total_codes_processed
  FROM public.fair_price_metrics
  WHERE created_at >= NOW() - (hours_back || ' hours')::INTERVAL
  GROUP BY time_bucket
  ORDER BY time_bucket DESC;
END;
$$;