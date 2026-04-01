-- ===== AuditFlow Pro: Invitation Codes Setup =====

-- 1. Crear la tabla de códigos de invitación
CREATE TABLE IF NOT EXISTS public.codigos_registro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo TEXT UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ
);

-- 2. Habilitar RLS
ALTER TABLE public.codigos_registro ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Seguridad
-- Lectura pública (para que el cliente pueda validar si existe y no está usado antes de registrarse)
CREATE POLICY "Permitir validación de códigos" ON public.codigos_registro
FOR SELECT TO anon, authenticated
USING (is_used = false);

-- Actualización (solo para marcar como usado al registrarse)
-- Idealmente esto se haría vía una función RPC por mayor seguridad, 
-- pero para la versión simple permitiremos el update si el usuario está autenticado (recién creado)
CREATE POLICY "Permitir marcar código como usado" ON public.codigos_registro
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Insertar algunos códigos iniciales de prueba
INSERT INTO public.codigos_registro (codigo) VALUES 
('AUDIT-PRO-2026-001'),
('AUDIT-PRO-2026-002'),
('AUDIT-PRO-2026-003'),
('GARCIA-INTEGRUM-VIP');
