import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log(`\n🔍 Verificando esquema para: ${supabaseUrl}`);
    
    // Lista de columnas que el código espera enviar
    const expectedColumns = [
        'fecha', 'codigo', 'numero', 'año', 'asunto', 'responsable', 
        'entidad', 'clasificacion', 'industria', 'anulado', 
        'es_interno', 'tipo_informe', 'accion_supervision', 
        'descripcion_accion', 'es_vehiculo_inversion', 
        'fondo_inversion', 'cantidad_unidades', 'blf_otro', 'normas'
    ];

    // Intentamos obtener una fila (registros o solo esquema)
    const { data, error } = await supabase
        .from('correlativos')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Error de conexión o tabla no encontrada:', error.message);
        return;
    }

    const actualColumns = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    if (actualColumns.length > 0) {
        console.log('✅ Columnas encontradas en la tabla:');
        console.log(actualColumns.join(', '));
        
        const missing = expectedColumns.filter(col => !actualColumns.includes(col));
        
        if (missing.length > 0) {
            console.log('\n🚨 COLUMNAS FALTANTES DETECTADAS:');
            missing.forEach(col => console.log(`   - ${col}`));
            console.log('\n⚠️ DEBES EJECUTAR EL SCRIPT SQL QUE TE PASÉ PARA ARREGLAR ESTO.');
        } else {
            console.log('\n🎉 ¡Perfecto! El esquema coincide con lo que espera el código.');
        }
    } else {
        console.log('ℹ️ La tabla está vacía. No puedo leer las columnas automáticamente.');
        console.log('Intentando verificar mediante una inserción de prueba...');
        
        // Verificación manual campo por campo para ver dónde falla
        for (const col of expectedColumns) {
            const testPayload = { [col]: (col === 'fecha' ? '2025-01-01' : (col === 'numero' || col === 'año' || col === 'cantidad_unidades' ? 0 : (col === 'normas' ? [] : (col === 'anulado' || col === 'es_interno' || col === 'es_vehiculo_inversion' ? false : '')))) };
            const { error: colError } = await supabase.from('correlativos').insert([testPayload]);
            
            if (colError && colError.message.includes('column') && colError.message.includes('does not exist')) {
                console.log(`❌ La columna [${col}] NO EXISTE en Supabase.`);
            } else if (colError) {
                // Otros errores (como RLS o null) los ignoramos aquí porque solo buscamos existencia de columna
            } else {
                 // Column exists! Clean up if necessary
            }
        }
    }
}

checkSchema();
