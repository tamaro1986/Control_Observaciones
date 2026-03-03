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
    nroInforme: '',
    nota: '',
    responsable: '',
    fechaPlanAccion: '',
};

export default function NuevoRegistro({ crearAuditoria, catalogos, correlativos = [] }) {
    const [entidadId, setEntidadId] = useState('');
    const [tipoVisita, setTipoVisita] = useState('Focalizada');
    const [tipoInforme, setTipoInforme] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [tarjetas, setTarjetas] = useState([{ ...EMPTY_TARJETA }]);
    const [showToast, setShowToast] = useState(false);
    const [errors, setErrors] = useState({});

    const addTarjeta = () => {
        setTarjetas(prev => [...prev, { ...EMPTY_TARJETA }]);
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
        if (!fechaInicio) errs.fechaInicio = 'Ingrese fecha de inicio';
        if (!fechaFin) errs.fechaFin = 'Ingrese fecha de fin';
        tarjetas.forEach((t, i) => {
            if (!t.titulo.trim()) errs[`titulo_${i}`] = 'Ingrese el título';
            if (!t.descripcion.trim()) errs[`desc_${i}`] = 'Ingrese la descripción';
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        crearAuditoria({
            entidadId,
            tipoVisita,
            fechaInicio,
            fechaFin,
            tarjetas,
        });
        // Reset
        setEntidadId('');
        setFechaInicio('');
        setFechaFin('');
        setTarjetas([{ ...EMPTY_TARJETA }]);
        setErrors({});
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    return (
        <div className="animate-fade-in max-w-[1600px] mx-auto space-y-4 pb-24">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-text-primary tracking-tight">Expediente de Carga</h2>
                    </div>
                    <p className="text-sm font-medium text-text-muted">Registro de hallazgos y control de documentación para el proceso de auditoría.</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ID SOLICITUD:</span>
                    <span className="text-xs font-black text-text-primary leading-none">AUTO-{Math.floor(Math.random() * 9000) + 1000}</span>
                </div>
            </div>

            {/* Master Data Section */}
            <section className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                    <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">01. Datos Maestros de la Auditoría</h3>
                </div>

                <Card className="!p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Entidad Auditada</label>
                            <select
                                value={entidadId}
                                onChange={e => setEntidadId(e.target.value)}
                                className={`w-full px-4 py-3 rounded-2xl border ${errors.entidad ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200'} text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50/50 cursor-pointer`}
                            >
                                <option value="">Seleccione Entidad</option>
                                {catalogos.entidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                            </select>
                            {errors.entidad && <p className="text-[10px] font-black text-rose-500 mt-2 px-1 uppercase tracking-tighter">⚠️ {errors.entidad}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Tipo de Visita</label>
                            <div className="relative">
                                <select
                                    value={tipoVisita}
                                    onChange={e => setTipoVisita(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50/50 cursor-pointer appearance-none"
                                >
                                    {TIPOS_VISITA.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Tipo de Informe</label>
                            <div className="relative">
                                <select
                                    value={tipoInforme}
                                    onChange={e => {
                                        setTipoInforme(e.target.value);
                                        // Resetear referencia cuando cambia el tipo de informe
                                        setTarjetas(prev => prev.map(t => ({ ...t, nroInforme: '' })));
                                    }}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50/50 cursor-pointer appearance-none"
                                >
                                    <option value="">Manual / Ninguno</option>
                                    {catalogos.tiposInforme && catalogos.tiposInforme.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Fecha de Apertura</label>
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={e => setFechaInicio(e.target.value)}
                                className={`w-full px-4 py-3 rounded-2xl border ${errors.fechaInicio ? 'border-rose-500' : 'border-slate-200'} text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50/50`}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Fecha de Cierre</label>
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={e => setFechaFin(e.target.value)}
                                className={`w-full px-4 py-3 rounded-2xl border ${errors.fechaFin ? 'border-rose-500' : 'border-slate-200'} text-sm font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50/50`}
                            />
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento de Soporte (PDF):</label>
                            <button
                                onClick={() => alert('Integración con servicio de almacenamiento requerida.')}
                                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-text-primary uppercase tracking-[0.1em] hover:bg-slate-50 hover:border-primary transition-all flex items-center gap-2 group cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                Vincular Adjunto
                            </button>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 italic">* Campos obligatorios marcados para validación regulatoria</span>
                    </div>
                </Card>
            </section>

            {/* Hallazgos Section */}
            <section className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                        <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">02. Declaración de Hallazgos ({tarjetas.length})</h3>
                    </div>
                    <button
                        onClick={addTarjeta}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 cursor-pointer active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Item
                    </button>
                </div>

                <div className="space-y-3">
                    {tarjetas.map((tarjeta, index) => (
                        <Card key={index} noPadding className="relative overflow-visible group">
                            {/* Card Decorative Left Bar */}
                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl ${tarjeta.nivelRiesgo === 'Crítico' ? 'bg-rose-500 shadow-[2px_0_10px_rgba(239,68,68,0.2)]' :
                                tarjeta.nivelRiesgo === 'Alto' ? 'bg-amber-500 shadow-[2px_0_10px_rgba(245,158,11,0.2)]' :
                                    tarjeta.nivelRiesgo === 'Medio' ? 'bg-blue-500 shadow-[2px_0_10px_rgba(59,130,246,0.2)]' : 'bg-slate-300'
                                }`} />

                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 max-w-2xl group-hover:pl-1 transition-all">
                                        <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 px-1">Identificador de Hallazgo</label>
                                        <input
                                            type="text"
                                            placeholder="Describa el título corto de la observación..."
                                            value={tarjeta.titulo}
                                            onChange={e => updateTarjeta(index, 'titulo', e.target.value)}
                                            className={`w-full px-1 py-1 text-xl font-black text-text-primary placeholder:text-slate-300 focus:outline-none bg-transparent border-b-2 ${errors[`titulo_${index}`] ? 'border-rose-300' : 'border-slate-100'} focus:border-primary transition-all`}
                                        />
                                        {errors[`titulo_${index}`] && <p className="text-[10px] font-black text-rose-500 mt-2 px-1 uppercase tracking-tighter">⚠️ {errors[`titulo_${index}`]}</p>}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Severidad</label>
                                            <select
                                                value={tarjeta.nivelRiesgo}
                                                onChange={e => updateTarjeta(index, 'nivelRiesgo', e.target.value)}
                                                className="px-4 py-1.5 rounded-full border border-slate-200 text-[11px] font-black uppercase text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary cursor-pointer hover:bg-slate-50 transition-all appearance-none text-center min-w-[100px]"
                                            >
                                                {NIVELES_RIESGO.map(n => <option key={n.value} value={n.value}>{n.value}</option>)}
                                            </select>
                                        </div>

                                        {tarjetas.length > 1 && (
                                            <button
                                                onClick={() => removeTarjeta(index)}
                                                className="mt-4 p-2.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer group/del"
                                                title="Descartar Item"
                                            >
                                                <svg className="w-5 h-5 group-hover/del:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                    <div className="lg:col-span-1 space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Detalle Narrativo</label>
                                            <textarea
                                                placeholder="Describa extensamente el hallazgo, condiciones y efectos detectados..."
                                                value={tarjeta.descripcion}
                                                onChange={e => updateTarjeta(index, 'descripcion', e.target.value)}
                                                rows={4}
                                                className={`w-full p-4 rounded-2xl border ${errors[`desc_${index}`] ? 'border-rose-200' : 'border-slate-100'} text-sm font-medium text-text-secondary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none bg-slate-50/30`}
                                            />
                                            {errors[`desc_${index}`] && <p className="text-[10px] font-black text-rose-500 mt-2 px-1 uppercase tracking-tighter">⚠️ {errors[`desc_${index}`]}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Gestión Inicial</label>
                                                <select
                                                    value={tarjeta.estado}
                                                    onChange={e => updateTarjeta(index, 'estado', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[11px] font-black text-text-primary uppercase focus:outline-none bg-white cursor-pointer"
                                                >
                                                    {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.value}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Tipo de Riesgo</label>
                                                <select
                                                    value={tarjeta.tipoRiesgo}
                                                    onChange={e => updateTarjeta(index, 'tipoRiesgo', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[11px] font-black text-text-primary uppercase focus:outline-none bg-white cursor-pointer"
                                                >
                                                    {TIPOS_RIESGO.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-1 space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Normativa Aplicable</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Art. 45 - Lineamientos de Seguridad IT"
                                                value={tarjeta.normativa}
                                                onChange={e => updateTarjeta(index, 'normativa', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Referencia Informe</label>
                                                {tipoInforme === 'Informe de supervisión' ? (
                                                    <select
                                                        value={tarjeta.nroInforme}
                                                        onChange={e => updateTarjeta(index, 'nroInforme', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-indigo-50/50 text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer appearance-none truncate"
                                                    >
                                                        <option value="">Seleccione Correlativo...</option>
                                                        {correlativos.filter(c => c.tipoInforme === 'Informe de supervisión').map(c => (
                                                            <option key={c.id} value={c.codigo}>{c.codigo} - {c.entidad}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        placeholder="N° INF-2025-001"
                                                        value={tarjeta.nroInforme}
                                                        onChange={e => updateTarjeta(index, 'nroInforme', e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-text-primary focus:outline-none"
                                                    />
                                                )}
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Sección</label>
                                                <input
                                                    type="text"
                                                    placeholder="Nota 1.2"
                                                    value={tarjeta.nota}
                                                    onChange={e => updateTarjeta(index, 'nota', e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-text-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-slate-900/5 border border-slate-900/10 space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen Ejecutivo Automatico:</p>
                                            <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                                                "{tarjeta.titulo || 'Sin título'} identificado como riesgo {tarjeta.nivelRiesgo.toUpperCase()} bajo la normativa {tarjeta.normativa || 'no especificada'}."
                                            </p>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-1 space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Responsable del Seguimiento</label>
                                            <select
                                                value={tarjeta.responsable}
                                                onChange={e => updateTarjeta(index, 'responsable', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-text-primary focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">Asignar Auditor</option>
                                                {catalogos.responsables.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Fecha Compromiso Plan Acción</label>
                                            <input
                                                type="date"
                                                value={tarjeta.fechaPlanAccion}
                                                onChange={e => updateTarjeta(index, 'fechaPlanAccion', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-text-primary focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1 pt-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estado de Integridad</label>
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-100">
                                                <div className={`w-3 h-3 rounded-full ${tarjeta.titulo && tarjeta.descripcion ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Validación de Datos Básicos</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Sticky Actions Bar */}
            <div className="fixed bottom-0 left-[220px] right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-3 z-40 transition-all">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso de Carga</span>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-black text-text-primary leading-none uppercase">{tarjetas.length} HALLAZGO(S)</span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min((tarjetas.length / 5) * 100, 100)}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-slate-100" />

                        <p className="text-[10px] font-bold text-slate-400 max-w-[200px] leading-relaxed italic">
                            Asegúrese de que el plan de acción coincida con la severidad declarada.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (window.confirm('¿Está seguro de limpiar todo el formulario?')) {
                                    setTarjetas([{ ...EMPTY_TAR_JETA }]);
                                    setEntidadId('');
                                    setFechaInicio('');
                                    setFechaFin('');
                                    setErrors({});
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                            className="px-6 py-3 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                        >
                            Limpiar Formulario
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-10 py-3.5 rounded-2xl bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 cursor-pointer group"
                        >
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                            Finalizar y Registrar
                        </button>
                    </div>
                </div>
            </div>

            {showToast && (
                <SuccessToast
                    message="Auditoría registrada en el sistema de control centralizado exitosamente."
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
}

