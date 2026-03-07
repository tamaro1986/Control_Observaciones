import { useState } from 'react';
import { Card, Badge } from '../components/SharedComponents';
import { getEstadoStyle, getRiesgoStyle, formatDate, daysUntil } from '../data/data';

export default function SeguimientoList({ observaciones, onSelectObservacion, eliminarObservacion, editarObservacion }) {
    // Filtrar solo las que no están subsanadas
    const pendientes = observaciones.filter(o => o.estado !== 'Subsanada');

    // Stats
    const totalPendientes = pendientes.length;
    const criticos = pendientes.filter(o => o.nivelRiesgo === 'Crítico').length;
    const vencidas = pendientes.filter(o => o.estado === 'Vencida').length;

    // Table render logic...
    return (
        <div className="animate-fade-in max-w-[1600px] mx-auto space-y-4 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">Módulo de Seguimiento</h2>
                    </div>
                    <p className="text-sm font-medium text-text-muted">Gestión y control de observaciones pendientes de subsanar.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="!bg-gradient-to-br from-indigo-500 to-indigo-600 !border-0 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Pendientes</h4>
                        <div className="mt-2 text-4xl font-black">{totalPendientes}</div>
                    </div>
                </Card>
                <Card className="!bg-gradient-to-br from-rose-500 to-rose-600 !border-0 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-100">Riesgo Crítico</h4>
                        <div className="mt-2 text-4xl font-black">{criticos}</div>
                    </div>
                </Card>
                <Card className="!bg-gradient-to-br from-amber-500 to-amber-600 !border-0 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-100">Vencidas</h4>
                        <div className="mt-2 text-4xl font-black">{vencidas}</div>
                    </div>
                </Card>
            </div>

            {/* List */}
            <Card className="overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr>
                                <th className="py-2.5 px-3 text-[10px] font-black text-text-muted uppercase tracking-[0.12em] bg-slate-50/70 border-b border-border whitespace-nowrap w-[80px]">Ref</th>
                                <th className="py-2.5 px-3 text-[10px] font-black text-text-muted uppercase tracking-[0.12em] bg-slate-50/70 border-b border-border whitespace-nowrap w-[30%]">Hallazgo</th>
                                <th className="py-2.5 px-3 text-[10px] font-black text-text-muted uppercase tracking-[0.12em] bg-slate-50/70 border-b border-border whitespace-nowrap">Estado</th>
                                <th className="py-2.5 px-3 text-[10px] font-black text-text-muted uppercase tracking-[0.12em] bg-slate-50/70 border-b border-border whitespace-nowrap">Criticidad</th>
                                <th className="py-2.5 px-3 text-[10px] font-black text-text-muted uppercase tracking-[0.12em] bg-slate-50/70 border-b border-border whitespace-nowrap">Plan de Acción</th>
                                <th className="py-2.5 px-3 text-[10px] font-black text-text-muted uppercase tracking-[0.12em] bg-slate-50/70 border-b border-border whitespace-nowrap text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendientes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                                        No hay observaciones pendientes de subsanar.
                                    </td>
                                </tr>
                            ) : (
                                pendientes.map(obs => {
                                    const estadoStyle = getEstadoStyle(obs.estado);
                                    const riesgoStyle = getRiesgoStyle(obs.nivelRiesgo);
                                    const evtDays = daysUntil(obs.fechaPlanAccion);
                                    const isVencida = evtDays !== null && evtDays < 0;

                                    return (
                                        <tr key={obs.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                                            <td className="py-2.5 px-3 align-middle font-mono text-xs">{obs.nroInforme}</td>
                                            <td className="py-2.5 px-3 align-middle">
                                                <div className="font-bold text-slate-800 line-clamp-1" title={obs.titulo}>{obs.titulo}</div>
                                                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{obs.normativa}</div>
                                            </td>
                                            <td className="py-2.5 px-3 align-middle">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${estadoStyle.bg}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${estadoStyle.dot}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${estadoStyle.text}`}>
                                                        {obs.estado}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 align-middle">
                                                <Badge className={`${riesgoStyle.bg} ${riesgoStyle.text} ${riesgoStyle.border}`}>
                                                    {obs.nivelRiesgo}
                                                </Badge>
                                            </td>
                                            <td className="py-2.5 px-3 align-middle">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-bold text-slate-700">{obs.fechaPlanAccion ? formatDate(obs.fechaPlanAccion) : '—'}</span>
                                                    {evtDays !== null && (
                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${isVencida ? 'text-rose-500' : 'text-slate-400'}`}>
                                                            {isVencida ? `Vencido hace ${Math.abs(evtDays)} días` : `En ${evtDays} días`}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => onSelectObservacion(obs.id, 'nuevo_seguimiento')}
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest group-hover:shadow-md cursor-pointer"
                                                    >
                                                        Gestionar
                                                        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); eliminarObservacion(obs.id); }}
                                                        className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer group/del"
                                                        title="Eliminar Hallazgo"
                                                    >
                                                        <svg className="w-4 h-4 group-hover/del:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            </Card>
        </div>
    );
}
