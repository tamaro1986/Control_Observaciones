import { useState } from 'react';
import { NIVELES_RIESGO, TIPOS_RIESGO, ESTADOS, TIPOS_VISITA } from '../data/data';
import { RiskBadge, SuccessToast, Card } from '../components/SharedComponents';

const EMPTY_TARJETA = {
    titulo: '',
    descripcion: '',
    nivelRiesgo: 'Medio',
    tipoRiesgo: 'Operacional',
    estado: 'Pendiente',
    normativa: '',
    nota: '',
    responsable: '',
    fechaPlanAccion: '',
    // Cycle finishing fields
    fechaRespuesta: '',
    respuestaEntidad: '',
    comentarioAuditor: '',
};

export default function NuevoRegistro({ crearAuditoria, catalogos, correlativos = [] }) {
    // Header Data States
    const [entidadId, setEntidadId] = useState('');
    const [tipoVisita, setTipoVisita] = useState('Focalizada');
    const [nroInforme, setNroInforme] = useState('');
    const [esInformeManual, setEsInformeManual] = useState(false);

    // Dates States
    const [fechaApertura, setFechaApertura] = useState('');
    const [fechaCierre, setFechaCierre] = useState('');
    const [fechaEvalInicio, setFechaEvalInicio] = useState('');
    const [fechaEvalFinal, setFechaEvalFinal] = useState('');

    // Items States
    const [tarjetas, setTarjetas] = useState([{ ...EMPTY_TARJETA }]);
    const [showToast, setShowToast] = useState(false);
    const [errors, setErrors] = useState({});

    const addTarjeta = () => {
        setTarjetas(prev => [...prev, { ...EMPTY_TAR_JETA }]);
        // Intentionally kept typo from user's current version to reproduce and fix
    };

    const removeTarjeta = (index) => {
        if (tarjetas.length <= 1) return;
        setTarjetas(prev => prev.filter((_, i) => i !== index));
    };

    const updateTarjeta = (index, field, value) => {
        setTarjetas(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
    };

    const validate = () => {
        const errs = {};
        if (!entidadId) errs.entidad = 'Seleccione una entidad';
        if (!nroInforme) errs.nroInforme = 'Referencia requerida';
        if (!fechaApertura) errs.fechaApertura = 'Requerido';
        if (!fechaCierre) errs.fechaCierre = 'Requerido';

        tarjetas.forEach((t, i) => {
            if (!t.titulo.trim()) errs[`titulo_${i}`] = 'Requerido';
            if (!t.descripcion.trim()) errs[`desc_${i}`] = 'Requerido';
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        crearAuditoria({
            entidadId,
            tipoVisita,
            nroInforme,
            fechaApertura,
            fechaCierre,
            fechaEvalInicio,
            fechaEvalFinal,
            tarjetas,
        });

        // Reset
        setEntidadId('');
        setNroInforme('');
        setEsInformeManual(false);
        setFechaApertura('');
        setFechaCierre('');
        setFechaEvalInicio('');
        setFechaEvalFinal('');
        setTarjetas([{ ...EMPTY_TARJETA }]);
        setErrors({});
        setShowToast(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setShowToast(false), 4000);
    };

    return (
        <div className="animate-fade-in max-w-[1600px] mx-auto space-y-3 pb-24 text-slate-800">
            {/* Header Mini Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-black text-text-primary tracking-tight uppercase">Expediente de Registro</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">REF:</span>
                    <span className="text-[10px] font-black text-primary leading-none">AUD-TRACK-{Math.floor(Math.random() * 900) + 100}</span>
                </div>
            </div>

            {/* Master Data Compact Section */}
            <section className="space-y-2">
                <Card className="!p-4 bg-white/70 backdrop-blur border-slate-200 shadow-sm overflow-visible">
                    <div className="flex flex-col gap-4">
                        {/* Row 1: Primary Data */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Entidad Auditada</label>
                                <select
                                    value={entidadId}
                                    onChange={e => setEntidadId(e.target.value)}
                                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.entidad ? 'border-rose-400 bg-rose-50/20' : 'border-slate-100 bg-white'} text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer`}
                                >
                                    <option value="">— SELECCIONE —</option>
                                    {catalogos.entidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Modalidad</label>
                                <select
                                    value={tipoVisita}
                                    onChange={e => setTipoVisita(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-white text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer"
                                >
                                    {(catalogos.tiposVisita || TIPOS_VISITA).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="md:col-span-5">
                                <div className="flex items-center justify-between px-1 mb-1">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Referencia Informe</label>
                                    <button
                                        type="button"
                                        onClick={() => { setEsInformeManual(!esInformeManual); setNroInforme(''); }}
                                        className="text-[8px] font-black text-primary uppercase tracking-tighter hover:bg-primary/5 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                                    >
                                        {esInformeManual ? '↩ Lista' : '➕ Manual'}
                                    </button>
                                </div>
                                {esInformeManual ? (
                                    <input
                                        type="text"
                                        placeholder="EJ: AUD-001-2023"
                                        value={nroInforme}
                                        onChange={e => setNroInforme(e.target.value.toUpperCase())}
                                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.nroInforme ? 'border-rose-400' : 'border-primary/10 bg-primary/5'} text-sm font-black text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all uppercase`}
                                    />
                                ) : (
                                    <select
                                        value={nroInforme}
                                        onChange={e => setNroInforme(e.target.value)}
                                        className={`w-full px-3 py-2.5 rounded-xl border ${errors.nroInforme ? 'border-rose-400' : 'border-slate-100 bg-white'} text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer pr-8 appearance-none`}
                                    >
                                        <option value="">— SELECCIONE INFORME —</option>
                                        {correlativos.filter(c => c.tipoInforme === 'Informe de supervisión').map(c => (
                                            <option key={c.id} value={c.codigo}>{c.codigo}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Grouped Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Auditoría Box */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2 shadow-sm">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 px-1">
                                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                                    Programación Auditoría
                                </span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-bold text-slate-500 uppercase ml-1">Apertura</span>
                                        <input type="date" value={fechaApertura} onChange={e => setFechaApertura(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-[11px] font-bold focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-bold text-slate-500 uppercase ml-1">Cierre</span>
                                        <input type="date" value={fechaCierre} onChange={e => setFechaCierre(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-[11px] font-bold focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Evaluación Box */}
                            <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100/50 flex flex-col gap-2 shadow-sm">
                                <span className="text-[8px] font-black text-indigo-500/80 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 px-1">
                                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                    Periodo de Evaluación
                                </span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-bold text-indigo-400 uppercase ml-1">Desde</span>
                                        <input type="date" value={fechaEvalInicio} onChange={e => setFechaEvalInicio(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-indigo-100 bg-white text-[11px] font-bold text-indigo-900 focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-bold text-indigo-400 uppercase ml-1">Hasta</span>
                                        <input type="date" value={fechaEvalFinal} onChange={e => setFechaEvalFinal(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-indigo-100 bg-white text-[11px] font-bold text-indigo-900 focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Hallazgos Section */}
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.3em]">02. Hallazgos Individuales ({tarjetas.length})</h3>
                <button onClick={addTarjeta} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    Nuevo
                </button>
            </div>

            <div className="space-y-3">
                {tarjetas.map((tarjeta, index) => (
                    <Card key={index} noPadding className="relative group border-slate-100 shadow-sm">
                        <div className={`absolute top-0 left-0 bottom-0 w-1 rounded-l-2xl ${tarjeta.nivelRiesgo === 'Crítico' ? 'bg-rose-500' : tarjeta.nivelRiesgo === 'Alto' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-4 gap-4">
                                <div className="flex-1">
                                    <label className="block text-[8px] font-black text-primary uppercase tracking-widest mb-1 px-1">Título de la Observación</label>
                                    <input
                                        type="text"
                                        placeholder="Identifique brevemente el hallazgo..."
                                        value={tarjeta.titulo}
                                        onChange={e => updateTarjeta(index, 'titulo', e.target.value)}
                                        className={`w-full px-1 py-0.5 text-base font-black text-text-primary placeholder:text-slate-200 focus:outline-none border-b ${errors[`titulo_${index}`] ? 'border-rose-300' : 'border-slate-50'} focus:border-primary transition-all`}
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={tarjeta.nivelRiesgo}
                                        onChange={e => updateTarjeta(index, 'nivelRiesgo', e.target.value)}
                                        className="px-3 py-1 rounded-full border border-slate-200 text-[9px] font-black uppercase tracking-tighter"
                                    >
                                        {NIVELES_RIESGO.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                                    </select>
                                    {tarjetas.length > 1 && (
                                        <button onClick={() => removeTarjeta(index)} className="text-slate-300 hover:text-rose-500 transition-colors p-1 cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                <div className="space-y-3">
                                    <textarea
                                        placeholder="Detalle narrativo del hallazgo..."
                                        value={tarjeta.descripcion}
                                        onChange={e => updateTarjeta(index, 'descripcion', e.target.value)}
                                        rows={4}
                                        className="w-full p-3 rounded-xl border border-slate-50 bg-slate-50/50 text-[12px] font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all resize-none shadow-inner"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select value={tarjeta.estado} onChange={e => updateTarjeta(index, 'estado', e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-100 text-[9px] font-black text-text-primary uppercase focus:outline-none">
                                            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                                        </select>
                                        <select value={tarjeta.tipoRiesgo} onChange={e => updateTarjeta(index, 'tipoRiesgo', e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-100 text-[9px] font-black text-text-primary uppercase focus:outline-none">
                                            {TIPOS_RIESGO.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Normativa</label>
                                        <select value={tarjeta.normativa} onChange={e => updateTarjeta(index, 'normativa', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-white text-[11px] font-bold text-text-primary focus:outline-none shadow-sm">
                                            <option value="">— SELECCIONAR —</option>
                                            {catalogos.normas.map(n => <option key={n.codigo} value={`${n.codigo} - ${n.nombre}`}>{n.codigo}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-blue-50/30 p-3 rounded-2xl border border-blue-100/50">
                                    <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest block mb-2 px-1">3. Respuesta Entidad</span>
                                    <input type="date" value={tarjeta.fechaRespuesta} onChange={e => updateTarjeta(index, 'fechaRespuesta', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-blue-100 bg-white text-[11px] font-bold focus:outline-none mb-2 shadow-sm" />
                                    <textarea placeholder="Justificación técnica..." value={tarjeta.respuestaEntidad} onChange={e => updateTarjeta(index, 'respuestaEntidad', e.target.value)} rows={2} className="w-full p-2.5 rounded-xl border border-blue-100 bg-white text-[11px] font-medium resize-none shadow-sm" />
                                </div>

                                <div className="space-y-3 bg-violet-50/30 p-3 rounded-2xl border border-violet-100/50">
                                    <span className="text-[8px] font-black text-violet-700 uppercase tracking-widest block mb-2 px-1">4. Situación Actual</span>
                                    <select value={tarjeta.responsable} onChange={e => updateTarjeta(index, 'responsable', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-white text-[11px] font-bold mb-2 shadow-sm">
                                        <option value="">— ASIGNAR —</option>
                                        {catalogos.responsables.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    <textarea placeholder="Análisis final..." value={tarjeta.comentarioAuditor} onChange={e => updateTarjeta(index, 'comentarioAuditor', e.target.value)} rows={2} className="w-full p-2.5 rounded-xl border border-violet-100 bg-white text-[11px] font-medium resize-none shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Compact Sticky Bar */}
            <div className="fixed bottom-0 left-[220px] right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-3 z-40 shadow-2xl">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Carga de Hallazgos</span>
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs font-black text-slate-900 leading-none uppercase">{tarjetas.length} REGISTRO(S)</span>
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${Math.min((tarjetas.length / 5) * 100, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <p className="text-[9px] font-bold text-slate-400 italic max-w-[150px] leading-tight">Valide periodos de evaluación antes de firmar.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => { if (window.confirm('¿Borrar formulario?')) { setEntidadId(''); setNroInforme(''); setFechaApertura(''); setFechaCierre(''); setFechaEvalInicio(''); setFechaEvalFinal(''); setTarjetas([{ ...EMPTY_TARJETA }]); setErrors({}); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors cursor-pointer px-4">Limpiar</button>
                        <button onClick={handleSubmit} className="px-8 py-3 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group">
                            Finalizar Expediente
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {showToast && <SuccessToast message="Expediente registrado exitosamente." onClose={() => setShowToast(false)} />}
        </div>
    );
}

// Fix for internal constant reference
const EMPTY_TAR_JETA = EMPTY_TARJETA;
