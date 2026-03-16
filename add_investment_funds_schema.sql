-- Añadir columnas para el control de Fondos de Inversión
ALTER TABLE correlativos 
ADD COLUMN IF NOT EXISTS es_vehiculo_inversion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fondo_inversion TEXT;

-- Comentario para identificar la versión
COMMENT ON COLUMN correlativos.es_vehiculo_inversion IS 'Indica si el informe corresponde a un vehículo de inversión';
COMMENT ON COLUMN correlativos.fondo_inversion IS 'Nombre del fondo de inversión asociado si aplica';
