import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { 
    CLASIFICACIONES_CORR, INDUSTRIAS_CORR, TIPOS_INFORME_CORR,
    ACCIONES_SUPERVISION, NORMAS_CORR, RESPONSABLES, ENTIDADES,
    TIPOS_CORRESPONDENCIA, NORMAS_NOTAS_EXTRA,
    NIVELES_RIESGO, ESTADOS, TIPOS_RIESGO, TIPOS_VISITA, UNIDADES_AUDITABLES,
    MOCK_OBSERVACIONES, MOCK_CORRELATIVOS, MOCK_CORRELATIVOS_NOTAS
} from './src/data/data.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas.');
    process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key length:', supabaseKey?.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('Iniciando migración de datos a Supabase...');

    try {
        const { data: testData, error: testError } = await supabase.from('entidades').select('count', { count: 'exact', head: true });
        if (testError) {
             console.error('Error al conectar con Supabase o la tabla no existe:', testError);
             return;
        }
        console.log('Conexión exitosa. Tablas detectadas.');

        // 2. Settings (Catálogos)
        console.log('Migrando catálogos (settings)...');
        const catalogs = {
            clasificaciones: CLASIFICACIONES_CORR,
            industrias: INDUSTRIAS_CORR,
            tiposInforme: TIPOS_INFORME_CORR,
            accionesSupervision: ACCIONES_SUPERVISION,
            normas: NORMAS_CORR,
            responsables: RESPONSABLES,
            tiposCorrespondencia: TIPOS_CORRESPONDENCIA,
            normasExtra: NORMAS_NOTAS_EXTRA,
            nivelesRiesgo: NIVELES_RIESGO,
            estados: ESTADOS,
            tiposRiesgo: TIPOS_RIESGO,
            tiposVisita: TIPOS_VISITA,
            unidadesAuditables: UNIDADES_AUDITABLES,
        };

        const settingsToUpsert = Object.entries(catalogs).map(([key, value]) => ({
            key, value
        }));
        const { error: settError } = await supabase.from('settings').upsert(settingsToUpsert, { onConflict: 'key' });
        if (settError) throw settError;

        /*
        // 3. Correlativos
        console.log('Migrando correlativos...');
        const mapCorrToDB = (item) => ({
            id: item.dbId || undefined, // Evitar colisión si no existe
            codigo: item.codigo,
            numero: item.numero,
            año: item.año,
            fecha: item.fecha,
            codigo_norma: item.codigoNorma,
            nombre_norma: item.nombreNorma,
            cantidad_unidades: item.cantidadUnidades,
            clasificacion: item.clasificacion,
            industria: item.industria,
            tipo_informe: item.tipoInforme,
            accion_supervision: item.accionSupervision,
            descripcion_accion: item.descripcionAccion,
            responsable: item.responsable,
            asunto: item.asunto,
            entidad: item.entidad,
            tipo: item.tipo || 'Externo',
            es_interno: item.esInterno || false,
            // es_vehiculo_inversion: item.esVehiculoInversion || false,
            // fondo_inversion: item.fondoInversion || null
        });
        const corrToInsert = MOCK_CORRELATIVOS.map(mapCorrToDB);
        const { error: corrError } = await supabase.from('correlativos').upsert(corrToInsert, { onConflict: 'codigo' });
        if (corrError) throw corrError;

        // 4. Notas
        console.log('Migrando notas...');
        const mapNotaToDB = (item) => ({
            id: item.dbId || undefined,
            codigo: item.codigo,
            numero: item.numero,
            año: item.año,
            fecha: item.fecha,
            asunto: item.asunto,
            responsable: item.responsable,
            entidad: item.entidad,
            tipo_correspondencia: item.tipoCorrespondencia,
            norma_extra: item.normaExtra || item.codigoNorma,
            descripcion: item.descripcion || item.descripcionAccion,
            es_interno: true
        });
        const notasToInsert = MOCK_CORRELATIVOS_NOTAS.map(mapNotaToDB);
        const { error: notasError } = await supabase.from('correlativos_notas').upsert(notasToInsert, { onConflict: 'codigo' });
        if (notasError) throw notasError;

        // 5. Observaciones
        console.log('Migrando observaciones...');
        const mapToDB = (item) => ({
            entidad_id: item.entidadId,
            tipo_visita: item.tipoVisita,
            fecha_apertura: item.fechaApertura || item.fechaInicio,
            fecha_cierre: item.fechaCierre || item.fechaFin,
            fecha_eval_inicio: item.fechaEvalInicio,
            fecha_eval_final: item.fechaEvalFinal,
            nro_informe: item.nroInforme,
            nivel_riesgo: item.nivelRiesgo,
            tipo_riesgo: item.tipoRiesgo,
            fecha_plan_accion: item.fechaPlanAccion,
            respuesta_entidad: item.respuestaEntidad,
            fecha_respuesta: item.fechaRespuesta,
            historial_estados: item.historialEstados,
            estado: item.estado,
            titulo: item.titulo,
            descripcion: item.descripcion,
            normativa: item.normativa,
            nota: item.nota,
            responsable: item.responsable,
            seccion_id: item.seccionId,
        });

        const obsToInsert = MOCK_OBSERVACIONES.map(mapToDB);
        const { error: obsError } = await supabase.from('observaciones').upsert(obsToInsert);
        if (obsError) throw obsError;
        */

        console.log('Migración de catálogos finalizada con éxito.');

    } catch (err) {
        console.error('Error durante la migración:', err);
    }
}

migrate();
