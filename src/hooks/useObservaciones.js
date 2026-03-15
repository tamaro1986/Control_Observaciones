import { useState, useCallback, useEffect } from 'react';
import { 
    MOCK_OBSERVACIONES, MOCK_CORRELATIVOS, MOCK_CORRELATIVOS_NOTAS,
    CLASIFICACIONES_CORR, INDUSTRIAS_CORR, TIPOS_INFORME_CORR,
    ACCIONES_SUPERVISION, NORMAS_CORR, RESPONSABLES, ENTIDADES,
    TIPOS_CORRESPONDENCIA, NORMAS_NOTAS_EXTRA,
    NIVELES_RIESGO, ESTADOS, TIPOS_RIESGO, TIPOS_VISITA
} from '../data/data';

const STORAGE_KEY = 'auditflow_observaciones_v1';
const CATALOGOS_KEY = 'auditflow_catalogos';
const CORRELATIVOS_KEY = 'auditflow_correlativos_v1';
const NOTAS_KEY = 'auditflow_notas_v1';
const COUNTER_KEY = 'auditflow_next_id_v1';

function loadFromStorage(key, defaultValue) {
    try {
        const saved = localStorage.getItem(key);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed;
        }
    } catch (e) {
        console.error('Error loading data:', e);
    }
    return defaultValue;
}

export default function useObservaciones() {
    // 1. Observations State
    const [observaciones, setObservaciones] = useState(() => {
        const data = loadFromStorage(STORAGE_KEY, MOCK_OBSERVACIONES);
        return Array.isArray(data) ? data : MOCK_OBSERVACIONES;
    });

    // 2. Catalogos State
    const [catalogos, setCatalogos] = useState(() => {
        const defaultCats = {
            clasificaciones: CLASIFICACIONES_CORR,
            industrias: INDUSTRIAS_CORR,
            tiposInforme: TIPOS_INFORME_CORR,
            accionesSupervision: ACCIONES_SUPERVISION,
            normas: NORMAS_CORR,
            responsables: RESPONSABLES,
            entidades: ENTIDADES,
            tiposCorrespondencia: TIPOS_CORRESPONDENCIA,
            normasExtra: NORMAS_NOTAS_EXTRA,
            nivelesRiesgo: NIVELES_RIESGO,
            estados: ESTADOS,
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
        };
        return loadFromStorage(CATALOGOS_KEY, defaultCats);
    });

    // 3. Correlativos & Notas State
    const [correlativos, setCorrelativos] = useState(() => loadFromStorage(CORRELATIVOS_KEY, MOCK_CORRELATIVOS));
    const [notas, setNotas] = useState(() => loadFromStorage(NOTAS_KEY, MOCK_CORRELATIVOS_NOTAS));

    // 4. ID Control
    const [nextId, setNextId] = useState(() => {
        const saved = localStorage.getItem(COUNTER_KEY);
        if (saved) return parseInt(saved, 10);
        return observaciones.length === 0 ? 1000 : Math.max(...observaciones.map(o => o.id), 999) + 1;
    });

    // Persistence Effects
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(observaciones)); }, [observaciones]);
    useEffect(() => { localStorage.setItem(CATALOGOS_KEY, JSON.stringify(catalogos)); }, [catalogos]);
    useEffect(() => { localStorage.setItem(CORRELATIVOS_KEY, JSON.stringify(correlativos)); }, [correlativos]);
    useEffect(() => { localStorage.setItem(NOTAS_KEY, JSON.stringify(notas)); }, [notas]);
    useEffect(() => { localStorage.setItem(COUNTER_KEY, String(nextId)); }, [nextId]);

    // Helpers
    const getEntidadById = useCallback((id) => {
        return catalogos.entidades.find(e => String(e.id) === String(id)) || null;
    }, [catalogos.entidades]);

    // --- Actions ---

    const crearAuditoria = useCallback(({
        entidadId,
        tipoVisita,
        fechaApertura,
        fechaCierre,
        fechaEvalInicio,
        fechaEvalFinal,
        nroInforme,
        tarjetas
    }) => {
        const nuevas = tarjetas.map((t, idx) => {
            const id = nextId + idx;
            return {
                id,
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
            };
        });

        setObservaciones(prev => [...prev, ...nuevas]);
        setNextId(prev => prev + tarjetas.length);
        return nuevas.map(n => n.id);
    }, [nextId]);

    const cambiarEstado = useCallback((id, cambio) => {
        setObservaciones(prev =>
            prev.map(obs => {
                if (obs.id !== id) return obs;
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
                return {
                    ...obs,
                    estado: cambio.nuevoEstado,
                    nroInforme: cambio.nroInforme || obs.nroInforme,
                    nota: cambio.nota || obs.nota,
                    fechaPlanAccion: cambio.fechaPlanAccion || obs.fechaPlanAccion,
                    historialEstados: [...obs.historialEstados, nuevoHistorial],
                };
            })
        );
    }, []);

    const editarObservacion = useCallback((id, data) => {
        setObservaciones(prev => prev.map(obs => {
            if (obs.id !== id) return obs;
            return { ...obs, ...data };
        }));
    }, []);

    const eliminarObservacion = useCallback((id) => {
        if (!window.confirm('¿Está seguro de eliminar esta observación? Esta acción no se puede deshacer.')) return;
        setObservaciones(prev => prev.filter(obs => obs.id !== id));
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
        if (filtros.anio) {
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

    // --- Data Management (Export/Import) ---
    const exportData = useCallback(() => {
        try {
            const data = {
                observaciones,
                nextId,
                correlativos,
                notas,
                catalogos,
                fechaRespaldo: new Date().toISOString(),
                version: "1.1"
            };
            return data;
        } catch (e) {
            console.error("Error exporting data:", e);
            return null;
        }
    }, [observaciones, nextId, correlativos, notas, catalogos]);

    const importData = useCallback((data) => {
        try {
            if (!data.observaciones || !data.catalogos) {
                throw new Error("Formato de archivo no válido");
            }

            setObservaciones(data.observaciones);
            setNextId(data.nextId || 1000);
            setCorrelativos(data.correlativos || []);
            setNotas(data.notas || []);
            setCatalogos(data.catalogos);
            
            return true;
        } catch (e) {
            console.error("Error importing data:", e);
            return false;
        }
    }, []);

    return {
        observaciones: [...observaciones],
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
        exportData,
        importData,
    };
}
