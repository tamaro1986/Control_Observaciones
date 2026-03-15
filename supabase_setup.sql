-- ===== AuditFlow Pro: Database Schema Setup =====

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Entidades
CREATE TABLE IF NOT EXISTS public.entidades (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    categoria TEXT,
    creado_at TIMESTAMPTZ DEFAULT NOW(),
    actualizado_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Observaciones
CREATE TABLE IF NOT EXISTS public.observaciones (
    id BIGSERIAL PRIMARY KEY,
    entidad_id BIGINT REFERENCES public.entidades(id),
    tipo_visita TEXT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    nivel_riesgo TEXT NOT NULL, -- Crítico, Alto, Medio, Bajo
    tipo_riesgo TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    normativa TEXT,
    nro_informe TEXT,
    nota TEXT,
    responsable TEXT, -- Nombre del auditor responsable
    fecha_plan_accion DATE,
    creado_por UUID REFERENCES auth.users(id),
    creado_at TIMESTAMPTZ DEFAULT NOW(),
    actualizado_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Historial de Estados para Observaciones
CREATE TABLE IF NOT EXISTS public.historial_observaciones (
    id BIGSERIAL PRIMARY KEY,
    observacion_id BIGINT REFERENCES public.observaciones(id) ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE,
    estado_anterior TEXT,
    estado_nuevo TEXT NOT NULL,
    nro_informe TEXT,
    nota TEXT,
    respuesta_entidad TEXT,
    analisis_auditor TEXT,
    plan_accion TEXT,
    fecha_plan_accion DATE,
    creado_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Correlativos (Cartas/Informes)
CREATE TABLE IF NOT EXISTS public.correlativos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo TEXT UNIQUE NOT NULL, -- Ejemplo: DSFIT-035/2026
    numero INTEGER NOT NULL,
    año INTEGER NOT NULL,
    fecha DATE NOT NULL,
    codigo_norma TEXT,
    nombre_norma TEXT,
    cantidad_unidades INTEGER DEFAULT 1,
    clasificacion TEXT,
    industria TEXT,
    tipo_informe TEXT,
    accion_supervision TEXT,
    descripcion_accion TEXT,
    responsable TEXT,
    asunto TEXT,
    entidad TEXT,
    creado_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Configuración de Seguridad (RLS)
ALTER TABLE public.entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_observaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correlativos ENABLE ROW LEVEL SECURITY;

-- Políticas por defecto (Lectura para todos los autenticados)
CREATE POLICY "Lectura pública para usuarios autenticados" ON public.entidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura pública para usuarios autenticados" ON public.observaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura pública para usuarios autenticados" ON public.historial_observaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura pública para usuarios autenticados" ON public.correlativos FOR SELECT TO authenticated USING (true);

-- Políticas de Inserción/Edición (Solo autenticados)
CREATE POLICY "Inserción para usuarios autenticados" ON public.observaciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Edición para usuarios autenticados" ON public.observaciones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Inserción para usuarios autenticados" ON public.historial_observaciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Inserción para usuarios autenticados" ON public.correlativos FOR INSERT TO authenticated WITH CHECK (true);

-- 7. Funciones para actualizar el campo actualizado_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entidades_actualizado_at BEFORE UPDATE ON public.entidades FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_observaciones_actualizado_at BEFORE UPDATE ON public.observaciones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
