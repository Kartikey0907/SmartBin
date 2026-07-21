-- ===========================================
-- SmartBin AI - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ===========================================

-- 1. Bins Table
CREATE TABLE IF NOT EXISTS bins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('wet', 'dry', 'plastic')),
    location VARCHAR(200) NOT NULL,
    zone VARCHAR(100) NOT NULL DEFAULT 'Campus',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    fill_level DECIMAL(5,2) NOT NULL DEFAULT 0,
    current_capacity DECIMAL(5,2) NOT NULL DEFAULT 0,
    max_capacity DECIMAL(5,2) NOT NULL DEFAULT 100,
    alert_threshold DECIMAL(5,2) NOT NULL DEFAULT 85,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Disposal Events Table
CREATE TABLE IF NOT EXISTS disposal_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
    waste_type VARCHAR(100) NOT NULL,
    waste_category VARCHAR(50) NOT NULL CHECK (waste_category IN ('wet', 'dry', 'plastic')),
    detected_category VARCHAR(50) NOT NULL CHECK (detected_category IN ('wet', 'dry', 'plastic')),
    is_compliant BOOLEAN NOT NULL,
    weight_estimate_kg DECIMAL(6,3),
    image_url TEXT,
    confidence_score DECIMAL(4,3),
    feedback_type VARCHAR(20) NOT NULL DEFAULT 'correct' CHECK (feedback_type IN ('correct', 'warning', 'alert')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Daily Bin Stats (for analytics)
CREATE TABLE IF NOT EXISTS daily_bin_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_deposits INTEGER NOT NULL DEFAULT 0,
    compliant_deposits INTEGER NOT NULL DEFAULT 0,
    non_compliant_deposits INTEGER NOT NULL DEFAULT 0,
    contamination_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    compliance_rate DECIMAL(5,2) NOT NULL DEFAULT 100,
    avg_fill_level DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_weight_kg DECIMAL(8,2) NOT NULL DEFAULT 0,
    peak_hour INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bin_id, date)
);

-- 4. Impact Metrics Table
CREATE TABLE IF NOT EXISTS impact_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(50) NOT NULL UNIQUE CHECK (metric_type IN (
        'waste_diverted_kg',
        'compost_produced_kg',
        'methane_avoided_kg',
        'co2e_avoided_t',
        'landfill_fees_saved',
        'total_interventions',
        'overall_compliance_rate',
        'active_bins',
        'total_events_logged'
    )),
    value DECIMAL(12,2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Hourly Analytics (for chart data)
CREATE TABLE IF NOT EXISTS hourly_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    wet_count INTEGER NOT NULL DEFAULT 0,
    dry_count INTEGER NOT NULL DEFAULT 0,
    plastic_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bin_id, hour, date)
);

-- 6. Weekly Compliance Tracking
CREATE TABLE IF NOT EXISTS weekly_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start DATE NOT NULL,
    week_label VARCHAR(20) NOT NULL,
    compliance_rate DECIMAL(5,2) NOT NULL,
    total_events INTEGER NOT NULL DEFAULT 0,
    compliant_events INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(week_start)
);

-- ===========================================
-- Indexes for Performance
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_disposal_events_bin_id ON disposal_events(bin_id);
CREATE INDEX IF NOT EXISTS idx_disposal_events_created_at ON disposal_events(created_at);
CREATE INDEX IF NOT EXISTS idx_disposal_events_compliant ON disposal_events(is_compliant);
CREATE INDEX IF NOT EXISTS idx_daily_bin_stats_date ON daily_bin_stats(date);
CREATE INDEX IF NOT EXISTS idx_hourly_analytics_date ON hourly_analytics(date);
CREATE INDEX IF NOT EXISTS idx_hourly_analytics_bin_date ON hourly_analytics(bin_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_compliance_week ON weekly_compliance(week_start);

-- ===========================================
-- Trigger: auto-update updated_at on bins
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bins_updated_at
    BEFORE UPDATE ON bins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Row Level Security (RLS) Policies
-- ===========================================

-- Enable RLS
ALTER TABLE bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE disposal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bin_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hourly_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_compliance ENABLE ROW LEVEL SECURITY;

-- Allow public read access for dashboard (via anon key)
CREATE POLICY "Allow public read bins" ON bins FOR SELECT USING (true);
CREATE POLICY "Allow public read events" ON disposal_events FOR SELECT USING (true);
CREATE POLICY "Allow public read daily_stats" ON daily_bin_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read impact" ON impact_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read hourly" ON hourly_analytics FOR SELECT USING (true);
CREATE POLICY "Allow public read weekly" ON weekly_compliance FOR SELECT USING (true);

-- Allow service_role full access for backend
CREATE POLICY "Allow service full access bins" ON bins FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service full access events" ON disposal_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service full access daily_stats" ON daily_bin_stats FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service full access impact" ON impact_metrics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service full access hourly" ON hourly_analytics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service full access weekly" ON weekly_compliance FOR ALL USING (auth.role() = 'service_role');

-- ===========================================
-- Seed Data: Default Bins
-- ===========================================
INSERT INTO bins (id, name, type, location, zone, fill_level, current_capacity, max_capacity) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Wet Waste Bin', 'wet', 'Hostel A - Mess Hall', 'Hostel A', 62, 62, 100),
    ('a0000000-0000-0000-0000-000000000002', 'Dry Waste Bin', 'dry', 'Hostel B - Cafeteria', 'Hostel B', 45, 45, 100),
    ('a0000000-0000-0000-0000-000000000003', 'Plastic/Recyclable Bin', 'plastic', 'Main Cafeteria - Food Court', 'Main Campus', 78, 78, 100)
ON CONFLICT (id) DO NOTHING;

-- Seed Data: Impact Metrics
INSERT INTO impact_metrics (metric_type, value, unit) VALUES
    ('waste_diverted_kg', 1427, 'kg'),
    ('compost_produced_kg', 584, 'kg'),
    ('methane_avoided_kg', 312, 'kg'),
    ('co2e_avoided_t', 12.4, 't'),
    ('landfill_fees_saved', 48500, '₹'),
    ('total_interventions', 312, 'events'),
    ('overall_compliance_rate', 87, '%'),
    ('active_bins', 3, 'bins'),
    ('total_events_logged', 2847, 'events')
ON CONFLICT (metric_type) DO NOTHING;

-- Seed Data: Weekly Compliance
INSERT INTO weekly_compliance (week_start, week_label, compliance_rate, total_events, compliant_events) VALUES
    ('2026-06-22', 'Week 1', 72, 420, 302),
    ('2026-06-29', 'Week 2', 78, 510, 398),
    ('2026-07-06', 'Week 3', 85, 480, 408),
    ('2026-07-13', 'Week 4', 89, 540, 481)
ON CONFLICT (week_start) DO NOTHING;