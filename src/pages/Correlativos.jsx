import { useState, useMemo } from 'react';
import { Card, Avatar } from '../components/SharedComponents.jsx';
import { getNextCorrelativo, formatDate } from '../data/data.js';

const ITEMS_PER_PAGE = 15;

const ACCION_COLOR = {
    'In Situ': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    'Extra Sitio': 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
};

const getCategoryStyle = (text) => {
    const colors = [
        'bg-slate-50 text-slate-600 ring-slate-200',
        'bg-indigo-50 text-indigo-600 ring-indigo-200',
        'bg-emerald-50 text-emerald-600 ring-emerald-200',
        'bg-amber-50 text-amber-600 ring-amber-200',
        'bg-cyan-50 text-cyan-600 ring-cyan-200',
    ];
    let hash = 0;
    if (text) {
        for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    return `inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ring-1 ${color}`;
};

const emptyForm = {
    blfOtro: '',
    fecha: new Date().toISOString().slice(0, 10),
    codigoNorma: '',
    nombreNorma: '',
    cantidadUnidades: 1,
    clasificacion: '',
    industria: '',
    tipoInforme: '',
    accionSupervision: 'In Situ',
    descripcionAccion: '',
    responsable: '',
    asunto: '',
    entidad: '',
};

export default function Correlativos({ correlativos, onAgregarCorrelativo, catalogos }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState('');
    const [filterClasif, setFilterClasif] = useState('');
    const [filterIndust, setFilterIndust] = useState('');
    const [filterAccion, setFilterAccion] = useState('');
    const [filterAño, setFilterAño] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRow, setExpandedRow] = useState(null);

    const años = useMemo(() => {
        const set = [...new Set(correlativos.map(c => c.año))].sort().reverse();
        return set;
    }, [correlativos]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return correlativos.filter(c => {
            const matchQ = !q ||
                c.codigo.toLowerCase().includes(q) ||
                c.entidad.toLowerCase().includes(q) ||
                c.responsable.toLowerCase().includes(q) ||
                c.codigoNorma.toLowerCase().includes(q) ||
                c.asunto.toLowerCase().includes(q);
            const matchClasif = !filterClasif || c.clasificacion === filterClasif;
            const matchIndust = !filterIndust || c.industria === filterIndust;
            const matchAccion = !filterAccion || c.accionSupervision === filterAccion;
            const matchAño = !filterAño || c.año === parseInt(filterAño);
            return matchQ && matchClasif && matchIndust && matchAccion && matchAño;
        });
    }, [correlativos, search, filterClasif, filterIndust, filterAccion, filterAño]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    function handleField(key, val) {
        setForm(f => {
            const next = { ...f, [key]: val };
            if (key === 'codigoNorma') {
                const norma = catalogos.normas.find(n => n.codigo === val);
                if (norma) next.nombreNorma = norma.nombre;
            }
            return next;
        });
    }

    function handleGuardar() {
        if (!form.fecha || !form.clasificacion || !form.industria || !form.tipoInforme || !form.responsable || !form.entidad) {
            alert('Por favor complete los campos obligatorios marcados con *.');
            return;
        }
        const { codigo, numero, año } = getNextCorrelativo(correlativos, new Date(form.fecha + 'T00:00:00').getFullYear());
        const nuevo = { ...form, id: `corr-${Date.now()}`, codigo, numero, año, cantidadUnidades: Number(form.cantidadUnidades) };
        onAgregarCorrelativo(nuevo);
        setForm(emptyForm);
        setShowForm(false);
        setCurrentPage(1);
    }

    const stats = useMemo(() => {
        const getTop = (arr, key, limit = 5) => {
            const counts = arr.reduce((acc, curr) => {
                const val = curr[key] || 'N/A';
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {});
            return Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit);
        };

        return {
            total: correlativos.length,
            esteAño: correlativos.filter(c => c.año === new Date().getFullYear()).length,
            porTipo: getTop(correlativos, 'tipoInforme'),
            porNorma: getTop(correlativos, 'codigoNorma'),
            porResponsable: getTop(correlativos, 'responsable'),
        };
    }, [correlativos]);

    return (
        <div className="max-w-[1700px] mx-auto space-y-4 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 shadow-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-primary tracking-tight">Correlativos de Informes — DSFIT</h2>
                            <p className="text-xs font-medium text-text-muted">Control correlativo de informes y memorandos emitidos</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-primary shadow-xl transition-all duration-300 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Correlativo
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3">
                {/* Main Stats - Smaller */}
                <Card className="md:col-span-2 lg:col-span-2 flex flex-col items-center justify-center text-center !bg-slate-900 !text-white border-0 shadow-sm min-h-[140px]">
                    <span className="text-3xl font-black mb-0.5">{stats.total}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total</span>
                </Card>

                {/* Categories Stats - Larger */}
                {[
                    { label: 'Tipo de Informe', data: stats.porTipo, icon: '📋', span: 'md:col-span-2 lg:col-span-3' },
                    { label: 'Norma Aplicada', data: stats.porNorma, icon: '⚖️', span: 'md:col-span-2 lg:col-span-3' },
                    { label: 'Responsable', data: stats.porResponsable, icon: '👤', span: 'md:col-span-6 lg:col-span-4' },
                ].map(cat => (
                    <Card key={cat.label} className={`${cat.span} !p-3.5 !bg-white border-slate-100 hover:shadow-md transition-shadow min-h-[140px] flex flex-col`}>
                        <div className="flex items-center gap-2 mb-2.5 border-b border-slate-50 pb-2">
                            <span className="text-sm">{cat.icon}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cat.label}</span>
                        </div>
                        <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[110px] scrollbar-hide">
                            {cat.data.map(([val, count]) => {
                                const pct = Math.round((count / stats.total) * 100);
                                return (
                                    <div key={val} className="group">
                                        <div className="flex justify-between items-center text-[10px] mb-0.5">
                                            <span className="font-bold text-slate-700 truncate max-w-[140px]" title={val}>{val}</span>
                                            <span className="font-black text-primary">{count}</span>
                                        </div>
                                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-300 group-hover:bg-primary transition-colors" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="!p-0 overflow-visible">
                <div className="px-4 py-3 flex flex-wrap gap-3 items-center border-b border-border bg-slate-50/50">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[180px]">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por código, entidad, responsable, asunto…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-3 h-9 rounded-lg border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                        />
                    </div>
                    {[
                        { label: 'Año', value: filterAño, set: v => { setFilterAño(v); setCurrentPage(1); }, options: años.map(a => ({ value: String(a), label: String(a) })) },
                        { label: 'Clasificación', value: filterClasif, set: v => { setFilterClasif(v); setCurrentPage(1); }, options: catalogos.clasificaciones.map(c => ({ value: c, label: c })) },
                        { label: 'Industria', value: filterIndust, set: v => { setFilterIndust(v); setCurrentPage(1); }, options: catalogos.industrias.map(i => ({ value: i, label: i })) },
                        { label: 'Acción', value: filterAccion, set: v => { setFilterAccion(v); setCurrentPage(1); }, options: catalogos.accionesSupervision.map(a => ({ value: a, label: a })) },
                    ].map(f => (
                        <select
                            key={f.label}
                            value={f.value}
                            onChange={e => f.set(e.target.value)}
                            className="h-9 px-3 rounded-lg border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-text-secondary cursor-pointer"
                        >
                            <option value="">Todos — {f.label}</option>
                            {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    ))}
                    {(search || filterClasif || filterIndust || filterAccion || filterAño) && (
                        <button
                            onClick={() => { setSearch(''); setFilterClasif(''); setFilterIndust(''); setFilterAccion(''); setFilterAño(''); setCurrentPage(1); }}
                            className="h-9 px-3 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                        >✕ Limpiar</button>
                    )}
                    <span className="ml-auto text-[10px] font-black text-text-muted uppercase tracking-widest">
                        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr>
                                {['#', 'Código', 'Fecha', 'Norma', 'Uds.', 'Clasificación', 'Industria', 'Tipo Informe', 'Acción', 'Responsable', 'Entidad'].map(h => (
                                    <th key={h} className="py-2.5 px-3 text-[10px] font-black text-text-muted uppercase tracking-[0.12em] bg-slate-50/70 border-b border-border whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr><td colSpan={11} className="py-16 text-center text-sm text-text-muted font-medium">No se encontraron correlativos</td></tr>
                            ) : paginated.map((c, idx) => (
                                <>
                                    <tr
                                        key={c.id}
                                        onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}
                                        className={`group cursor-pointer transition-colors ${expandedRow === c.id ? 'bg-slate-50' : 'hover:bg-primary/[0.02]'}`}
                                    >
                                        <td className="py-2 px-3 align-middle">
                                            <span className="text-[10px] font-black text-slate-300">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 align-middle whitespace-nowrap">
                                            <span className="text-xs font-black text-slate-900 tracking-tight">{c.codigo}</span>
                                            {c.blfOtro && <div className="text-[9px] text-slate-400 font-medium">{c.blfOtro}</div>}
                                        </td>
                                        <td className="py-2 px-3 align-middle whitespace-nowrap">
                                            <span className="text-[10px] font-bold text-text-secondary">{formatDate(c.fecha)}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle">
                                            <span className="text-[10px] font-black text-text-primary">{c.codigoNorma}</span>
                                            <p className="text-[9px] text-slate-400 max-w-[140px] truncate">{c.nombreNorma}</p>
                                        </td>
                                        <td className="py-2 px-3 align-middle text-center">
                                            <span className="text-xs font-black text-text-primary">{c.cantidadUnidades}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle">
                                            <span className={getCategoryStyle(c.clasificacion)}>
                                                {c.clasificacion}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 align-middle">
                                            <span className={getCategoryStyle(c.industria)}>
                                                {c.industria}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 align-middle">
                                            <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{c.tipoInforme}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${ACCION_COLOR[c.accionSupervision] || 'bg-slate-100 text-slate-600'}`}>
                                                {c.accionSupervision}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 align-middle">
                                            <div className="flex items-center gap-1.5">
                                                <Avatar nombre={c.responsable} size="xs" />
                                                <span className="text-[10px] font-bold text-text-primary whitespace-nowrap">{c.responsable.split(' ').slice(0, 2).join(' ')}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 align-middle max-w-[180px]">
                                            <span className="text-[10px] font-bold text-text-primary line-clamp-2">{c.entidad}</span>
                                        </td>
                                    </tr>
                                    {expandedRow === c.id && (
                                        <tr key={`${c.id}-exp`} className="bg-slate-50 border-b border-slate-100">
                                            <td colSpan={11} className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asunto</p>
                                                        <p className="text-xs font-medium text-text-secondary leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{c.asunto}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descripción de la Acción</p>
                                                        <p className="text-xs font-medium text-text-secondary leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{c.descripcionAccion || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 flex items-center justify-between border-t border-border bg-slate-50/30">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            Pág. <span className="text-primary">{currentPage}</span> de <span className="text-primary">{totalPages}</span>
                        </span>
                        <div className="flex gap-1">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border bg-white hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">← Ant</button>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border bg-white hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">Sig →</button>
                        </div>
                    </div>
                )}
            </Card>

            {/* ===== Slide-in Form Panel ===== */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    {/* Panel */}
                    <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-fade-in overflow-hidden">
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 shrink-0">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nuevo Registro</p>
                                <p className="text-sm font-black text-white">
                                    {getNextCorrelativo(correlativos, new Date(form.fecha + 'T00:00:00').getFullYear()).codigo}
                                </p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm cursor-pointer transition-colors">✕</button>
                        </div>

                        {/* Scrollable form body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">

                            {/* Row 1 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Fecha *</label>
                                    <input type="date" value={form.fecha} onChange={e => handleField('fecha', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">BLF / Informe Otro</label>
                                    <input type="text" placeholder="ej. 10/02/2026" value={form.blfOtro} onChange={e => handleField('blfOtro', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50" />
                                </div>
                            </div>

                            {/* Row 2 — Norma */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Código de Norma</label>
                                    <select value={form.codigoNorma} onChange={e => handleField('codigoNorma', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.normas.map(n => <option key={n.codigo} value={n.codigo}>{n.codigo}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cantidad Unidades</label>
                                    <input type="number" min="1" value={form.cantidadUnidades} onChange={e => handleField('cantidadUnidades', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50" />
                                </div>
                            </div>

                            {/* Nombre norma (auto-filled) */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nombre de la Norma</label>
                                <input type="text" placeholder="Se rellena automáticamente al elegir código, o escríbalo manualmente"
                                    value={form.nombreNorma} onChange={e => handleField('nombreNorma', e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50" />
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Clasificación *</label>
                                    <select value={form.clasificacion} onChange={e => handleField('clasificacion', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.clasificaciones.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Industria *</label>
                                    <select value={form.industria} onChange={e => handleField('industria', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.industrias.map(i => <option key={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tipo de Informe/Memo *</label>
                                    <select value={form.tipoInforme} onChange={e => handleField('tipoInforme', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.tiposInforme.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Acción de Supervisión *</label>
                                    <select value={form.accionSupervision} onChange={e => handleField('accionSupervision', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                        {catalogos.accionesSupervision.map(a => <option key={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Row 5 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Responsable *</label>
                                    <select value={form.responsable} onChange={e => handleField('responsable', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.responsables.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Entidad *</label>
                                    <select value={form.entidad} onChange={e => handleField('entidad', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.entidades.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Descripción acción */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Descripción de la Acción de Supervisión</label>
                                    <select
                                        onChange={e => e.target.value && handleField('descripcionAccion', e.target.value)}
                                        className="text-[9px] font-black uppercase text-primary bg-primary/5 px-2 py-0.5 rounded cursor-pointer border-none outline-none"
                                    >
                                        <option value="">— Cargar Plantilla —</option>
                                        {catalogos.descripcionesAccion.map((d, i) => (
                                            <option key={i} value={d}>{d.substring(0, 40)}...</option>
                                        ))}
                                    </select>
                                </div>
                                <textarea rows={2} placeholder="Describa brevemente la acción supervisora realizada…"
                                    value={form.descripcionAccion} onChange={e => handleField('descripcionAccion', e.target.value)}
                                    className="w-full p-3 rounded-lg border border-slate-200 text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 resize-none" />
                            </div>

                            {/* Asunto */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Asunto del Informe / Memo</label>
                                <textarea rows={4} placeholder="Redacte el asunto completo del informe o memorándum…"
                                    value={form.asunto} onChange={e => handleField('asunto', e.target.value)}
                                    className="w-full p-3 rounded-lg border border-slate-200 text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 resize-none" />
                            </div>
                        </div>

                        {/* Panel footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
                            <button onClick={() => setShowForm(false)}
                                className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-text-secondary hover:border-slate-400 transition-colors cursor-pointer">
                                Cancelar
                            </button>
                            <button onClick={handleGuardar}
                                className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-primary shadow-lg transition-all cursor-pointer flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Guardar Correlativo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
