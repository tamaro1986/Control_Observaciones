-- ===================================================================
-- AuditFlow Pro: FIX SCHEME & PERMISSIONS
-- Ejecutar este script en el SQL Editor de Supabase
-- ===================================================================

-- 1. DESACTIVAR RLS TEMPORALMENTE (Para asegurar que la data cargue sin session)
ALTER TABLE IF EXISTS public.entidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.observaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.correlativos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.correlativos_notas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings DISABLE ROW LEVEL SECURITY;

-- 2. ASEGURAR COLUMNAS DE AUDITORÍA (Evita errores de ordenamiento en JS)
DO $$ 
BEGIN 
    -- TABLA: correlativos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='correlativos' AND column_name='creado_at') THEN
        ALTER TABLE public.correlativos ADD COLUMN creado_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- TABLA: correlativos_notas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='correlativos_notas' AND column_name='creado_at') THEN
        ALTER TABLE public.correlativos_notas ADD COLUMN creado_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- TABLA: observaciones
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='observaciones' AND column_name='creado_at') THEN
        ALTER TABLE public.observaciones ADD COLUMN creado_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. INSERTAR DATOS DE PRUEBA (Si las tablas están vacías no verás nada)
-- Solo inserta si no hay registros para no duplicar
INSERT INTO public.entidades (nombre, tipo, categoria)
SELECT 'García Integrum - Default', 'Sujeto Obligado', 'No Financiero'
WHERE NOT EXISTS (SELECT 1 FROM public.entidades LIMIT 1);

INSERT INTO public.settings (key, value)
VALUES ('catalogos', '{
    "sectores": ["Bancario", "Seguros", "Valores", "Inmobiliario", "Automotriz", "Legal", "Contable"],
    "riesgos": ["Crítico", "Alto", "Medio", "Bajo"],
    "estados": ["Pendiente", "En Proceso", "Cerrado", "Extemporáneo"]
}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 4. RE-HABILITAR RLS CON ACCESO PÚBLICO (Versión Permisiva para Dev)
-- Esto es mejor que desactivarlo totalmente. Permite SELECT a cualquiera con la anon key.
ALTER TABLE public.entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correlativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correlativos_notas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_entidades" ON public.entidades;
CREATE POLICY "public_select_entidades" ON public.entidades FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_select_obs" ON public.observaciones;
CREATE POLICY "public_select_obs" ON public.observaciones FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_select_corr" ON public.correlativos;
CREATE POLICY "public_select_corr" ON public.correlativos FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_select_notas" ON public.correlativos_notas;
CREATE POLICY "public_select_notas" ON public.correlativos_notas FOR SELECT USING (true);
