import { useState } from 'react';
import { NIVELES_RIESGO, TIPOS_RIESGO, ESTADOS, TIPOS_VISITA } from '../data';
import { RiskBadge, SuccessToast, Card } from '../components/ui/SharedComponents';
import { useConfirm } from '../context/ConfirmContext';

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
    fechaRespuesta: '',
    respuestaEntidad: '',
    comentarioAuditor: '',
    // Optional Tracking for historical data
    seguimiento: null,
};

export default function NuevoRegistro({ crearAuditoria, catalogos = {}, entidades = [], correlativos = [], initialEntityId = null }) {
    const confirm = useConfirm();
    
    // Función para obtener la tarjeta inicial dinámica según el catálogo de estados
    const getInitialTarjeta = () => ({
        ...EMPTY_TARJETA,
        estado: catalogos?.estados?.[0] || 'Pendiente'
    });
    // Header Data States
    const [entidadId, setEntidadId] = useState(initialEntityId || '');
    const [tipoVisita, setTipoVisita] = useState('Focalizada');
    const [nroInforme, setNroInforme] = useState('');
    const [esInformeManual, setEsInformeManual] = useState(false);

    // Dates States
    const [fechaApertura, setFechaApertura] = useState('');
    const [fechaCierre, setFechaCierre] = useState('');
    const [fechaEvalInicio, setFechaEvalInicio] = useState('');
    const [fechaEvalFinal, setFechaEvalFinal] = useState('');
    
    // Investment Vehicle States
    const [esVehiculoInversion, setEsVehiculoInversion] = useState(false);
    const [fondoInversion, setFondoInversion] = useState('');
    const [fondoTitularizacion, setFondoTitularizacion] = useState('');
    // Items States
    const [tarjetas, setTarjetas] = useState([getInitialTarjeta()]);
    const [showToast, setShowToast] = useState(false);
    const [errors, setErrors] = useState({});

    const addTarjeta = () => {
        setTarjetas(prev => [...prev, getInitialTarjeta()]);
    };

    const removeTarjeta = (index) => {
        if (tarjetas.length <= 1) return;
        setTarjetas(prev => prev.filter((_, i) => i !== index));
    };

    const updateTarjeta = (index, field, value) => {
        setTarjetas(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
    };

    const updateSeguimiento = (index, field, value) => {
        setTarjetas(prev => prev.map((t, i) => {
            if (i !== index) return t;
            if (!t.seguimiento) t.seguimiento = {};
            return { ...t, seguimiento: { ...t.seguimiento, [field]: value } };
        }));
    };

    const toggleSeguimiento = (index) => {
        setTarjetas(prev => prev.map((t, i) => {
            if (i !== index) return t;
            return { ...t, seguimiento: t.seguimiento ? null : {} };
        }));
    };

    const validate = () => {
        const errs = {};
        if (!entidadId) errs.entidad = 'Seleccione una entidad';
        if (!nroInforme) errs.nroInforme = 'Ingrese referencia de informe';
        if (!fechaApertura) errs.fechaApertura = 'Ingrese fecha de apertura';
        if (!fechaCierre) errs.fechaCierre = 'Ingrese fecha de cierre';

        tarjetas.forEach((t, i) => {
            if (!t.titulo.trim()) errs[`titulo_${i}`] = 'Ingrese el título';
            if (!t.descripcion.trim()) errs[`desc_${i}`] = 'Ingrese la descripción';
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        
        try {
            await crearAuditoria({
                entidadId: Number(entidadId),
                tipoVisita,
                nroInforme,
                esInformeManual,
                fechaCierre,
                fechaEvalInicio,
                fechaEvalFinal,
                esVehiculoInversion,
                fondoInversion,
                fondoTitularizacion,
                tarjetas,
            });

            // Reset only finding cards, PRESERVE header context for continuous entry
            setTarjetas([getInitialTarjeta()]);
            setErrors({});
            setShowToast(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setShowToast(false), 4000);
        } catch (error) {
            console.error('Error al guardar expediente:', error);
            if (error.code === 'PGRST301' || error.message?.includes('Unauthorized') || String(error.status) === '401') {
                alert('Error de sesión: Por favor, vuelve a iniciar sesión o verifica tus permisos.');
            } else {
                alert('Error inesperado al guardar: ' + (error.message || 'Consulte al administrador.'));
            }
        }
    };

    return (
        <div className="animate-fade-in max-w-400 mx-auto space-y-4 pb-24 text-slate-800">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-text-primary tracking-tight uppercase">Expediente de Auditoría</h2>
                    </div>
                    <p className="text-sm font-medium text-text-muted">Gestión centralizada de hallazgos, programación y documentación oficial del proceso.</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">CÓDIGO GESTIÓN:</span>
                    <span className="text-xs font-black text-primary leading-none">AF-{Math.floor(Math.random() * 9000) + 1000}</span>
                </div>
            </div>

            {/* Master Data Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                    <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">01. Protocolo y Programación</h3>
                </div>

                <Card className="p-6! bg-white border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-visible">
                    <div className="space-y-6">
                        {/* Primary Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Institución / Entidad Auditada</label>
                                <select
                                    value={entidadId}
                                    onChange={e => setEntidadId(Number(e.target.value))}
                                    className={`w-full px-4 py-3.5 rounded-2xl border ${errors.entidad ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50'} text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer`}
                                >
                                    <option value="">— SELECCIONE ENTIDAD —</option>
                                    {entidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Modalidad de Intervención</label>
                                <div className="relative">
                                    <select
                                        value={tipoVisita}
                                        onChange={e => setTipoVisita(e.target.value)}
                                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer appearance-none"
                                    >
                                        {(catalogos.tiposVisita || TIPOS_VISITA).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-5">
                                <div className="flex items-center justify-between px-1 mb-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Referencia Oficial del Informe</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEsInformeManual(!esInformeManual);
                                            setNroInforme('');
                                        }}
                                        className="text-[9px] font-black text-primary uppercase tracking-tighter hover:underline cursor-pointer flex items-center gap-1.5"
                                    >
                                        {esInformeManual ? (
                                            <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" /></svg>LISTADO DINÁMICO</>
                                        ) : (
                                            <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>INGRESO MANUAL</>
                                        )}
                                    </button>
                                </div>
                                <div className="relative">
                                    {esInformeManual ? (
                                        <input
                                            type="text"
                                            placeholder="EJ: AUD-HISTORICO-2022-001"
                                            value={nroInforme}
                                            onChange={e => setNroInforme(e.target.value.toUpperCase())}
                                            className={`w-full px-4 py-3.5 rounded-2xl border ${errors.nroInforme ? 'border-rose-500' : 'border-primary/20 bg-primary/5'} text-sm font-black text-primary placeholder:text-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase`}
                                        />
                                    ) : (
                                        <>
                                            <select
                                                value={nroInforme}
                                                onChange={e => setNroInforme(e.target.value)}
                                                className={`w-full px-4 py-3.5 rounded-2xl border ${errors.nroInforme ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50'} text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer appearance-none pr-10`}
                                            >
                                                <option value="">— SELECCIONE INFORME VIGENTE —</option>
                                                {correlativos.filter(c => c.tipoInforme === 'Informe de supervisión').map(c => (
                                                    <option key={c.id} value={c.codigo}>{c.codigo} | {c.asunto || 'Sin Asunto'}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vehículo de Inversión Logic */}
                        <div className={`p-5 rounded-3xl transition-all duration-500 ${esVehiculoInversion ? 'bg-amber-50/50 border border-amber-100 shadow-sm' : 'bg-slate-50/30 border border-slate-100/50'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${esVehiculoInversion ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-100 text-slate-400'}`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${esVehiculoInversion ? 'text-amber-700' : 'text-slate-500'}`}>Protocolo de Vehículo de Inversión</span>
                                        <span className="text-[9px] font-medium text-slate-400 uppercase">Habilitar si la auditoría se enfoca en fondos o titularizadoras</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEsVehiculoInversion(!esVehiculoInversion);
                                        if (esVehiculoInversion) {
                                            setFondoInversion('');
                                            setFondoTitularizacion('');
                                        }
                                    }}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none cursor-pointer ${esVehiculoInversion ? 'bg-amber-500 shadow-inner' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${esVehiculoInversion ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {esVehiculoInversion && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest px-1">Fondos de Inversión</label>
                                        <div className="relative">
                                            <select
                                                value={fondoInversion}
                                                onChange={e => {
                                                    setFondoInversion(e.target.value);
                                                    if (e.target.value) setFondoTitularizacion('');
                                                }}
                                                className="w-full px-4 py-3 rounded-2xl border border-amber-200 bg-white text-sm font-bold text-amber-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all cursor-pointer appearance-none shadow-sm"
                                            >
                                                <option value="">— SELECCIONAR FONDO —</option>
                                                {(catalogos.fondosInversion || []).map(f => (
                                                    <option key={f.codigo} value={f.nombre}>{f.codigo} - {f.nombre}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-300">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-amber-900 uppercase tracking-widest px-1">Fondos de Titularización</label>
                                        <div className="relative">
                                            <select
                                                value={fondoTitularizacion}
                                                onChange={e => {
                                                    setFondoTitularizacion(e.target.value);
                                                    if (e.target.value) setFondoInversion('');
                                                }}
                                                className="w-full px-4 py-3 rounded-2xl border border-amber-200 bg-white text-sm font-bold text-amber-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all cursor-pointer appearance-none shadow-sm"
                                            >
                                                <option value="">— SELECCIONAR TITULARIZADORA —</option>
                                                {(catalogos.fondosTitularizacion || []).map(f => (
                                                    <option key={f.codigo} value={f.nombre}>{f.codigo} - {f.nombre}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-300">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Audit Scheduling and Evaluation Boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                            {/* Auditoría Box */}
                            <div className="relative p-5 rounded-3xl bg-slate-50/80 border border-slate-200/50 group hover:border-primary/20 transition-all">
                                <div className="absolute -top-3 left-4 px-3 py-1 bg-white border border-slate-200 rounded-full">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Programación de la Auditoría
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-5 pt-2">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fecha Apertura</label>
                                        <input
                                            type="date"
                                            value={fechaApertura}
                                            onChange={e => setFechaApertura(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fecha Cierre</label>
                                        <input
                                            type="date"
                                            value={fechaCierre}
                                            onChange={e => setFechaCierre(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Evaluación Box */}
                            <div className="relative p-5 rounded-3xl bg-indigo-50/30 border border-indigo-100/50 group hover:border-indigo-200 transition-all">
                                <div className="absolute -top-3 left-4 px-3 py-1 bg-white border border-indigo-100 rounded-full">
                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        Periodo de Evaluación
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-5 pt-2">
                                    <div>
                                        <label className="block text-[9px] font-black text-indigo-400/70 uppercase tracking-widest mb-2 ml-1">Fecha Inicio</label>
                                        <input
                                            type="date"
                                            value={fechaEvalInicio}
                                            onChange={e => setFechaEvalInicio(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white text-xs font-bold text-indigo-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-300 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-indigo-400/70 uppercase tracking-widest mb-2 ml-1">Fecha Finalización</label>
                                        <input
                                            type="date"
                                            value={fechaEvalFinal}
                                            onChange={e => setFechaEvalFinal(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white text-xs font-bold text-indigo-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-300 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Hallazgos Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                        <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">02. Declaración de Hallazgos ({tarjetas.length})</h3>
                    </div>
                    <button
                        onClick={addTarjeta}
                        className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Añadir Observación
                    </button>
                </div>

                <div className="space-y-4">
                    {tarjetas.map((tarjeta, index) => (
                        <Card key={index} noPadding className="relative overflow-visible group border-slate-100">
                            {/* Card Decorative Left Bar */}
                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl ${tarjeta.nivelRiesgo === 'Crítico' ? 'bg-rose-500 shadow-[2px_0_10px_rgba(239,68,68,0.2)]' :
                                tarjeta.nivelRiesgo === 'Alto' ? 'bg-amber-500 shadow-[2px_0_10px_rgba(245,158,11,0.2)]' :
                                    tarjeta.nivelRiesgo === 'Medio' ? 'bg-blue-500 shadow-[2px_0_10px_rgba(59,130,246,0.2)]' : 'bg-slate-300'
                                }`} />

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-5 gap-6">
                                    <div className="flex-1 group-hover:pl-1 transition-all">
                                        <label className="block text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-1.5 px-1">Identificación del Hallazgo</label>
                                        <input
                                            type="text"
                                            placeholder="Describa el título corto de la observación..."
                                            value={tarjeta.titulo}
                                            onChange={e => updateTarjeta(index, 'titulo', e.target.value)}
                                            className={`w-full px-1 py-1 text-xl font-black text-text-primary placeholder:text-slate-200 focus:outline-none bg-transparent border-b-2 ${errors[`titulo_${index}`] ? 'border-rose-300' : 'border-slate-50'} focus:border-primary transition-all`}
                                        />
                                        {errors[`titulo_${index}`] && <p className="text-[10px] font-black text-rose-500 mt-2 px-1 uppercase tracking-tighter">⚠️ {errors[`titulo_${index}`]}</p>}
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="flex flex-col items-end">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Criticidad</label>
                                            <select
                                                value={tarjeta.nivelRiesgo}
                                                onChange={e => updateTarjeta(index, 'nivelRiesgo', e.target.value)}
                                                className="font-black text-[12px] text-primary focus:outline-none bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 uppercase cursor-pointer hover:border-primary/50 transition-all appearance-none"
                                            >
                                                {(catalogos?.nivelesRiesgo?.length > 0 ? catalogos.nivelesRiesgo : NIVELES_RIESGO.map(n => n.value)).map(n => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {tarjetas.length > 1 && (
                                            <button
                                                onClick={() => removeTarjeta(index)}
                                                className="self-end p-2.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer group/del"
                                                title="Eliminar Observación"
                                            >
                                                <svg className="w-5 h-5 group-hover/del:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    {/* 02. Identificación del Hallazgo */}
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 px-1">Detalle Narrativo</label>
                                            <textarea
                                                placeholder="Describa extensamente el hallazgo, condiciones y efectos detectados..."
                                                value={tarjeta.descripcion}
                                                onChange={e => updateTarjeta(index, 'descripcion', e.target.value)}
                                                rows={5}
                                                className={`w-full p-5 rounded-3xl border ${errors[`desc_${index}`] ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100 bg-slate-50/30'} text-sm font-medium text-text-secondary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none shadow-inner`}
                                            />
                                            {errors[`desc_${index}`] && <p className="text-[10px] font-black text-rose-500 mt-2 px-1 uppercase tracking-tighter">⚠️ {errors[`desc_${index}`]}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Estado</label>
                                                <select
                                                    value={tarjeta.estado}
                                                    onChange={e => updateTarjeta(index, 'estado', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 text-[11px] font-black text-text-primary uppercase focus:outline-none bg-white cursor-pointer shadow-sm hover:border-primary/30 transition-all appearance-none"
                                                >
                                                    {(catalogos?.estados?.length > 0 ? catalogos.estados : ESTADOS.map(e => e.value)).map(e => (
                                                        <option key={e} value={e}>{e}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Riesgo / Origen</label>
                                                <select
                                                    value={tarjeta.tipoRiesgo}
                                                    onChange={e => updateTarjeta(index, 'tipoRiesgo', e.target.value)}
                                                    className="w-full px-5 py-3 rounded-2xl border border-slate-100 text-[11px] font-black uppercase text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary cursor-pointer hover:bg-slate-50 transition-all appearance-none shadow-sm"
                                                >
                                                    {(catalogos.tiposRiesgo || TIPOS_RIESGO.map(t => t.value || t)).map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Control Regulatorio */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 px-1">Normativa Aplicable</label>
                                            <div className="relative">
                                                <select
                                                    value={tarjeta.normativa}
                                                    onChange={e => updateTarjeta(index, 'normativa', e.target.value)}
                                                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-100 bg-white text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none cursor-pointer shadow-sm"
                                                >
                                                    <option value="">— SELECCIONAR NORMA —</option>
                                                    {(catalogos.normas || []).map(n => (
                                                        <option key={n.codigo} value={`${n.codigo} - ${n.nombre}`}>
                                                            {n.codigo} - {n.nombre.length > 50 ? n.nombre.substring(0, 50) + '...' : n.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="text-[9px] font-medium text-slate-400 mt-2 px-1">Seleccione la base legal o normativa transgredida.</p>
                                        </div>

                                    </div>

                                    {/* 03. Respuesta de la Entidad */}
                                    <div className="space-y-4 pt-1 border-t-4 border-blue-500/20 lg:border-t-0 lg:border-l-4 lg:pl-6 bg-blue-50/10 -mx-4 px-4 py-2 lg:mx-0 lg:p-0 rounded-r-3xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white font-black">3</div>
                                            <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest leading-none pt-0.5">Respuesta de la Entidad</h4>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-widest mb-2 px-1">Fecha de Respuesta</label>
                                            <input
                                                type="date"
                                                value={tarjeta.fechaRespuesta}
                                                onChange={e => updateTarjeta(index, 'fechaRespuesta', e.target.value)}
                                                className="w-full px-4 py-3 rounded-2xl border border-blue-100 bg-white text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-widest mb-2 px-1">Contenido Oficial</label>
                                            <textarea
                                                placeholder="Resumen de la justificación técnica..."
                                                value={tarjeta.respuestaEntidad}
                                                onChange={e => updateTarjeta(index, 'respuestaEntidad', e.target.value)}
                                                rows={5}
                                                className="w-full p-5 rounded-3xl border border-blue-100 bg-white text-sm font-medium text-text-secondary focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all resize-none shadow-sm shadow-blue-50"
                                            />
                                        </div>
                                    </div>

                                    {/* 04. Situación Actual */}
                                    <div className="space-y-4 pt-1 border-t-4 border-violet-500/20 lg:border-t-0 lg:border-l-4 lg:pl-6 bg-violet-50/10 -mx-4 px-4 py-2 lg:mx-0 lg:p-0 rounded-r-3xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center text-[10px] text-white font-black">4</div>
                                            <h4 className="text-[10px] font-black text-violet-700 uppercase tracking-widest leading-none pt-0.5">Situación Actual</h4>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-violet-500/60 uppercase tracking-widest mb-2 px-1">Auditor Responsable</label>
                                            <div className="relative">
                                                <select
                                                    value={tarjeta.responsable}
                                                    onChange={e => updateTarjeta(index, 'responsable', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-2xl border border-violet-100 bg-white text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-400 appearance-none cursor-pointer shadow-sm"
                                                >
                                                    <option value="">— ASIGNAR AUDITOR —</option>
                                                    {(catalogos.responsables || []).map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-violet-500/60 uppercase tracking-widest mb-2 px-1">Análisis de Seguimiento</label>
                                            <textarea
                                                placeholder="Comentarios sobre el estado de la observación..."
                                                value={tarjeta.comentarioAuditor}
                                                onChange={e => updateTarjeta(index, 'comentarioAuditor', e.target.value)}
                                                rows={4}
                                                className="w-full p-5 rounded-3xl border border-violet-100 bg-white text-sm font-medium text-text-secondary focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-400 transition-all resize-none shadow-sm shadow-violet-50"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 pt-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estado de Integridad</label>
                                            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
                                                <div className={`w-3 h-3 rounded-full ${tarjeta.titulo && tarjeta.descripcion ? (tarjeta.respuestaEntidad ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]') : 'bg-slate-200'}`} />
                                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-tight">
                                                    {tarjeta.respuestaEntidad ? 'Expediente Completo' : 'Solo Identificación'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 05. Seguimiento Histórico Inicial */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100 lg:col-span-4 rounded-b-3xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-[10px] text-white font-black">5</div>
                                                <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none pt-0.5">Seguimiento (Opcional)</h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleSeguimiento(index)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none cursor-pointer ${tarjeta.seguimiento ? 'bg-emerald-500 shadow-inner' : 'bg-slate-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${tarjeta.seguimiento ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>

                                        {tarjeta.seguimiento !== null && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5 bg-emerald-50/50 border border-emerald-100 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div>
                                                    <label className="block text-[9px] font-black text-emerald-600/80 uppercase tracking-widest mb-2 px-1">Fecha Respuesta (Entidad)</label>
                                                    <input
                                                        type="date"
                                                        value={tarjeta.seguimiento.fechaRespuesta || ''}
                                                        onChange={e => updateSeguimiento(index, 'fechaRespuesta', e.target.value)}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 bg-white text-xs font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-black text-emerald-600/80 uppercase tracking-widest mb-2 px-1">Fecha Plan Acción</label>
                                                    <input
                                                        type="date"
                                                        value={tarjeta.seguimiento.fechaPlanAccion || ''}
                                                        onChange={e => updateSeguimiento(index, 'fechaPlanAccion', e.target.value)}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 bg-white text-xs font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-black text-emerald-600/80 uppercase tracking-widest mb-2 px-1">Fecha de este Seguimiento</label>
                                                    <input
                                                        type="date"
                                                        value={tarjeta.seguimiento.fechaSeguimiento || ''}
                                                        onChange={e => updateSeguimiento(index, 'fechaSeguimiento', e.target.value)}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 bg-white text-xs font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                                                    />
                                                </div>
                                                <div className="lg:col-span-3">
                                                    <label className="block text-[9px] font-black text-emerald-600/80 uppercase tracking-widest mb-2 px-1">Campo para Detallar (Extracto / Componente)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Especifique el componente evaluado..."
                                                        value={tarjeta.seguimiento.campoDetallar || ''}
                                                        onChange={e => updateSeguimiento(index, 'campoDetallar', e.target.value)}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 bg-white text-xs font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                                                    />
                                                </div>
                                                <div className="lg:col-span-3">
                                                    <label className="block text-[9px] font-black text-emerald-600/80 uppercase tracking-widest mb-2 px-1">Respuesta (Entidad frente al plan)</label>
                                                    <textarea
                                                        placeholder="Comentarios de la entidad..."
                                                        value={tarjeta.seguimiento.respuesta || ''}
                                                        onChange={e => updateSeguimiento(index, 'respuesta', e.target.value)}
                                                        rows={2}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 bg-white text-xs font-medium text-text-secondary focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all resize-none shadow-sm shadow-emerald-50"
                                                    />
                                                </div>
                                                <div className="lg:col-span-3">
                                                    <label className="block text-[9px] font-black text-emerald-600/80 uppercase tracking-widest mb-2 px-1">Análisis (Auditor/Especialista)</label>
                                                    <textarea
                                                        placeholder="Conclusiones del análisis del seguimiento..."
                                                        value={tarjeta.seguimiento.analisis || ''}
                                                        onChange={e => updateSeguimiento(index, 'analisis', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-emerald-100 bg-white text-xs font-medium text-text-secondary focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all resize-none shadow-sm shadow-emerald-50"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Sticky Actions Bar */}
            <div className="fixed bottom-0 left-55 right-0 bg-white/70 backdrop-blur-2xl border-t border-slate-200/50 px-6 py-4 z-40 transition-all shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)]">
                <div className="max-w-400 mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacidad de Registro</span>
                            <div className="flex items-center gap-4 mt-1.5">
                                <span className="text-sm font-black text-slate-900 leading-none uppercase tracking-tight">{tarjetas.length} HALLAZGO(S) DECLARADO(S)</span>
                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" style={{ width: `${Math.min((tarjetas.length / 5) * 100, 100)}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-slate-200" />

                        <div className="flex flex-col text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed italic max-w-50">
                            <span>* Valide las fechas de corte</span>
                            <span>* El informe es obligatorio</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button
                            onClick={async () => {
                                if (await confirm('¿Desea descartar todos los cambios actuales?', 'Descartar Cambios')) {
                                    setEntidadId('');
                                    setNroInforme('');
                                    setFechaApertura('');
                                    setFechaCierre('');
                                    setFechaEvalInicio('');
                                    setFechaEvalFinal('');
                                    setEsVehiculoInversion(false);
                                    setFondoInversion('');
                                    setFondoTitularizacion('');
                                    setTarjetas([{ ...EMPTY_TARJETA }]);
                                    setErrors({});
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                            className="px-8 py-3.5 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer active:scale-95"
                        >
                            Limpiar Formulario
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-12 py-4 rounded-2xl bg-slate-900 text-white text-[12px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-slate-300 hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center gap-3 cursor-pointer group"
                        >
                            <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Registrar Hallazgos
                        </button>
                    </div>
                </div>
            </div>

            {showToast && (
                <SuccessToast
                    message="El expediente de auditoría ha sido registrado exitosamente en el sistema central."
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
}
