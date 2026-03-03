import { useState } from 'react';
import { getEntidadById, formatDate, ESTADOS, RESPONSABLES } from '../data/data';
import { RiskBadge, EstadoBadge, Avatar, SuccessToast, Card } from '../components/SharedComponents';

export default function DetalleObservacion({ observacion, cambiarEstado, onBack }) {
    const ent = getEntidadById(observacion.entidadId);
    const [nuevoEstado, setNuevoEstado] = useState(observacion.estado);
    const [nroInforme, setNroInforme] = useState(observacion.nroInforme);
    const [nota, setNota] = useState('');
    const [respuestaEntidad, setRespuestaEntidad] = useState('');
    const [analisisAuditor, setAnalisisAuditor] = useState('');
    const [planAccion, setPlanAccion] = useState('');
    const [fechaPlanAccion, setFechaPlanAccion] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleGuardar = () => {
        cambiarEstado(observacion.id, {
            nuevoEstado,
            nroInforme,
            nota,
            respuestaEntidad,
            analisisAuditor,
            planAccion,
            fechaPlanAccion,
        });
        setNota('');
        setRespuestaEntidad('');
        setAnalisisAuditor('');
        setPlanAccion('');
        setFechaPlanAccion('');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-4 pb-6">
            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-all cursor-pointer w-fit"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Regresar a Listado
                    </button>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
                            <span className="text-sm font-black text-white">#{observacion.id.split('-').pop()}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-primary tracking-tight leading-tight">{observacion.titulo}</h2>
                            <div className="flex items-center gap-3 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Expediente {observacion.nroInforme}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <span>{ent?.nombre.split(',')[0]}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <RiskBadge nivel={observacion.nivelRiesgo} />
                    <EstadoBadge estado={observacion.estado} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="!p-0 overflow-hidden shadow-xl border-0 ring-1 ring-slate-100">
                        <div className="bg-slate-900 p-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Información de Atribución</h3>
                            <div className="flex items-center gap-4">
                                <Avatar nombre={observacion.responsable} size="lg" className="ring-4 ring-white/10" />
                                <div>
                                    <p className="text-white font-black text-lg leading-none">{observacion.responsable}</p>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">Auditor Responsable</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-4 bg-white">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Visita</span>
                                    <p className="text-sm font-bold text-text-primary uppercase">{observacion.tipoVisita}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nivel Riesgo</span>
                                    <p className="text-sm font-bold text-text-primary uppercase">{observacion.nivelRiesgo}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Normativa Ref.</span>
                                    <p className="text-sm font-bold text-text-primary">{observacion.normativa || 'No Declarada'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Riesgo</span>
                                    <p className="text-sm font-bold text-text-primary uppercase">{observacion.tipoRiesgo}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 space-y-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descripción del Caso</span>
                                <p className="text-sm font-medium text-text-secondary leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                                    "{observacion.descripcion}"
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vigencia Auditoría</span>
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-black text-slate-400 uppercase">Inicio</span>
                                        <span className="text-xs font-black text-text-primary">{formatDate(observacion.fechaInicio)}</span>
                                    </div>
                                    <div className="w-8 h-px bg-slate-200" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] font-black text-slate-400 uppercase">Fin</span>
                                        <span className="text-xs font-black text-text-primary">{formatDate(observacion.fechaFin)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Actions and Timeline */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Interaction Form */}
                    <Card className="!p-4 shadow-xl border-0 ring-1 ring-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-black text-text-primary uppercase tracking-widest">Actualización de Expediente</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nuevo Estado de Gestión</label>
                                    <select
                                        value={nuevoEstado}
                                        onChange={e => setNuevoEstado(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-text-primary uppercase focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary bg-slate-50/50 cursor-pointer"
                                    >
                                        {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.value}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Referencia de Informe Actualizado</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={nroInforme}
                                            onChange={e => setNroInforme(e.target.value)}
                                            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50/50"
                                            placeholder="Nro. Informe"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nota"
                                            value={nota}
                                            onChange={e => setNota(e.target.value)}
                                            className="w-24 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fecha Estimada de Regularización</label>
                                    <input
                                        type="date"
                                        value={fechaPlanAccion}
                                        onChange={e => setFechaPlanAccion(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary bg-slate-50/50"
                                    />
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed italic">
                                        * Al cambiar de estado, se notificará automáticamente a los entes de control correspondientes.
                                    </p>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Análisis Profesional del Auditor</label>
                                <textarea
                                    placeholder="Describa el progreso, hallazgos adicionales o justificación de cambios..."
                                    value={analisisAuditor}
                                    onChange={e => setAnalisisAuditor(e.target.value)}
                                    rows={3}
                                    className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-medium text-text-secondary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary bg-slate-50/50 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleGuardar}
                                className="px-6 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Registrar Actualización
                            </button>
                        </div>
                    </Card>

                    {/* Timeline History */}
                    <section className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_8px_rgba(0,0,0,0.1)]" />
                                <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">Traza de Auditoría</h3>
                            </div>
                            <span className="text-[10px] font-bold text-text-muted italic">{observacion.historialEstados.length} EVENTOS REGISTRADOS</span>
                        </div>

                        <div className="relative pl-6 space-y-4">
                            <div className="absolute left-[3px] top-4 bottom-4 w-[2px] bg-slate-100" />

                            {[...observacion.historialEstados].reverse().map((h, i) => (
                                <div key={i} className="relative animate-fade-in group">
                                    <div className="absolute -left-[30px] top-1.5 w-[12px] h-[12px] rounded-full bg-white border-2 border-slate-900 group-hover:scale-125 transition-transform z-10" />

                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-lg transition-all border-l-4 border-l-slate-900">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className="px-3 py-1 bg-slate-100 rounded-lg">
                                                    <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">{formatDate(h.fecha)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {h.estadoAnterior && (
                                                        <>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase line-through uppercase">{h.estadoAnterior}</span>
                                                            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                            </svg>
                                                        </>
                                                    )}
                                                    <EstadoBadge estado={h.estadoNuevo} />
                                                </div>
                                            </div>
                                            {h.nroInforme && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">REF:</span>
                                                    <span className="text-[11px] font-black text-text-primary leading-none">{h.nroInforme} {h.nota && `• ${h.nota}`}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {h.analisisAuditor && (
                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Análisis Ejecutivo:</span>
                                                    <p className="text-[13px] font-medium text-text-secondary leading-relaxed">{h.analisisAuditor}</p>
                                                </div>
                                            )}
                                            {h.planAccion && (
                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plan de Rectificación:</span>
                                                    <p className="text-[13px] font-medium text-text-secondary leading-relaxed">{h.planAccion}</p>
                                                    {h.fechaPlanAccion && (
                                                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                                                            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-[10px] font-black text-amber-700">Compromiso: {formatDate(h.fechaPlanAccion)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {h.respuestaEntidad && (
                                                <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-50">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Argumento de la Entidad:</span>
                                                    <p className="text-[13px] font-medium text-text-secondary leading-relaxed bg-slate-50 p-4 rounded-2xl italic">"{h.respuestaEntidad}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {showToast && (
                <SuccessToast
                    message="El registro ha sido actualizado y sincronizado en la bitácora histórica exitosamente."
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
}
