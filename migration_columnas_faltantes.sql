-- ===================================================================
-- MIGRACIÓN COMPLETA: Agregar TODAS las columnas faltantes
-- Ejecutar en Supabase → SQL Editor
-- Fecha: 2026-03-15
-- ===================================================================

-- ========================
-- TABLA: correlativos
-- ========================
ALTER TABLE public.correlativos
    ADD COLUMN IF NOT EXISTS anulado              BOOLEAN  DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS blf_otro             TEXT     DEFAULT '',
    ADD COLUMN IF NOT EXISTS tipo_correspondencia TEXT     DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS normas               JSONB    DEFAULT '[]'::jsonb;

-- ========================
-- TABLA: correlativos_notas
-- ========================
ALTER TABLE public.correlativos_notas
    ADD COLUMN IF NOT EXISTS anulado              BOOLEAN  DEFAULT FALSE;

-- ========================
-- TABLA: observaciones
-- (fecha_apertura ya existe en el schema original pero 
--  puede no estar en la BD si fue creada antes)
-- ========================
ALTER TABLE public.observaciones
    ADD COLUMN IF NOT EXISTS fecha_apertura       DATE     DEFAULT NULL;

-- ========================
-- VERIFICAR RESULTADO
-- ========================
SELECT table_name, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('correlativos', 'correlativos_notas', 'observaciones')
  AND column_name IN ('anulado', 'blf_otro', 'tipo_correspondencia', 'normas', 'fecha_apertura')
ORDER BY table_name, column_name;
