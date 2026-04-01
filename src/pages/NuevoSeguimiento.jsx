import { useState } from 'react';
import { Card, SuccessToast, Badge } from '../components/ui/SharedComponents';
import { getEstadoStyle, getRiesgoStyle, formatDate, ESTADOS } from '../data';

export default function NuevoSeguimiento({ observacion, cambiarEstado, onBack, catalogos, correlativos }) {
    const [nuevoEstado, setNuevoEstado] = useState(observacion.estado);
    const [nroInforme, setNroInforme] = useState('');
    const [fechaRespuesta, setFechaRespuesta] = useState('');
    const [respuestaEntidad, setRespuestaEntidad] = useState('');
    const [analisisAuditor, setAnalisisAuditor] = useState('');
    const [responsable, setResponsable] = useState(observacion.responsable || '');
    const [fechaPlanAccion, setFechaPlanAccion] = useState(observacion.fechaPlanAccion || '');
    const [criterioAdministrativo, setCriterioAdministrativo] = useState(observacion.criterioAdministrativo || '');
    const [criterioLegal, setCriterioLegal] = useState(observacion.criterioLegal || '');

    const [showToast, setShowToast] = useState(false);
    const [errors, setErrors] = useState({});

    // Left pane styles
    const estadoStyle = getEstadoStyle(observacion.estado);
    const riesgoStyle = getRiesgoStyle(observacion.nivelRiesgo);

    const validate = () => {
        const errs = {};
        if (!fechaRespuesta) errs.fechaRespuesta = 'Requerido';
        if (!respuestaEntidad.trim()) errs.respuestaEntidad = 'Requerido';
        if (!analisisAuditor.trim()) errs.analisisAuditor = 'Requerido';
        if (!responsable) errs.responsable = 'Requerido';
        if (nuevoEstado !== 'Subsanada' && !fechaPlanAccion) errs.fechaPlanAccion = 'Requerido para observaciones no subsanadas';
        if (nuevoEstado === 'Subsanada' && !criterioAdministrativo.trim()) errs.criterioAdministrativo = 'Requerido para subsanar';
        if (nuevoEstado === 'Subsanada' && !criterioLegal.trim()) errs.criterioLegal = 'Requerido para subsanar';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        cambiarEstado(observacion.id, {
            nuevoEstado,
            nroInforme,
            respuestaEntidad,
            fechaRespuesta,
            analisisAuditor,
            responsable,
            criterioAdministrativo,
            criterioLegal,
            // Only update action plan if it's not solved
            fechaPlanAccion: nuevoEstado !== 'Subsanada' ? fechaPlanAccion : '',
            // Clear current plan details inside history if moved to solved
            planAccion: nuevoEstado !== 'Subsanada' ? 'Nuevo plan de contingencia' : 'N/A - Subsanado'
        });

        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            onBack();
        }, 1500);
    };

    const sortedHistory = [...(observacion.historialEstados || [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return (
        <div className="animate-fade-in max-w-400 mx-auto pb-24 h-full flex flex-col pt-2">

            {/* Split Pane Container */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 items-stretch">

                {/* LEFT PANE: Context & History */}
                <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-4">
                    <Card className="shrink-0 bg-slate-900 text-white border-0 shadow-xl overflow-hidden relative">
                        {/* Status glowing bar */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${estadoStyle.bg.replace('bg-', 'bg-').replace('-bg', '')} shadow-[2px_0_15px_rgba(255,255,255,0.2)]`} />
                        <div className="p-6 pl-8">
                            <div className="flex justify-between items-start mb-4">
                                <span className="font-mono text-xs text-slate-400">{observacion.nroInforme}</span>
                                <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <h2 className="text-xl font-black text-white leading-tight mb-3">{observacion.titulo}</h2>
                            <div className="flex flex-wrap gap-2 mb-6">
                                <Badge className={`${riesgoStyle.bg} ${riesgoStyle.text}`}>{observacion.nivelRiesgo}</Badge>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${estadoStyle.bg} border-0`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${estadoStyle.dot}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${estadoStyle.text}`}>{observacion.estado}</span>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 text-sm text-slate-300 font-medium leading-relaxed border border-white/10">
                                {observacion.descripcion}
                            </div>
                        </div>
                    </Card>

                    <Card className="flex-1 bg-white border-slate-200 overflow-y-auto min-h-100">
                        <div className="p-5">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Línea de Tiempo del Hallazgo
                            </h3>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {sortedHistory.map((h, i) => {
                                    const hStyle = getEstadoStyle(h.estadoNuevo);
                                    return (
                                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-slate-200 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10" />
                                            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm ml-4 md:ml-0 group-hover:border-primary/20 transition-all">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatDate(h.fecha)}</span>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${hStyle.bg} ${hStyle.text}`}>{h.estadoNuevo}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-medium leading-relaxed">{h.analisisAuditor}</p>
                                                {h.respuestaEntidad && (
                                                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                                                        "{h.respuestaEntidad}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* RIGHT PANE: Action Form */}
                <div className="w-full lg:w-7/12 xl:w-2/3 flex flex-col">
                    <Card className="flex-1 bg-white border-slate-200 overflow-y-auto shadow-sm relative">
                        <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-5">
                            <svg className="w-64 h-64 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" /></svg>
                        </div>

                        <div className="p-8 pb-32 max-w-3xl relative z-10">
                            <div className="mb-8 border-b border-slate-100 pb-5">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Registro de Seguimiento</h3>
                                <p className="text-sm text-slate-500 mt-1 font-medium">Actualice el estado y documente la respuesta de la entidad para el expediente oficial.</p>
                            </div>

                            <div className="space-y-8">
                                {/* Sección 1: Referencia de Informe */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[11px] font-black">1</div>
                                        <h4 className="text-[11px] font-black text-text-primary uppercase tracking-widest">Documentación Oficial</h4>
                                    </div>
                                    <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Fecha de Seguimiento (Hoy)</label>
                                            <input
                                                type="date"
                                                defaultValue={new Date().toISOString().split('T')[0]}
                                                disabled
                                                className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nº Informe (Opcional)</label>
                                            <select
                                                value={nroInforme}
                                                onChange={e => setNroInforme(e.target.value)}
                                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary cursor-pointer shadow-sm appearance-none"
                                            >
                                                <option value="">— Mismo del Hallazgo —</option>
                                                {correlativos.filter(c => c.tipoInforme === 'Informe de supervisión' || c.tipoInforme === 'Memo').map(c => (
                                                    <option key={c.codigo} value={c.codigo}>{c.codigo}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección 2: Respuesta Entidad */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-black">2</div>
                                        <h4 className="text-[11px] font-black text-text-primary uppercase tracking-widest">Respuesta de la Entidad</h4>
                                    </div>
                                    <div className="pl-8 space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Fecha de Recepción <span className="text-rose-500">*</span></label>
                                            <input
                                                type="date"
                                                value={fechaRespuesta}
                                                onChange={e => setFechaRespuesta(e.target.value)}
                                                className={`w-full md:w-1/2 px-4 py-3 rounded-2xl border ${errors.fechaRespuesta ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500/10 focus:border-rose-400' : 'border-slate-200 bg-white focus:ring-primary/5 focus:border-primary'} text-sm font-bold text-text-primary focus:outline-none focus:ring-4 cursor-pointer shadow-sm`}
                                            />
                                            {errors.fechaRespuesta && (
                                                <p className="text-[10px] font-bold text-rose-500 mt-1.5 pl-1 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {errors.fechaRespuesta}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Extracto de Respuesta Oficial <span className="text-rose-500">*</span></label>
                                            <textarea
                                                rows={4}
                                                placeholder="Resumen de las justificaciones o evidencias presentadas por la entidad..."
                                                value={respuestaEntidad}
                                                onChange={e => setRespuestaEntidad(e.target.value)}
                                                className={`w-full p-4 rounded-3xl border ${errors.respuestaEntidad ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500/10 focus:border-rose-400' : 'border-slate-200 bg-white focus:ring-primary/5 focus:border-primary'} text-sm font-medium focus:outline-none focus:ring-4 shadow-sm resize-none`}
                                            />
                                            {errors.respuestaEntidad && (
                                                <p className="text-[10px] font-bold text-rose-500 mt-1.5 pl-1 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {errors.respuestaEntidad}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sección 3: Dictamen y Estado */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[11px] font-black">3</div>
                                        <h4 className="text-[11px] font-black text-text-primary uppercase tracking-widest">Dictamen del Auditor</h4>
                                    </div>
                                    <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Responsable del Análisis <span className="text-rose-500">*</span></label>
                                            <select
                                                value={responsable}
                                                onChange={e => setResponsable(e.target.value)}
                                                className={`w-full px-4 py-3 rounded-2xl border ${errors.responsable ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500/10 focus:border-rose-400' : 'border-slate-200 bg-white focus:ring-primary/5 focus:border-primary'} text-sm font-bold text-text-primary focus:outline-none flex-1 appearance-none cursor-pointer`}
                                            >
                                                <option value="">— SELECCIONE —</option>
                                                {(catalogos.responsables || []).map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            {errors.responsable && (
                                                <p className="text-[10px] font-bold text-rose-500 mt-1.5 pl-1 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {errors.responsable}
                                                </p>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 relative overflow-hidden">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-2">Nuevo Estado</label>
                                            <select
                                                value={nuevoEstado}
                                                onChange={e => setNuevoEstado(e.target.value)}
                                                className="w-full px-2 py-1 bg-transparent border-0 text-sm font-black text-primary focus:outline-none cursor-pointer appearance-none relative z-10"
                                            >
                                                {(catalogos?.estados?.length > 0 ? catalogos.estados : ESTADOS.map(e => e.value)).map(e => (
                                                    <option key={e} value={e}>{e}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pl-8 mb-5">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Análisis Técnico <span className="text-rose-500">*</span></label>
                                            <textarea
                                                rows={5}
                                                placeholder="Evaluación de la respuesta y justificación del estado modificado..."
                                                value={analisisAuditor}
                                                onChange={e => setAnalisisAuditor(e.target.value)}
                                                className={`w-full p-4 rounded-3xl border ${errors.analisisAuditor ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500/10 focus:border-rose-400' : 'border-slate-200 bg-white focus:ring-primary/5 focus:border-primary'} text-sm font-medium focus:outline-none focus:ring-4 shadow-sm resize-none`}
                                            />
                                            {errors.analisisAuditor && (
                                                <p className="text-[10px] font-bold text-rose-500 mt-1.5 pl-1 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {errors.analisisAuditor}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Criterios de Cierre (Solo si es Subsanada) */}
                                    {nuevoEstado === 'Subsanada' && (
                                        <div className="pl-8 pt-4 border-t border-slate-100 space-y-5">
                                            <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-2xl p-5 space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div className="flex-1 space-y-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Criterio Administrativo de Cierre <span className="text-rose-500">*</span></label>
                                                            <textarea
                                                                rows={2}
                                                                placeholder="Describa el criterio administrativo para cerrar esta observación..."
                                                                value={criterioAdministrativo}
                                                                onChange={e => setCriterioAdministrativo(e.target.value)}
                                                                className={`w-full p-4 rounded-2xl border ${errors.criterioAdministrativo ? 'border-rose-300 bg-rose-50/50' : 'border-emerald-200 bg-white'} text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm resize-none`}
                                                            />
                                                            {errors.criterioAdministrativo && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.criterioAdministrativo}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Criterio Legal de Cierre <span className="text-rose-500">*</span></label>
                                                            <textarea
                                                                rows={2}
                                                                placeholder="Describa el fundamento legal para el cierre..."
                                                                value={criterioLegal}
                                                                onChange={e => setCriterioLegal(e.target.value)}
                                                                className={`w-full p-4 rounded-2xl border ${errors.criterioLegal ? 'border-rose-300 bg-rose-50/50' : 'border-emerald-200 bg-white'} text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm resize-none`}
                                                            />
                                                            {errors.criterioLegal && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.criterioLegal}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fecha Plan de Accion Condicional */}
                                    {nuevoEstado !== 'Subsanada' && (
                                        <div className="pl-8 pt-4 border-t border-slate-100">
                                            <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-5">
                                                <div className="flex items-start gap-3">
                                                    <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">Fecha del Nuevo Plan de Acción <span className="text-rose-500">*</span></label>
                                                        <input
                                                            type="date"
                                                            value={fechaPlanAccion}
                                                            onChange={e => setFechaPlanAccion(e.target.value)}
                                                            className={`w-full md:w-1/2 px-4 py-3 rounded-2xl border ${errors.fechaPlanAccion ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500/10 focus:border-rose-400' : 'border-amber-200 bg-white focus:ring-amber-500/10 focus:border-amber-400'} text-sm font-bold text-text-primary focus:outline-none focus:ring-4 cursor-pointer shadow-sm`}
                                                        />
                                                        {errors.fechaPlanAccion ? (
                                                            <p className="text-[10px] font-bold text-rose-500 mt-2 flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                {errors.fechaPlanAccion}
                                                            </p>
                                                        ) : (
                                                            <p className="text-[10px] font-medium text-amber-600/70 mt-2">La fecha es necesaria mientras la observación no esté "Subsanada".</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Right Pane Footer Actions */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur border-t border-slate-100 flex items-center justify-between">
                            <button onClick={onBack} className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleSubmit} className="px-8 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                Procesar Seguimiento
                            </button>
                        </div>
                    </Card>
                </div>

            </div>

            {showToast && (
                <SuccessToast message="El seguimiento ha sido registrado y el estado actualizado exitosamente." onClose={() => setShowToast(false)} />
            )}
        </div>
    );
}
