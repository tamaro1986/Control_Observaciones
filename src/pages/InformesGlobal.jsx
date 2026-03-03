import { useState, useMemo } from 'react';
import { ENTIDADES } from '../data/data.js';
import Informes from './Informes';

const ENTIDAD_MAP = Object.fromEntries(ENTIDADES.map(e => [e.id, e.nombre]));

// ─── Palette ───────────────────────────────────────────────────────────────
const PALETTES = {
    riesgo: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
    estado: ['#6366f1', '#f59e0b', '#10b981', '#06b6d4', '#dc2626'],
    clasif: ['#8b5cf6', '#0ea5e9', '#f59e0b', '#10b981', '#f43f5e'],
    indust: ['#3b82f6', '#a78bfa', '#34d399', '#fbbf24', '#f87171'],
    tipo: ['#d97706', '#0284c7'],
    accion: ['#4f46e5', '#7c3aed'],
    visa: ['#059669', '#94a3b8'],
};

// ─── Utility ───────────────────────────────────────────────────────────────
function countBy(arr, key) {
    return arr.reduce((acc, item) => {
        const v = item[key] || 'Sin datos';
        acc[v] = (acc[v] || 0) + 1;
        return acc;
    }, {});
}

function toSorted(obj) {
    return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

// ─── Custom Charts ─────────────────────────────────────────────────────────

/** Donut SVG chart */
function DonutChart({ data, palette, size = 140, strokeW = 22 }) {
    const r = (size - strokeW) / 2;
    const circ = 2 * Math.PI * r;
    const total = data.reduce((s, d) => s + d.value, 0) || 1;

    let offset = 0;
    const slices = data.map((d, i) => {
        const len = (d.value / total) * circ;
        const dash = `${len} ${circ - len}`;
        const slice = { dasharray: dash, dashoffset: -offset, color: palette[i % palette.length] };
        offset += len;
        return slice;
    });

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                {/* track */}
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
                {slices.map((s, i) => (
                    <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
                        stroke={s.color} strokeWidth={strokeW - 2}
                        strokeDasharray={s.dasharray}
                        strokeDashoffset={s.dashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                    />
                ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900">{total}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
            </div>
        </div>
    );
}

/** Horizontal bar chart */
function BarChart({ data, palette, maxBars = 8 }) {
    const sliced = data.slice(0, maxBars);
    const max = Math.max(...sliced.map(d => d.value), 1);
    return (
        <div className="space-y-2.5">
            {sliced.map(([label, value], i) => {
                const pct = Math.round((value / max) * 100);
                const color = palette[i % palette.length];
                return (
                    <div key={label} className="flex items-center gap-3 group">
                        <span className="text-[10px] font-bold text-slate-500 truncate w-32 shrink-0 text-right">{label}</span>
                        <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: color, minWidth: 24 }}
                            >
                                <span className="text-[9px] font-black text-white drop-shadow">{value}</span>
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-slate-300 w-6 text-right">{pct}%</span>
                    </div>
                );
            })}
        </div>
    );
}

/** Legend pills */
function Legend({ data, palette }) {
    return (
        <div className="flex flex-wrap gap-2 mt-3">
            {data.map(([label, value], i) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-600">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: palette[i % palette.length] }} />
                    {label} <span className="font-black text-slate-800">{value}</span>
                </span>
            ))}
        </div>
    );
}

/** Section card wrapper */
function ChartCard({ title, subtitle, children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 ${className}`}>
            <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-0.5">{title}</p>
            {subtitle && <p className="text-[10px] text-slate-400 font-medium mb-4">{subtitle}</p>}
            {!subtitle && <div className="mb-4" />}
            {children}
        </div>
    );
}

/** KPI card */
function KPI({ label, value, icon, color = 'bg-slate-900', sub }) {
    return (
        <div className={`${color} rounded-2xl p-4 flex items-center gap-3 shadow-lg`}>
            <span className="text-3xl">{icon}</span>
            <div>
                <p className="text-2xl font-black text-white leading-none">{value}</p>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-0.5">{label}</p>
                {sub && <p className="text-[10px] font-black text-white/50 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

/** Table ranking */
function RankTable({ rows, headers }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="bg-slate-50">
                        {headers.map(h => (
                            <th key={h} className="py-2 px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className="py-2 px-3 text-[10px] font-medium text-slate-600">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Tab: Resumen General ─────────────────────────────────────────────────
function TabResumen({ observaciones, correlativos, notas }) {
    const añoActual = new Date().getFullYear();

    const kpis = [
        { label: 'Observaciones / Hallazgos', value: observaciones.length, icon: '🔍', color: 'bg-indigo-600', sub: `${observaciones.filter(o => o.año === añoActual || (o.fechaInicio || '').startsWith(String(añoActual))).length} este año` },
        { label: 'Correlativos de Informes', value: correlativos.length, icon: '📄', color: 'bg-slate-800', sub: `${correlativos.filter(c => c.año === añoActual).length} en ${añoActual}` },
        { label: 'Correspondencia Enviada', value: notas.length, icon: '📬', color: 'bg-amber-600', sub: `${notas.filter(n => n.año === añoActual).length} en ${añoActual}` },
        { label: 'Total de Registros', value: observaciones.length + correlativos.length + notas.length, icon: '📊', color: 'bg-emerald-600' },
    ];

    // Activity by month (last 12m) across all modules
    const now = new Date();
    const meses = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return {
            label: d.toLocaleDateString('es-SV', { month: 'short', year: '2-digit' }),
            year: d.getFullYear(), month: d.getMonth() + 1,
        };
    });

    function countInMonth(arr, dateField, year, month) {
        return arr.filter(x => {
            const d = new Date((x[dateField] || '') + 'T00:00:00');
            return d.getFullYear() === year && d.getMonth() + 1 === month;
        }).length;
    }

    const activityData = meses.map(m => ({
        label: m.label,
        obs: countInMonth(observaciones, 'fechaInicio', m.year, m.month),
        corr: countInMonth(correlativos, 'fecha', m.year, m.month),
        notas: countInMonth(notas, 'fecha', m.year, m.month),
    }));
    const maxAct = Math.max(...activityData.map(d => d.obs + d.corr + d.notas), 1);

    // Industria distribution combined
    const industCombined = {};
    [...correlativos, ...notas].forEach(x => {
        const v = x.industria || 'Sin datos';
        industCombined[v] = (industCombined[v] || 0) + 1;
    });
    const industSorted = toSorted(industCombined);

    // Responsable activity
    const respMap = {};
    [...observaciones.map(o => ({ responsable: o.responsable })), ...correlativos, ...notas].forEach(x => {
        if (x.responsable) respMap[x.responsable] = (respMap[x.responsable] || 0) + 1;
    });
    const respSorted = toSorted(respMap).slice(0, 6);

    return (
        <div className="space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(k => <KPI key={k.label} {...k} />)}
            </div>

            {/* Activity timeline + Industria donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Grouped bar chart — 6-month activity */}
                <ChartCard title="Actividad últimos 6 meses" subtitle="Registros por módulo por mes" className="lg:col-span-2">
                    <div className="flex items-end gap-3 h-36">
                        {activityData.map(d => {
                            const total = d.obs + d.corr + d.notas;
                            const pctObs = (d.obs / maxAct) * 100;
                            const pctCorr = (d.corr / maxAct) * 100;
                            const pctNota = (d.notas / maxAct) * 100;
                            return (
                                <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-[9px] font-black text-slate-400">{total || ''}</span>
                                    <div className="w-full flex gap-0.5 items-end h-24">
                                        {[
                                            { pct: pctObs, color: '#6366f1' },
                                            { pct: pctCorr, color: '#1e293b' },
                                            { pct: pctNota, color: '#d97706' },
                                        ].map((b, bi) => (
                                            <div key={bi} className="flex-1 rounded-t-sm transition-all duration-500"
                                                style={{ height: `${b.pct}%`, backgroundColor: b.color, minHeight: b.pct > 0 ? 4 : 0 }} />
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{d.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-4 mt-3">
                        {[['Observaciones', '#6366f1'], ['Correlativos', '#1e293b'], ['Correspondencia', '#d97706']].map(([l, c]) => (
                            <span key={l} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />{l}
                            </span>
                        ))}
                    </div>
                </ChartCard>

                {/* Industria donut */}
                <ChartCard title="Distribución por Industria" subtitle="Correlativos + Correspondencia">
                    <div className="flex flex-col items-center gap-3">
                        <DonutChart data={industSorted.map(([l, v]) => ({ label: l, value: v }))} palette={PALETTES.indust} />
                        <Legend data={industSorted} palette={PALETTES.indust} />
                    </div>
                </ChartCard>
            </div>

            {/* Responsable ranking */}
            <ChartCard title="Ranking de Actividad por Responsable" subtitle="Total de registros en los tres módulos">
                <BarChart data={respSorted} palette={PALETTES.clasif} />
            </ChartCard>
        </div>
    );
}

// ─── Tab: Observaciones ───────────────────────────────────────────────────
function TabObservaciones({ observaciones }) {
    if (observaciones.length === 0) {
        return <div className="py-20 text-center text-sm text-slate-400 font-medium">Sin datos de observaciones disponibles</div>;
    }
    const nivelData = toSorted(countBy(observaciones, 'nivelRiesgo'));
    const estadoData = toSorted(countBy(observaciones, 'estado'));
    const tipoData = toSorted(countBy(observaciones, 'tipoRiesgo'));
    // Map entidadId → nombre for entity breakdown
    const entidadMap2 = {};
    observaciones.forEach(o => {
        const nombre = ENTIDAD_MAP[o.entidadId] || o.entidad || 'Sin datos';
        entidadMap2[nombre] = (entidadMap2[nombre] || 0) + 1;
    });
    const entidadData = toSorted(entidadMap2);
    const responsableData = toSorted(countBy(observaciones, 'responsable'));

    const pendientes = observaciones.filter(o => o.estado === 'Pendiente').length;
    const criticas = observaciones.filter(o => o.nivelRiesgo === 'Crítico').length;
    const vencidas = observaciones.filter(o => o.estado === 'Vencida').length;
    const subsanadas = observaciones.filter(o => o.estado === 'Subsanada').length;

    const RISK_PALETTE = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const ESTADO_PALETTE = ['#6366f1', '#f59e0b', '#10b981', '#06b6d4', '#dc2626'];

    return (
        <div className="space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI label="Total Hallazgos" value={observaciones.length} icon="🔍" color="bg-indigo-600" />
                <KPI label="Críticos" value={criticas} icon="🚨" color="bg-red-600" />
                <KPI label="Pendientes" value={pendientes} icon="⏳" color="bg-amber-600" />
                <KPI label="Subsanadas" value={subsanadas} icon="✅" color="bg-emerald-600" sub={`${vencidas} vencidas`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Nivel Riesgo donut */}
                <ChartCard title="Por Nivel de Riesgo" subtitle="Distribución de hallazgos activos">
                    <div className="flex flex-col items-center gap-3">
                        <DonutChart data={nivelData.map(([l, v]) => ({ label: l, value: v }))} palette={RISK_PALETTE} />
                        <Legend data={nivelData} palette={RISK_PALETTE} />
                    </div>
                </ChartCard>

                {/* Estado donut */}
                <ChartCard title="Por Estado" subtitle="Ciclo de vida de los hallazgos">
                    <div className="flex flex-col items-center gap-3">
                        <DonutChart data={estadoData.map(([l, v]) => ({ label: l, value: v }))} palette={ESTADO_PALETTE} />
                        <Legend data={estadoData} palette={ESTADO_PALETTE} />
                    </div>
                </ChartCard>

                {/* Tipo Riesgo bar */}
                <ChartCard title="Por Tipo de Riesgo" subtitle="Frecuencia de categoría de riesgo">
                    <BarChart data={tipoData} palette={PALETTES.clasif} />
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Responsable bar */}
                <ChartCard title="Carga por Responsable" subtitle="Hallazgos asignados">
                    <BarChart data={responsableData} palette={PALETTES.indust} />
                </ChartCard>

                {/* Top observaciones críticas */}
                <ChartCard title="Hallazgos Críticos / Vencidos" subtitle="Requieren atención inmediata">
                    <RankTable
                        headers={['Nivel', 'Estado', 'Normativa', 'Responsable']}
                        rows={observaciones
                            .filter(o => o.nivelRiesgo === 'Crítico' || o.estado === 'Vencida')
                            .slice(0, 8)
                            .map(o => [
                                <span key="n" className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black ${o.nivelRiesgo === 'Crítico' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{o.nivelRiesgo}</span>,
                                <span key="e" className="text-[10px] font-bold">{o.estado}</span>,
                                <span key="nr" className="text-[10px] text-slate-500">{o.normativa || '—'}</span>,
                                <span key="r" className="text-[10px]">{(o.responsable || '').split(' ').slice(0, 2).join(' ')}</span>,
                            ])
                        }
                    />
                </ChartCard>
            </div>
        </div>
    );
}

// ─── Tab: Correlativos Informes ───────────────────────────────────────────
function TabCorrelativos({ correlativos }) {
    const añoActual = new Date().getFullYear();
    const clasifData = toSorted(countBy(correlativos, 'clasificacion'));
    const industData = toSorted(countBy(correlativos, 'industria'));
    const accionData = toSorted(countBy(correlativos, 'accionSupervision'));
    const normaData = toSorted(countBy(correlativos, 'codigoNorma'));
    const respData = toSorted(countBy(correlativos, 'responsable'));
    const añoData = toSorted(countBy(correlativos, 'año'));

    const inSitu = correlativos.filter(c => c.accionSupervision === 'In Situ').length;
    const extraSitio = correlativos.filter(c => c.accionSupervision === 'Extra Sitio').length;
    const esteAño = correlativos.filter(c => c.año === añoActual).length;
    const totalUds = correlativos.reduce((a, c) => a + (Number(c.cantidadUnidades) || 1), 0);

    return (
        <div className="space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI label="Total Correlativos" value={correlativos.length} icon="📄" color="bg-slate-800" />
                <KPI label={`Emitidos ${añoActual}`} value={esteAño} icon="📅" color="bg-indigo-600" />
                <KPI label="In Situ" value={inSitu} icon="🏢" color="bg-blue-600" />
                <KPI label="Extra Sitio" value={extraSitio} icon="🖥️" color="bg-violet-600" sub={`${totalUds} unidades totales`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Clasificación donut */}
                <ChartCard title="Por Clasificación" subtitle="Categoría temática del informe">
                    <div className="flex flex-col items-center gap-3">
                        <DonutChart data={clasifData.map(([l, v]) => ({ label: l, value: v }))} palette={PALETTES.clasif} />
                        <Legend data={clasifData} palette={PALETTES.clasif} />
                    </div>
                </ChartCard>

                {/* Industria donut */}
                <ChartCard title="Por Industria" subtitle="Sector supervisado">
                    <div className="flex flex-col items-center gap-3">
                        <DonutChart data={industData.map(([l, v]) => ({ label: l, value: v }))} palette={PALETTES.indust} />
                        <Legend data={industData} palette={PALETTES.indust} />
                    </div>
                </ChartCard>

                {/* Acción + Año */}
                <div className="space-y-4">
                    <ChartCard title="Por Acción de Supervisión" subtitle="">
                        <BarChart data={accionData} palette={PALETTES.accion} />
                    </ChartCard>
                    <ChartCard title="Por Año" subtitle="">
                        <BarChart data={añoData.sort((a, b) => b[0] - a[0])} palette={PALETTES.indust} maxBars={5} />
                    </ChartCard>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Normas más Referenciadas" subtitle="Código de norma por frecuencia de uso">
                    <BarChart data={normaData} palette={PALETTES.clasif} maxBars={8} />
                </ChartCard>
                <ChartCard title="Producción por Responsable" subtitle="Correlativos emitidos por analista">
                    <BarChart data={respData} palette={PALETTES.indust} maxBars={8} />
                </ChartCard>
            </div>
        </div>
    );
}

// ─── Tab: Correspondencia ─────────────────────────────────────────────────
function TabNotas({ notas }) {
    const añoActual = new Date().getFullYear();
    const tipoData = toSorted(countBy(notas, 'tipoCorrespondencia'));
    const clasifData = toSorted(countBy(notas, 'clasificacion'));
    const industData = toSorted(countBy(notas, 'industria'));
    const visaData = toSorted(countBy(notas, 'visasInforme'));
    const accionData = toSorted(countBy(notas, 'accionSupervision'));
    const respData = toSorted(countBy(notas, 'responsable'));
    const normaData = toSorted(countBy(notas, 'codigoNorma'));

    const cartas = notas.filter(n => n.tipoCorrespondencia === 'Carta').length;
    const memos = notas.filter(n => n.tipoCorrespondencia === 'Memo').length;
    const conVisa = notas.filter(n => n.visasInforme === 'SI').length;
    const esteAño = notas.filter(n => n.año === añoActual).length;
    const totalJuntas = notas.reduce((a, n) => a + (n.juntas?.length || 0), 0);

    return (
        <div className="space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI label="Total Correspondencia" value={notas.length} icon="📬" color="bg-amber-600" />
                <KPI label="Cartas" value={cartas} icon="✉️" color="bg-amber-700" sub={`${memos} memos`} />
                <KPI label="Con Visa Informe" value={conVisa} icon="✅" color="bg-emerald-600" />
                <KPI label={`Emitidas ${añoActual}`} value={esteAño} icon="📅" color="bg-slate-800" sub={totalJuntas > 0 ? `${totalJuntas} juntas registradas` : undefined} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Tipo Carta/Memo donut */}
                <ChartCard title="Carta vs. Memo" subtitle="Tipo de correspondencia enviada">
                    <div className="flex flex-col items-center gap-3">
                        <DonutChart data={tipoData.map(([l, v]) => ({ label: l, value: v }))} palette={PALETTES.tipo} />
                        <Legend data={tipoData} palette={PALETTES.tipo} />
                    </div>
                </ChartCard>

                {/* Clasificación donut */}
                <ChartCard title="Por Clasificación" subtitle="Categoría temática de la carta/memo">
                    <div className="flex flex-col items-center gap-3">
                        <DonutChart data={clasifData.map(([l, v]) => ({ label: l, value: v }))} palette={PALETTES.clasif} />
                        <Legend data={clasifData} palette={PALETTES.clasif} />
                    </div>
                </ChartCard>

                {/* Visa + Acción */}
                <div className="space-y-4">
                    <ChartCard title="Visas de Informe" subtitle="">
                        <BarChart data={visaData} palette={PALETTES.visa} />
                    </ChartCard>
                    <ChartCard title="Acción de Supervisión" subtitle="">
                        <BarChart data={accionData} palette={PALETTES.accion} />
                    </ChartCard>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ChartCard title="Por Industria" subtitle="">
                    <BarChart data={industData} palette={PALETTES.indust} />
                </ChartCard>
                <ChartCard title="Normas Referenciadas" subtitle="">
                    <BarChart data={normaData} palette={PALETTES.clasif} maxBars={6} />
                </ChartCard>
                <ChartCard title="Producción por Responsable" subtitle="">
                    <BarChart data={respData} palette={PALETTES.indust} maxBars={6} />
                </ChartCard>
            </div>

            {/* Gobierno Corporativo juntas table */}
            {totalJuntas > 0 && (
                <ChartCard title="🏛️ Registro de Juntas — Gobierno Corporativo" subtitle={`${totalJuntas} asistencias a junta registradas`}>
                    <RankTable
                        headers={['Código', 'Industria', 'Fecha', 'Hora', 'Entidad', 'Responsable', 'Tipo / Nombre de Junta']}
                        rows={notas.flatMap(n => (n.juntas || []).map(j => [
                            <span key="c" className="font-black text-amber-700 text-[9px]">{n.codigo}</span>,
                            j.industria || '—',
                            j.fechaCelebracion || '—',
                            j.hora || '—',
                            <span key="e" className="font-bold">{j.entidad}</span>,
                            (j.responsable || '').split(' ').slice(0, 2).join(' ') || '—',
                            <span key="t" className="font-bold text-amber-700">{j.tipoJunta}</span>,
                        ]))}
                    />
                </ChartCard>
            )}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────
const TABS = [
    { id: 'resumen', label: 'Resumen General', icon: '📊' },
    { id: 'observaciones', label: 'Observaciones', icon: '🔍' },
    { id: 'correlativos', label: 'Correlativos Informes', icon: '📄' },
    { id: 'notas', label: 'Correspondencia', icon: '📬' },
    { id: 'generador', label: 'Generador de Informes', icon: '📑' },
];

export default function InformesGlobal({ observaciones = [], correlativos = [], notas = [], filtrar, getEstadisticas, onSelectObservacion, catalogos }) {
    const [activeTab, setActiveTab] = useState('resumen');

    return (
        <div className="max-w-[1800px] mx-auto space-y-5 animate-fade-in">

            {/* ── Page header ── */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Informes y Analítica — DSFIT</h2>
                    <p className="text-xs font-medium text-slate-400">Estadísticas consolidadas de los tres módulos del sistema de control</p>
                </div>
                <div className="ml-auto hidden lg:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Datos en tiempo real
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer flex-1 justify-center
                            ${activeTab === tab.id
                                ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <span className="text-base">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab content ── */}
            {activeTab === 'resumen' && <TabResumen observaciones={observaciones} correlativos={correlativos} notas={notas} />}
            {activeTab === 'observaciones' && <TabObservaciones observaciones={observaciones} />}
            {activeTab === 'correlativos' && <TabCorrelativos correlativos={correlativos} />}
            {activeTab === 'notas' && <TabNotas notas={notas} />}
            {activeTab === 'generador' && (
                <div className="pt-2">
                    <Informes
                        observaciones={observaciones}
                        filtrar={filtrar}
                        getEstadisticas={getEstadisticas}
                        onSelectObservacion={onSelectObservacion}
                        catalogos={catalogos}
                    />
                </div>
            )}
        </div>
    );
}
