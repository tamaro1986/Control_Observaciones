import { daysUntil } from '../data/data';
import { RiskBadge, Avatar } from '../components/SharedComponents';

export default function Dashboard({ observaciones, getEstadisticas, onNavigate, onSelectObservacion, catalogos }) {
    const stats = getEstadisticas();

    const entidadesDisponibles = catalogos?.entidades || [];

    const entidadCards = entidadesDisponibles.map(ent => {
        const obs = observaciones.filter(o => o.entidadId === ent.id);
        const total = obs.length;
        const subsanadas = obs.filter(o => o.estado === 'Subsanada').length;
        const pendientes = obs.filter(o => o.estado === 'Pendiente').length;
        const vencidas = obs.filter(o => o.estado === 'Vencida').length;
        const enCurso = obs.filter(o => o.estado === 'En Curso').length;
        const cumplimiento = total > 0 ? Math.round((subsanadas / total) * 100) : 0;
        const criticos = obs.filter(o => o.nivelRiesgo === 'Crítico').length;
        const altos = obs.filter(o => o.nivelRiesgo === 'Alto').length;

        const riesgosAbiertos = total - subsanadas;

        let status = 'ok';
        if (vencidas > 0 || criticos > 0) status = 'critical';
        else if (riesgosAbiertos > 0 || altos > 0) status = 'warning';

        return {
            ...ent, total, subsanadas, pendientes, vencidas, enCurso,
            cumplimiento, criticos, altos, status, riesgosAbiertos
        };
    }).filter(e => e.total > 0);

    const alertas = observaciones
        .filter(o => o.estado !== 'Subsanada' && o.fechaPlanAccion)
        .map(o => ({ ...o, diasRestantes: daysUntil(o.fechaPlanAccion) }))
        .filter(a => a.diasRestantes !== null && a.diasRestantes <= 30)
        .sort((a, b) => a.diasRestantes - b.diasRestantes)
        .slice(0, 6);

    const statusConfig = {
        ok: {
            bg: "bg-emerald-500",
            lightBg: "bg-emerald-100",
            text: "text-emerald-700",
            label: "Estable",
            icon: "monitoring",
            countColor: "text-emerald-600"
        },
        warning: {
            bg: "bg-amber-500",
            lightBg: "bg-amber-100",
            text: "text-amber-700",
            label: "Advertencia",
            icon: "account_balance_wallet",
            countColor: "text-amber-600"
        },
        critical: {
            bg: "bg-red-500",
            lightBg: "bg-red-100",
            text: "text-red-700",
            label: "Crítico",
            icon: "account_balance",
            countColor: "text-red-600"
        },
    };

    return (
        <div className="max-w-[1440px] mx-auto animate-fade-in pb-20">

            {/* ── Headline Section ── */}
            <div className="mb-3">
                <h2 className="text-text-primary tracking-tight text-2xl font-bold leading-tight">Dashboard de Entidades de Auditoría</h2>
                <p className="text-text-secondary text-xs mt-0.5">Monitoreo en tiempo real de riesgos y cumplimiento normativo.</p>
            </div>

            {/* ── Filter Bar Section ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-border overflow-x-auto no-scrollbar">
                    <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary text-white px-4 text-sm font-semibold shadow-md shadow-primary/20">
                        <span>Todas</span>
                    </button>
                    {['Anual', 'Seguimiento', 'Especial'].map(tab => (
                        <button key={tab} className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-transparent text-text-secondary px-4 text-sm font-medium hover:bg-surface-hover transition-colors">
                            <span>{tab}</span>
                            <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-muted">Ordenar por:</span>
                    <button className="flex h-9 items-center justify-center gap-2 rounded-lg bg-white border border-border px-4 text-sm font-medium text-text-primary hover:bg-surface-hover shadow-sm transition-colors">
                        Riesgos Críticos
                        <span className="material-symbols-outlined text-base text-text-secondary">swap_vert</span>
                    </button>
                </div>
            </div>

            {/* ── Entity Cards Section ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
                {entidadCards.map(ent => {
                    const cfg = statusConfig[ent.status];
                    return (
                        <div
                            key={ent.id}
                            className="group premium-card rounded-2xl flex flex-col overflow-hidden relative bg-white"
                        >
                            {/* Ambient Glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-[0.08] pointer-events-none rounded-full ${cfg.bg}`} />

                            {/* colored top bar */}
                            <div className={`h-2 w-full ${cfg.bg}`}></div>

                            <div style={{ padding: '14px 16px 16px 16px' }} className="flex flex-col flex-1">
                                {/* Icon + Badge row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', marginTop: '2px' }}>
                                    <div className={`${cfg.lightBg} ${cfg.text}`} style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{cfg.icon}</span>
                                    </div>
                                    <span className={`${cfg.lightBg} ${cfg.text}`} style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="group-hover:text-primary transition-colors text-text-primary font-bold text-sm leading-tight mb-0.5 z-10 relative">
                                    {ent?.nombre?.split(',')[0]}
                                </h3>
                                <p className="text-text-muted text-xs z-10 relative">Sector: {ent.categoria}</p>

                                {/* Metric row */}
                                <div className="flex items-center justify-between mt-4 z-10 relative">
                                    <div>
                                        <span className={`text-2xl font-black leading-none ${ent.riesgosAbiertos > 0 ? cfg.countColor : 'text-text-primary'}`}>
                                            {ent.riesgosAbiertos}
                                        </span>
                                        <p className="text-[9px] text-text-secondary font-bold uppercase mt-1">Riesgos Abiertos</p>
                                    </div>
                                    <div className="flex">
                                        <Avatar nombre={ent.nombre} size="xs" />
                                        <div className="w-6 h-6 rounded-full border-2 border-surface bg-surface-hover flex items-center justify-center text-[9px] font-bold text-text-muted -ml-1.5">+1</div>
                                    </div>
                                </div>

                                {/* Footer button */}
                                <div className="mt-4 pt-3 border-t border-border/60 z-10 relative">
                                    <button
                                        onClick={() => onNavigate(ent.riesgosAbiertos > 0 ? 'seguimiento' : 'informes')}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'rgba(11,115,218,0.08)', color: '#0b73da', fontWeight: 700, fontSize: '12px', padding: '7px 0', borderRadius: '7px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#0b73da'; e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(11,115,218,0.08)'; e.currentTarget.style.color = '#0b73da'; }}
                                    >
                                        {ent.riesgosAbiertos > 0 ? 'Gestionar' : 'Ver Detalles'}
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Alerts Section ── */}
            <div className="premium-card rounded-2xl overflow-hidden mt-6 bg-white">
                {/* Header */}
                <div className="p-4 border-b border-border/60 flex items-center justify-between">
                    <div>
                        <h3 className="text-text-primary text-sm font-bold">Alertas de Vencimiento</h3>
                        <p className="text-text-muted text-xs mt-0.5">Plazos críticos en los próximos 30 días</p>
                    </div>
                    {alertas.length > 0 && (
                        <span style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                            {alertas.length} críticas
                        </span>
                    )}
                </div>

                {/* Rows */}
                <div>
                    {alertas.map(a => (
                        <div
                            key={a.id}
                            onClick={() => onSelectObservacion(a.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 16px', borderBottom: '1px solid #f0f2f5', cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            className="group"
                        >
                            {/* Day counter badge */}
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '8px', flexShrink: 0,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                background: a.diasRestantes <= 0 ? '#fef2f2' : '#fffbeb',
                                color: a.diasRestantes <= 0 ? '#dc2626' : '#d97706',
                                border: `1px solid ${a.diasRestantes <= 0 ? '#fecaca' : '#fde68a'}`
                            }}>
                                <span style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1 }}>{Math.abs(a.diasRestantes)}</span>
                                <span style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>{a.diasRestantes <= 0 ? 'atraso' : 'días'}</span>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#111418', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    className="group-hover:text-[#0b73da] transition-colors">
                                    {a.titulo}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#60758a', textTransform: 'uppercase' }}>{(entidadesDisponibles.find(e => e.id === a.entidadId)?.nombre || 'Entidad Desconocida').split(',')[0]}</span>
                                    <RiskBadge nivel={a.nivelRiesgo} />
                                </div>
                            </div>

                            <Avatar nombre={a.responsable} size="xs" />
                            <span className="material-symbols-outlined text-[16px] text-text-muted/50 group-hover:text-primary transition-colors">arrow_forward_ios</span>
                        </div>
                    ))}

                    {alertas.length === 0 && (
                        <div className="p-10 text-center">
                            <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">check_circle</span>
                            <p className="text-text-secondary text-sm font-medium">Sin alertas de vencimiento pendientes</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Sticky FAB (Matching snippet) ── */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <button
                    onClick={() => onNavigate('nuevo')}
                    className="size-14 bg-primary text-white rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all outline outline-1 outline-white/20 outline-offset-2"
                >
                    <span className="material-symbols-outlined text-2xl">add</span>
                </button>
            </div>
        </div>
    );
}
