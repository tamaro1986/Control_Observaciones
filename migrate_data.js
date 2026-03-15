import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { 
    CLASIFICACIONES_CORR, INDUSTRIAS_CORR, TIPOS_INFORME_CORR,
    ACCIONES_SUPERVISION, NORMAS_CORR, RESPONSABLES, ENTIDADES,
    TIPOS_CORRESPONDENCIA, NORMAS_NOTAS_EXTRA,
    NIVELES_RIESGO, ESTADOS, TIPOS_RIESGO, TIPOS_VISITA,
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
        };

        const settingsToUpsert = Object.entries(catalogs).map(([key, value]) => ({
            key, value
        }));
        const { error: settError } = await supabase.from('settings').upsert(settingsToUpsert);
        if (settError) throw settError;

        // 3. Correlativos
        console.log('Migrando correlativos...');
        const { error: corrError } = await supabase.from('correlativos').upsert(MOCK_CORRELATIVOS);
        if (corrError) throw corrError;

        // 4. Notas
        console.log('Migrando notas...');
        const { error: notasError } = await supabase.from('correlativos_notas').upsert(MOCK_CORRELATIVOS_NOTAS);
        if (notasError) throw notasError;

        // 5. Observaciones
        console.log('Migrando observaciones...');
        const mapToDB = (item) => ({
            entidad_id: item.entidadId,
            tipo_visita: item.tipoVisita,
            fecha_apertura: item.fechaApertura,
            fecha_cierre: item.fechaCierre,
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
        });

        const obsToInsert = MOCK_OBSERVACIONES.map(mapToDB);
        const { error: obsError } = await supabase.from('observaciones').upsert(obsToInsert);
        if (obsError) throw obsError;

        console.log('Migración completada exitosamente.');

    } catch (err) {
        console.error('Error durante la migración:', err);
    }
}

migrate();
