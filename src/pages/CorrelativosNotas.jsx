import React, { useState, useMemo } from 'react';
import { Card, Avatar } from '../components/SharedComponents.jsx';
import { getNextCorrelativoNota, formatDate } from '../data/data.js';
import { Mail, FileText, Download, Briefcase, Globe, Activity, CheckCircle, AlertCircle, Calendar, Award } from 'lucide-react';

const ITEMS_PER_PAGE = 15;

const ACCION_COLOR = {
    'In Situ': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    'Extra Sitio': 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
};

// ─── Empty junta template ───────────────────────────────────────────────────
const emptyJunta = {
    industria: '',
    fechaCelebracion: new Date().toISOString().slice(0, 10),
    hora: '',
    entidad: '',
    lugar: '',
    responsable: '',
    tipoJunta: '',
};

const emptyForm = {
    fecha: new Date().toISOString().slice(0, 10),
    normas: [],
    codigoNorma: '',
    nombreNorma: '',
    clasificacion: '',
    tipoCorrespondencia: '',
    cantidadUnidades: 1,
    industria: '',
    accionSupervision: 'Extra Sitio',
    descripcionAccion: '',
    responsable: '',
    entidad: '',
    asunto: '',
    vinculado: '',
    vieneDeInforme: 'NO',
    juntas: [],
    anulado: false,
};

const INPUT = 'w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 bg-slate-50';
const SELECT = INPUT + ' cursor-pointer';
const LABEL = 'block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5';

