import { useState } from 'react';
import { formatDate, ESTADOS, RESPONSABLES, TIPOS_VISITA, NIVELES_RIESGO, TIPOS_RIESGO } from '../data';
import { RiskBadge, EstadoBadge, Avatar, SuccessToast, Card } from '../components/ui/SharedComponents';

// ─── Shared sub-components ────────────────────────────────────────────────────
function SectionHeader({ number, label, color = 'slate', icon }) {
    const colors = {
        slate: { ring: 'ring-slate-200', bg: 'bg-slate-900', text: 'text-white', border: 'border-l-slate-700', numBg: 'bg-slate-100', numText: 'text-slate-700' },
        blue: { ring: 'ring-blue-100', bg: 'bg-blue-600', text: 'text-white', border: 'border-l-blue-600', numBg: 'bg-blue-50', numText: 'text-blue-700' },
        violet: { ring: 'ring-violet-100', bg: 'bg-violet-600', text: 'text-white', border: 'border-l-violet-600', numBg: 'bg-violet-50', numText: 'text-violet-700' },
        emerald: { ring: 'ring-emerald-100', bg: 'bg-emerald-600', text: 'text-white', border: 'border-l-emerald-600', numBg: 'bg-emerald-50', numText: 'text-emerald-700' },
    };
    const c = colors[color];
    return (
        <div className={`flex items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
            <div className={`w-7 h-7 rounded-lg ${c.numBg} flex items-center justify-center shrink-0`}>
                <span className={`text-xs font-black ${c.numText}`}>{number}</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
                {icon && <span className={`${c.numText}`}>{icon}</span>}
                <h3 className={`text-[11px] font-black text-text-primary uppercase tracking-[0.18em]`}>{label}</h3>
            </div>
        </div>
    );
}

function FieldLabel({ children }) {
    return <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{children}</label>;
}

function inputCls() {
    return "w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary bg-slate-50/50 transition-all";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DetalleObservacion({ observacion, cambiarEstado, eliminarObservacion, editarObservacion, onBack, catalogos }) {
    const entidades = catalogos?.entidades || [];
    const ent = entidades.find(e => Number(e.id) === Number(observacion.entidadId));

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ 
        ...observacion,
        fechaApertura: observacion.fechaApertura || '',
        fechaCierre: observacion.fechaCierre || '',
        fechaEvalInicio: observacion.fechaEvalInicio || '',
        fechaEvalFinal: observacion.fechaEvalFinal || ''
    });

    const handleEliminar = () => {
        if (window.confirm('¿Está seguro de eliminar esta observación permanentemente?')) {
            if (eliminarObservacion(observacion.id)) {
                onBack();
            }
        }
    };

    const handleSaveEdit = async () => {
        setIsEditing(false);
        await editarObservacion(observacion.id, editData);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    const handleCancelEdit = () => {
        setEditData({ 
            ...observacion,
            fechaApertura: observacion.fechaApertura || '',
            fechaCierre: observacion.fechaCierre || '',
            fechaEvalInicio: observacion.fechaEvalInicio || '',
            fechaEvalFinal: observacion.fechaEvalFinal || ''
        });
        setIsEditing(false);
    };


    // Section 3 – Respuesta de la Entidad
    const [fechaRespuesta, setFechaRespuesta] = useState('');
    const [respuestaEntidad, setRespuestaEntidad] = useState('');
    const [objetoSeguimiento, setObjetoSeguimiento] = useState('');

    // Section 4 – Situación Actual
    const [nuevoEstado, setNuevoEstado] = useState(observacion.estado);
    const [comentarioAuditor, setComentarioAuditor] = useState('');
    const [fechaPlanAccion, setFechaPlanAccion] = useState('');

    // Legacy fields kept so the data shape stays compatible
    const [nroInforme, setNroInforme] = useState(observacion.nroInforme);
    const [nota, setNota] = useState('');
    const [criterioAdministrativo, setCriterioAdministrativo] = useState(observacion.criterioAdministrativo || '');
    const [criterioLegal, setCriterioLegal] = useState(observacion.criterioLegal || '');

    const [showToast, setShowToast] = useState(false);

    const handleGuardarCiclo = () => {
        if (nuevoEstado === 'Subsanada') {
            if (!criterioAdministrativo.trim() || !criterioLegal.trim()) {
                alert('Debe completar los criterios administrativo y legal para cerrar la observación.');
                return;
            }
        }

        cambiarEstado(observacion.id, {
            nuevoEstado,
            nroInforme: isEditing ? editData.nroInforme : nroInforme,
            nota,
            respuestaEntidad,
            fechaRespuesta,
            objetoSeguimiento,
            analisisAuditor: comentarioAuditor,
            fechaPlanAccion,
            criterioAdministrativo,
            criterioLegal,
        });

        // Reset fields
        setFechaRespuesta('');
        setRespuestaEntidad('');
        setObjetoSeguimiento('');
        setComentarioAuditor('');
        setFechaPlanAccion('');
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    const estados = catalogos?.estados || ESTADOS.map(e => e.value);
    const responsables = catalogos?.responsables || RESPONSABLES;
    const tiposVisita = catalogos?.tiposVisita || TIPOS_VISITA;
    const nivelesRiesgo = catalogos?.nivelesRiesgo || NIVELES_RIESGO.map(n => n.value);
    const tiposRiesgo = catalogos?.tiposRiesgo || TIPOS_RIESGO;
    const secciones = catalogos?.secciones || [];

    return (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-4 pb-6 px-4">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2 grow">
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
                            <span className="text-sm font-black text-white">#{String(observacion?.id || '').split('-').pop()}</span>
                        </div>
                        <div className="grow">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.titulo}
                                    onChange={e => setEditData({ ...editData, titulo: e.target.value })}
                                    className="text-xl font-black text-text-primary tracking-tight leading-tight w-full bg-slate-100 px-2 py-1 rounded-lg border-none focus:ring-2 focus:ring-primary/20"
                                />
                            ) : (
                                <h2 className="text-xl font-black text-text-primary tracking-tight leading-tight">{observacion.titulo}</h2>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <span>Expediente:</span>
                                        <input
                                            type="text"
                                            value={editData.nroInforme}
                                            onChange={e => setEditData({ ...editData, nroInforme: e.target.value })}
                                            className="bg-slate-100 p-1 rounded font-black text-slate-600 focus:outline-none"
                                        />
                                    </div>
                                ) : (
                                    <span>Expediente {observacion.nroInforme}</span>
                                )}
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <span>{ent?.nombre?.split(',')[0]}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all cursor-pointer"
                            >
                                Guardar Cambios
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                            </button>
                            <button
                                onClick={handleEliminar}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors cursor-pointer border border-rose-100"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                            </button>
                        </>
                    )}
                    <RiskBadge nivel={isEditing ? editData.nivelRiesgo : observacion.nivelRiesgo} />
                    <EstadoBadge estado={observacion.estado} />
                </div>
            </div>

            {/* ── Layout ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Left Column – static info */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-0! overflow-hidden shadow-xl border-0 ring-1 ring-slate-100">
                        <div className="bg-slate-900 p-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Información de Atribución</h3>
                            <div className="flex items-center gap-4">
                                <Avatar nombre={isEditing ? editData.responsable : observacion.responsable} size="lg" className="ring-4 ring-white/10" />
                                <div className="grow">
                                    {isEditing ? (
                                        <select
                                            value={editData.responsable}
                                            onChange={e => setEditData({ ...editData, responsable: e.target.value })}
                                            className="w-full bg-slate-800 text-white font-black text-sm p-1.5 rounded-lg border-none focus:ring-2 focus:ring-primary/40 uppercase"
                                        >
                                             {responsables.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-white font-black text-lg leading-none">{observacion.responsable}</p>
                                    )}
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">Auditor Responsable</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-4 bg-white">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Visita</span>
                                    {isEditing ? (
                                        <select
                                            value={editData.tipoVisita}
                                            onChange={e => setEditData({ ...editData, tipoVisita: e.target.value })}
                                            className="text-xs font-bold text-text-primary uppercase w-full bg-slate-50 border-none rounded p-1"
                                        >
                                            {tiposVisita.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-bold text-text-primary uppercase">{observacion.tipoVisita}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nivel Riesgo</span>
                                    {isEditing ? (
                                        <select
                                            value={editData.nivelRiesgo}
                                            onChange={e => setEditData({ ...editData, nivelRiesgo: e.target.value })}
                                            className="text-xs font-bold text-text-primary uppercase w-full bg-slate-50 border-none rounded p-1"
                                        >
                                            {nivelesRiesgo.map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-bold text-text-primary uppercase">{observacion.nivelRiesgo}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Normativa Ref.</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.normativa}
                                            onChange={e => setEditData({ ...editData, normativa: e.target.value })}
                                            className="text-xs font-bold text-text-primary w-full bg-slate-50 border-none rounded p-1"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-text-primary">{observacion.normativa || 'No Declarada'}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sección</span>
                                    {isEditing ? (
                                        <select
                                            value={editData.seccionId}
                                            onChange={e => setEditData({ ...editData, seccionId: e.target.value })}
                                            className="text-xs font-bold text-text-primary uppercase w-full bg-slate-50 border-none rounded p-1"
                                        >
                                            <option value="">— SELEC —</option>
                                            {secciones.map(s => (
                                                <option key={s.codigo} value={s.codigo} title={s.nombre}>{s.codigo}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-bold text-text-primary uppercase">{observacion.seccionId || '—'}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Riesgo</span>
                                    {isEditing ? (
                                        <select
                                            value={editData.tipoRiesgo}
                                            onChange={e => setEditData({ ...editData, tipoRiesgo: e.target.value })}
                                            className="text-xs font-bold text-text-primary uppercase w-full bg-slate-50 border-none rounded p-1"
                                        >
                                            {tiposRiesgo.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-bold text-text-primary uppercase">{observacion.tipoRiesgo}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 space-y-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descripción del Caso</span>
                                {isEditing ? (
                                    <textarea
                                        value={editData.descripcion}
                                        onChange={e => setEditData({ ...editData, descripcion: e.target.value })}
                                        className="text-sm font-medium text-text-secondary leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic w-full focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                                        rows={5}
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-text-secondary leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                                        "{observacion.descripcion}"
                                    </p>
                                )}
                            </div>

                        <div className="pt-2 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <FieldLabel>Apertura Auditoría</FieldLabel>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editData.fechaApertura?.split('T')[0] || ''}
                                            onChange={e => setEditData({ ...editData, fechaApertura: e.target.value })}
                                            className="text-[11px] font-bold text-text-primary w-full bg-slate-50 border border-slate-100 rounded px-2 py-1"
                                        />
                                    ) : (
                                        <p className="text-xs font-bold text-text-primary uppercase">{formatDate(observacion.fechaApertura)}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <FieldLabel>Cierre Auditoría</FieldLabel>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editData.fechaCierre?.split('T')[0] || ''}
                                            onChange={e => setEditData({ ...editData, fechaCierre: e.target.value })}
                                            className="text-[11px] font-bold text-text-primary w-full bg-slate-50 border border-slate-100 rounded px-2 py-1"
                                        />
                                    ) : (
                                        <p className="text-xs font-bold text-text-primary uppercase">{formatDate(observacion.fechaCierre)}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                                <div className="space-y-1">
                                    <FieldLabel>Inicio Evaluación</FieldLabel>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editData.fechaEvalInicio?.split('T')[0] || ''}
                                            onChange={e => setEditData({ ...editData, fechaEvalInicio: e.target.value })}
                                            className="text-[11px] font-bold text-text-primary w-full bg-slate-50 border border-slate-100 rounded px-2 py-1"
                                        />
                                    ) : (
                                        <p className="text-xs font-bold text-text-primary uppercase">{formatDate(observacion.fechaEvalInicio)}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <FieldLabel>Final Evaluación</FieldLabel>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editData.fechaEvalFinal?.split('T')[0] || ''}
                                            onChange={e => setEditData({ ...editData, fechaEvalFinal: e.target.value })}
                                            className="text-[11px] font-bold text-text-primary w-full bg-slate-50 border border-slate-100 rounded px-2 py-1"
                                        />
                                    ) : (
                                        <p className="text-xs font-bold text-text-primary uppercase">{formatDate(observacion.fechaEvalFinal)}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column – sections 3 & 4 + timeline */}
                <div className="lg:col-span-2 space-y-4">

                    {/* ╔═══════════════════════════════════════════════════════╗ */}
                    {/* ║  REGISTRO DE CICLO DE GESTIÓN                        ║ */}
                    {/* ╚═══════════════════════════════════════════════════════╝ */}
                    
                    {/* SECCIÓN 3 – Respuesta de la Entidad */}
                    <Card className="p-5! shadow-xl border-0 ring-1 ring-blue-100">
                        <SectionHeader
                            number="3"
                            color="blue"
                            label="Respuesta de la Entidad"
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <FieldLabel>Fecha de Respuesta</FieldLabel>
                                <input
                                    type="date"
                                    value={fechaRespuesta}
                                    onChange={e => setFechaRespuesta(e.target.value)}
                                    className={inputCls()}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <FieldLabel>Respuesta / Contenido</FieldLabel>
                                <textarea
                                    placeholder="Detalle la respuesta brindada por la entidad..."
                                    value={respuestaEntidad}
                                    onChange={e => setRespuestaEntidad(e.target.value)}
                                    rows={1}
                                    className={`${inputCls()} resize-none`}
                                />
                            </div>

                            <div className="md:col-span-3">
                                <FieldLabel>Objeto del Seguimiento</FieldLabel>
                                <textarea
                                    placeholder="Título o resumen breve del seguimiento actual..."
                                    value={objetoSeguimiento}
                                    onChange={e => setObjetoSeguimiento(e.target.value)}
                                    rows={1}
                                    className={`${inputCls()} resize-none bg-blue-50/50 border-blue-200`}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* SECCIÓN 4 – Situación Actual / Análisis */}
                    <Card className="p-5! shadow-xl border-0 ring-1 ring-violet-100">
                        <SectionHeader
                            number="4"
                            color="violet"
                            label="Situación Actual y Análisis"
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <FieldLabel>Nuevo Estado</FieldLabel>
                                    <select
                                        value={nuevoEstado}
                                        onChange={e => setNuevoEstado(e.target.value)}
                                        className={`${inputCls()} font-bold uppercase cursor-pointer border-violet-200 bg-violet-50/30 text-violet-900 focus:ring-violet-500/20 focus:border-violet-500`}
                                    >
                                        <option value="" disabled>— Seleccionar —</option>
                                        {catalogos?.estados?.map(e => (
                                            <option key={e.id} value={e.nombre}>{e.nombre}</option>
                                        )) || estados.map(e => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <FieldLabel>Fecha Plan de Acción</FieldLabel>
                                    <input
                                        type="date"
                                        value={fechaPlanAccion}
                                        onChange={e => setFechaPlanAccion(e.target.value)}
                                        className={inputCls()}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <FieldLabel>Análisis Técnico del Auditor</FieldLabel>
                                <textarea
                                    placeholder="Registre su análisis técnico respecto a los avances o situación actual..."
                                    value={comentarioAuditor}
                                    onChange={e => setComentarioAuditor(e.target.value)}
                                    rows={5}
                                    className={`${inputCls()} resize-none`}
                                />
                            </div>
                        </div>

                        {/* Criterios de Cierre */}
                        {nuevoEstado === 'Subsanada' && (
                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-5">
                                <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Criterio Administrativo <span className="text-rose-500">*</span></label>
                                                <textarea
                                                    rows={1}
                                                    value={criterioAdministrativo}
                                                    onChange={e => setCriterioAdministrativo(e.target.value)}
                                                    className={`w-full p-4 rounded-2xl border border-emerald-200 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm resize-none`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Criterio Legal <span className="text-rose-500">*</span></label>
                                                <textarea
                                                    rows={1}
                                                    value={criterioLegal}
                                                    onChange={e => setCriterioLegal(e.target.value)}
                                                    className={`w-full p-4 rounded-2xl border border-emerald-200 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm resize-none`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                            <p className="text-[10px] text-amber-600 font-bold italic">
                                * Al registrar se actualizará la bitácora y la tabla de seguimientos.
                            </p>
                            <button
                                onClick={handleGuardarCiclo}
                                className="px-6 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Registrar Ciclo
                            </button>
                        </div>
                    </Card>

                    {/* TRAZA DE AUDITORÍA (Historial de Estados y Seguimiento) */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-900" />
                                <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">Traza de Auditoría</h3>
                            </div>
                            <span className="text-[10px] font-bold text-text-muted italic">Eventos Cronológicos</span>
                        </div>

                        <div className="relative pl-6 space-y-4">
                            <div className="absolute left-0.75 top-4 bottom-4 w-0.5 bg-slate-100" />

                            {[...(observacion.historialEstados || [])].reverse().map((h, i) => (
                                <div key={i} className="relative animate-fade-in group">
                                    <div className="absolute -left-7.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-900 group-hover:scale-125 transition-transform z-10" />

                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-lg transition-all border-l-4 border-l-slate-900">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className="px-3 py-1 bg-slate-100 rounded-lg">
                                                    <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">{formatDate(h.fecha)}</span>
                                                </div>
                                                <EstadoBadge estado={h.estadoNuevo} />
                                            </div>
                                            {h.objetoSeguimiento && (
                                                <div className="line-clamp-1 text-[11px] font-black text-slate-500 uppercase italic">
                                                    {h.objetoSeguimiento}
                                                </div>
                                            )}
                                        </div>

                                        {h.analisisAuditor && (
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                                                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{h.analisisAuditor}"</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {h.fechaPlanAccion && (
                                                <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                                    PLAN ACCIÓN: {formatDate(h.fechaPlanAccion)}
                                                </div>
                                            )}
                                            {h.fechaRespuesta && (
                                                <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                                    RESPUESTA: {formatDate(h.fechaRespuesta)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* BITÁCORA RELACIONAL */}
                    <section className="space-y-4 pt-6 border-t border-slate-100">
                         <div className="flex items-center gap-2 px-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">Bitácora Relacional (Seguimientos)</h3>
                        </div>

                        {(!observacion.seguimientos || observacion.seguimientos.length === 0) ? (
                            <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin registros de seguimiento relacional persistidos</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...observacion.seguimientos].sort((a, b) => b.id - a.id).map(s => (
                                    <div key={s.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col gap-2 border-l-4 border-l-emerald-500">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{formatDate(s.fecha_seguimiento)}</span>
                                            {s.fecha_plan_accion && (
                                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">Vence: {formatDate(s.fecha_plan_accion)}</span>
                                            )}
                                        </div>
                                        <h4 className="text-xs font-black text-slate-800 leading-tight">{s.campo_detallar || 'Seguimiento general'}</h4>
                                        {s.analisis && (
                                            <p className="text-[11px] font-medium text-slate-600 line-clamp-2 italic">"{s.analisis}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {showToast && (
                <SuccessToast
                    message={isEditing ? "Gestión actualizada." : "Ciclo registrado con éxito."}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
}
