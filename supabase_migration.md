# Supabase Migration Plan: Investment Vehicles

This migration ensures that the database schema supports the new logic for Investment Funds and Titularization Funds across the three core modules.

## SQL Migration Commands

Copy and execute the following SQL in the [Supabase SQL Editor](https://app.supabase.com/project/hmiygipkbqwotnsrmslu/sql):

```sql
-- 1. Table: observaciones
-- Adds support for defining records as investment vehicles and selecting specific funds.
ALTER TABLE observaciones ADD COLUMN IF NOT EXISTS es_vehiculo_inversion BOOLEAN DEFAULT FALSE;
ALTER TABLE observaciones ADD COLUMN IF NOT EXISTS fondo_inversion TEXT;
ALTER TABLE observaciones ADD COLUMN IF NOT EXISTS fondo_titularizacion TEXT;

-- 2. Table: correlativos
-- Ensures that 'correlativos' (used for reports) also captures titularization fund selection.
-- (Note: 'es_vehiculo_inversion' and 'fondo_inversion' should already exist but we include them with IF NOT EXISTS for safety)
ALTER TABLE correlativos ADD COLUMN IF NOT EXISTS es_vehiculo_inversion BOOLEAN DEFAULT FALSE;
ALTER TABLE correlativos ADD COLUMN IF NOT EXISTS fondo_inversion TEXT;
ALTER TABLE correlativos ADD COLUMN IF NOT EXISTS fondo_titularizacion TEXT;

-- 3. Table: correlativos_notas
-- Extends the correspondence logic to optionally track investment vehicles.
ALTER TABLE correlativos_notas ADD COLUMN IF NOT EXISTS es_vehiculo_inversion BOOLEAN DEFAULT FALSE;
ALTER TABLE correlativos_notas ADD COLUMN IF NOT EXISTS fondo_inversion TEXT;
ALTER TABLE correlativos_notas ADD COLUMN IF NOT EXISTS fondo_titularizacion TEXT;
```

## Schema Validation (Post-Migration)

Once the SQL is executed, the following results are expected:

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| `observaciones` | `es_vehiculo_inversion` | `BOOLEAN` | Main toggle in 'NuevoRegistro' |
| `observaciones` | `fondo_inversion` | `TEXT` | Stores ID from Investment Fund catalog |
| `observaciones` | `fondo_titularizacion` | `TEXT` | Stores ID from Titularization Fund catalog |
| `correlativos` | `fondo_titularizacion` | `TEXT` | Captures titularization in Planificación reports |
| `correlativos_notas` | `fondo_titularizacion` | `TEXT` | (Optional) Captures titularization in Notes |

---
> [!IMPORTANT]
> The 'fondo_inversion' and 'fondo_titularizacion' columns use `TEXT` instead of `UUID` to maintain compatibility with the existing alphanumeric IDs in the 'Settings' catalog.