function JuntasSubForm({ juntas, onChange, catalogos }) {
    const [draft, setDraft] = useState(emptyJunta);

    function handleDraft(key, val) {
        setDraft(d => ({ ...d, [key]: val }));
    }

    function agregarJunta() {
        if (!draft.entidad || !draft.fechaCelebracion || !draft.tipoJunta) {
            alert('Complete los campos obligatorios de la junta: Entidad, Fecha y Tipo/Nombre de Junta.');
            return;
        }
        onChange([...juntas, { ...draft, id: Date.now() }]);
        setDraft(emptyJunta);
    }

    function eliminarJunta(id) {
        onChange(juntas.filter(j => j.id !== id));
    }

    return (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-100/60 border-b border-amber-200">
                <span className="text-lg">🏛️</span>
                <div>
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-[0.2em]">Asistencias a Juntas</p>
                    <p className="text-[9px] text-amber-600 font-medium">Junta General de Accionistas · Asamblea de Partícipes · JGTV</p>
                </div>
                <span className="ml-auto bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {juntas.length} junta{juntas.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="p-4 space-y-4">
                {juntas.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-amber-200 bg-white">
                        <table className="w-full border-collapse text-left text-[10px]">
                            <thead>
                                <tr className="bg-amber-50">
                                    {['Industria', 'Fecha', 'Hora', 'Entidad', 'Lugar', 'Responsable', 'Tipo/Nombre Junta', ''].map(h => (
                                        <th key={h} className="py-2 px-3 font-black text-amber-700 uppercase tracking-widest whitespace-nowrap border-b border-amber-100">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {juntas.map((j, i) => (
                                    <tr key={j.id || i} className="border-b border-amber-50 hover:bg-amber-50/40 transition-colors">
                                        <td className="py-2 px-3 font-bold text-slate-600 whitespace-nowrap">{j.industria || '—'}</td>
                                        <td className="py-2 px-3 font-bold text-slate-600 whitespace-nowrap">{formatDate(j.fechaCelebracion)}</td>
                                        <td className="py-2 px-3 font-bold text-slate-600 whitespace-nowrap">{j.hora || '—'}</td>
                                        <td className="py-2 px-3 font-bold text-slate-700 max-w-[140px]">
                                            <span className="line-clamp-2">{j.entidad}</span>
                                        </td>
                                        <td className="py-2 px-3 text-slate-500 max-w-[140px]">
                                            <span className="line-clamp-2">{j.lugar || '—'}</span>
                                        </td>
                                        <td className="py-2 px-3 font-bold text-slate-600 whitespace-nowrap">
                                            {j.responsable ? j.responsable.split(' ').slice(0, 2).join(' ') : '—'}
                                        </td>
                                        <td className="py-2 px-3 font-bold text-amber-700 max-w-[160px]">
                                            <span className="line-clamp-2">{j.tipoJunta}</span>
                                        </td>
                                        <td className="py-2 px-3">
                                            <button
                                                onClick={() => eliminarJunta(j.id || i)}
                                                className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center cursor-pointer transition-colors text-xs font-black"
                                                title="Eliminar"
                                            >✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">+ Agregar junta</p>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className={LABEL}>Industria</label>
                            <select value={draft.industria} onChange={e => handleDraft('industria', e.target.value)} className={SELECT}>
                                <option value="">— Seleccionar —</option>
                                {catalogos.industrias.map(i => <option key={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={LABEL}>Fecha de Celebración *</label>
                            <input type="date" value={draft.fechaCelebracion} onChange={e => handleDraft('fechaCelebracion', e.target.value)} className={INPUT} />
                        </div>
                        <div>
                            <label className={LABEL}>Hora</label>
                            <input type="text" placeholder="ej. 10:00 a.m." value={draft.hora} onChange={e => handleDraft('hora', e.target.value)} className={INPUT} />
                        </div>
                    </div>

                    <div>
                        <label className={LABEL}>Entidad *</label>
                        <input type="text" placeholder="Nombre completo de la entidad que celebra la junta…" value={draft.entidad} onChange={e => handleDraft('entidad', e.target.value)} className={INPUT} />
                    </div>

                    <div>
                        <label className={LABEL}>Lugar (dirección exacta)</label>
                        <input type="text" placeholder="Dirección completa donde se celebra la junta…" value={draft.lugar} onChange={e => handleDraft('lugar', e.target.value)} className={INPUT} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={LABEL}>Responsable</label>
                            <select value={draft.responsable} onChange={e => handleDraft('responsable', e.target.value)} className={SELECT}>
                                <option value="">— Seleccionar —</option>
                                {catalogos.responsables.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={LABEL}>Tipo de Junta / Nombre del Fondo *</label>
                            <input
                                type="text"
                                placeholder="ej. Asamblea de Partícipes del Fondo de Inversión Cerrado…"
                                value={draft.tipoJunta}
                                onChange={e => handleDraft('tipoJunta', e.target.value)}
                                className={INPUT}
                            />
                        </div>
                    </div>

                    <button
                        onClick={agregarJunta}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all cursor-pointer shadow-md shadow-amber-600/20"
                    >
                        <Activity className="w-3.5 h-3.5" />
                        Agregar Junta
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CorrelativosNotas({ notas, onAgregarNota, onEliminarNota, onEditarNota, catalogos, correlativos = [] }) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState('');
    const [filterClasif, setFilterClasif] = useState('');
    const [filterIndust, setFilterIndust] = useState('');
    const [filterAccion, setFilterAccion] = useState('');
    const [filterAño, setFilterAño] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRow, setExpandedRow] = useState(null);

    const isGobiernoCorporativo = form.clasificacion === 'Gobierno Corporativo';
    const TODAS_NORMAS = useMemo(() => [...catalogos.normas, ...catalogos.normasExtra], [catalogos]);

    const años = useMemo(() => {
        return [...new Set(notas.map(n => n.año))].sort().reverse();
    }, [notas]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return notas.filter(n => {
            const matchQ = !q ||
                n.codigo.toLowerCase().includes(q) ||
                n.entidad.toLowerCase().includes(q) ||
                n.responsable.toLowerCase().includes(q) ||
                (n.normas && n.normas.some(norm => norm.codigo.toLowerCase().includes(q) || norm.nombre.toLowerCase().includes(q))) ||
                (n.codigoNorma && n.codigoNorma.toLowerCase().includes(q)) ||
                n.asunto.toLowerCase().includes(q);
            return matchQ
                && (!filterClasif || n.clasificacion === filterClasif)
                && (!filterIndust || n.industria === filterIndust)
                && (!filterAccion || n.accionSupervision === filterAccion)
                && (!filterAño || n.año === parseInt(filterAño));
        });
    }, [search, filterClasif, filterIndust, filterAccion, filterAño, notas]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    function resetFilters() {
        setSearch(''); setFilterClasif(''); setFilterIndust('');
        setFilterAccion(''); setFilterAño(''); setCurrentPage(1);
    }

    function handleField(key, val) {
        setForm(f => {
            const next = { ...f, [key]: val };
            if (key === 'codigoNorma') {
                const norma = TODAS_NORMAS.find(n => n.codigo === val);
                if (norma) next.nombreNorma = norma.nombre;
            }
            if (key === 'clasificacion' && val !== 'Gobierno Corporativo') {
                next.juntas = [];
            }
            if (key === 'vieneDeInforme' && val === 'NO') {
                next.vinculado = '';
            }
            return next;
        });
    }

    function handleJuntas(newJuntas) {
        setForm(f => ({ ...f, juntas: newJuntas }));
    }

    function handleOpenEdit(nota) {
        setForm({
            ...nota,
            normas: nota.normas || (nota.codigoNorma ? [{ codigo: nota.codigoNorma, nombre: nota.nombreNorma }] : [])
        });
        setEditingId(nota.id);
        setShowForm(true);
    }

    function handleGuardar() {
        if (!form.fecha || !form.clasificacion || !form.industria || !form.responsable || !form.entidad) {
            alert('Por favor complete los campos obligatorios (*).');
            return;
        }

        if (editingId) {
            onEditarNota({ ...form, id: editingId, cantidadUnidades: Number(form.cantidadUnidades) });
        } else {
            const año = new Date(form.fecha + 'T00:00:00').getFullYear();
            const { codigo, numero } = getNextCorrelativoNota(notas, año);
            const nuevo = {
                ...form, id: `nota-${Date.now()}`, codigo, numero, año,
                cantidadUnidades: Number(form.cantidadUnidades),
            };
            onAgregarNota(nuevo);
        }

        setForm(emptyForm);
        setEditingId(null);
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
            total: notas.length,
            esteAño: notas.filter(n => n.año === new Date().getFullYear()).length,
            porClasif: getTop(notas, 'clasificacion'),
            porIndustria: getTop(notas, 'industria'),
            porResponsable: getTop(notas, 'responsable'),
        };
    }, [notas]);

    const previewCodigo = useMemo(() => {
        if (editingId) return form.codigo;
        const año = new Date(form.fecha + 'T00:00:00').getFullYear();
        return getNextCorrelativoNota(notas, año).codigo;
    }, [notas, form.fecha, editingId, form.codigo]);

    return (
        <div className="max-w-[1800px] mx-auto space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 shadow-lg flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-text-primary tracking-tight">Correlativos de Correspondencia — DSFIT</h2>
                        <p className="text-xs font-medium text-text-muted">Control correlativo de cartas y memos emitidos</p>
                    </div>
                </div>
                <button
                    onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-700 shadow-xl shadow-amber-600/20 transition-all duration-300 cursor-pointer shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Nota / Carta
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
                <div className="bg-amber-600 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Mail className="w-20 h-20" />
                    </div>
                    <p className="text-3xl font-black mb-1">{stats.total}</p>
                    <p className="text-[10px] font-bold text-amber-100 uppercase tracking-widest">Total Correspondencia</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full">{stats.esteAño} en {new Date().getFullYear()}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Clasificación Principal</p>
                    <div className="space-y-3 flex-1">
                        {stats.porClasif.slice(0, 3).map(([name, count]) => (
                            <div key={name}>
                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                    <span className="text-slate-600 truncate mr-2">{name}</span>
                                    <span className="text-slate-900">{count}</span>
                                </div>
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(count / (stats.total || 1)) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Industrias Frecuentes</p>
                    <div className="space-y-3 flex-1">
                        {stats.porIndustria.slice(0, 3).map(([name, count]) => (
                            <div key={name}>
                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                    <span className="text-slate-600 truncate mr-2">{name}</span>
                                    <span className="text-slate-900">{count}</span>
                                </div>
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / (stats.total || 1)) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Carga Unidades</p>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <p className="text-3xl font-black text-slate-800">
                            {notas.reduce((a, n) => a + (Number(n.cantidadUnidades) || 1), 0)}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Unidades Reportadas</p>
                    </div>
                </div>
            </div>

            <Card className="!p-0 overflow-visible">
                <div className="px-4 py-3 flex flex-wrap gap-3 items-center border-b border-border bg-slate-50/50">
                    <div className="relative flex-1 min-w-[180px]">
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por código, entidad, responsable, asunto…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-3 h-9 rounded-lg border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 bg-white"
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
                            className="h-9 px-3 rounded-lg border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 bg-white text-text-secondary cursor-pointer"
                        >
                            <option value="">Todos — {f.label}</option>
                            {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    ))}
                    {(search || filterClasif || filterIndust || filterAccion || filterAño) && (
                        <button onClick={resetFilters}
                            className="h-9 px-3 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer">
                            ✕ Limpiar
                        </button>
                    )}
                    <span className="ml-auto text-[10px] font-black text-text-muted uppercase tracking-widest">
                        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr>
                                {['#', 'Código Despacho', 'Fecha', 'Tipo', 'Norma', 'Clasificación', 'Uds.', 'Industria', 'Acción', 'Responsable', 'Entidad', 'Acciones'].map(h => (
                                    <th key={h} className={`py-2.5 px-3 text-[10px] font-black text-text-muted uppercase tracking-[0.12em] bg-slate-50/70 border-b border-border whitespace-nowrap ${h === 'Acciones' ? 'text-center' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr><td colSpan={12} className="py-16 text-center text-sm text-text-muted font-medium">No se encontraron registros</td></tr>
                            ) : paginated.map((n, idx) => (
                                <React.Fragment key={n.id}>
                                    <tr
                                        className={`group cursor-pointer transition-colors border-b border-slate-50 ${expandedRow === n.id ? 'bg-amber-50/40' : 'hover:bg-amber-50/20'}`}
                                    >
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            <span className="text-[10px] font-black text-slate-300">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle whitespace-nowrap" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[11px] font-black tracking-tight ${n.anulado ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{n.codigo}</span>
                                                {n.anulado && <span className="bg-rose-50 text-rose-500 text-[8px] font-black px-1 rounded uppercase tracking-tighter ring-1 ring-rose-100">Anulado</span>}
                                                {n.juntas?.length > 0 && !n.anulado && (
                                                    <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded-full ring-1 ring-amber-200" title={`${n.juntas.length} junta(s)`}>
                                                        🏛️ {n.juntas.length}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 align-middle whitespace-nowrap" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            <span className="text-[10px] font-bold text-text-secondary">{formatDate(n.fecha)}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            <span className="text-[10px] font-bold text-text-secondary">{n.tipoCorrespondencia || 'Nota'}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            {n.normas && n.normas.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {n.normas.map((norm, i) => (
                                                        <div key={i}>
                                                            <span className="text-[10px] font-black text-text-primary">{norm.codigo}</span>
                                                            <p className="text-[9px] text-slate-400 max-w-[110px] truncate" title={norm.nombre}>{norm.nombre}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="text-[10px] font-black text-text-primary">{n.codigoNorma || '—'}</span>
                                                    <p className="text-[9px] text-slate-400 max-w-[110px] truncate">{n.nombreNorma || ''}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            <span className="text-[10px] font-bold text-text-secondary">{n.clasificacion}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle text-center" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            <span className="text-xs font-black text-text-primary">{n.cantidadUnidades}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle whitespace-nowrap" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            <span className="text-[10px] font-bold text-text-secondary">{n.industria}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${ACCION_COLOR[n.accionSupervision] || 'bg-slate-100 text-slate-600'}`}>
                                                {n.accionSupervision}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            <div className="flex items-center gap-1.5">
                                                <Avatar nombre={n.responsable} size="xs" />
                                                <span className="text-[10px] font-bold text-text-primary whitespace-nowrap">{n.responsable.split(' ').slice(0, 2).join(' ')}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 align-middle max-w-[160px]" onClick={() => setExpandedRow(expandedRow === n.id ? null : n.id)}>
                                            <span className="text-[10px] font-bold text-text-primary line-clamp-2">{n.entidad}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(n); }}
                                                    className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEliminarNota(n.id); }}
                                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRow === n.id && (
                                        <tr key={`${n.id}-exp`} className="bg-amber-50/30 border-b border-amber-100">
                                            <td colSpan={12} className="px-6 py-4">
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asunto</p>
                                                            <p className="text-xs font-medium text-text-secondary leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{n.asunto || '—'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descripción de la Acción</p>
                                                            <p className="text-xs font-medium text-text-secondary leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{n.descripcionAccion || '—'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vinculado a</p>
                                                            <p className="text-xs font-medium text-text-secondary leading-relaxed bg-white p-3 rounded-xl border border-slate-100 whitespace-pre-line">{n.vinculado || '—'}</p>
                                                        </div>
                                                    </div>

                                                    {n.juntas?.length > 0 && (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-base">🏛️</span>
                                                                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
                                                                    Asistencias a Juntas ({n.juntas.length})
                                                                </p>
                                                            </div>
                                                            <div className="overflow-x-auto rounded-xl border border-amber-200 bg-white">
                                                                <table className="w-full border-collapse text-left text-[10px]">
                                                                    <thead>
                                                                        <tr className="bg-amber-50">
                                                                            {['Industria', 'Fecha', 'Hora', 'Entidad', 'Lugar', 'Responsable', 'Tipo/Nombre de Junta'].map(h => (
                                                                                <th key={h} className="py-2 px-3 font-black text-amber-700 uppercase tracking-widest whitespace-nowrap border-b border-amber-100">{h}</th>
                                                                            ))}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {n.juntas.map((j, ji) => (
                                                                            <tr key={ji} className="border-b border-amber-50 last:border-0">
                                                                                <td className="py-2 px-3 font-bold text-slate-600">{j.industria || '—'}</td>
                                                                                <td className="py-2 px-3 font-bold text-slate-600 whitespace-nowrap">{formatDate(j.fechaCelebracion)}</td>
                                                                                <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{j.hora || '—'}</td>
                                                                                <td className="py-2 px-3 font-bold text-slate-700 max-w-[160px]"><span className="line-clamp-2">{j.entidad}</span></td>
                                                                                <td className="py-2 px-3 text-slate-500 max-w-[200px]"><span className="line-clamp-2">{j.lugar || '—'}</span></td>
                                                                                <td className="py-2 px-3 font-bold text-slate-600 whitespace-nowrap">{j.responsable || '—'}</td>
                                                                                <td className="py-2 px-3 font-bold text-amber-700 max-w-[200px]"><span className="line-clamp-2">{j.tipoJunta}</span></td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-4 py-3 flex items-center justify-between border-t border-border bg-slate-50/30">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            Pág. <span className="text-amber-600">{currentPage}</span> de <span className="text-amber-600">{totalPages}</span>
                        </span>
                        <div className="flex gap-1">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border bg-white hover:border-amber-500 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">← Ant</button>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border bg-white hover:border-amber-500 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">Sig →</button>
                        </div>
                    </div>
                )}
            </Card>

            {showForm && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-fade-in overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 bg-amber-600 shrink-0">
                            <div>
                                <p className="text-[10px] font-black text-amber-100 uppercase tracking-[0.2em]">{editingId ? 'Editando Nota' : 'Nueva Correspondencia'}</p>
                                <p className="text-sm font-black text-white">{previewCodigo}</p>
                            </div>
                            <button onClick={() => setShowForm(false)}
                                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm cursor-pointer transition-colors">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Estado Anulado toggle */}
                            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Anular Documento</p>
                                    <p className="text-[9px] font-medium text-rose-400 uppercase tracking-tighter">No aparecerá en dashboard ni analítica</p>
                                </div>
                                <button
                                    onClick={() => handleField('anulado', !form.anulado)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.anulado ? 'bg-rose-500' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.anulado ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL}>Fecha *</label>
                                    <input type="date" value={form.fecha} onChange={e => handleField('fecha', e.target.value)} className={INPUT} />
                                </div>
                                <div>
                                    <label className={LABEL}>Cantidad Unidades</label>
                                    <input type="number" min="1" value={form.cantidadUnidades} onChange={e => handleField('cantidadUnidades', e.target.value)} className={INPUT} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={LABEL}>Normativas Aplicables (Puede agregar múltiples) *</label>
                                <select
                                    className={SELECT}
                                    value=""
                                    onChange={(e) => {
                                        const code = e.target.value;
                                        if (!code) return;
                                        const norma = TODAS_NORMAS.find(n => n.codigo === code);
                                        if (norma && (!form.normas || !form.normas.find(n => n.codigo === code))) {
                                            setForm(f => ({ ...f, normas: [...(f.normas || []), norma] }));
                                        }
                                    }}
                                >
                                    <option value="">— Agregar norma... —</option>
                                    {TODAS_NORMAS.map(n => <option key={n.codigo} value={n.codigo}>{n.codigo} - {n.nombre.substring(0, 60)}{n.nombre.length > 60 ? '...' : ''}</option>)}
                                </select>

                                {form.normas && form.normas.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                                        {form.normas.map(n => (
                                            <div key={n.codigo} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-700 leading-none">{n.codigo}</span>
                                                    <span className="text-[9px] font-medium text-slate-500 max-w-[200px] truncate mt-0.5">{n.nombre}</span>
                                                </div>
                                                <button
                                                    onClick={() => setForm(f => ({ ...f, normas: f.normas.filter(x => x.codigo !== n.codigo) }))}
                                                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors ml-1 cursor-pointer"
                                                    title="Remover norma"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL}>Clasificación *</label>
                                    <select value={form.clasificacion} onChange={e => handleField('clasificacion', e.target.value)} className={SELECT}>
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.clasificaciones.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={LABEL}>Tipo Correspondencia *</label>
                                    <select value={form.tipoCorrespondencia} onChange={e => handleField('tipoCorrespondencia', e.target.value)} className={SELECT}>
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.tiposCorrespondencia.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1">
                                <div>
                                    <label className={LABEL}>Industria *</label>
                                    <select value={form.industria} onChange={e => handleField('industria', e.target.value)} className={SELECT}>
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.industrias.map(i => <option key={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1">
                                <div>
                                    <label className={LABEL}>Acción Supervisión</label>
                                    <select value={form.accionSupervision} onChange={e => handleField('accionSupervision', e.target.value)} className={SELECT}>
                                        {catalogos.accionesSupervision.map(a => <option key={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                                <div>
                                    <label className={LABEL}>¿Viene de un Informe?</label>
                                    <div className="flex gap-2 h-9 items-center">
                                        {['SI', 'NO'].map(v => (
                                            <label key={v} className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg border cursor-pointer text-xs font-black transition-all ${form.vieneDeInforme === v ? (v === 'SI' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-500 text-white border-slate-500') : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400'}`}>
                                                <input type="radio" name="vieneDeInforme" value={v} checked={form.vieneDeInforme === v} onChange={e => handleField('vieneDeInforme', e.target.value)} className="hidden" />
                                                {v}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className={form.vieneDeInforme === 'NO' ? 'opacity-40' : ''}>
                                    <label className={LABEL}>Vinculado a (Referencia de Informe)</label>
                                    <select
                                        value={form.vinculado}
                                        onChange={e => handleField('vinculado', e.target.value)}
                                        className={SELECT}
                                        disabled={form.vieneDeInforme === 'NO'}
                                    >
                                        <option value="">— Seleccionar Informe —</option>
                                        <optgroup label="Correlativo de Informes">
                                            {correlativos.map(c => (
                                                <option key={c.id} value={c.codigo}>
                                                    {c.codigo} — {c.entidad}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={LABEL}>Responsable *</label>
                                    <select value={form.responsable} onChange={e => handleField('responsable', e.target.value)} className={SELECT}>
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.responsables.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={LABEL}>Entidad *</label>
                                    <select value={form.entidad} onChange={e => handleField('entidad', e.target.value)} className={SELECT}>
                                        <option value="">— Seleccionar —</option>
                                        {catalogos.entidades.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className={LABEL}>Descripción de la Acción</label>
                                    <select
                                        onChange={e => e.target.value && handleField('descripcionAccion', e.target.value)}
                                        className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded cursor-pointer border-none outline-none"
                                    >
                                        <option value="">— Cargar Plantilla —</option>
                                        {catalogos.descripcionesAccion.map((d, i) => (
                                            <option key={i} value={d}>{d.substring(0, 40)}...</option>
                                        ))}
                                    </select>
                                </div>
                                <textarea rows={2} placeholder="Describa la acción…" value={form.descripcionAccion} onChange={e => handleField('descripcionAccion', e.target.value)} className={SELECT + " resize-none"} />
                            </div>

                            <div>
                                <label className={LABEL}>Asunto</label>
                                <textarea rows={3} value={form.asunto} onChange={e => handleField('asunto', e.target.value)}
                                    placeholder="Asunto de la carta o memo…"
                                    className="w-full p-3 rounded-lg border border-slate-200 text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 bg-slate-50 resize-none" />
                            </div>

                            {isGobiernoCorporativo && (
                                <JuntasSubForm juntas={form.juntas} onChange={handleJuntas} catalogos={catalogos} />
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
                            <button onClick={() => { setShowForm(false); setEditingId(null); }}
                                className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-text-secondary hover:border-slate-400 transition-colors cursor-pointer">
                                Cancelar
                            </button>
                            <button onClick={handleGuardar}
                                className="px-6 py-2 rounded-xl bg-amber-600 text-white text-xs font-black uppercase tracking-wider hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition-all cursor-pointer flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {editingId ? 'Actualizar Nota / Carta' : 'Guardar Nota / Carta'}
                                {isGobiernoCorporativo && form.juntas.length > 0 && (
                                    <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                        +{form.juntas.length} junta{form.juntas.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
