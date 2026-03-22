import { useState, useMemo, useEffect } from 'react';
import { NIVELES_RIESGO, ESTADOS } from '../data/data';
import { RiskBadge, EstadoBadge, Avatar, Pagination, EmptyState, Card } from '../components/SharedComponents';

const ITEMS_PER_PAGE = 10;

// Custom MultiSelect Component for Premium Feel
function CustomMultiSelect({ label, options, selected, onChange, placeholder = "Seleccionar..." }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                {label}
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`min-h-[46px] w-full px-4 py-2 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-wrap gap-1.5 items-center 
                    ${isOpen ? 'border-primary bg-white shadow-md ring-4 ring-primary/5' : 'border-border bg-white hover:border-text-muted'}`}
            >
                {selected.length === 0 ? (
                    <span className="text-sm text-text-muted">{placeholder}</span>
                ) : (
                    selected.map(val => (
                        <span key={val} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary text-[11px] font-bold border border-primary/10">
                            {val}
                            <button
                                onClick={(e) => { e.stopPropagation(); onChange(selected.filter(v => v !== val)); }}
                                className="hover:text-primary-dark transition-colors"
                            >×</button>
                        </span>
                    ))
                )}
                <svg className={`w-4 h-4 text-text-muted ml-auto transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto p-2 animate-fade-in">
                        {options.map(opt => {
                            const val = typeof opt === 'string' ? opt : opt.value;
                            const isSelected = selected.includes(val);
                            return (
                                <div
                                    key={val}
                                    onClick={() => {
                                        onChange(isSelected ? selected.filter(v => v !== val) : [...selected, val]);
                                    }}
                                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all mb-1
                                        ${isSelected ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-slate-50 text-text-secondary'}`}
                                >
                                    <span className="text-sm">{val}</span>
                                    {isSelected && (
                                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default function Informes({ observaciones = [], filtrar, getEstadisticas, onSelectObservacion, eliminarObservacion, editarObservacion, catalogos, entidades = [] }) {
    const getEntidadById = (id) => entidades.find(e => String(e.id) === String(id));

    const [entidadSeleccionadas, setEntidadSeleccionadas] = useState([]);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [nivelesRiesgo, setNivelesRiesgo] = useState([]);
    const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterVisible, setIsFilterVisible] = useState(true);

    const resultados = useMemo(() => {
        if (typeof filtrar !== 'function') return observaciones;
        return filtrar({
            entidadIds: entidadSeleccionadas.length > 0 ? entidadSeleccionadas : undefined,
            nivelRiesgo: nivelesRiesgo.length > 0 ? nivelesRiesgo : undefined,
            estados: estadosSeleccionados.length > 0 ? estadosSeleccionados : undefined,
            fechaInicio: fechaInicio || undefined,
            fechaFin: fechaFin || undefined,
            keyword: keyword || undefined,
        });
    }, [filtrar, observaciones, entidadSeleccionadas, nivelesRiesgo, estadosSeleccionados, fechaInicio, fechaFin, keyword]);

    const totalPages = Math.ceil(resultados.length / ITEMS_PER_PAGE);
    const paginatedResults = resultados.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const stats = typeof getEstadisticas === 'function' ? getEstadisticas() : { total: 0, porEstado: {}, porRiesgo: {} };
    const years = [...new Set(observaciones.map(o => o.fechaApertura?.substring(0, 4)).filter(Boolean))].sort().reverse();

    return (
        <div className="max-w-[1600px] mx-auto space-y-4 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-primary tracking-tight">Generador de Informes</h2>
                            <p className="text-sm font-medium text-text-muted">Análisis consolidado de hallazgos y cumplimiento</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => alert('Exportar...')}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border text-xs font-bold text-text-secondary hover:text-primary hover:border-primary hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Exportar Excel
                    </button>
                    <button
                        onClick={() => alert('PDF...')}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-primary shadow-xl shadow-slate-900/10 hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
                    >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Generar PDF
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <Card className="!p-0 overflow-visible">
                <div
                    className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors"
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </div>
                        <span className="text-xs font-black text-text-primary uppercase tracking-widest">Panel de Filtros</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEntidadSeleccionadas([]);
                                setFechaInicio('');
                                setFechaFin('');
                                setNivelesRiesgo([]);
                                setEstadosSeleccionados([]);
                                setKeyword('');
                            }}
                        >
                            Limpiar todo
                        </button>
                        <svg className={`w-4 h-4 text-text-muted transition-transform duration-300 ${isFilterVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {isFilterVisible && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                        <CustomMultiSelect
                            label="Entidades"
                            options={entidades.map(e => e.nombre)}
                            selected={entidadSeleccionadas.map(id => getEntidadById(id)?.nombre).filter(Boolean)}
                            onChange={(names) => setEntidadSeleccionadas(names.map(name => entidades.find(e => e.nombre === name)?.id))}
                            placeholder="Todas las entidades"
                        />
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Desde</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={e => setFechaInicio(e.target.value)}
                                className="w-full h-[46px] px-4 py-2 rounded-2xl border border-border bg-white text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer appearance-none"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Hasta</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={e => setFechaFin(e.target.value)}
                                className="w-full h-[46px] px-4 py-2 rounded-2xl border border-border bg-white text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer appearance-none"
                            />
                        </div>
                        <CustomMultiSelect
                            label="Nivel de Riesgo"
                            options={catalogos.nivelesRiesgo || NIVELES_RIESGO.map(n => n.value)}
                            selected={nivelesRiesgo}
                            onChange={setNivelesRiesgo}
                            placeholder="Todos los riesgos"
                        />
                        <CustomMultiSelect
                            label="Estado"
                            options={catalogos.estados || ESTADOS.map(e => e.value)}
                            selected={estadosSeleccionados}
                            onChange={setEstadosSeleccionados}
                            placeholder="Todos los estados"
                        />
                        <div className="lg:col-span-4 mt-2">
                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">Búsqueda Rápida</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por ID, Responsable o Hallazgo..."
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                    className="w-full h-12 pl-12 pr-6 rounded-2xl border border-border bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Results Table */}
            <Card noPadding className="shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-border">
                                <th className="text-left py-5 px-6 text-[10px] bg-slate-50/50 font-black text-text-muted uppercase tracking-[0.15em]">No.</th>
                                <th className="text-left py-5 px-6 text-[10px] bg-slate-50/50 font-black text-text-muted uppercase tracking-[0.15em]">Entidad & Tipo</th>
                                <th className="text-left py-5 px-6 text-[10px] bg-slate-50/50 font-black text-text-muted uppercase tracking-[0.15em]">Fecha Apertura</th>
                                <th className="text-left py-5 px-4 text-[10px] bg-slate-50/50 font-black text-text-muted uppercase tracking-[0.15em]">Riesgo</th>
                                <th className="text-left py-5 px-6 text-[10px] bg-slate-50/50 font-black text-text-muted uppercase tracking-[0.15em]">Observación</th>
                                <th className="text-left py-5 px-6 text-[10px] bg-slate-50/50 font-black text-text-muted uppercase tracking-[0.15em]">Estado</th>
                                <th className="text-left py-5 px-6 text-[10px] bg-slate-50/50 font-black text-text-muted uppercase tracking-[0.15em]">Responsable</th>
                                <th className="text-center py-5 px-6 text-[10px] bg-slate-50/50 font-black text-text-muted uppercase tracking-[0.15em]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {paginatedResults.length === 0 ? (
                                <tr>
                                    <td colSpan="8">
                                        <EmptyState
                                            title="No hay hallazgos que coincidan"
                                            description="Intenta ajustar los filtros para ver otros resultados."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                paginatedResults.map((obs, idx) => {
                                    const ent = getEntidadById(obs.entidadId);
                                    return (
                                        <tr
                                            key={obs.id}
                                            onClick={() => onSelectObservacion(obs.id)}
                                            className="group hover:bg-primary/[0.02] cursor-pointer transition-colors"
                                        >
                                            <td className="py-2 px-4 align-middle">
                                                <span className="text-xs font-black text-slate-400 group-hover:text-primary transition-colors">
                                                    {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-text-primary">{ent?.nombre?.split(',')[0]}</span>
                                                    {obs.esVehiculoInversion && obs.fondoInversion ? (
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.05em] flex items-center gap-1">
                                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                                            </svg>
                                                            {obs.fondoInversion}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium text-text-muted">{ent?.categoria}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 align-middle">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-bold text-text-secondary">{obs.fechaApertura}</span>
                                                    <span className="text-[10px] font-medium text-text-muted">{obs.fechaCierre || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-3 align-middle">
                                                <RiskBadge nivel={obs.nivelRiesgo} />
                                            </td>
                                            <td className="py-2 px-4 align-middle max-w-xs">
                                                <p className="text-xs font-medium text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
                                                    {obs.titulo}
                                                </p>
                                            </td>
                                            <td className="py-2 px-4 align-middle">
                                                <EstadoBadge estado={obs.estado} />
                                            </td>
                                            <td className="py-2 px-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <Avatar nombre={obs.responsable} size="xs" />
                                                    <span className="text-xs font-bold text-text-primary whitespace-nowrap">{obs.responsable}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 align-middle">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); alert('Edición de datos base pronto disponible...'); }}
                                                        className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                                                        title="Editar Información"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); eliminarObservacion(obs.id); }}
                                                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                                                        title="Eliminar Hallazgo"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-border bg-slate-50/30 gap-3">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-border shadow-sm">
                        Mostrando <span className="text-primary">{paginatedResults.length}</span> de <span className="text-primary">{resultados.length}</span> hallazgos
                    </span>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </Card>

            {/* Bottom Insight Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="flex flex-col items-center justify-center text-center !bg-slate-900 !text-white border-0 shadow-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                        <svg className="w-7 h-7 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <span className="text-3xl font-black mb-1">{stats.cumplimientoGlobal}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Resolución Global</span>
                </Card>

                <Card className="md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Cumplimiento por Entidad</h3>
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest ring-1 ring-emerald-600/10">
                            Alta Eficiencia
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        {entidades.filter(e => stats.porEntidad[e.id]).slice(0, 6).map(ent => {
                            const data = stats.porEntidad[ent.id];
                            const pct = Math.round((data.subsanadas / data.total) * 100);
                            return (
                                <div key={ent.id} className="group">
                                    <div className="flex justify-between text-[11px] mb-2">
                                        <span className="text-text-secondary font-bold truncate transition-colors group-hover:text-primary">{ent?.nombre?.split(',')[0]}</span>
                                        <span className="font-black text-text-primary">{pct}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-1"
                                            style={{ width: `${pct}%` }}
                                        >
                                            <div className="w-1 h-1 rounded-full bg-white opacity-40 shadow-sm" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card className="flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-black text-text-primary uppercase tracking-widest">Última Actualización</span>
                        </div>
                        <p className="text-2xl font-black text-text-primary tracking-tight">Sincronizado</p>
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1">Hoy {new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <p className="text-[11px] font-medium text-text-secondary leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/50 mt-4">
                        Los datos se actualizan dinámicamente según el flujo de auditoría corporativa.
                    </p>
                </Card>
            </div>

            <div className="pt-3 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    © {new Date().getFullYear()} AuditFlow • García Integrum
                </p>
            </div>
        </div>
    );
}

