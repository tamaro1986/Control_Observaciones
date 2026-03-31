import React, { useState, useMemo } from 'react';
import { Card, Avatar } from '../components/SharedComponents.jsx';
import { getNextCorrelativo, formatDate } from '../data/data.js';
import { FileText, Users, Award, Shield, Briefcase, Globe, Activity, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

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
    esInterno: false,
    blfOtro: '',
    fecha: new Date().toISOString().slice(0, 10),
    normas: [],
    cantidadUnidades: 1,
    clasificacion: '',
    industria: '',
    tipoInforme: '',
    accionSupervision: 'In Situ',
    descripcionAccion: '',
    responsable: '',
    asunto: '',
    entidad: '',
    anulado: false,
    esVehiculoInversion: false,
    fondoInversion: '',
};

export default function Correlativos({ correlativos, onAgregarCorrelativo, onEliminarCorrelativo, onEditarCorrelativo, catalogos = {} }) {
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

    const años = useMemo(() => {
        const set = [...new Set(correlativos.map(c => c.año))].sort().reverse();
        return set;
    }, [correlativos]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return correlativos.filter(c => {
            if (!c) return false;
            const codeStr = (c.codigo || '').toLowerCase();
            const asntStr = (c.asunto || '').toLowerCase();
            const entStr = (c.entidad || '').toLowerCase();
            const respStr = (c.responsable || '').toLowerCase();
            const yearStr = String(c.año || '');
            
            const matchQ = !q ||
                codeStr.includes(q) ||
                entStr.includes(q) ||
                respStr.includes(q) ||
                yearStr.includes(q) ||
                (c.normas && c.normas.some(n => (n.codigo || '').toLowerCase().includes(q) || (n.nombre || '').toLowerCase().includes(q))) ||
                (c.codigoNorma && c.codigoNorma.toLowerCase().includes(q)) ||
                asntStr.includes(q);
                
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
        setForm(f => ({ ...f, [key]: val }));
    }

    function handleOpenEdit(corr) {
        setForm({
            ...corr,
            normas: corr.normas || (corr.codigoNorma ? [{ codigo: corr.codigoNorma, nombre: corr.nombreNorma }] : [])
        });
        setEditingId(corr.id);
        setShowForm(true);
    }

    async function handleGuardar() {
        if (!form.anulado) {
            if (form.esInterno) {
                if (!form.fecha || !form.tipoInforme || !form.responsable || !form.asunto) {
                    alert('Por favor complete los campos obligatorios para el informe interno (Fecha, Tipo, Responsable, Asunto).');
                    return;
                }
            } else {
                if (!form.fecha || !form.clasificacion || !form.industria || !form.tipoInforme || !form.responsable || !form.entidad) {
                    alert('Por favor complete los campos obligatorios marcados con *.');
                    return;
                }
            }
        }

        try {
            if (editingId) {
                await onEditarCorrelativo({ ...form, id: editingId, cantidadUnidades: Number(form.cantidadUnidades) });
            } else {
                const yearVal = form.fecha ? new Date(form.fecha + 'T00:00:00').getFullYear() : new Date().getFullYear();
                const { codigo, numero, año } = getNextCorrelativo(correlativos, yearVal);
                const nuevo = { ...form, id: `corr-${Date.now()}`, codigo, numero, año, cantidadUnidades: Number(form.cantidadUnidades) };
                await onAgregarCorrelativo(nuevo);
                alert('Correlativo guardado exitosamente.');
            }

            setForm(emptyForm);
            setEditingId(null);
            setShowForm(false);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error saving correlativo:", error);
            alert("Ocurrió un error al guardar el correlativo. Por favor intente de nuevo.");
        }
    }

    const stats = useMemo(() => {
        const statsCorrelativos = correlativos.filter(c => !c.esInterno && !c.anulado);

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

        const getTopNormas = (arr, limit = 5) => {
            const counts = {};
            arr.forEach(curr => {
                const normasDelDoc = curr.normas && curr.normas.length > 0
                    ? curr.normas
                    : (curr.codigoNorma ? [{ codigo: curr.codigoNorma }] : []);

                if (normasDelDoc.length === 0) {
                    counts['N/A'] = (counts['N/A'] || 0) + 1;
                } else {
                    normasDelDoc.forEach(n => {
                        const val = n.codigo;
                        counts[val] = (counts[val] || 0) + 1;
                    });
                }
            });
            return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
        };

        return {
            total: statsCorrelativos.length,
            esteAño: statsCorrelativos.filter(c => c.año === new Date().getFullYear()).length,
            porTipo: getTop(statsCorrelativos, 'tipoInforme'),
            porNorma: getTopNormas(statsCorrelativos),
            porResponsable: getTop(statsCorrelativos, 'responsable'),
            totalUnidades: statsCorrelativos.reduce((a, c) => a + (Number(c.cantidadUnidades) || 1), 0),
        };
    }, [correlativos]);

    return (
        <div className="max-w-[1700px] mx-auto space-y-4 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 shadow-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-primary tracking-tight">Correlativos de Informes — DSFIT</h2>
                            <p className="text-xs font-medium text-text-muted">Control correlativo de informes y memorandos emitidos</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-primary shadow-xl transition-all duration-300 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Correlativo
                </button>
            </div>

            {/* Dashboard Visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
                <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FileText className="w-20 h-20" />
                    </div>
                    <p className="text-3xl font-black mb-1">{stats.total}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registros Totales</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full">{stats.esteAño} en {new Date().getFullYear()}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top 3 Categorías</p>
                    <div className="space-y-3 flex-1">
                        {stats.porTipo.slice(0, 3).map(([name, count]) => (
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Normas Frecuentes</p>
                    <div className="space-y-3 flex-1">
                        {stats.porNorma.slice(0, 3).map(([name, count]) => (
                            <div key={name}>
                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                    <span className="text-slate-600 truncate mr-2">{name}</span>
                                    <span className="text-slate-900">{count}</span>
                                </div>
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / (stats.total || 1)) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Distribución Unidades</p>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <p className="text-3xl font-black text-slate-800">
                            {stats.totalUnidades}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total Unidades Auditadas</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="!p-0 overflow-visible">
                <div className="px-4 py-3 flex flex-wrap gap-3 items-center border-b border-border bg-slate-50/50">
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
                        { label: 'Clasificación', value: filterClasif, set: v => { setFilterClasif(v); setCurrentPage(1); }, options: (catalogos.clasificaciones || []).map(c => ({ value: c, label: c })) },
                        { label: 'Industria', value: filterIndust, set: v => { setFilterIndust(v); setCurrentPage(1); }, options: (catalogos.industrias || []).map(i => ({ value: i, label: i })) },
                        { label: 'Acción', value: filterAccion, set: v => { setFilterAccion(v); setCurrentPage(1); }, options: (catalogos.accionesSupervision || []).map(a => ({ value: a, label: a })) },
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
                                {['#', 'Código', 'Fecha', 'Norma', 'Uds.', 'Clasificación', 'Industria', 'Tipo Informe', 'Acción', 'Responsable', 'Entidad', 'Acciones'].map(h => (
                                    <th key={h} className={`py-2.5 px-3 text-[10px] font-black text-text-muted uppercase tracking-[0.12em] bg-slate-50/70 border-b border-border whitespace-nowrap ${h === 'Acciones' ? 'text-center' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr><td colSpan={12} className="py-16 text-center text-sm text-text-muted font-medium">No se encontraron correlativos</td></tr>
                            ) : paginated.map((c, idx) => (
                                <React.Fragment key={c.id}>
                                    <tr
                                        className={`group cursor-pointer transition-colors ${expandedRow === c.id ? 'bg-slate-50' : 'hover:bg-primary/[0.02]'}`}
                                    >
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            <span className="text-[10px] font-black text-slate-300">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 align-middle whitespace-nowrap" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-xs font-black tracking-tight ${c.anulado ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{c.codigo}</span>
                                                {c.anulado && <span className="bg-rose-50 text-rose-500 text-[8px] font-black px-1 rounded uppercase tracking-tighter ring-1 ring-rose-100">Anulado</span>}
                                            </div>
                                            {c.blfOtro && <div className="text-[9px] text-slate-400 font-medium">{c.blfOtro}</div>}
                                        </td>
                                        <td className="py-2 px-3 align-middle whitespace-nowrap" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            <span className="text-[10px] font-bold text-text-secondary">{formatDate(c.fecha)}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            {c.normas && c.normas.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {c.normas.map((n, i) => (
                                                        <div key={i}>
                                                            <span className="text-[10px] font-black text-text-primary">{n.codigo}</span>
                                                            <p className="text-[9px] text-slate-400 max-w-[140px] truncate" title={n.nombre}>{n.nombre}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="text-[10px] font-black text-text-primary">{c.codigoNorma || '—'}</span>
                                                    <p className="text-[9px] text-slate-400 max-w-[140px] truncate">{c.nombreNorma || ''}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 px-3 align-middle text-center" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            <span className="text-xs font-black text-text-primary">{c.cantidadUnidades}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            <span className={getCategoryStyle(c.clasificacion)}>
                                                {c.clasificacion}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            <span className={getCategoryStyle(c.industria)}>
                                                {c.industria}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                                                    {c.tipoInforme}
                                                    {c.esInterno && <span className="ml-1.5 bg-indigo-50 text-indigo-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ring-1 ring-indigo-100">Interno</span>}
                                                </span>
                                                {c.esVehiculoInversion && c.fondoInversion && (
                                                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter mt-0.5">
                                                        {c.fondoInversion}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${ACCION_COLOR[c.accionSupervision] || 'bg-slate-100 text-slate-600'}`}>
                                                {c.accionSupervision}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 align-middle" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            <div className="flex items-center gap-1.5">
                                                <Avatar nombre={c.responsable} size="xs" />
                                                <span className="text-[10px] font-bold text-text-primary whitespace-nowrap">{c.responsable?.split(' ').slice(0, 2).join(' ')}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 align-middle max-w-[180px]" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                            <span className="text-[10px] font-bold text-text-primary line-clamp-2">{c.esInterno ? '—' : c.entidad}</span>
                                        </td>
                                        <td className="py-2 px-3 align-middle">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(c); }}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEliminarCorrelativo(c.id); }}
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
                                    {expandedRow === c.id && (
                                        <tr key={`${c.id}-exp`} className="bg-slate-50 border-b border-slate-100">
                                            <td colSpan={12} className="px-6 py-4">
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
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

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
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{editingId ? 'Editando Registro' : 'Nuevo Registro'}</p>
                                <p className="text-sm font-black text-white">
                                    {editingId ? form.codigo : getNextCorrelativo(correlativos, new Date(form.fecha + 'T00:00:00').getFullYear()).codigo}
                                </p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm cursor-pointer transition-colors">✕</button>
                        </div>

                        {/* Scrollable form body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">

                            {/* Toggle Es Interno */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Procedencia del Registro</p>
                                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                                        {form.esInterno ? 'Registro Interno (No se contemplará en las estadísticas globales)' : 'Entidades / Externo (Registro de supervisión regular)'}
                                    </p>
                                </div>
                                <div className="flex bg-slate-200/50 p-1 rounded-lg shrink-0">
                                    <button
                                        onClick={() => handleField('esInterno', false)}
                                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${!form.esInterno ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Entidades
                                    </button>
                                    <button
                                        onClick={() => handleField('esInterno', true)}
                                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${form.esInterno ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Uso Interno
                                    </button>
                                </div>
                            </div>

                            {/* Row 1 */}
                            <div className={`grid gap-4 ${form.esInterno ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-3'}`}>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Fecha *</label>
                                    <input type="date" value={form.fecha} onChange={e => handleField('fecha', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50" />
                                </div>
                                {!form.esInterno && (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">BLF / Informe Otro</label>
                                            <input type="text" placeholder="ej. 10/02/2026" value={form.blfOtro} onChange={e => handleField('blfOtro', e.target.value)}
                                                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Cat. Unidades</label>
                                            <input type="number" min="1" value={form.cantidadUnidades} onChange={e => handleField('cantidadUnidades', e.target.value)}
                                                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50" />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Row 2 — Normas Multi-Select */}
                            {!form.esInterno && (
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Normativas Aplicables (Puede agregar múltiples) *</label>
                                    <select
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer"
                                        value=""
                                        onChange={(e) => {
                                            const code = e.target.value;
                                            if (!code) return;
                                            const norma = (catalogos.normas || []).find(n => n.codigo === code);
                                            if (norma && (!form.normas || !form.normas.find(n => n.codigo === code))) {
                                                setForm(f => ({ ...f, normas: [...(f.normas || []), norma] }));
                                            }
                                        }}
                                    >
                                        <option value="">— Agregar norma... —</option>
                                        {(catalogos.normas || []).map(n => <option key={n.codigo} value={n.codigo}>{n.codigo} - {n.nombre.substring(0, 60)}{n.nombre.length > 60 ? '...' : ''}</option>)}
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
                            )}

                            {/* Estado Anulado toggle */}
                            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Anular Registro</p>
                                    <p className="text-[9px] font-medium text-rose-400 uppercase tracking-tighter">El registro no se contará en estadísticas globales</p>
                                </div>
                                <button
                                    onClick={() => handleField('anulado', !form.anulado)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.anulado ? 'bg-rose-500' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.anulado ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Row 3 */}
                            {!form.esInterno && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Clasificación *</label>
                                        <select value={form.clasificacion} onChange={e => handleField('clasificacion', e.target.value)}
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                            <option value="">— Seleccionar —</option>
                                            {(catalogos.clasificaciones || []).map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Industria *</label>
                                        <select value={form.industria} onChange={e => handleField('industria', e.target.value)}
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                            <option value="">— Seleccionar —</option>
                                            {(catalogos.industrias || []).map(i => <option key={i}>{i}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Row 4 */}
                            <div className={`grid gap-4 ${form.esInterno ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}`}>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tipo de Informe/Memo *</label>
                                    <select value={form.tipoInforme} onChange={e => {
                                        const val = e.target.value;
                                        handleField('tipoInforme', val);
                                        // Resetear campos si cambia de tipo
                                        if (val !== 'Informe de Planeación') {
                                            handleField('esVehiculoInversion', false);
                                            handleField('fondoInversion', '');
                                        }
                                    }}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                        <option value="">— Seleccionar —</option>
                                        {(catalogos.tiposInforme || []).map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>

                                {/* Lógica de Vehículo de Inversión exclusiva para Informe de Planeación */}
                                {form.tipoInforme === 'Informe de Planeación' && (
                                    <div className="col-span-2 mt-2 p-4 bg-amber-50/50 rounded-xl border border-amber-100 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">¿Es Vehículo de Inversión?</span>
                                                <span className="text-[9px] font-medium text-amber-500 uppercase">Habilitar para informes enfocados en fondos específicos</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newVal = !form.esVehiculoInversion;
                                                    handleField('esVehiculoInversion', newVal);
                                                    if (!newVal) handleField('fondoInversion', '');
                                                }}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.esVehiculoInversion ? 'bg-amber-500' : 'bg-slate-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.esVehiculoInversion ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        {form.esVehiculoInversion && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1.5">Fondo de Inversión *</label>
                                                <select
                                                    value={form.fondoInversion}
                                                    onChange={e => handleField('fondoInversion', e.target.value)}
                                                    className="w-full h-9 px-3 rounded-lg border border-amber-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white cursor-pointer transition-all"
                                                >
                                                    <option value="">— Seleccionar Fondo del Catálogo —</option>
                                                    {catalogos.fondosInversion && catalogos.fondosInversion.map(f => (
                                                        <option key={f.codigo} value={f.nombre}>{f.codigo} - {f.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!form.esInterno && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Acción de Supervisión *</label>
                                        <select value={form.accionSupervision} onChange={e => handleField('accionSupervision', e.target.value)}
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                            {(catalogos.accionesSupervision || []).map(a => <option key={a}>{a}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Row 5 */}
                            <div className={`grid gap-4 ${form.esInterno ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}`}>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Responsable *</label>
                                    <select value={form.responsable} onChange={e => handleField('responsable', e.target.value)}
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                        <option value="">— Seleccionar —</option>
                                        {(catalogos.responsables || []).map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </div>
                                {!form.esInterno && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Entidad *</label>
                                        <select value={form.entidad} onChange={e => handleField('entidad', e.target.value)}
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 cursor-pointer">
                                            <option value="">— Seleccionar —</option>
                                            {(catalogos.entidades || []).map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Descripción acción */}
                            {!form.esInterno && (
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Descripción de la Acción de Supervisión</label>
                                        <select
                                            onChange={e => e.target.value && handleField('descripcionAccion', e.target.value)}
                                            className="text-[9px] font-black uppercase text-primary bg-primary/5 px-2 py-0.5 rounded cursor-pointer border-none outline-none"
                                        >
                                            <option value="">— Cargar Plantilla —</option>
                                            {(catalogos.descripcionesAccion || []).map((d, i) => (
                                                <option key={i} value={d}>{d.substring(0, 40)}...</option>
                                            ))}
                                        </select>
                                    </div>
                                    <textarea rows={2} placeholder="Describa brevemente la acción supervisora realizada…"
                                        value={form.descripcionAccion} onChange={e => handleField('descripcionAccion', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-slate-200 text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 resize-none" />
                                </div>
                            )}

                            {/* Asunto */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Asunto del Informe / Memo {form.esInterno && '*'}</label>
                                <textarea rows={4} placeholder="Redacte el asunto completo del informe o memorándum…"
                                    value={form.asunto} onChange={e => handleField('asunto', e.target.value)}
                                    className="w-full p-3 rounded-lg border border-slate-200 text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 resize-none" />
                            </div>
                        </div>

                        {/* Panel footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
                            <button onClick={() => { setShowForm(false); setEditingId(null); }}
                                className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-text-secondary hover:border-slate-400 transition-colors cursor-pointer">
                                Cancelar
                            </button>
                            <button onClick={handleGuardar}
                                className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider hover:bg-primary shadow-lg transition-all cursor-pointer flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                {editingId ? 'Actualizar Correlativo' : 'Guardar Correlativo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
