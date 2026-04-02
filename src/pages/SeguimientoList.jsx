import { useState, useMemo, useRef, useEffect } from 'react';
import { RiskBadge, EstadoBadge, Avatar, Pagination, EmptyState, Card } from '../components/ui/SharedComponents';
import { Search, Filter, Calendar, Briefcase, FileText, Trash2, Edit2, ChevronDown, Check, X } from 'lucide-react';
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

export default function SeguimientoList({ observaciones, onSelectObservacion, eliminarObservacion, editarObservacion, filtrar, catalogos, entidades }) {
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
                <div className="grid grid-cols-1 gap-4">
                    {paginatedResults.map((obs) => {
                        const isExpanded = expandedRows.has(obs.id);
                        return (
                        <Card
                            key={obs.id}
                            className={`bg-white transition-all duration-300 border overflow-hidden ${isExpanded ? 'border-indigo-300 shadow-xl shadow-indigo-500/10' : 'border-slate-100/60 hover:border-indigo-200 hover:shadow-lg group'}`}
                        >
                            {/* Header / Main Compact Row */}
                            <div 
                                className="flex flex-col xl:flex-row xl:items-center gap-4 p-4 lg:p-5 cursor-pointer select-none group-hover:bg-slate-50/40 transition-colors"
                                onClick={(e) => toggleRow(obs.id, e)}
                            >
                                {/* Part 1: Redesigned Status & Title */}
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <RiskBadge nivel={obs.nivelRiesgo} />
                                        <EstadoBadge estado={obs.estado} />
                                        {(obs.numReferencia && obs.numReferencia !== 'S/R') && (
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline-block border-l border-slate-200 pl-2">
                                                {obs.numReferencia}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`text-[15px] leading-tight font-black truncate transition-colors ${isExpanded ? 'text-indigo-700' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                                        {obs.titulo}
                                    </h3>
                                </div>
                                
                                {/* Part 2: Entity & Responsable explicitly on the row */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-5 xl:gap-8 shrink-0 border-t xl:border-t-0 pt-4 xl:pt-0 border-slate-100">
                                    
                                    {/* Entidad */}
                                    <div className="flex items-center gap-3 w-full sm:w-48 xl:w-56">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-50/80 flex items-center justify-center shrink-0 border border-indigo-100/50 text-indigo-500">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Entidad Involucrada</span>
                                            <span className="text-xs font-bold text-slate-700 truncate" title={obs.entidadNombre}>{obs.entidadNombre}</span>
                                        </div>
                                    </div>

                                    {/* Responsable */}
                                    <div className="flex items-center gap-3 w-full sm:w-48 xl:w-56">
                                        <div className="shrink-0 flex border border-slate-200 p-0.5 rounded-full">
                                           <Avatar name={obs.responsable || "S A"} size="sm" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Responsable</span>
                                            <span className="text-xs font-bold text-slate-700 truncate" title={obs.responsable || "Sin Asignar"}>{obs.responsable || "Sin Asignar"}</span>
                                        </div>
                                    </div>

                                    {/* Chevron Expander */}
                                    <div className="shrink-0 flex items-center justify-end sm:w-auto absolute right-4 top-4 xl:static">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-indigo-600 text-white rotate-180 shadow-md shadow-indigo-500/20' : 'bg-slate-50 border border-slate-200 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200'}`}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Content Area */}
                            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="p-5 pt-2 border-t border-slate-100/60 bg-slate-50/30">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            
                                            {/* Left Col: Details */}
                                            <div className="lg:col-span-2 space-y-4">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> Descripción del Hallazgo</h4>
                                                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                                        {obs.observacion}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                     <div className="bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2.5">
                                                          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0"><Calendar className="w-4 h-4" /></div>
                                                          <div>
                                                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight">Apertura</p>
                                                              <p className="text-xs font-bold text-slate-700 leading-tight">{new Date(obs.fechaApertura || obs.fechaInicio).toLocaleDateString()}</p>
                                                          </div>
                                                     </div>
                                                     {obs.fondoInversion && (
                                                     <div className="bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2.5">
                                                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><Briefcase className="w-4 h-4" /></div>
                                                          <div className="min-w-0">
                                                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight">Fondo de Invers.</p>
                                                              <p className="text-xs font-bold text-slate-700 leading-tight truncate max-w-37.5">{typeof obs.fondoInversion === 'object' && obs.fondoInversion !== null ? (obs.fondoInversion.nombre || obs.fondoInversion.codigo) : (obs.fondoInversion || 'AUDITORÍA DIRECTA')}</p>
                                                          </div>
                                                     </div>
                                                     )}
                                                     <div className="bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2.5">
                                                          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0"><FileText className="w-4 h-4" /></div>
                                                          <div className="min-w-0">
                                                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight">Ref / Sección</p>
                                                              <p className="text-xs font-bold text-slate-700 leading-tight truncate max-w-30">{obs.seccionId || obs.numReferencia}</p>

                                                          </div>
                                                     </div>
                                                </div>
                                            </div>

                                            {/* Right Col: Entity & Actions */}
                                            <div className="space-y-4">
                                                {/* Entity Filter Card */}
                                                <div>
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5"/> Entidad y Responsable</h4>
                                                    
                                                    <div className="w-full flex items-start text-left group/entity relative overflow-hidden premium-card p-4 rounded-2xl bg-white border border-slate-200 transition-all shadow-sm">
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xs font-black text-slate-800 truncate block">
                                                                    {obs.entidadNombre}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between group/resp">
                                                                    <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                                                                        <Avatar name={obs.responsable} size="sm" /> 
                                                                        <span className="text-[11px] font-bold text-slate-600 truncate">{obs.responsable || "Sin Asignar"}</span>
                                                                    </div>
                                                                    <button 
                                                                        className="shrink-0 p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all opacity-100 lg:opacity-0 group-hover/entity:opacity-100"
                                                                        onClick={(e) => handleEditResponsable(e, obs)}
                                                                        title="Cambiar Responsable"
                                                                    >
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                                
                                                                {/* Edit Overlay */}
                                                                {editingResponsable === obs.id && (
                                                                    <div onClick={(e) => e.stopPropagation()} className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm p-3 flex flex-col justify-center gap-2">
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reasignar:</span>
                                                                        <div className="flex items-center gap-1">
                                                                            <select
                                                                                value={nuevoResponsable}
                                                                                onChange={(e) => setNuevoResponsable(e.target.value)}
                                                                                className="flex-1 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 py-1.5 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                            >
                                                                                <option value="">Seleccionar...</option>
                                                                                {catalogos?.responsables?.map((resp, i) => (
                                                                                    <option key={i} value={typeof resp === 'string' ? resp : (resp.nombre || resp.value)}>
                                                                                        {typeof resp === 'string' ? resp : (resp.nombre || resp.value)}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <button onClick={(e) => handleSaveResponsable(e, obs.id)} className="p-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg shrink-0">
                                                                                <Check className="w-4 h-4" />
                                                                            </button>
                                                                            <button onClick={handleCancelResponsable} className="p-1.5 bg-slate-500 text-white hover:bg-slate-600 rounded-lg shrink-0">
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Filter trigger side-button */}
                                                        <div className="absolute right-0 top-0 bottom-0 w-12 border-l border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center group-hover/entity:bg-indigo-50 transition-colors">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const clickedEntity = entidades.find(e => e.id === obs.entidadId);
                                                                    if (clickedEntity) {
                                                                        setEntidad(clickedEntity);
                                                                        // Usually "Pendiente" is used for pending issues.
                                                                        setEstado("Pendiente");
                                                                        setCurrentPage(1);
                                                                    }
                                                                }}
                                                                className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 group-hover/entity:text-indigo-600 transition-colors"
                                                                title="Filtrar pendientes por entidad"
                                                            >
                                                                <Filter className="w-4 h-4" />
                                                                <span className="text-[8px] font-black writing-vertical-lr uppercase tracking-widest text-transparent group-hover/entity:text-indigo-400 mt-1 transition-all">Solo Pendientes</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div>
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"><Edit2 className="w-3.5 h-3.5"/> Documentar Avances</h4>
                                                    <div className="flex flex-col gap-2.5">
                                                         <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onSelectObservacion(obs.id);
                                                            }}
                                                            className="w-full py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
                                                         >
                                                             <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Realizar Seguimiento
                                                         </button>
                                                         
                                                         <button 
                                                            onClick={(e) => handleDelete(e, obs.id)}
                                                            className="w-full py-2.5 rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 group/del"
                                                         >
                                                             <Trash2 className="w-3.5 h-3.5 group-hover/del:scale-110 transition-transform" /> Eliminar Observación
                                                         </button>
                                                    </div>
                                                </div>
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
