import { ENTIDADES, getEntidadById, daysUntil } from '../data/data';
import { RiskBadge, Avatar } from '../components/SharedComponents';

export default function Dashboard({ observaciones, getEstadisticas, onNavigate, onSelectObservacion }) {
    const stats = getEstadisticas();

    const entidadCards = ENTIDADES.map(ent => {
        const obs = observaciones.filter(o => o.entidadId === ent.id);
        const total = obs.length;
        const subsanadas = obs.filter(o => o.estado === 'Subsanada').length;
        const pendientes = obs.filter(o => o.estado === 'Pendiente').length;
        const vencidas = obs.filter(o => o.estado === 'Vencida').length;
        const enCurso = obs.filter(o => o.estado === 'En Curso').length;
        const cumplimiento = total > 0 ? Math.round((subsanadas / total) * 100) : 0;
        const criticos = obs.filter(o => o.nivelRiesgo === 'Crítico').length;
        const altos = obs.filter(o => o.nivelRiesgo === 'Alto').length;

        const riesgosAbiertos = pendientes + vencidas;

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
                <h2 className="text-[#111418] tracking-tight text-2xl font-bold leading-tight">Dashboard de Entidades de Auditoría</h2>
                <p className="text-[#60758a] text-xs mt-0.5">Monitoreo en tiempo real de riesgos y cumplimiento normativo.</p>
            </div>

            {/* ── Filter Bar Section ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-x-auto no-scrollbar">
                    <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#0b73da] text-white px-4 text-sm font-semibold">
                        <span>Todas</span>
                    </button>
                    {['Anual', 'Seguimiento', 'Especial'].map(tab => (
                        <button key={tab} className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f0f2f5] text-[#111418] px-4 text-sm font-medium hover:bg-gray-200 transition-colors">
                            <span>{tab}</span>
                            <span className="material-symbols-outlined text-base">keyboard_arrow_down</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#60758a]">Ordenar por:</span>
                    <button className="flex h-9 items-center justify-center gap-2 rounded-lg bg-white border border-[#e5e7eb] px-4 text-sm font-medium">
                        Riesgos Críticos
                        <span className="material-symbols-outlined text-base">swap_vert</span>
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
                            className="group bg-white rounded-xl border border-[#e5e7eb] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                        >
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
                                <h3 className="group-hover:text-[#0b73da] transition-colors" style={{ color: '#111418', fontSize: '14px', fontWeight: 700, lineHeight: '1.3', marginBottom: '2px' }}>
                                    {ent.nombre.split(',')[0]}
                                </h3>
                                <p style={{ color: '#60758a', fontSize: '12px' }}>Sector: {ent.categoria}</p>

                                {/* Metric row */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1 }}
                                            className={ent.riesgosAbiertos > 0 ? cfg.countColor : 'text-[#111418]'}>
                                            {ent.riesgosAbiertos}
                                        </span>
                                        <p style={{ fontSize: '9px', color: '#60758a', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>Riesgos Abiertos</p>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <Avatar nombre={ent.nombre} size="xs" />
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#6b7280', marginLeft: '-6px' }}>+1</div>
                                    </div>
                                </div>

                                {/* Footer button */}
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f2f5' }}>
                                    <button
                                        onClick={() => onNavigate('informes')}
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
            <div style={{ marginTop: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ color: '#111418', fontSize: '14px', fontWeight: 700 }}>Alertas de Vencimiento</h3>
                        <p style={{ color: '#60758a', fontSize: '12px', marginTop: '1px' }}>Plazos críticos en los próximos 30 días</p>
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
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#60758a', textTransform: 'uppercase' }}>{getEntidadById(a.entidadId)?.nombre.split(',')[0]}</span>
                                    <RiskBadge nivel={a.nivelRiesgo} />
                                </div>
                            </div>

                            <Avatar nombre={a.responsable} size="xs" />
                            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#9ca3af' }}>arrow_forward_ios</span>
                        </div>
                    ))}

                    {alertas.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#34d399', display: 'block', marginBottom: '8px' }}>check_circle</span>
                            <p style={{ color: '#60758a', fontSize: '13px', fontWeight: 500 }}>Sin alertas de vencimiento pendientes</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Sticky FAB (Matching snippet) ── */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <button
                    onClick={() => onNavigate('nuevo')}
                    className="size-14 bg-[#0b73da] text-white rounded-full shadow-lg shadow-[#0b73da]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-2xl">add</span>
                </button>
            </div>
        </div>
    );
}
