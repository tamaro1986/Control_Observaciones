import { useState, useCallback, useEffect } from 'react';
import { MOCK_OBSERVACIONES } from '../data/data';
const STORAGE_KEY = 'auditflow_observaciones_v1';
const COUNTER_KEY = 'auditflow_next_id_v1';

function loadFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error('Error loading data:', e);
    }
    return [];
}

function saveToStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

function loadNextId(observaciones) {
    try {
        const saved = localStorage.getItem(COUNTER_KEY);
        if (saved) return parseInt(saved, 10);
    } catch (e) { /* ignore */ }
    if (observaciones.length === 0) return 1000;
    return Math.max(...observaciones.map(o => o.id), 999) + 1;
}

function saveNextId(id) {
    try {
        localStorage.setItem(COUNTER_KEY, String(id));
    } catch (e) { /* ignore */ }
}

export default function useObservaciones() {
    const [observaciones, setObservaciones] = useState(() => loadFromStorage());
    const [nextId, setNextId] = useState(() => loadNextId(loadFromStorage()));

    useEffect(() => {
        saveToStorage(observaciones);
    }, [observaciones]);

    useEffect(() => {
        saveNextId(nextId);
    }, [nextId]);

    // Create a new audit with multiple observations
    const crearAuditoria = useCallback(({ entidadId, tipoVisita, fechaInicio, fechaFin, tarjetas }) => {
        const nuevas = tarjetas.map((t, idx) => {
            const id = nextId + idx;
            return {
                id,
                entidadId: parseInt(entidadId),
                tipoVisita,
                fechaInicio,
                fechaFin,
                titulo: t.titulo,
                descripcion: t.descripcion,
                nivelRiesgo: t.nivelRiesgo,
                tipoRiesgo: t.tipoRiesgo || 'Operacional',
                estado: t.estado || 'Pendiente',
                normativa: t.normativa || '',
                nroInforme: t.nroInforme || '',
                nota: t.nota || '',
                responsable: t.responsable || '',
                fechaPlanAccion: t.fechaPlanAccion || '',
                historialEstados: [
                    {
                        fecha: new Date().toISOString().split('T')[0],
                        estadoAnterior: null,
                        estadoNuevo: t.estado || 'Pendiente',
                        nroInforme: t.nroInforme || '',
                        nota: t.nota || '',
                        respuestaEntidad: '',
                        analisisAuditor: 'Hallazgo registrado.',
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

    // Update the state of an observation (unlimited modifications)
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

    // Get a single observation by id
    const getObservacion = useCallback((id) => {
        return observaciones.find(o => o.id === id) || null;
    }, [observaciones]);

    // Filter observations
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
            resultado = resultado.filter(o => o.fechaInicio && o.fechaInicio.startsWith(String(filtros.anio)));
        }
        if (filtros.fechaDesde) {
            resultado = resultado.filter(o => o.fechaInicio >= filtros.fechaDesde);
        }
        if (filtros.fechaHasta) {
            resultado = resultado.filter(o => o.fechaFin <= filtros.fechaHasta);
        }
        if (filtros.keyword) {
            const kw = filtros.keyword.toLowerCase();
            resultado = resultado.filter(o =>
                String(o.id).includes(kw) ||
                o.titulo.toLowerCase().includes(kw) ||
                o.descripcion.toLowerCase().includes(kw) ||
                o.responsable.toLowerCase().includes(kw) ||
                o.normativa.toLowerCase().includes(kw)
            );
        }

        return resultado;
    }, [observaciones]);

    // Get stats
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

    return {
        observaciones,
        crearAuditoria,
        cambiarEstado,
        getObservacion,
        filtrar,
        getEstadisticas,
    };
}
