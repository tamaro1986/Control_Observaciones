import React, { useState, useMemo, useEffect } from 'react';
import { ENTIDADES } from '../data/data.js';
import Informes from './Informes';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
    Legend as RechartsLegend, AreaChart, Area
} from 'recharts';
import {
    Calendar, Users, FileText, Activity, Shield,
    TrendingUp, Filter, CheckCircle, AlertCircle,
    Download, Briefcase, Globe, Award
} from 'lucide-react';

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

function countByMulti(arr, key, fallbackKey) {
    return arr.reduce((acc, item) => {
        let vals = item[key];

        // Handle fallback if main key is empty and fallback is provided
        if ((!vals || vals.length === 0) && fallbackKey) {
            vals = item[fallbackKey];
        }

        // Convert single value to array if needed
        if (vals && !Array.isArray(vals)) {
            vals = [vals];
        }

        if (!vals || vals.length === 0) {
            acc['N/A'] = (acc['N/A'] || 0) + 1;
        } else {
            vals.forEach(v => {
                const label = typeof v === 'object' ? (v.codigo || v.nombre) : v;
                acc[label] = (acc[label] || 0) + 1;
            });
        }
        return acc;
    }, {});
}

function toSorted(obj) {
    return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function toChartData(obj) {
    return Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));
}

// ─── Time Filtering Logic ───────────────────────────────────────────────
const filterByPeriod = (data, dateField, period, specificValue) => {
    if (period === 'all') return data;

    return data.filter(item => {
        const dateStr = item[dateField];
        if (!dateStr) return false;
        const d = new Date(dateStr + 'T00:00:00');
        const year = d.getFullYear();
        const month = d.getMonth(); // 0-indexed

        if (period === 'month') {
            return month === parseInt(specificValue.month) && year === parseInt(specificValue.year);
        }
        if (period === 'quarter') {
            const q = Math.floor(month / 3) + 1;
            return q === parseInt(specificValue.quarter) && year === parseInt(specificValue.year);
        }
        if (period === 'semester') {
            const s = Math.floor(month / 6) + 1;
            return s === parseInt(specificValue.semester) && year === parseInt(specificValue.year);
        }
        if (period === 'annual') {
            return year === parseInt(specificValue.year);
        }
        return true;
    });
};

// ─── Custom UI Components ─────────────────────────────────────────

