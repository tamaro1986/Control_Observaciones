-- ===================================================================
-- AuditFlow Pro: Migration — Criterios de Cierre
-- ===================================================================

ALTER TABLE public.observaciones 
ADD COLUMN IF NOT EXISTS criterio_administrativo TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS criterio_legal TEXT DEFAULT '';

COMMENT ON COLUMN public.observaciones.criterio_administrativo IS 'Justificación administrativa para el cierre del hallazgo';
COMMENT ON COLUMN public.observaciones.criterio_legal IS 'Fundamentación legal para el cierre del hallazgo';
