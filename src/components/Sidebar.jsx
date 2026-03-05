const NAV_ITEMS = [
    {
        id: 'dashboard',
        label: 'Casos Abiertos',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        id: 'nuevo',
        label: 'Observaciones',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
        ),
    },
    {
        id: 'seguimiento',
        label: 'Seguimiento',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
    },
    {
        id: 'correlativos',
        label: 'Informes',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        id: 'notas',
        label: 'Notas',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        id: 'reportes',
        label: 'Reportes',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        id: 'config',
        label: 'Configuración',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

export default function Sidebar({ activeView, onNavigate, collapsed, setCollapsed }) {
    return (
        <aside
            style={{ width: collapsed ? '64px' : '220px' }}
            className="fixed top-0 left-0 h-screen bg-slate-900 border-r border-white/5 z-40 flex flex-col transition-all duration-500"
        >
            {/* Brand Header */}
            <div className={`flex items-center h-12 border-b border-white/5 shrink-0 overflow-hidden transition-all duration-500 ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'}`}>
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                {!collapsed && (
                    <div className="overflow-hidden whitespace-nowrap">
                        <h1 className="text-base font-black text-white tracking-tight leading-none">AuditFlow Pro</h1>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Control de Auditoría</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-hidden">
                {!collapsed && (
                    <p className="px-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] mb-3">Menú Principal</p>
                )}
                {NAV_ITEMS.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                        <div key={item.id} className="relative group/item">
                            <button
                                onClick={() => onNavigate(item.id)}
                                className={`w-full flex items-center gap-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'
                                    } ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'text-slate-400 hover:text-white hover:bg-white/8'
                                    }`}
                            >
                                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover/item:text-white'}`}>
                                    {item.icon}
                                </span>
                                {!collapsed && (
                                    <span className="truncate">{item.label}</span>
                                )}
                                {isActive && !collapsed && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
                                )}
                            </button>
                            {/* Tooltip when collapsed */}
                            {collapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover/item:opacity-100 pointer-events-none transition-all duration-200 translate-x-1 group-hover/item:translate-x-0 shadow-xl border border-white/10 z-50">
                                    {item.label}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-white/5">
                {!collapsed && (
                    <div className="bg-white/5 rounded-xl p-3.5 mb-3 border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Soporte Técnico</p>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">¿Necesitas ayuda? Contacta con IT.</p>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`w-full flex items-center rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-all duration-200 cursor-pointer ${collapsed ? 'justify-center py-2 px-0' : 'justify-between px-3 py-2'
                        }`}
                >
                    {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Colapsar panel</span>}
                    <svg
                        className={`w-4 h-4 transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m10 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>
        </aside>
    );
}
