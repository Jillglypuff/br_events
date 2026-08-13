-- Script SQL de Creación de Tablas para BR Events en Supabase

-- 1. Tabla de Amigas / Perfiles (Sin usuarios quemados)
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  shirt_size TEXT DEFAULT 'M',
  avatar TEXT,
  age INT DEFAULT 25,
  province TEXT DEFAULT 'San José',
  canton TEXT DEFAULT 'Escazú',
  district TEXT DEFAULT 'San Rafael',
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla del Turnero de Meses
CREATE TABLE IF NOT EXISTS months (
  id INT NOT NULL,
  year INT NOT NULL DEFAULT 2026,
  name TEXT NOT NULL,
  theme TEXT,
  organizer_id UUID REFERENCES friends(id),
  organizer_name TEXT,
  status TEXT DEFAULT 'unassigned',
  image TEXT,
  PRIMARY KEY (id, year)
);

-- 3. Tabla de Gastos Compartidos (CRC)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  paid_by TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Fotos HD
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  uploader TEXT NOT NULL,
  date TEXT DEFAULT 'Reciente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Reseñas & Calificaciones
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_name TEXT NOT NULL,
  avatar TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  date TEXT DEFAULT 'Hoy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
