// ===== AuditFlow — Helper / Utility Functions =====

import { ENTIDADES } from './constants';

export function getEntidadById(id) {
    return ENTIDADES.find(e => e.id === id);
}

export function getRiesgoStyle(nivel) {
    const map = {
        'Crítico': { bg: 'bg-risk-critico-bg', text: 'text-risk-critico', border: 'border-risk-critico' },
        'Alto': { bg: 'bg-risk-alto-bg', text: 'text-risk-alto', border: 'border-risk-alto' },
        'Medio': { bg: 'bg-risk-medio-bg', text: 'text-risk-medio', border: 'border-risk-medio' },
        'Bajo': { bg: 'bg-risk-bajo-bg', text: 'text-risk-bajo', border: 'border-risk-bajo' },
    };
    return map[nivel] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };
}

export function getEstadoStyle(estado) {
    const estadoLower = String(estado || '').toLowerCase();
    
    // Explicit mappings for common/new statuses
    const map = {
        'pendiente': { bg: 'bg-estado-pendiente-bg', text: 'text-estado-pendiente', dot: 'bg-estado-pendiente' },
        'en curso': { bg: 'bg-estado-encurso-bg', text: 'text-estado-encurso', dot: 'bg-estado-encurso' },
        'subsanada': { bg: 'bg-estado-subsanada-bg', text: 'text-estado-subsanada', dot: 'bg-estado-subsanada' },
        'parcialmente subsanada': { bg: 'bg-estado-parcial-bg', text: 'text-estado-parcial', dot: 'bg-estado-parcial' },
        'vencida': { bg: 'bg-estado-vencida-bg', text: 'text-estado-vencida', dot: 'bg-estado-vencida' },
        'no subsanada': { bg: 'bg-rose-100', text: 'text-rose-600', dot: 'bg-rose-500' }
    };
    
    if (map[estadoLower]) return map[estadoLower];
    
    // Generic colorful fallback for dynamic catalog keys
    const colors = [
        { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
        { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', dot: 'bg-fuchsia-500' },
        { bg: 'bg-teal-50', text: 'text-teal-600', dot: 'bg-teal-500' },
        { bg: 'bg-sky-50', text: 'text-sky-600', dot: 'bg-sky-500' },
    ];
    let hash = 0;
    for (let i = 0; i < estadoLower.length; i++) hash = estadoLower.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export function getInitials(name) {
    const text = typeof name === 'object' && name !== null ? (name.nombre || name.codigo || '') : String(name || '');
    return text.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '';
}

export function getAvatarColor(name) {
    const text = typeof name === 'object' && name !== null ? (name.nombre || name.codigo || '') : String(name || '');
    if (!text) return 'bg-gray-400';
    const colors = [
        'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
        'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/**
 * Devuelve el siguiente código correlativo para el año dado.
 * El contador se reinicia cada año: DSFIT-001/AAAA
 * @param {Array} correlativos - lista actual de correlativos
 * @param {number} [año] - año objetivo (default: año actual)
 * @returns {string} código formateado
 */
export function getNextCorrelativo(correlativos, año = new Date().getFullYear()) {
    const targetYear = Number(año);
    const delAño = (correlativos || []).filter(c => Number(c.año) === targetYear);

    const numeros = delAño.map(c => Number(c.numero)).filter(num => !isNaN(num));
    const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;

    return {
        codigo: `DSFIT-${String(siguiente).padStart(3, '0')}/${targetYear}`,
        numero: siguiente,
        año: targetYear,
    };
}

/**
 * Genera el siguiente código SAV-DSFIT-MNNN para el año dado.
 * El contador reinicia cada año.
 */
export function getNextCorrelativoNota(notas, año = new Date().getFullYear()) {
    const targetYear = Number(año);
    const delAño = (notas || []).filter(n =>
        Number(n.año) === targetYear &&
        (n.codigo || '').startsWith('SAV-DSFIT-M')
    );

    const numeros = delAño.map(n => Number(n.numero)).filter(num => !isNaN(num));
    const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;

    return {
        codigo: `SAV-DSFIT-M${String(siguiente).padStart(3, '0')}`,
        numero: siguiente,
        año: targetYear,
    };
}