function ChartCard({ title, subtitle, children, className = '', height = 300 }) {
    return (
        <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 ${className} flex flex-col`}>
            <div className="mb-6">
                <p className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-1">{title}</p>
                {subtitle && <p className="text-[10px] text-slate-400 font-semibold tracking-wide">{subtitle}</p>}
            </div>
            <div style={{ height: `${height}px`, minHeight: `${height}px` }} className="flex-1 w-full relative overflow-hidden">
                {children}
            </div>
        </div>
    );
}

function KPI({ label, value, icon: Icon, colorClass, subText }) {
    return (
        <div className={`relative overflow-hidden rounded-[2rem] p-6 shadow-2xl transition-all hover:scale-[1.02] ${colorClass}`}>
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-3xl font-black text-white tracking-tighter mb-1">{value}</p>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{label}</p>
                    {subText && <p className="text-[9px] font-black text-white/40 mt-1 uppercase tracking-tighter">{subText}</p>}
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10">
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </div>
    );
}

function PeriodFilters({ period, setPeriod, values, setValues, availableYears }) {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mr-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros de Tiempo</span>
            </div>

            <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer bg-slate-50"
            >
                <option value="all">Todo el tiempo</option>
                <option value="month">Mensual</option>
                <option value="quarter">Trimestral</option>
                <option value="semester">Semestral</option>
                <option value="annual">Anual</option>
            </select>

            {period !== 'all' && (
                <select
                    value={values.year}
                    onChange={(e) => setValues({ ...values, year: e.target.value })}
                    className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer bg-slate-50"
                >
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            )}

            {period === 'month' && (
                <select
                    value={values.month}
                    onChange={(e) => setValues({ ...values, month: e.target.value })}
                    className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer bg-slate-50"
                >
                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
            )}

            {period === 'quarter' && (
                <select
                    value={values.quarter}
                    onChange={(e) => setValues({ ...values, quarter: e.target.value })}
                    className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer bg-slate-50"
                >
                    <option value="1">1er Trimestre</option>
                    <option value="2">2do Trimestre</option>
                    <option value="3">3er Trimestre</option>
                    <option value="4">4to Trimestre</option>
                </select>
            )}

            {period === 'semester' && (
                <select
                    value={values.semester}
                    onChange={(e) => setValues({ ...values, semester: e.target.value })}
                    className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer bg-slate-50"
                >
                    <option value="1">1er Semestre</option>
                    <option value="2">2do Semestre</option>
                </select>
            )}
        </div>
    );
}

// ─── Tab Components ───────────────────────────────────────────────────────

function TabResumen({ observaciones, correlativos, notas, period, values, years }) {
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const obsFiltered = useMemo(() => filterByPeriod(observaciones, 'fechaInicio', period, values), [observaciones, period, values]);
    const corrFiltered = useMemo(() => filterByPeriod(correlativos, 'fecha', period, values), [correlativos, period, values]);
    const notasFiltered = useMemo(() => filterByPeriod(notas, 'fecha', period, values), [notas, period, values]);

    const total = obsFiltered.length + corrFiltered.length + notasFiltered.length;

    const barData = useMemo(() => [
        { name: 'Observaciones', value: obsFiltered.length },
        { name: 'Informes', value: corrFiltered.length },
        { name: 'Notas', value: notasFiltered.length },
    ], [obsFiltered, corrFiltered, notasFiltered]);

    const pieData = useMemo(() => toChartData({
        Observaciones: obsFiltered.length,
        Informes: corrFiltered.length,
        Notas: notasFiltered.length
    }), [obsFiltered, corrFiltered, notasFiltered]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI label="Observaciones" value={obsFiltered.length} icon={AlertCircle} colorClass="bg-indigo-600" />
                <KPI label="Informes" value={corrFiltered.length} icon={FileText} colorClass="bg-slate-900" />
                <KPI label="Notas" value={notasFiltered.length} icon={Download} colorClass="bg-amber-600" />
                <KPI label="Consolidado Total" value={total} icon={Activity} colorClass="bg-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Distribución por Módulo" subtitle="Comparativo de registros procesados">
                    {isReady && (
                        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                    stroke="none"
                                >
                                    <Cell fill="#6366f1" />
                                    <Cell fill="#0f172a" />
                                    <Cell fill="#d97706" />
                                </Pie>
                                <Tooltip />
                                <RechartsLegend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Carga de Trabajo Global" subtitle="Registros por módulo">
                    {isReady && (
                        <ResponsiveContainer width="99%" height="100%" minHeight={250}>
                            <RechartsBarChart data={barData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fontWeight: 900 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={40} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>
        </div>
    );
}

function TabCorrelativos({ correlativos, notas = [], period, values }) {
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const corrFiltered = useMemo(() => filterByPeriod(correlativos, 'fecha', period, values), [correlativos, period, values]);
    const notasFiltered = useMemo(() => filterByPeriod(notas, 'fecha', period, values), [notas, period, values]);

    const data = useMemo(() => {
        // Marcamos las notas con un tipo genérico si no lo tienen para que aparezcan en el gráfico de tipos
        const normalizedNotas = notasFiltered.map(n => ({
            ...n,
            tipoInforme: n.tipoInforme || 'Nota / Carta'
        }));
        return [...corrFiltered, ...normalizedNotas];
    }, [corrFiltered, notasFiltered]);

    const stats = useMemo(() => {
        const uds = data.reduce((a, c) => a + (Number(c.cantidadUnidades) || 1), 0);
        const inSitu = data.filter(c => c.accionSupervision === 'In Situ').length;
        const extraSitio = data.filter(c => c.accionSupervision === 'Extra Sitio').length;
        const descript = data.filter(c => !!c.descripcionAccion).length;

        return {
            total: data.length,
            unidades: uds,
            visitas: inSitu,
            remoto: extraSitio,
            conDesc: descript,
            tipoData: toChartData(countBy(data, 'tipoInforme')),
            clasifData: toChartData(countBy(data, 'clasificacion')),
            industriaData: toChartData(countBy(data, 'industria')),
            accionData: toChartData(countBy(data, 'accionSupervision')),
            tipoCorrData: toChartData(countBy(data, 'tipoCorrespondencia')),
            respData: toChartData(countBy(data, 'responsable')).slice(0, 8),
            normaData: toChartData(countByMulti(data, 'normas', 'codigoNorma')).slice(0, 10),
            entidadData: toChartData(countBy(data, 'entidad')).slice(0, 8),
            descripcionData: (() => {
                const filtered = data.filter(c => !!c.descripcionAccion);
                const counts = filtered.reduce((acc, curr) => {
                    const desc = curr.descripcionAccion;
                    acc[desc] = (acc[desc] || 0) + 1;
                    return acc;
                }, {});
                return toChartData(counts).slice(0, 5);
            })()
        };
    }, [data]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI label="Total Correlativos" value={stats.total} icon={FileText} colorClass="bg-slate-900" />
                <KPI label="Total Unidades" value={stats.unidades} icon={Award} colorClass="bg-indigo-600" />
                <KPI label="In Situ" value={stats.visitas} icon={Globe} colorClass="bg-blue-600" />
                <KPI label="Extra Sitio" value={stats.remoto} icon={Activity} colorClass="bg-violet-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Por Clasificación" subtitle="Categoría del informe">
                    {isReady && (
                        <ResponsiveContainer width="100%" height={260} minHeight={260}>
                            <PieChart>
                                <Pie
                                    data={stats.clasifData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    dataKey="value"
                                    nameKey="name"
                                    stroke="none"
                                >
                                    {stats.clasifData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PALETTES.clasif[index % PALETTES.clasif.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <RechartsLegend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Tipo de Informe" subtitle="Informes vs Notas">
                    {isReady && (
                        <ResponsiveContainer width="100%" height={260} minHeight={260}>
                            <PieChart>
                                <Pie
                                    data={stats.tipoData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    dataKey="value"
                                    nameKey="name"
                                    stroke="none"
                                >
                                    {stats.tipoData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PALETTES.tipo[index % PALETTES.tipo.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <RechartsLegend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <ChartCard title="Por Industria" subtitle="Sector supervisado" height={400}>
                    {isReady && (
                        <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                            <RechartsBarChart data={stats.industriaData} layout="vertical" margin={{ left: 40, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 9, fontWeight: 700 }}
                                    width={180}
                                    tickFormatter={(val) => val.length > 40 ? val.substring(0, 40) + '...' : val}
                                />
                                <Tooltip />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                                    {stats.industriaData.map((_, i) => <Cell key={i} fill={PALETTES.indust[i % PALETTES.indust.length]} />)}
                                </Bar>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Normativas más Aplicadas" subtitle="Frecuencia de base legal utilizada" height={350}>
                    {isReady && (
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <RechartsBarChart data={stats.normaData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 900 }} width={100} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={25} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Entidades Frecuentes" subtitle="Distribución por sujeto supervisado" height={350}>
                    {isReady && (
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <RechartsBarChart data={stats.entidadData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 9, fontWeight: 700 }}
                                    width={120}
                                    tickFormatter={(val) => val.length > 25 ? val.substring(0, 25) + '...' : val}
                                />
                                <Tooltip />
                                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={25} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Desempeño por Responsable" subtitle="Correlativos emitidos" height={350}>
                    {isReady && (
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <RechartsBarChart data={stats.respData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 700 }} width={120} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={25} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <div className="grid grid-cols-1 gap-6">
                    <ChartCard title="Acción de Supervisión" subtitle="Metodología aplicada" height={160}>
                        {isReady && (
                            <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                                <RechartsBarChart data={stats.accionData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 900 }} width={80} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={20} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    <ChartCard title="Tipos de Correspondencia" subtitle="Flujo documental" height={160}>
                        {isReady && (
                            <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                                <RechartsBarChart data={stats.tipoCorrData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 900 }} width={80} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#06b6d4" radius={[0, 6, 6, 0]} barSize={20} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <ChartCard title="Descripciones de Acción" subtitle="Metodologías Detalladas (Top 5)" height={320}>
                    {isReady && (
                        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                            <RechartsBarChart data={stats.descripcionData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 9, fontWeight: 700 }}
                                    width={180}
                                    tickFormatter={(val) => val.length > 45 ? val.substring(0, 45) + '...' : val}
                                />
                                <Tooltip
                                    contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [value + ' registros', 'Frecuencia']}
                                />
                                <Bar dataKey="value" fill="#ec4899" radius={[0, 6, 6, 0]} barSize={25} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>
        </div>
    );
}

function TabSeguimiento({ observaciones, period, values }) {
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 500);
        return () => clearTimeout(timer);
    }, []);
    const data = useMemo(() => filterByPeriod(observaciones, 'fechaInicio', period, values), [observaciones, period, values]);

    const stats = useMemo(() => ({
        total: data.length,
        criticas: data.filter(o => o.nivelRiesgo === 'Crítico').length,
        pendientes: data.filter(o => o.estado === 'Pendiente').length,
        subsanadas: data.filter(o => o.estado === 'Subsanada').length,
        nivelData: toChartData(countBy(data, 'nivelRiesgo')),
        estadoData: toChartData(countBy(data, 'estado')),
        responsableData: toChartData(countBy(data, 'responsable')).slice(0, 8),
    }), [data]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI label="Total Hallazgos" value={stats.total} icon={Shield} colorClass="bg-indigo-600" />
                <KPI label="Críticos" value={stats.criticas} icon={AlertCircle} colorClass="bg-red-600" />
                <KPI label="Pendientes" value={stats.pendientes} icon={Calendar} colorClass="bg-amber-600" />
                <KPI label="Subsanadas" value={stats.subsanadas} icon={CheckCircle} colorClass="bg-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Riesgo vs Estado" subtitle="Distribución cualitativa">
                    {isReady && (
                        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                            <PieChart>
                                <Pie data={stats.nivelData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" stroke="none">
                                    {stats.nivelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PALETTES.riesgo[index % PALETTES.riesgo.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <RechartsLegend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Carga por Responsable" subtitle="Seguimiento de hallazgos">
                    {isReady && (
                        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                            <RechartsBarChart data={stats.responsableData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 8, fontWeight: 700 }} width={80} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────
const TABS = [
    { id: 'resumen', label: 'Resumen General', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'correlativos', label: 'Correlativos Informes', icon: <FileText className="w-4 h-4" /> },
    { id: 'hallazgos', label: 'Analítica de Seguimiento', icon: <Shield className="w-4 h-4" /> },
    { id: 'correspondencia', label: 'Correspondencia', icon: <Download className="w-4 h-4" /> },
    { id: 'informes', label: 'Generador', icon: <Award className="w-4 h-4" /> },
];

export default function InformesGlobal({ observaciones = [], correlativos = [], notas = [], filtrar, getEstadisticas, onSelectObservacion, eliminarObservacion, editarObservacion, catalogos }) {
    const [activeTab, setActiveTab] = useState('resumen');

    // Time filtering state
    const [period, setPeriod] = useState('all');
    const [filterValues, setFilterValues] = useState({
        year: new Date().getFullYear().toString(),
        month: new Date().getMonth().toString(),
        quarter: '1',
        semester: '1'
    });

    const years = useMemo(() => {
        const set = new Set([
            ...observaciones.map(o => (o.fechaInicio || '').substring(0, 4)),
            ...correlativos.map(c => c.año?.toString()),
            ...notas.map(n => n.año?.toString()),
            new Date().getFullYear().toString()
        ]);
        return [...set].filter(Boolean).sort().reverse();
    }, [observaciones, correlativos, notas]);

    return (
        <div className="max-w-[1700px] mx-auto space-y-8 animate-fade-in pb-20">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-violet-800 shadow-2xl shadow-indigo-500/20 flex items-center justify-center shrink-0">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Power Reporter — Analítica DSFIT</h2>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Inteligencia de Datos v4.0
                            </span>
                        </div>
                    </div>
                </div>

                <PeriodFilters
                    period={period}
                    setPeriod={setPeriod}
                    values={filterValues}
                    setValues={setFilterValues}
                    availableYears={years}
                />
            </div>

            <div className="flex gap-2 bg-slate-100/50 p-2 rounded-[2rem] border border-slate-200/50 backdrop-blur-xl overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 cursor-pointer flex-1 justify-center
                            ${activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 border border-indigo-100'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-fade-in">
                {activeTab === 'resumen' && (
                    <TabResumen observaciones={observaciones} correlativos={correlativos} notas={notas} period={period} values={filterValues} years={years} />
                )}
                {activeTab === 'correlativos' && (
                    <TabCorrelativos correlativos={correlativos} notas={notas} period={period} values={filterValues} />
                )}
                {activeTab === 'hallazgos' && (
                    <TabSeguimiento observaciones={observaciones} period={period} values={filterValues} />
                )}
                {activeTab === 'correspondencia' && (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <Download className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Analítica de Correspondencia</p>
                        <p className="text-xs text-slate-300 mt-2 font-medium">Próximamente métricas de flujo documental</p>
                    </div>
                )}
                {activeTab === 'informes' && (
                    <Informes
                        observaciones={observaciones}
                        filtrar={filtrar}
                        getEstadisticas={getEstadisticas}
                        onSelectObservacion={onSelectObservacion}
                        eliminarObservacion={eliminarObservacion}
                        editarObservacion={editarObservacion}
                        catalogos={catalogos}
                    />
                )}
            </div>

            <div className="text-center pt-8 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                    AuditFlow Intelligence Engine • {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
