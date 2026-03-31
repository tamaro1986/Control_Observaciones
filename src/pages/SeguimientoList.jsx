import { useState, useMemo, useRef, useEffect } from 'react';
import { RiskBadge, EstadoBadge, Avatar, Pagination, EmptyState, Card } from '../components/SharedComponents';
import { Search, Filter, Calendar, Briefcase, FileText, Trash2, Edit2, ChevronDown, Check, X } from 'lucide-react';
import { ESTADOS } from '../data/data';

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
                        options={ESTADOS}
                        selected={estado}
                        onChange={(val) => { setEstado(val); setCurrentPage(1); }}
                        icon={FileText}
                    />
                </div>
            </div>

            {/* Content List */}
            {paginatedResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {paginatedResults.map((obs) => (
                        <Card
                            key={obs.id}
                            className="bg-white hover:border-indigo-200 transition-all hover:shadow-2xl hover:shadow-indigo-500/5 group"
                            onClick={() => onSelectObservacion(obs.id)}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-1">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-widest ring-4 ring-indigo-500/5">
                                            {obs.numReferencia}
                                        </span>
                                        <RiskBadge nivel={obs.nivelRiesgo} />
                                        <EstadoBadge estado={obs.estado} />
                                        {obs.fondoInversion && (
                                            <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 uppercase tracking-widest">
                                                {typeof obs.fondoInversion === 'object' && obs.fondoInversion !== null ? (obs.fondoInversion.nombre || obs.fondoInversion.codigo) : (obs.fondoInversion || 'AUDITORÍA DIRECTA')}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {obs.seccionId}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 mb-2 truncate group-hover:text-indigo-700 transition-colors">
                                        {obs.titulo}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-1 mb-4 leading-relaxed font-medium">
                                        {obs.observacion}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                                {obs.entidadNombre}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                                Apertura: {new Date(obs.fechaApertura || obs.fechaInicio).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-50">
                                    {/* Action Buttons */}
                                    <div className="flex flex-row items-center gap-1 mr-4">
                                         <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectObservacion(obs.id);
                                            }}
                                            className="p-2.5 rounded-xl bg-indigo-50/50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            title="Editar hallazgo completo"
                                         >
                                             <Edit2 className="w-4 h-4" />
                                         </button>
                                         <button 
                                            onClick={(e) => handleDelete(e, obs.id)}
                                            className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            title="Eliminar hallazgo"
                                         >
                                             <Trash2 className="w-4 h-4" />
                                         </button>
                                    </div>

                                    {/* Responsable Area */}
                                    <div className="flex flex-col items-end gap-1 min-w-35">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                            Responsable
                                            {editingResponsable !== obs.id && (
                                                <button onClick={(e) => handleEditResponsable(e, obs)} className="text-slate-300 hover:text-indigo-600 p-0.5 rounded-md hover:bg-indigo-50" title="Editar Responsable">
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </span>
                                        {editingResponsable === obs.id ? (
                                            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 w-full bg-slate-50 p-1 rounded-xl shadow-inner border border-slate-200">
                                                <select
                                                    value={nuevoResponsable}
                                                    onChange={(e) => setNuevoResponsable(e.target.value)}
                                                    className="w-full bg-white text-xs font-bold text-slate-700 py-1.5 px-2 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {catalogos?.responsables?.map((resp, i) => (
                                                        <option key={i} value={typeof resp === 'string' ? resp : (resp.nombre || resp.value)}>
                                                            {typeof resp === 'string' ? resp : (resp.nombre || resp.value)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button onClick={(e) => handleSaveResponsable(e, obs.id)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={handleCancelResponsable} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Avatar name={obs.responsable} />
                                        )}
                                    </div>

                                    {/* Arrow Navigation */}
                                    <button
                                        className="w-10 h-10 ml-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm group/btn shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectObservacion(obs.id);
                                        }}
                                        title="Abrir seguimiento"
                                    >
                                        <svg className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
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
