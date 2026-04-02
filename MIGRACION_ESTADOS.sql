-- Este script actualiza los registros antiguos que tenían el estado 'Pendiente'
-- al nuevo valor que configuraste en tu catálogo: 'No subsanada'.

UPDATE observaciones 
SET estado = 'No subsanada' 
WHERE estado = 'Pendiente' OR estado = 'pendiente';

-- También opcional: actualizar historiales anidados si usaras JSONB, pero dado tu esquema, esto resuelve el listado principal.
