-- ===================================================================
-- AuditFlow Pro: Database Schema Setup — VERSIÓN COMPLETA v2
-- Ejecutar completo en Supabase → SQL Editor
-- ===================================================================

-- 0. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- TABLA 1: entidades
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.entidades (
    id         BIGSERIAL PRIMARY KEY,
    nombre     TEXT NOT NULL,
    tipo       TEXT NOT NULL,
    categoria  TEXT,
    creado_at  TIMESTAMPTZ DEFAULT NOW(),
    actualizado_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- TABLA 2: observaciones
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.observaciones (
    id                  BIGSERIAL PRIMARY KEY,
    entidad_id          BIGINT REFERENCES public.entidades(id),
    tipo_visita         TEXT,
    fecha_apertura      DATE,
    fecha_cierre        DATE,
    fecha_eval_inicio   DATE,
    fecha_eval_final    DATE,
    titulo              TEXT NOT NULL,
    descripcion         TEXT,
    observacion         TEXT,
    nivel_riesgo        TEXT NOT NULL DEFAULT 'Medio',
    tipo_riesgo         TEXT,
    estado              TEXT NOT NULL DEFAULT 'Pendiente',
    normativa           TEXT,
    nro_informe         TEXT,
    nota                TEXT,
    responsable         TEXT,
    fecha_plan_accion   DATE,
    respuesta_entidad   TEXT,
    fecha_respuesta     DATE,
    historial_estados   JSONB DEFAULT '[]'::jsonb,
    num_referencia      TEXT,
    seccion_id          TEXT,
    anulada             BOOLEAN DEFAULT FALSE,
    creado_por          UUID REFERENCES auth.users(id),
    creado_at           TIMESTAMPTZ DEFAULT NOW(),
    actualizado_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- TABLA 3: correlativos  (cartas / informes)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.correlativos (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo               TEXT UNIQUE,
    numero               INTEGER,
    año                  INTEGER,
    fecha                DATE,
    codigo_norma         TEXT,
    nombre_norma         TEXT,
    cantidad_unidades    INTEGER DEFAULT 1,
    clasificacion        TEXT,
    industria            TEXT,
    tipo_informe         TEXT,
    accion_supervision   TEXT,
    descripcion_accion   TEXT,
    responsable          TEXT,
    asunto               TEXT,
    entidad              TEXT,
    tipo                 TEXT DEFAULT 'Externo',
    es_interno           BOOLEAN DEFAULT FALSE,
    creado_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- TABLA 4: correlativos_notas  (notas / comunicaciones internas)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.correlativos_notas (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo               TEXT,
    numero               INTEGER,
    año                  INTEGER,
    fecha                DATE,
    asunto               TEXT,
    responsable          TEXT,
    entidad              TEXT,
    tipo_correspondencia TEXT,
    norma_extra          TEXT,
    descripcion          TEXT,
    es_interno           BOOLEAN DEFAULT TRUE,
    creado_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- TABLA 5: settings  (configuración dinámica de catálogos)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id         BIGSERIAL PRIMARY KEY,
    key        TEXT UNIQUE NOT NULL,
    value      JSONB,
    creado_at  TIMESTAMPTZ DEFAULT NOW(),
    actualizado_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- TABLA 6: codigos_registro  (invitaciones / licencias)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.codigos_registro (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo     TEXT UNIQUE NOT NULL,
    is_used    BOOLEAN DEFAULT FALSE,
    used_by    UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    used_at    TIMESTAMPTZ
);

-- ===================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ===================================================================
ALTER TABLE public.entidades          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observaciones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correlativos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correlativos_notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigos_registro   ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- POLÍTICAS (DROP IF EXISTS + CREATE para evitar duplicados)
-- ===================================================================

-- entidades
DROP POLICY IF EXISTS "select_entidades"  ON public.entidades;
DROP POLICY IF EXISTS "insert_entidades"  ON public.entidades;
DROP POLICY IF EXISTS "update_entidades"  ON public.entidades;
DROP POLICY IF EXISTS "delete_entidades"  ON public.entidades;
CREATE POLICY "select_entidades"  ON public.entidades FOR SELECT    TO authenticated USING (true);
CREATE POLICY "insert_entidades"  ON public.entidades FOR INSERT    TO authenticated WITH CHECK (true);
CREATE POLICY "update_entidades"  ON public.entidades FOR UPDATE    TO authenticated USING (true);
CREATE POLICY "delete_entidades"  ON public.entidades FOR DELETE    TO authenticated USING (true);

-- observaciones
DROP POLICY IF EXISTS "select_obs"  ON public.observaciones;
DROP POLICY IF EXISTS "insert_obs"  ON public.observaciones;
DROP POLICY IF EXISTS "update_obs"  ON public.observaciones;
DROP POLICY IF EXISTS "delete_obs"  ON public.observaciones;
CREATE POLICY "select_obs"  ON public.observaciones FOR SELECT    TO authenticated USING (true);
CREATE POLICY "insert_obs"  ON public.observaciones FOR INSERT    TO authenticated WITH CHECK (true);
CREATE POLICY "update_obs"  ON public.observaciones FOR UPDATE    TO authenticated USING (true);
CREATE POLICY "delete_obs"  ON public.observaciones FOR DELETE    TO authenticated USING (true);

-- correlativos
DROP POLICY IF EXISTS "select_corr"  ON public.correlativos;
DROP POLICY IF EXISTS "insert_corr"  ON public.correlativos;
DROP POLICY IF EXISTS "update_corr"  ON public.correlativos;
DROP POLICY IF EXISTS "delete_corr"  ON public.correlativos;
CREATE POLICY "select_corr"  ON public.correlativos FOR SELECT    TO authenticated USING (true);
CREATE POLICY "insert_corr"  ON public.correlativos FOR INSERT    TO authenticated WITH CHECK (true);
CREATE POLICY "update_corr"  ON public.correlativos FOR UPDATE    TO authenticated USING (true);
CREATE POLICY "delete_corr"  ON public.correlativos FOR DELETE    TO authenticated USING (true);

-- correlativos_notas
DROP POLICY IF EXISTS "select_notas"  ON public.correlativos_notas;
DROP POLICY IF EXISTS "insert_notas"  ON public.correlativos_notas;
DROP POLICY IF EXISTS "update_notas"  ON public.correlativos_notas;
DROP POLICY IF EXISTS "delete_notas"  ON public.correlativos_notas;
CREATE POLICY "select_notas"  ON public.correlativos_notas FOR SELECT    TO authenticated USING (true);
CREATE POLICY "insert_notas"  ON public.correlativos_notas FOR INSERT    TO authenticated WITH CHECK (true);
CREATE POLICY "update_notas"  ON public.correlativos_notas FOR UPDATE    TO authenticated USING (true);
CREATE POLICY "delete_notas"  ON public.correlativos_notas FOR DELETE    TO authenticated USING (true);

-- settings
DROP POLICY IF EXISTS "select_settings"  ON public.settings;
DROP POLICY IF EXISTS "insert_settings"  ON public.settings;
DROP POLICY IF EXISTS "update_settings"  ON public.settings;
CREATE POLICY "select_settings"  ON public.settings FOR SELECT    TO authenticated USING (true);
CREATE POLICY "insert_settings"  ON public.settings FOR INSERT    TO authenticated WITH CHECK (true);
CREATE POLICY "update_settings"  ON public.settings FOR UPDATE    TO authenticated USING (true);

-- codigos_registro
DROP POLICY IF EXISTS "validar_codigo"  ON public.codigos_registro;
DROP POLICY IF EXISTS "marcar_usado"    ON public.codigos_registro;
CREATE POLICY "validar_codigo"  ON public.codigos_registro FOR SELECT TO anon, authenticated USING (is_used = false);
CREATE POLICY "marcar_usado"    ON public.codigos_registro FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ===================================================================
-- TRIGGER: actualizar campo actualizado_at
-- ===================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_entidades_updated_at      ON public.entidades;
DROP TRIGGER IF EXISTS trg_observaciones_updated_at  ON public.observaciones;
DROP TRIGGER IF EXISTS trg_settings_updated_at       ON public.settings;

CREATE TRIGGER trg_entidades_updated_at
    BEFORE UPDATE ON public.entidades
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_observaciones_updated_at
    BEFORE UPDATE ON public.observaciones
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ===================================================================
-- DATOS INICIALES: Códigos de invitación
-- ===================================================================
INSERT INTO public.codigos_registro (codigo) VALUES
    ('AUDIT-PRO-2026-001'),
    ('AUDIT-PRO-2026-002'),
    ('AUDIT-PRO-2026-003'),
    ('GARCIA-INTEGRUM-VIP')
ON CONFLICT (codigo) DO NOTHING;
