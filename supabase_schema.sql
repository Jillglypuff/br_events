CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  shirt_size TEXT DEFAULT 'M',
  avatar TEXT,
  age INT,
  province TEXT,
  canton TEXT,
  district TEXT,
  role TEXT DEFAULT 'member', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id INT NOT NULL, 
  year INT NOT NULL DEFAULT 2026,
  title TEXT NOT NULL,
  theme TEXT,
  description TEXT,
  banner TEXT,
  organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organizer_name TEXT,
  confirmed_date TEXT,
  location TEXT,
  maps_url TEXT,
  waze_url TEXT,
  status TEXT DEFAULT 'unassigned', 
  show_checklist BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month_id, year)
);

CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  question TEXT NOT NULL DEFAULT '¿Qué fecha prefieres para este evento?',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  date_text TEXT NOT NULL, 
  voters TEXT[] DEFAULT '{}', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  avatar TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  uploader_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  paid_by TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carpooling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  route TEXT,
  seats INT DEFAULT 4,
  passengers TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  assigned_to TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_name TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  month_name TEXT DEFAULT 'General',
  type TEXT DEFAULT 'Regalías y Productos',
  product_description TEXT,
  amount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'Confirmado',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  description TEXT NOT NULL,
  website_url TEXT,
  banner_url TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  location TEXT DEFAULT 'all',
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carpooling ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso Publico Users" ON users;
CREATE POLICY "Acceso Publico Users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso Publico Events" ON events;
CREATE POLICY "Acceso Publico Events" ON events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso Publico Polls" ON polls;
CREATE POLICY "Acceso Publico Polls" ON polls FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso Publico PollOptions" ON poll_options;
CREATE POLICY "Acceso Publico PollOptions" ON poll_options FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso Publico Reviews" ON reviews;
CREATE POLICY "Acceso Publico Reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso Publico Photos" ON photos;
CREATE POLICY "Acceso Publico Photos" ON photos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso Publico Expenses" ON expenses;
CREATE POLICY "Acceso Publico Expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso Publico Carpooling" ON carpooling;
CREATE POLICY "Acceso Publico Carpooling" ON carpooling FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso Publico Checklists" ON checklists;
CREATE POLICY "Acceso Publico Checklists" ON checklists FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso Publico Sponsorships" ON sponsorships;
CREATE POLICY "Acceso Publico Sponsorships" ON sponsorships FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso Publico AdCampaigns" ON ad_campaigns;
CREATE POLICY "Acceso Publico AdCampaigns" ON ad_campaigns FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- BUCKET DE ALMACENAMIENTO DE IMÁGENES (SUPABASE STORAGE)
-- ====================================================================

-- Crear el Bucket Público 'photos' para fotos HD, banners y avatares
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Acceso Público Lectura/Escritura para el Bucket 'photos'
DROP POLICY IF EXISTS "Acceso Lectura Fotos Bucket" ON storage.objects;
CREATE POLICY "Acceso Lectura Fotos Bucket" ON storage.objects FOR SELECT USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Acceso Insertar Fotos Bucket" ON storage.objects;
CREATE POLICY "Acceso Insertar Fotos Bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "Acceso Actualizar Fotos Bucket" ON storage.objects;
CREATE POLICY "Acceso Actualizar Fotos Bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "Acceso Eliminar Fotos Bucket" ON storage.objects;
CREATE POLICY "Acceso Eliminar Fotos Bucket" ON storage.objects FOR DELETE USING (bucket_id = 'photos');
