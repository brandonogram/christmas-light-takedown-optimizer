-- Christmas Light Takedown Optimizer Schema

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  service_regions TEXT[] DEFAULT '{}',
  storage_addresses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'dispatcher', 'crew')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobber OAuth connections
CREATE TABLE jobber_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crews table
CREATE TABLE crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  member_names JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  jobber_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'en_route', 'on_site', 'in_progress', 'completed', 'cancelled')),
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  crew_id UUID REFERENCES crews(id) ON DELETE SET NULL,
  notes TEXT,
  property_access_notes TEXT,
  estimated_duration_minutes INTEGER DEFAULT 60,
  payment_status TEXT DEFAULT 'unknown' CHECK (payment_status IN ('paid', 'partial', 'unpaid', 'unknown')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job inventory items
CREATE TABLE job_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'damaged', 'missing')),
  storage_location TEXT,
  storage_bin TEXT,
  qr_code TEXT,
  checked_off BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job photos
CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('installation', 'before', 'after', 'damage', 'other')),
  caption TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status updates log
CREATE TABLE status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  notes TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  crew_id UUID REFERENCES crews(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  job_ids UUID[] DEFAULT '{}',
  optimized_order INTEGER[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'in_progress', 'completed')),
  start_location TEXT,
  end_location TEXT,
  total_estimated_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Completion reports
CREATE TABLE completion_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
  pdf_url TEXT,
  sent_to_customer BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated videos (HeyGen, Gemini)
CREATE TABLE generated_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  video_type TEXT NOT NULL CHECK (video_type IN ('heygen_avatar', 'gemini_background', 'other')),
  video_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  provider_video_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_crew_id ON jobs(crew_id);
CREATE INDEX idx_job_inventory_job_id ON job_inventory(job_id);
CREATE INDEX idx_job_photos_job_id ON job_photos(job_id);
CREATE INDEX idx_status_updates_job_id ON status_updates(job_id);
CREATE INDEX idx_routes_company_id ON routes(company_id);
CREATE INDEX idx_routes_date ON routes(date);
CREATE INDEX idx_routes_crew_id ON routes(crew_id);
CREATE INDEX idx_crews_company_id ON crews(company_id);
CREATE INDEX idx_users_company_id ON users(company_id);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobber_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE completion_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for development)
CREATE POLICY "Allow all on companies" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all on jobber_connections" ON jobber_connections FOR ALL USING (true);
CREATE POLICY "Allow all on crews" ON crews FOR ALL USING (true);
CREATE POLICY "Allow all on jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow all on job_inventory" ON job_inventory FOR ALL USING (true);
CREATE POLICY "Allow all on job_photos" ON job_photos FOR ALL USING (true);
CREATE POLICY "Allow all on status_updates" ON status_updates FOR ALL USING (true);
CREATE POLICY "Allow all on routes" ON routes FOR ALL USING (true);
CREATE POLICY "Allow all on completion_reports" ON completion_reports FOR ALL USING (true);
CREATE POLICY "Allow all on generated_videos" ON generated_videos FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobber_connections_updated_at BEFORE UPDATE ON jobber_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON crews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_inventory_updated_at BEFORE UPDATE ON job_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_videos_updated_at BEFORE UPDATE ON generated_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
