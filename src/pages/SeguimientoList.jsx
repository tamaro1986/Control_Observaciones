import { useState, useMemo, useRef, useEffect } from 'react';
import { EstadoBadge, Avatar, Pagination, EmptyState, Card } from '../components/ui/SharedComponents';
import { Search, Filter, Calendar, Briefcase, FileText, Trash2, Edit2, ChevronDown, Check, X, PlusCircle } from 'lucide-react';
import { ESTADOS } from '../data';

const ITEMS_PER_PAGE = 8;

// Reutilizamos el MultiSelect para mantener consistencia visual
function CustomSelect({ label, options, selected, onChange, placeholder = "Todos", icon: Icon }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                {label}
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`h-12 w-full px-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3
                    ${isOpen ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-500/10 ring-4 ring-indigo-500/5' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'}`}
            >
                {Icon && <Icon className={`w-4 h-4 ${isOpen ? 'text-indigo-600' : 'text-slate-400'}`} />}
                <span className={`text-sm font-bold truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
                    {selected ? (typeof selected === 'object' ? selected.nombre : selected) : placeholder}
                </span>
                <svg className={`w-4 h-4 text-slate-400 ml-auto transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-3xl shadow-2xl z-30 max-h-72 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div
                            onClick={() => { onChange(null); setIsOpen(false); }}
                            className="px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-50 text-slate-500 text-sm font-bold transition-colors mb-1"
                        >
                            Todos
                        </div>
                        {options.map(opt => {
                            const val = typeof opt === 'string' ? opt : opt.nombre || opt.id;
                            const isSelected = selected === opt || selected?.id === opt.id;
                            return (
                                <div
                                    key={opt.id || val}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all mb-1
                                        ${isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                    <span className="text-sm">{val}</span>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default function SeguimientoList({ observaciones, onSelectObservacion, onNuevoWithEntity, eliminarObservacion, editarObservacion, filtrar, catalogos, entidades }) {
    const [keyword, setKeyword] = useState('');
    const [entidad, setEntidad] = useState(null);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [estado, setEstado] = useState(null);
    const [selectedFondo, setSelectedFondo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (id, e) => {
        if (e) e.stopPropagation();
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const [editingResponsable, setEditingResponsable] = useState(null);
    const [nuevoResponsable, setNuevoResponsable] = useState('');

    const handleEditResponsable = (e, obs) => {
        e.stopPropagation();
        setEditingResponsable(obs.id);
        setNuevoResponsable(obs.responsable || '');
    };

    const handleSaveResponsable = async (e, id) => {
        e.stopPropagation();
        await editarObservacion(id, { responsable: nuevoResponsable });
        setEditingResponsable(null);
    };

    const handleCancelResponsable = (e) => {
        e.stopPropagation();
        setEditingResponsable(null);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await eliminarObservacion(id);
    };

    const filtrados = useMemo(() => {
        return filtrar({
            keyword: keyword || undefined,
            entidadIds: entidad ? [entidad.id] : undefined,
            fechaInicio: fechaDesde || undefined,
            fechaFin: fechaHasta || undefined,
            estados: estado ? [estado] : undefined,
            fondo: selectedFondo || undefined
        });
    }, [filtrar, keyword, entidad, fechaDesde, fechaHasta, estado, selectedFondo]);

    const paginatedResults = useMemo(() => {
        return filtrados.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [filtrados, currentPage]);

    const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE);

    return (
        <div className="max-w-400 mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header with quick stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Seguimiento de Hallazgos</h2>
                    <p className="text-sm text-slate-400 font-medium">Gestione y documente las acciones de subsanación</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNuevoWithEntity(entidad?.id)}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-2 group"
                    >
                        <PlusCircle className="w-4 h-4 text-emerald-400 group-hover:rotate-90 transition-transform duration-500" />
                        Agregar Observación
                    </button>
                    <div className="px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {filtrados.length} Resultados encontrados
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Bar - Premium Design */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {/* Search */}
                    <div className="xl:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                            Búsqueda Directa
                        </label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Ref, palabra clave..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="h-12 w-full pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    {/* Entidad */}
                    <CustomSelect
                        label="Sujeto Supervisado"
                        options={entidades || []}
                        selected={entidad}
                        onChange={(val) => { setEntidad(val); setCurrentPage(1); }}
                        icon={Briefcase}
                    />

                    {/* Fondo de Inversión */}
                    <CustomSelect
                        label="Fondo de Inversión"
                        options={catalogos?.fondosInversion || []}
                        selected={selectedFondo}
                        onChange={(val) => { setSelectedFondo(val); setCurrentPage(1); }}
                        icon={FileText}
                    />

                    {/* Fecha Desde */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                            Desde (Apertura)
                        </label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => { setFechaDesde(e.target.value); setCurrentPage(1); }}
                                className="h-12 w-full pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-700 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Fecha Hasta */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                            Hasta
                        </label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => { setFechaHasta(e.target.value); setCurrentPage(1); }}
                                className="h-12 w-full pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-700 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Estado */}
                    <CustomSelect
                        label="Estado de Hallazgo"
                        options={catalogos?.estados || ESTADOS.map(e => e.value)}
                        selected={estado}
                        onChange={(val) => { setEstado(val); setCurrentPage(1); }}
                        icon={FileText}
                    />
                </div>
            </div>

            {/* Content List */}
            {paginatedResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                    {paginatedResults.map((obs) => {
                        const isExpanded = expandedRows.has(obs.id);
                        const entidadObj = entidades.find(e => String(e.id) === String(obs.entidadId));
                        const entidadNombre = entidadObj?.nombre || 'Sin entidad';
                        const lastHistorial = obs.historialEstados?.length > 0
                            ? obs.historialEstados[obs.historialEstados.length - 1]
                            : null;

                        return (
                        <Card
                            key={obs.id}
                            className={`bg-white transition-all duration-300 border overflow-hidden relative ${isExpanded ? 'border-indigo-300 shadow-xl shadow-indigo-500/10' : 'border-slate-100/60 hover:border-indigo-200 hover:shadow-lg group'}`}
                        >
                            {/* ─── COMPACT ROW (always visible) ─── */}
                            <div 
                                className="flex flex-col xl:flex-row xl:items-center gap-3 px-5 py-3 cursor-pointer select-none transition-colors hover:bg-slate-50/60"
                                onClick={(e) => toggleRow(obs.id, e)}
                            >
                                {/* Col 1: Entity + Title */}
                                <div className="flex-1 min-w-0 pr-4">
                                    <span className="block text-xs font-bold text-slate-500 truncate mb-0.5" title={entidadNombre}>
                                        {entidadNombre}
                                    </span>
                                    <h3 className={`text-[13px] font-medium leading-snug truncate transition-colors ${isExpanded ? 'text-indigo-700 font-bold' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                                        {obs.titulo}
                                    </h3>
                                </div>

                                {/* Col 2: Responsable */}
                                <div className="flex items-center gap-2 shrink-0 w-full sm:w-40 xl:w-48">
                                    <Avatar nombre={obs.responsable || "S A"} size="xs" />
                                    <span className="text-xs font-bold text-slate-700 truncate" title={obs.responsable || 'Sin Asignar'}>
                                        {obs.responsable || 'Sin Asignar'}
                                    </span>
                                </div>

                                {/* Col 3: Riesgo Origen (Compact, Dynamic style) */}
                                <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-28 xl:w-32">
                                    {(() => {
                                        // Estilos dinámicos para Tipo de Riesgo
                                        const riesgoStyles = {
                                            'Operacional': 'text-blue-600',
                                            'Liquidez': 'text-cyan-600',
                                            'LA/FT/PADM': 'text-rose-600',
                                            'Legal': 'text-violet-600',
                                            'Crédito': 'text-emerald-600',
                                            'Mercado': 'text-fuchsia-600',
                                            'Cumplimiento': 'text-amber-600'
                                        };
                                        const textColor = riesgoStyles[obs.tipoRiesgo] || 'text-slate-600';
                                        
                                        return (
                                            <>
                                                <svg className={`w-4 h-4 ${textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                                <span className={`text-[11px] font-bold uppercase truncate ${textColor}`}>{obs.tipoRiesgo || 'No definido'}</span>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Col 4: Estado (dinámico del catálogo) */}
                                <div className="flex items-center shrink-0 w-full sm:w-36 xl:w-44">
                                    <EstadoBadge estado={obs.estado} />
                                </div>

                                {/* Col 5: Actions */}
                                <div className="shrink-0 flex items-center justify-end gap-2 w-16">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(e, obs.id);
                                        }}
                                        className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                        title="Eliminar observación"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-600 font-bold' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                </div>

                                {/* Mobile Chevron (positioned absolutely) */}
                                <div className="xl:hidden absolute right-4 top-4">
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
                                </div>
                            </div>

                            {/* ─── EXPANDED ACCORDION (click to reveal all narrative detail) ─── */}
                            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="px-5 pb-5 pt-3 border-t border-slate-100/80 bg-linear-to-b from-slate-50/60 to-white">

                                        {/* Narrative Detail Sections */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                                            {/* 1. Detalle Narrativo */}
                                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5 text-indigo-400" /> Detalle Narrativo
                                                </h4>
                                                <p className="text-[13px] text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                                                    {obs.descripcion || '—  Sin detalle registrado.'}
                                                </p>
                                            </div>

                                            {/* 2. Normativa Aplicable */}
                                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    Normativa Aplicable
                                                </h4>
                                                <p className="text-[13px] text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                                                    {obs.normativa || '—  Sin normativa declarada.'}
                                                </p>
                                            </div>

                                            {/* 3. Respuesta de la Entidad */}
                                            <div className="bg-blue-50/40 rounded-2xl border border-blue-100/60 shadow-sm p-4">
                                                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    Respuesta de la Entidad
                                                </h4>
                                                <p className="text-[13px] text-blue-800/80 font-medium leading-relaxed italic whitespace-pre-line">
                                                    {obs.respuestaEntidad || lastHistorial?.respuestaEntidad || '—  Sin respuesta registrada.'}
                                                </p>
                                                {(obs.fechaRespuesta || lastHistorial?.fechaRespuesta) && (
                                                    <span className="inline-block mt-2 text-[10px] font-bold text-blue-500 bg-blue-100/60 px-2 py-0.5 rounded-lg">
                                                        Fecha: {new Date(obs.fechaRespuesta || lastHistorial?.fechaRespuesta).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* 4. Contenido Oficial */}
                                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                    Contenido Oficial
                                                </h4>
                                                <p className="text-[13px] text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                                                    {obs.nota || '—  Sin contenido oficial.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 5. Análisis de Seguimiento (from latest historial entry) */}
                                        {lastHistorial?.analisisAuditor && (
                                            <div className="bg-violet-50/40 rounded-2xl border border-violet-100/60 shadow-sm p-4 mb-5">
                                                <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                    Análisis de Seguimiento (Último Ciclo)
                                                </h4>
                                                <p className="text-[13px] text-violet-800/80 font-medium leading-relaxed whitespace-pre-line">
                                                    {lastHistorial.analisisAuditor}
                                                </p>
                                                {lastHistorial.fecha && (
                                                    <span className="inline-block mt-2 text-[10px] font-bold text-violet-500 bg-violet-100/60 px-2 py-0.5 rounded-lg">
                                                        Fecha: {new Date(lastHistorial.fecha).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Meta chips + Action row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                                            {/* Left: Compact meta info chips */}
                                            <div className="flex flex-wrap gap-2">
                                                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-500">Apertura: {new Date(obs.fechaApertura || obs.fechaInicio).toLocaleDateString()}</span>
                                                </div>
                                                {obs.nroInforme && (
                                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
                                                        <FileText className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-500">Ref: {obs.nroInforme}</span>
                                                    </div>
                                                )}
                                                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
                                                    <Avatar nombre={obs.responsable || "S A"} size="xs" />
                                                    <span className="text-[10px] font-bold text-slate-500">{obs.responsable || 'Sin Asignar'}</span>
                                                    <button 
                                                        className="p-0.5 rounded text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                                        onClick={(e) => handleEditResponsable(e, obs)}
                                                        title="Cambiar responsable"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                {/* Inline edit for responsible */}
                                                {editingResponsable === obs.id && (
                                                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-lg border border-slate-200">
                                                        <select
                                                            value={nuevoResponsable}
                                                            onChange={(e) => setNuevoResponsable(e.target.value)}
                                                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 py-1.5 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            {catalogos?.responsables?.map((resp, i) => (
                                                                <option key={i} value={typeof resp === 'string' ? resp : (resp.nombre || resp.value)}>
                                                                    {typeof resp === 'string' ? resp : (resp.nombre || resp.value)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button onClick={(e) => handleSaveResponsable(e, obs.id)} className="p-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg shrink-0">
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={handleCancelResponsable} className="p-1.5 bg-slate-400 text-white hover:bg-slate-500 rounded-lg shrink-0">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Action Buttons */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectObservacion(obs.id);
                                                    }}
                                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                    Seguimiento
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDelete(e, obs.id)}
                                                    className="px-3 py-2.5 rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </Card>
                    )})}
                </div>
            ) : (
                <EmptyState
                    title="No se encontraron hallazgos"
                    description="Ajuste los filtros de búsqueda para encontrar lo que necesita."
                />
            )}

            {totalPages > 1 && (
                <div className="pt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
}
