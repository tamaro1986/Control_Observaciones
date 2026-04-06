import { useState } from 'react';
import { Card, SuccessToast, Badge, Avatar } from '../components/ui/SharedComponents';
import { getEstadoStyle, getRiesgoStyle, formatDate, ESTADOS } from '../data';
import { FileText, Calendar, MessageSquare, Info, History, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

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

    const estadoStyle = getEstadoStyle(observacion.estado);
    const riesgoStyle = getRiesgoStyle(observacion.nivelRiesgo);

    const validate = () => {
        const errs = {};
        if (!fechaRespuesta) errs.fechaRespuesta = 'Requerido';
        if (!respuestaEntidad.trim()) errs.respuestaEntidad = 'Requerido';
        if (!analisisAuditor.trim()) errs.analisisAuditor = 'Requerido';
        if (!responsable) errs.responsable = 'Requerido';
        
        const isClosed = nuevoEstado === 'Subsanada';
        if (!isClosed && !fechaPlanAccion) errs.fechaPlanAccion = 'Requerido para observaciones abiertas';
        if (isClosed && !criterioAdministrativo.trim()) errs.criterioAdministrativo = 'Requerido para subsanar';
        if (isClosed && !criterioLegal.trim()) errs.criterioLegal = 'Requerido para subsanar';
        
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        cambiarEstado(observacion.id, {
            nuevoEstado,
            nroInforme: nroInforme || observacion.nroInforme,
            respuestaEntidad,
            fechaRespuesta,
            analisisAuditor,
            responsable,
            criterioAdministrativo,
            criterioLegal,
            fechaPlanAccion: nuevoEstado !== 'Subsanada' ? fechaPlanAccion : '',
            objetoSeguimiento: analisisAuditor.substring(0, 100) + (analisisAuditor.length > 100 ? '...' : '')
        });

        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            onBack();
        }, 1500);
    };

    // Unify and sort history from relational 'seguimientos' and JSON 'historialEstados'
    const combinedHistory = [
        ...(observacion.seguimientos || []).map(s => ({
            fecha: s.fecha_seguimiento,
            analisisAuditor: s.analisis,
            respuestaEntidad: s.respuesta,
            fechaRespuesta: s.fecha_respuesta,
            responsable: s.responsable,
            estadoNuevo: null, // Relational doesn't always store new state
            isRelational: true,
            id: s.id
        })),
        ...(observacion.historialEstados || []).map((h, i) => ({
            ...h,
            isRelational: false,
            id: `h-${i}`
        }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Remove duplicates (events that are in both) based on date and comment content
    const uniqueHistory = combinedHistory.filter((event, index, self) => 
        index === self.findIndex((t) => (
            t.fecha === event.fecha && 
            (t.analisisAuditor || '').substring(0, 50) === (event.analisisAuditor || '').substring(0, 50)
        ))
    );

    return (
        <div className="animate-fade-in max-w-5xl mx-auto space-y-8 pb-32">
            
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between px-2">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Regresar al módulo
                </button>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: {observacion.id}</span>
                </div>
            </div>

            {/* ─── SECTION SUPERIOR: CONTENIDO DETALLADO ─── */}
            <Card className="p-0! border-0 shadow-2xl shadow-slate-200/50 rounded-4xl overflow-hidden bg-white ring-1 ring-slate-100">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Left sidebar info */}
                    <div className="lg:col-span-4 bg-slate-900 p-8 text-white relative">
                        <div className={`absolute top-0 left-0 bottom-0 w-2 ${estadoStyle.bg.includes('emerald') ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Información de Origen</p>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-black tracking-tight">{observacion.nroInforme}</span>
                                </div>
                                <Badge className={`${riesgoStyle.bg} ${riesgoStyle.text} border-0 px-3 py-1`}>Riesgo {observacion.nivelRiesgo}</Badge>
                            </div>
                            
                            <div className="pt-6 border-t border-white/10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Auditor Responsable</p>
                                <div className="flex items-center gap-3">
                                    <Avatar nombre={observacion.responsable} size="sm" className="ring-2 ring-white/20" />
                                    <span className="text-sm font-bold">{observacion.responsable}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Estado Actual</p>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${estadoStyle.bg} ${estadoStyle.text} font-black text-[10px] uppercase tracking-widest`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${estadoStyle.dot}`} />
                                    {observacion.estado}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className="lg:col-span-8 p-10 bg-white">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-6">
                            {observacion.titulo}
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5" /> Descripción Técnica del Hallazgo
                                </h4>
                                <div className="p-6 bg-slate-50 rounded-4xl border border-slate-100 text-slate-600 text-sm font-medium leading-relaxed italic">
                                    "{observacion.descripcion}"
                                </div>
                            </div>
                            {observacion.normativa && (
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5" /> Fundamento Normativo
                                    </h4>
                                    <p className="text-xs font-bold text-slate-500 pl-1">{observacion.normativa}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* ─── SECTION MEDIA: HISTORIAL (Solo Lectura) ─── */}
            <section className="space-y-4 px-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                            <History className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Cronología de Gestión</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Respuestas y Análisis Previos</p>
                        </div>
                    </div>
                    {(observacion.seguimientos?.length || 0) > 0 && (
                        <div className="px-3 py-1 bg-white border border-slate-100 rounded-full flex items-center gap-2 shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{observacion.seguimientos.length} Seguimientos</span>
                        </div>
                    )}
                </div>

                {uniqueHistory.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-4xl border border-dashed border-slate-200">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No existen registros previos de seguimiento para esta observación</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {uniqueHistory.map((h, i) => {
                            const hStyle = h.estadoNuevo ? getEstadoStyle(h.estadoNuevo) : null;
                            return (
                                <div key={h.id} className="group relative">
                                    {i !== uniqueHistory.length - 1 && (
                                        <div className="absolute left-6 top-16 bottom-0 w-px bg-slate-100 lg:group-hover:bg-indigo-100 transition-colors" />
                                    )}
                                    <Card className="ml-1! p-6 bg-white border-slate-100/60 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all rounded-4xl group-hover:-translate-y-1">
                                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                                            <div className="shrink-0 flex md:flex-col items-center gap-2 md:w-24">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                                    <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-400 uppercase leading-none">{formatDate(h.fecha).split(' ')[0]}</span>
                                                    <span className="text-xs font-black text-slate-900 leading-none mt-1">{formatDate(h.fecha).split(' ')[1]}</span>
                                                </div>
                                                {hStyle && (
                                                    <Badge className={`${hStyle.bg} ${hStyle.text} text-[8px] uppercase tracking-tighter px-1.5`}>{h.estadoNuevo}</Badge>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 space-y-4">
                                                {h.analisisAuditor && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1.5 ">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Análisis del Auditor</span>
                                                            {h.responsable && (
                                                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                                                    <User className="w-2.5 h-2.5" />
                                                                    {h.responsable}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{h.analisisAuditor}</p>
                                                    </div>
                                                )}
                                                
                                                {h.respuestaEntidad && (
                                                    <div className="bg-indigo-50/30 rounded-2xl p-4 border border-indigo-50">
                                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1.5">Respuesta de la Entidad</span>
                                                        <p className="text-[13px] font-medium text-indigo-900/70 italic leading-relaxed">
                                                            "{h.respuestaEntidad}"
                                                        </p>
                                                        {h.fechaRespuesta && (
                                                            <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-indigo-400">
                                                                <Calendar className="w-3 h-3" />
                                                                Recibido el {formatDate(h.fechaRespuesta)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ─── SECTION INFERIOR: FORMULARIO DE NUEVO SEGUIMIENTO ─── */}
            <section className="space-y-6 pt-8 border-t border-slate-100 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                        <Send className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Registrar Nuevo Ciclo</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Documentación de Seguimiento Actual</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Left: Official Metadata */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nº Informe Referencia</label>
                                <select
                                    value={nroInforme}
                                    onChange={e => setNroInforme(e.target.value)}
                                    className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="">(Mismo del Hallazgo)</option>
                                    {correlativos?.filter(c => c.tipoInforme?.includes('Informe') || c.tipoInforme?.includes('Memo')).map(c => (
                                        <option key={c.codigo} value={c.codigo}>{c.codigo}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nuevo Estado <span className="text-rose-500">*</span></label>
                                <select
                                    value={nuevoEstado}
                                    onChange={e => setNuevoEstado(e.target.value)}
                                    className="w-full h-12 px-4 rounded-2xl border border-primary/20 bg-primary/5 text-sm font-black text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 tracking-wide cursor-pointer"
                                >
                                    {(catalogos?.estados?.length > 0 ? catalogos.estados : ESTADOS.map(e => e.value)).map(e => (
                                        <option key={e} value={e}>{e}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Responsable del Análisis <span className="text-rose-500">*</span></label>
                                <select
                                    value={responsable}
                                    onChange={e => setResponsable(e.target.value)}
                                    className={`w-full h-12 px-4 rounded-2xl border transition-all ${errors.responsable ? 'border-rose-300 bg-rose-50' : 'border-slate-100 bg-slate-50'} text-sm font-bold text-slate-700 appearance-none cursor-pointer`}
                                >
                                    <option value="">— Seleccionar —</option>
                                    {(catalogos?.responsables || []).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        {nuevoEstado !== 'Subsanada' ? (
                            <div className="bg-amber-50/50 p-6 rounded-4xl border border-amber-200/50 space-y-4">
                                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Próximo Vencimiento
                                </label>
                                <input
                                    type="date"
                                    value={fechaPlanAccion}
                                    onChange={e => setFechaPlanAccion(e.target.value)}
                                    className={`w-full h-12 px-4 rounded-2xl border ${errors.fechaPlanAccion ? 'border-rose-300 bg-white shadow-lg' : 'border-amber-200 bg-white'} text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 cursor-pointer`}
                                />
                                <p className="text-[9px] font-bold text-amber-600/70 leading-normal px-1">Se requiere definir la fecha del nuevo plan de acción mientras el hallazgo permanezca abierto.</p>
                            </div>
                        ) : (
                            <div className="bg-emerald-500 p-6 rounded-4xl text-white shadow-lg shadow-emerald-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="text-sm font-black uppercase tracking-widest">Cierre de Hallazgo</span>
                                </div>
                                <p className="text-[10px] font-bold opacity-80 leading-relaxed uppercase tracking-widest">Al guardar con este estado, la observación se marcará como subsanada y se archivará.</p>
                            </div>
                        )}
                    </div>

                    {/* Form Center & Right: Narrative Texts */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Entity Response Column */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Respuesta de la Entidad <span className="text-rose-500">*</span></label>
                                    <input
                                        type="date"
                                        value={fechaRespuesta}
                                        onChange={e => setFechaRespuesta(e.target.value)}
                                        className={`text-[10px] font-black uppercase bg-slate-50 border-none rounded-lg px-2 py-1 ${errors.fechaRespuesta ? 'text-rose-500 ring-2 ring-rose-300' : 'text-slate-500'}`}
                                    />
                                </div>
                                <textarea
                                    rows={5}
                                    placeholder="Documente la respuesta oficial y evidencias aportadas por el sujeto supervisado..."
                                    value={respuestaEntidad}
                                    onChange={e => setRespuestaEntidad(e.target.value)}
                                    className={`w-full p-5 rounded-4xl border ${errors.respuestaEntidad ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'} text-sm font-medium focus:ring-4 focus:ring-primary/5 transition-all shadow-sm resize-none`}
                                />
                            </div>

                            {/* Technical Analysis Column */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Análisis Técnico del Auditor <span className="text-rose-500">*</span></label>
                                <textarea
                                    rows={5}
                                    placeholder="Registre el dictamen técnico tras la evaluación de las evidencias..."
                                    value={analisisAuditor}
                                    onChange={e => setAnalisisAuditor(e.target.value)}
                                    className={`w-full p-5 rounded-4xl border ${errors.analisisAuditor ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'} text-sm font-medium focus:ring-4 focus:ring-primary/5 transition-all shadow-sm resize-none`}
                                />
                            </div>
                        </div>

                        {/* Closure Criteria Rows (Conditional) */}
                        {nuevoEstado === 'Subsanada' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest px-2">Criterio Administrativo <span className="text-rose-500">*</span></label>
                                    <textarea
                                        rows={2}
                                        value={criterioAdministrativo}
                                        onChange={e => setCriterioAdministrativo(e.target.value)}
                                        className={`w-full p-4 rounded-2xl bg-emerald-50/30 border ${errors.criterioAdministrativo ? 'border-rose-300' : 'border-emerald-100'} text-xs font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/5 resize-none`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest px-2">Criterio Legal <span className="text-rose-500">*</span></label>
                                    <textarea
                                        rows={2}
                                        value={criterioLegal}
                                        onChange={e => setCriterioLegal(e.target.value)}
                                        className={`w-full p-4 rounded-2xl bg-emerald-50/30 border ${errors.criterioLegal ? 'border-rose-300' : 'border-emerald-100'} text-xs font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/5 resize-none`}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button 
                                onClick={handleSubmit}
                                className="w-full md:w-auto px-10 py-4 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
                            >
                                <Send className="w-4 h-4" />
                                Procesar y Guardar Registro
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {showToast && (
                <SuccessToast message="Gestión registrada con éxito. Redirigiendo..." onClose={() => setShowToast(false)} />
            )}
        </div>
    );
}
