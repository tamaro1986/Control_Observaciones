import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    MOCK_OBSERVACIONES, MOCK_CORRELATIVOS, MOCK_CORRELATIVOS_NOTAS,
    CLASIFICACIONES_CORR, INDUSTRIAS_CORR, TIPOS_INFORME_CORR,
    ACCIONES_SUPERVISION, NORMAS_CORR, RESPONSABLES, ENTIDADES,
    TIPOS_CORRESPONDENCIA, NORMAS_NOTAS_EXTRA,
    NIVELES_RIESGO, ESTADOS, TIPOS_RIESGO, TIPOS_VISITA
} from '../data/data';

export default function useObservaciones() {
    // 1. Core States
    const [observaciones, setObservaciones] = useState([]);
    const [correlativos, setCorrelativos] = useState([]);
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);

    const [catalogos, setCatalogos] = useState({
        clasificaciones: CLASIFICACIONES_CORR,
        industrias: INDUSTRIAS_CORR,
        tiposInforme: TIPOS_INFORME_CORR,
        accionesSupervision: ACCIONES_SUPERVISION,
        normas: NORMAS_CORR,
        responsables: RESPONSABLES,
        entidades: ENTIDADES,
        tiposCorrespondencia: TIPOS_CORRESPONDENCIA,
        normasExtra: NORMAS_NOTAS_EXTRA,
        nivelesRiesgo: NIVELES_RIESGO.map(n => n.value),
        estados: ESTADOS.map(e => e.value),
        tiposRiesgo: TIPOS_RIESGO,
        tiposVisita: TIPOS_VISITA,
        descripcionesAccion: [
            'Visita de supervisión focalizada en controles de seguridad de la información.',
            'Revisión de gestión de inversión y cumplimiento normativo en fondo de inversión.',
            'Visita de supervisión focalizada en accesos y ciberseguridad.',
            'Análisis técnico sobre resultados de estados financieros y uso de plataformas.',
            'Elaboración de informe técnico para Junta General Ordinaria y Extraordinaria.',
            'Seguimiento a revisión de la implementación del sistema contable.',
            'Atención a Junta General de Accionistas y Asambleas de Partícipes.',
            'Respuesta a solicitud de prórroga de envío de seguimiento a plan de acción.',
        ],
    });

    // --- Mapping Helpers ---
    const mapFromDB = (item) => {
        if (!item) return null;
        return {
            ...item,
            entidadId: item.entidad_id,
            tipoVisita: item.tipo_visita,
            fechaApertura: item.fecha_apertura,
            fechaCierre: item.fecha_cierre,
            fechaEvalInicio: item.fecha_eval_inicio,
            fechaEvalFinal: item.fecha_eval_final,
            nroInforme: item.nro_informe,
            nivelRiesgo: item.nivel_riesgo,
            tipoRiesgo: item.tipo_riesgo,
            fechaPlanAccion: item.fecha_plan_accion,
            respuestaEntidad: item.respuesta_entidad,
            fechaRespuesta: item.fecha_respuesta,
            historialEstados: item.historial_estados || []
        };
    };

    const mapToDB = (item) => {
        if (!item) return null;
        const mapped = {};
        if (item.entidadId !== undefined) mapped.entidad_id = item.entidadId;
        if (item.tipoVisita !== undefined) mapped.tipo_visita = item.tipoVisita;
        if (item.fechaApertura !== undefined) mapped.fecha_apertura = item.fechaApertura;
        if (item.fechaCierre !== undefined) mapped.fecha_cierre = item.fechaCierre;
        if (item.fechaEvalInicio !== undefined) mapped.fecha_eval_inicio = item.fechaEvalInicio;
        if (item.fechaEvalFinal !== undefined) mapped.fecha_eval_final = item.fechaEvalFinal;
        if (item.nroInforme !== undefined) mapped.nro_informe = item.nroInforme;
        if (item.nivelRiesgo !== undefined) mapped.nivel_riesgo = item.nivelRiesgo;
        if (item.tipoRiesgo !== undefined) mapped.tipo_riesgo = item.tipoRiesgo;
        if (item.fechaPlanAccion !== undefined) mapped.fecha_plan_accion = item.fechaPlanAccion;
        if (item.respuestaEntidad !== undefined) mapped.respuesta_entidad = item.respuestaEntidad;
        if (item.fechaRespuesta !== undefined) mapped.fecha_respuesta = item.fechaRespuesta;
        if (item.historialEstados !== undefined) mapped.historial_estados = item.historialEstados;
        if (item.estado !== undefined) mapped.estado = item.estado;
        if (item.titulo !== undefined) mapped.titulo = item.titulo;
        if (item.descripcion !== undefined) mapped.descripcion = item.descripcion;
        if (item.normativa !== undefined) mapped.normativa = item.normativa;
        if (item.nota !== undefined) mapped.nota = item.nota;
        if (item.responsable !== undefined) mapped.responsable = item.responsable;
        return mapped;
    };

    // Safe fetch helper: returns { data, error } without throwing
    const safeFetch = async (query) => {
        try {
            const result = await query;
            if (result.error) {
                // Log but don't throw — table may not exist yet
                console.warn('[AuditFlow] Query warning:', result.error.message);
                return { data: [], error: result.error };
            }
            return { data: result.data || [], error: null };
        } catch (e) {
            console.warn('[AuditFlow] Fetch error:', e.message);
            return { data: [], error: e };
        }
    };

    // 2. Fetch Initial Data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Parallel fetch — each query is resilient; a missing table won't crash the app
            const [obsRes, corrRes, notasRes, entitiesRes, settingsRes] = await Promise.all([
                safeFetch(supabase.from('observaciones').select('*').order('creado_at', { ascending: false })),
                safeFetch(supabase.from('correlativos').select('*').order('creado_at', { ascending: false })),
                safeFetch(supabase.from('correlativos_notas').select('*').order('creado_at', { ascending: false })),
                safeFetch(supabase.from('entidades').select('*')),
                safeFetch(supabase.from('settings').select('*')),
            ]);

            if (obsRes.data.length > 0 || !obsRes.error) setObservaciones(obsRes.data.map(mapFromDB));
            if (corrRes.data.length > 0 || !corrRes.error) setCorrelativos(corrRes.data);
            if (notasRes.data.length > 0 || !notasRes.error) setNotas(notasRes.data);
            if (entitiesRes.data.length > 0) {
                setCatalogos(prev => ({ ...prev, entidades: entitiesRes.data }));
            }
            if (settingsRes.data.length > 0) {
                setCatalogos(prev => {
                    const newCatalogos = { ...prev };
                    settingsRes.data.forEach(s => {
                        newCatalogos[s.key] = s.value;
                    });
                    return newCatalogos;
                });
            }

        } catch (error) {
            console.error('Error in fetchData:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        
        // Subscription for Realtime
        const channel = supabase.channel('schema-db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'observaciones' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'correlativos' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'correlativos_notas' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'entidades' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchData())
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [fetchData]);

    // Helpers
    const getEntidadById = useCallback((id) => {
        return catalogos.entidades.find(e => String(e.id) === String(id)) || null;
    }, [catalogos.entidades]);

    // --- Actions ---

    const crearAuditoria = useCallback(async (form) => {
        const { entidadId, tipoVisita, fechaApertura, fechaCierre, fechaEvalInicio, fechaEvalFinal, nroInforme, tarjetas } = form;
        
        const nuevas = tarjetas.map((t) => mapToDB({
            entidadId: parseInt(entidadId),
            tipoVisita,
            fechaApertura,
            fechaCierre,
            fechaEvalInicio,
            fechaEvalFinal,
            nroInforme: nroInforme || t.nroInforme || '',
            titulo: t.titulo,
            descripcion: t.descripcion,
            nivelRiesgo: t.nivelRiesgo,
            tipoRiesgo: t.tipoRiesgo || 'Operacional',
            estado: t.estado || 'Pendiente',
            normativa: t.normativa || '',
            nota: t.nota || '',
            responsable: t.responsable || '',
            fechaPlanAccion: t.fechaPlanAccion || '',
            respuestaEntidad: t.respuestaEntidad || '',
            fechaRespuesta: t.fechaRespuesta || '',
            historialEstados: [
                {
                    fecha: new Date().toISOString().split('T')[0],
                    estadoAnterior: null,
                    estadoNuevo: t.estado || 'Pendiente',
                    nroInforme: nroInforme || t.nroInforme || '',
                    nota: t.nota || '',
                    respuestaEntidad: t.respuestaEntidad || '',
                    fechaRespuesta: t.fechaRespuesta || '',
                    analisisAuditor: t.comentarioAuditor || 'Hallazgo registrado.',
                    planAccion: '',
                    fechaPlanAccion: t.fechaPlanAccion || '',
                },
            ],
        }));

        const { data, error } = await supabase.from('observaciones').insert(nuevas).select();
        if (error) throw error;
        return data.map(n => n.id);
    }, []);

    const cambiarEstado = useCallback(async (id, cambio) => {
        const obs = observaciones.find(o => o.id === id);
        if (!obs) return;

        const nuevoHistorial = {
            fecha: new Date().toISOString().split('T')[0],
            estadoAnterior: obs.estado,
            estadoNuevo: cambio.nuevoEstado,
            nroInforme: cambio.nroInforme || obs.nroInforme,
            nota: cambio.nota || '',
            respuestaEntidad: cambio.respuestaEntidad || '',
            fechaRespuesta: cambio.fechaRespuesta || '',
            analisisAuditor: cambio.analisisAuditor || '',
            planAccion: cambio.planAccion || '',
            fechaPlanAccion: cambio.fechaPlanAccion || '',
        };

        const updateData = mapToDB({
            estado: cambio.nuevoEstado,
            nroInforme: cambio.nroInforme || obs.nroInforme,
            nota: cambio.nota || obs.nota,
            fechaPlanAccion: cambio.fechaPlanAccion || obs.fechaPlanAccion,
            historialEstados: [...(obs.historialEstados || []), nuevoHistorial],
        });

        const { error } = await supabase.from('observaciones')
            .update(updateData)
            .eq('id', id);
        
        if (error) {
            console.error('Error updating state:', error);
        } else {
            await fetchData();
        }
    }, [observaciones, fetchData]);

    const editarObservacion = useCallback(async (id, data) => {
        const { error } = await supabase.from('observaciones')
            .update(mapToDB(data))
            .eq('id', id);
        if (error) {
            console.error('Error editing observation:', error);
        } else {
            await fetchData();
        }
    }, [fetchData]);

    const eliminarObservacion = useCallback(async (id) => {
        if (!window.confirm('¿Está seguro de eliminar esta observación? Esta acción no se puede deshacer.')) return;
        const { error } = await supabase.from('observaciones')
            .delete()
            .eq('id', id);
        if (error) console.error('Error deleting observation:', error);
        else await fetchData(); // Explicitly call fetchData after delete
    }, [fetchData]);

    // --- Correlativos Actions ---
    const agregarCorrelativo = useCallback(async (nuevo) => {
        const { data, error } = await supabase.from('correlativos').insert([nuevo]).select();
        if (error) console.error('Error adding correlativo:', error);
        return data ? data[0] : null;
    }, []);

    const editarCorrelativo = useCallback(async (id, data) => {
        const { error } = await supabase.from('correlativos').update(data).eq('id', id);
        if (error) console.error('Error editing correlativo:', error);
    }, []);

    const eliminarCorrelativo = useCallback(async (id) => {
        const { error } = await supabase.from('correlativos').delete().eq('id', id);
        if (error) console.error('Error deleting correlativo:', error);
    }, []);

    // --- Notas Actions ---
    const agregarNota = useCallback(async (nuevo) => {
        const { data, error } = await supabase.from('correlativos_notas').insert([nuevo]).select();
        if (error) console.error('Error adding nota:', error);
        return data ? data[0] : null;
    }, []);

    const editarNota = useCallback(async (id, data) => {
        const { error } = await supabase.from('correlativos_notas').update(data).eq('id', id);
        if (error) console.error('Error editing nota:', error);
    }, []);

    const eliminarNota = useCallback(async (id) => {
        const { error } = await supabase.from('correlativos_notas').delete().eq('id', id);
        if (error) console.error('Error deleting nota:', error);
    }, []);

    const getObservacion = useCallback((id) => {
        return observaciones.find(o => o.id === id) || null;
    }, [observaciones]);

    const filtrar = useCallback((filtros = {}) => {
        let resultado = [...observaciones];

        if (filtros.entidadIds && filtros.entidadIds.length > 0) {
            resultado = resultado.filter(o => filtros.entidadIds.includes(o.entidadId));
        }
        if (filtros.nivelRiesgo && filtros.nivelRiesgo.length > 0) {
            resultado = resultado.filter(o => filtros.nivelRiesgo.includes(o.nivelRiesgo));
        }
        if (filtros.estados && filtros.estados.length > 0) {
            resultado = resultado.filter(o => filtros.estados.includes(o.estado));
        }
        if (filtros.fechaInicio) {
            resultado = resultado.filter(o => {
                const date = o.fechaApertura || o.fechaInicio;
                return date && date >= filtros.fechaInicio;
            });
        }
        if (filtros.fechaFin) {
            resultado = resultado.filter(o => {
                const date = o.fechaApertura || o.fechaInicio;
                return date && date <= filtros.fechaFin;
            });
        }
        if (filtros.anio && !filtros.fechaInicio && !filtros.fechaFin) {
            resultado = resultado.filter(o => {
                const year = o.fechaApertura ? o.fechaApertura.substring(0, 4) : '';
                return year === String(filtros.anio);
            });
        }
        if (filtros.keyword) {
            const kw = filtros.keyword.toLowerCase();
            resultado = resultado.filter(o =>
                String(o.id).includes(kw) ||
                (o.titulo || '').toLowerCase().includes(kw) ||
                (o.descripcion || '').toLowerCase().includes(kw) ||
                (o.responsable || '').toLowerCase().includes(kw) ||
                (o.normativa || '').toLowerCase().includes(kw)
            );
        }

        return resultado.sort((a, b) => b.id - a.id);
    }, [observaciones]);

    const getEstadisticas = useCallback(() => {
        const total = observaciones.length;
        const porEstado = {};
        const porEntidad = {};
        const porRiesgo = {};

        observaciones.forEach(o => {
            porEstado[o.estado] = (porEstado[o.estado] || 0) + 1;
            porEntidad[o.entidadId] = porEntidad[o.entidadId] || { total: 0, subsanadas: 0 };
            porEntidad[o.entidadId].total++;
            if (o.estado === 'Subsanada') porEntidad[o.entidadId].subsanadas++;
            porRiesgo[o.nivelRiesgo] = (porRiesgo[o.nivelRiesgo] || 0) + 1;
        });

        const subsanadas = porEstado['Subsanada'] || 0;
        const cumplimientoGlobal = total > 0 ? Math.round((subsanadas / total) * 100) : 0;

        return { total, porEstado, porEntidad, porRiesgo, cumplimientoGlobal };
    }, [observaciones]);

    const exportData = useCallback(async () => {
        try {
            const [obsRes, corrRes, notasRes, entitiesRes, settingsRes] = await Promise.all([
                supabase.from('observaciones').select('*'),
                supabase.from('correlativos').select('*'),
                supabase.from('correlativos_notas').select('*'),
                supabase.from('entidades').select('*'),
                supabase.from('settings').select('*')
            ]);

            return {
                observaciones: obsRes.data || [],
                correlativos: corrRes.data || [],
                notas: notasRes.data || [],
                entidades: entitiesRes.data || [],
                settings: settingsRes.data || [],
                exportMetadata: {
                    date: new Date().toISOString(),
                    version: "Supabase-1.0",
                    source: "AuditFlow-Supabase"
                }
            };
        } catch (error) {
            console.error("Error exporting data:", error);
            return null;
        }
    }, []);

    const importData = useCallback(async (data) => {
        if (!data) return false;

        try {
            setLoading(true);

            // Detect format: Supabase export (has exportMetadata.source) vs localStorage backup (has auditflow_* keys)
            const isSupabaseExport = data.exportMetadata && data.exportMetadata.source === "AuditFlow-Supabase";
            // The localStorage script exports keys like: auditflow_correlativos_v1, auditflow_catalogos, etc.
            const hasLocalStorageKeys = !!data['auditflow_correlativos_v1'] || !!data['auditflow_observaciones_v1'] || !!data['auditflow_catalogos'];


            if (isSupabaseExport) {
                // Handle Supabase export format
                // 1. Entidades
                if (data.entidades && data.entidades.length > 0) {
                    await supabase.from('entidades').upsert(data.entidades);
                }

                // 2. Settings (Catalogos)
                if (data.settings && data.settings.length > 0) {
                    await supabase.from('settings').upsert(data.settings);
                }

                // 3. Correlativos and Notas
                if (data.correlativos && data.correlativos.length > 0) {
                    await supabase.from('correlativos').upsert(data.correlativos);
                }
                if (data.notas && data.notas.length > 0) {
                    await supabase.from('correlativos_notas').upsert(data.notas);
                }

                // 4. Observaciones
                if (data.observaciones && data.observaciones.length > 0) {
                    const toImport = data.observaciones.map(mapToDB); // Ensure DB format
                    const { error } = await supabase.from('observaciones').upsert(toImport);
                    if (error) throw error;
                }

            } else if (hasLocalStorageKeys) {
                // ─── Formato localStorage (auditflow_*) ──────────────────────
                const corrLS  = data['auditflow_correlativos_v1']  || [];
                const catLS   = data['auditflow_catalogos']         || null;
                const obsLS   = data['auditflow_observaciones_v1'] || [];

                // 1. Catálogos → entidades table + settings table
                if (catLS) {
                    const entidadesLS = catLS.entidades || [];
                    if (entidadesLS.length > 0) {
                        const entPayload = entidadesLS.map(e => ({
                            id: typeof e.id === 'number' ? e.id : undefined,
                            nombre: e.nombre,
                            tipo: e.tipo || 'General',
                            categoria: e.categoria || 'General',
                        })).filter(e => e.nombre);
                        const { error: entErr } = await supabase.from('entidades').upsert(entPayload, { onConflict: 'id', ignoreDuplicates: false });
                        if (entErr) console.warn('[Import] Entidades:', entErr.message);
                    }
                    const otherCats = Object.entries(catLS).filter(([k]) => k !== 'entidades');
                    if (otherCats.length > 0) {
                        const settingsPayload = otherCats.map(([key, value]) => ({ key, value }));
                        const { error: setErr } = await supabase.from('settings').upsert(settingsPayload, { onConflict: 'key' });
                        if (setErr) console.warn('[Import] Settings:', setErr.message);
                    }
                }

                // 2. Correlativos — strip string IDs (like "corr-123"), conflict on codigo
                if (corrLS.length > 0) {
                    const corrPayload = corrLS.map(c => ({
                        codigo: c.codigo,
                        numero: c.numero,
                        año: c.año,
                        fecha: c.fecha || null,
                        entidad: c.entidad || '',
                        asunto: c.asunto || '',
                        responsable: c.responsable || '',
                        normas: c.normas || [],
                        clasificacion: c.clasificacion || '',
                        industria: c.industria || '',
                        tipo_informe: c.tipoInforme || c.tipo_informe || '',
                        accion_supervision: c.accionSupervision || c.accion_supervision || '',
                        descripcion_accion: c.descripcionAccion || c.descripcion_accion || '',
                        tipo_correspondencia: c.tipoCorrespondencia || c.tipo_correspondencia || null,
                        cantidad_unidades: c.cantidadUnidades != null ? c.cantidadUnidades : (c.cantidad_unidades != null ? c.cantidad_unidades : 1),
                        blf_otro: c.blfOtro || c.blf_otro || '',
                        es_interno: c.esInterno || c.es_interno || false,
                        anulado: c.anulado || false,
                    }));
                    const { error: corrErr } = await supabase.from('correlativos').upsert(corrPayload, { onConflict: 'codigo', ignoreDuplicates: true });
                    if (corrErr) console.warn('[Import] Correlativos:', corrErr.message);
                }

                // 3. Observaciones — map to DB schema, insert fresh (no local IDs)
                if (obsLS.length > 0) {
                    const obsPayload = obsLS.map(o => ({
                        estado: o.estado || 'Pendiente',
                        titulo: o.titulo || '',
                        descripcion: o.descripcion || '',
                        normativa: o.normativa || '',
                        nota: o.nota || '',
                        responsable: o.responsable || '',
                        nivel_riesgo: o.nivelRiesgo || o.nivel_riesgo || '',
                        tipo_riesgo: o.tipoRiesgo || o.tipo_riesgo || '',
                        entidad_id: typeof (o.entidadId ?? o.entidad_id) === 'number' ? (o.entidadId ?? o.entidad_id) : null,
                        tipo_visita: o.tipoVisita || o.tipo_visita || '',
                        fecha_apertura: o.fechaApertura || o.fecha_apertura || null,
                        fecha_cierre: o.fechaCierre || o.fecha_cierre || null,
                        fecha_eval_inicio: o.fechaEvalInicio || o.fecha_eval_inicio || null,
                        fecha_eval_final: o.fechaEvalFinal || o.fecha_eval_final || null,
                        nro_informe: o.nroInforme || o.nro_informe || '',
                        fecha_plan_accion: o.fechaPlanAccion || o.fecha_plan_accion || null,
                        respuesta_entidad: o.respuestaEntidad || o.respuesta_entidad || '',
                        fecha_respuesta: o.fechaRespuesta || o.fecha_respuesta || null,
                        historial_estados: o.historialEstados || o.historial_estados || [],
                    }));
                    const { error: obsErr } = await supabase.from('observaciones').insert(obsPayload);
                    if (obsErr) console.warn('[Import] Observaciones:', obsErr.message);
                }

                console.log(`[Import] localStorage backup OK: ${corrLS.length} correlativos, ${obsLS.length} observaciones.`);
            } else {
                // Fallback: Supabase-style export without exportMetadata marker
                if (data.correlativos && data.correlativos.length > 0) {
                    await supabase.from('correlativos').upsert(data.correlativos);
                }
                if (data.entidades && data.entidades.length > 0) {
                    await supabase.from('entidades').upsert(data.entidades);
                }
                if (data.settings && data.settings.length > 0) {
                    await supabase.from('settings').upsert(data.settings);
                } else if (data.catalogos) {
                    const settingsToUpsert = Object.entries(data.catalogos).map(([key, value]) => ({ key, value }));
                    await supabase.from('settings').upsert(settingsToUpsert);
                }
                if (data.observaciones && data.observaciones.length > 0) {
                    const isDBFormat = data.observaciones[0].entidad_id !== undefined;
                    const toImport = isDBFormat ? data.observaciones : data.observaciones.map(mapToDB);
                    const { error } = await supabase.from('observaciones').upsert(toImport);
                    if (error) throw error;
                }
            }

            // Refresh local state
            await fetchData();
            return true;
        } catch (error) {
            console.error("Error importing data:", error);
            alert("Error al importar los datos: " + error.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchData]);

    return {
        observaciones,
        setObservaciones,
        catalogos,
        setCatalogos,
        correlativos,
        setCorrelativos,
        notas,
        setNotas,
        getEntidadById,
        crearAuditoria,
        cambiarEstado,
        getObservacion,
        filtrar,
        getEstadisticas,
        editarObservacion,
        eliminarObservacion,
        agregarCorrelativo,
        editarCorrelativo,
        eliminarCorrelativo,
        agregarNota,
        editarNota,
        eliminarNota,
        exportData,
        importData,
        loading
    };
}
