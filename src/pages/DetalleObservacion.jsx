import { useState } from 'react';
import { formatDate, ESTADOS, RESPONSABLES, TIPOS_VISITA, NIVELES_RIESGO, TIPOS_RIESGO } from '../data/data';
import { RiskBadge, EstadoBadge, Avatar, SuccessToast, Card } from '../components/SharedComponents';

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

    // Section 4 – Situación Actual
    const [nuevoEstado, setNuevoEstado] = useState(observacion.estado);
    const [comentarioAuditor, setComentarioAuditor] = useState('');

    // Legacy fields kept so the data shape stays compatible
    const [nroInforme, setNroInforme] = useState(observacion.nroInforme);
    const [nota, setNota] = useState('');
    const [analisisAuditor, setAnalisisAuditor] = useState('');
    const [planAccion, setPlanAccion] = useState('');
    const [fechaPlanAccion, setFechaPlanAccion] = useState('');
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
            analisisAuditor: comentarioAuditor || analisisAuditor,
            planAccion,
            fechaPlanAccion,
            criterioAdministrativo,
            criterioLegal,
        });
        // Reset section-3 fields
        setFechaRespuesta('');
        setRespuestaEntidad('');
        // Reset section-4 fields (state stays as new value)
        setComentarioAuditor('');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    const estados = catalogos?.estados?.map(e => e.nombre) || ESTADOS.map(e => e.value);
    const responsables = catalogos?.responsables || RESPONSABLES;
    const tiposVisita = catalogos?.tiposVisita || TIPOS_VISITA;
    const nivelesRiesgo = catalogos?.nivelesRiesgo || NIVELES_RIESGO.map(n => n.value);
    const tiposRiesgo = catalogos?.tiposRiesgo || TIPOS_RIESGO;
    const normas = catalogos?.normas || [];
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
                            <span className="text-sm font-black text-white">#{observacion?.id?.split('-').pop()}</span>
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
                    {/* ║  SECCIÓN 3 – Respuesta de la Entidad                 ║ */}
                    {/* ╚═══════════════════════════════════════════════════════╝ */}
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
                            {/* Date field – 1 col */}
                            <div>
                                <FieldLabel>Fecha de Respuesta</FieldLabel>
                                <input
                                    type="date"
                                    value={fechaRespuesta}
                                    onChange={e => setFechaRespuesta(e.target.value)}
                                    className={inputCls()}
                                />
                            </div>

                            {/* Response text – 2 cols */}
                            <div className="md:col-span-2">
                                <FieldLabel>Contenido de la Respuesta</FieldLabel>
                                <textarea
                                    placeholder="Describa lo que respondió la entidad a la observación planteada..."
                                    value={respuestaEntidad}
                                    onChange={e => setRespuestaEntidad(e.target.value)}
                                    rows={3}
                                    className={`${inputCls()} resize-none`}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* ╔═══════════════════════════════════════════════════════╗ */}
                    {/* ║  SECCIÓN 4 – Situación Actual                        ║ */}
                    {/* ╚═══════════════════════════════════════════════════════╝ */}
                    <Card className="p-5! shadow-xl border-0 ring-1 ring-violet-100">
                        <SectionHeader
                            number="4"
                            color="violet"
                            label="Situación Actual"
                            icon={
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Estado – 1 col */}
                            <div className="space-y-3">
                                <div>
                                    <FieldLabel>Estado de Gestión Final</FieldLabel>
                                    <select
                                        value={nuevoEstado}
                                        onChange={e => setNuevoEstado(e.target.value)}
                                        className={`${inputCls()} font-bold uppercase cursor-pointer border-violet-200 bg-violet-50/30 text-violet-900 focus:ring-violet-500/20 focus:border-violet-500`}
                                    >
                                        <option value="" disabled>— Seleccionar Estado —</option>
                                        {catalogos?.estados?.map(e => (
                                            <option key={e.id} value={e.nombre}>{e.nombre}</option>
                                        )) || estados.map(e => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Estado pill visual */}
                                <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 rounded-xl border border-violet-100">
                                    <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shrink-0" />
                                    <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest leading-none">
                                        Transición a: {nuevoEstado || '...'}
                                    </span>
                                </div>
                            </div>

                            {/* Comentario del auditor – 2 cols */}
                            <div className="md:col-span-2">
                                <FieldLabel>Comentario del Auditor</FieldLabel>
                                <textarea
                                    placeholder="Registre el análisis o comentario del auditor respecto a la situación actual de la observación..."
                                    value={comentarioAuditor}
                                    onChange={e => setComentarioAuditor(e.target.value)}
                                    rows={4}
                                    className={`${inputCls()} resize-none`}
                                />
                            </div>
                        </div>

                        {/* Criterios de Cierre (Solo si es Subsanada) */}
                        {nuevoEstado === 'Subsanada' && (
                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-5">
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
                                                    className={`w-full p-4 rounded-2xl border border-emerald-200 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm resize-none`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Criterio Legal de Cierre <span className="text-rose-500">*</span></label>
                                                <textarea
                                                    rows={2}
                                                    placeholder="Describa el fundamento legal para el cierre..."
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

                        {/* Action bar */}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                            <p className="text-[10px] text-amber-600 font-bold italic max-w-sm">
                                * Al registrar se completará el ciclo de gestión y se actualizará la bitácora histórica.
                            </p>
                            <button
                                onClick={handleGuardarCiclo}
                                className="px-6 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Registrar Ciclo
                            </button>
                        </div>
                    </Card>

                    {/* ── Timeline History ─────────────────────────────────── */}
                    <section className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_8px_rgba(0,0,0,0.1)]" />
                                <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em]">Traza de Auditoría</h3>
                            </div>
                            <span className="text-[10px] font-bold text-text-muted italic">{observacion.historialEstados.length} EVENTOS REGISTRADOS</span>
                        </div>

                        <div className="relative pl-6 space-y-4">
                            <div className="absolute left-0.75 top-4 bottom-4 w-0.5 bg-slate-100" />

                            {[...observacion.historialEstados].reverse().map((h, i) => (
                                <div key={i} className="relative animate-fade-in group">
                                    <div className="absolute -left-7.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-900 group-hover:scale-125 transition-transform z-10" />

                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-lg transition-all border-l-4 border-l-slate-900">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className="px-3 py-1 bg-slate-100 rounded-lg">
                                                    <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">{formatDate(h.fecha)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {h.estadoAnterior && (
                                                        <>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase line-through">{h.estadoAnterior}</span>
                                                            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                            </svg>
                                                        </>
                                                    )}
                                                    <EstadoBadge estado={h.estadoNuevo} />
                                                </div>
                                            </div>
                                            {h.nroInforme && (
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">REF:</span>
                                                        <span className="text-[11px] font-black text-text-primary leading-none">{h.nroInforme} {h.nota && `• ${h.nota}`}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {/* Sección 3 en historial: Respuesta de la Entidad */}
                                            {(h.respuestaEntidad || h.fechaRespuesta) && (
                                                <div className="space-y-2 md:col-span-2 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center shrink-0">
                                                            <span className="text-[9px] font-black text-blue-700">3</span>
                                                        </div>
                                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Respuesta de la Entidad</span>
                                                        {h.fechaRespuesta && (
                                                            <span className="ml-auto text-[9px] font-bold text-blue-500 px-2 py-0.5 bg-blue-100 rounded-lg">{formatDate(h.fechaRespuesta)}</span>
                                                        )}
                                                    </div>
                                                    {h.respuestaEntidad && (
                                                        <p className="text-[13px] font-medium text-blue-900 leading-relaxed italic">"{h.respuestaEntidad}"</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Sección 4 en historial: Situación Actual / Comentario Auditor */}
                                            {h.analisisAuditor && (
                                                <div className="space-y-2 md:col-span-2 p-4 bg-violet-50 rounded-2xl border border-violet-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-5 h-5 rounded bg-violet-100 flex items-center justify-center shrink-0">
                                                            <span className="text-[9px] font-black text-violet-700">4</span>
                                                        </div>
                                                        <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">Situación Actual — Comentario del Auditor</span>
                                                    </div>
                                                    <p className="text-[13px] font-medium text-violet-900 leading-relaxed">{h.analisisAuditor}</p>
                                                </div>
                                            )}

                                            {/* Criterios de Cierre en historial */}
                                            {(h.criterioAdministrativo || h.criterioLegal) && (
                                                <div className="space-y-4 md:col-span-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                                                            <svg className="w-3 h-3 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Criterios de Cierre (Subsanada)</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {h.criterioAdministrativo && (
                                                            <div>
                                                                <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest block mb-1">Administrativo</span>
                                                                <p className="text-[12px] font-medium text-emerald-900 leading-tight italic">"{h.criterioAdministrativo}"</p>
                                                            </div>
                                                        )}
                                                        {h.criterioLegal && (
                                                            <div>
                                                                <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest block mb-1">Legal</span>
                                                                <p className="text-[12px] font-medium text-emerald-900 leading-tight italic">"{h.criterioLegal}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Plan de acción (legacy) */}
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
                    message={isEditing ? "Los datos de la observación han sido actualizados." : "Ciclo de gestión registrado exitosamente."}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
}
