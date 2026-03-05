import { getRiesgoStyle, getEstadoStyle, getInitials, getAvatarColor } from '../data/data';

export function Card({ children, className = '', noPadding = false, animate = true }) {
    return (
        <div className={`premium-card rounded-2xl overflow-hidden hover:scale-[1.002] active:scale-[0.998] ${animate ? 'animate-fade-in' : ''} ${className}`}>
            <div className={noPadding ? '' : 'p-5'}>
                {children}
            </div>
        </div>
    );
}


export function RiskBadge({ nivel }) {
    const style = getRiesgoStyle(nivel);
    const config = {
        'Crítico': { icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        'Alto': { icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        'Medio': { icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        'Bajo': { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black ${style.bg} ${style.text} uppercase tracking-widest shadow-sm border border-black/5 hover:brightness-95 transition-all duration-300 cursor-default select-none`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d={config[nivel]?.icon || ''} />
            </svg>
            {nivel}
        </span>
    );
}

export function EstadoBadge({ estado }) {
    const style = getEstadoStyle(estado);
    const isEnCurso = estado === 'En Curso';

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black ${style.bg} ${style.text} border border-black/5 shadow-sm uppercase tracking-widest hover:brightness-95 transition-all duration-300 cursor-default select-none`}>
            <span className={`relative flex h-2 w-2`}>
                {isEnCurso && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-75`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`}></span>
            </span>
            {estado}
        </span>
    );
}

export function Avatar({ nombre, size = 'md', className = '' }) {
    const initials = getInitials(nombre);
    const color = getAvatarColor(nombre);
    const sizeClasses = {
        xs: 'w-6 h-6 text-[8px]',
        sm: 'w-9 h-9 text-[10px]',
        md: 'w-11 h-11 text-xs',
        lg: 'w-14 h-14 text-sm',
    };
    return (
        <div
            className={`${sizeClasses[size]} rounded-2xl ${color} text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-black/5 ring-4 ring-white border border-black/5 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer ${className}`}
            title={nombre}
        >
            {initials}
        </div>
    );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const renderPageButton = (p) => (
        <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 rounded-2xl text-[11px] font-black transition-all duration-300 cursor-pointer ${p === currentPage
                ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110 z-10'
                : 'text-slate-400 hover:bg-white hover:text-primary hover:shadow-lg'
                }`}
        >
            {p}
        </button>
    );

    return (
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-3xl border border-slate-100 shadow-sm">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-primary hover:bg-white disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed group"
            >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div className="flex gap-1.5">
                {[...Array(totalPages)].map((_, i) => renderPageButton(i + 1))}
            </div>
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-primary hover:bg-white disabled:opacity-20 transition-all cursor-pointer disabled:cursor-not-allowed group"
            >
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

export function EmptyState({ icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in group">
            <div className="group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 shadow-inner border border-slate-100 relative">
                <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                {icon || (
                    <svg className="w-12 h-12 text-slate-300 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
            <p className="text-[13px] font-medium text-slate-400 max-w-sm leading-relaxed">{description}</p>
        </div>
    );
}

export function SuccessToast({ message, onClose }) {
    return (
        <div className="fixed bottom-10 right-10 z-[100] animate-slide-in">
            <div className="bg-slate-900 text-white pl-6 pr-4 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div className="flex flex-col pr-8">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Operación Sistematizada</span>
                    <span className="text-sm font-bold tracking-tight text-slate-200">{message}</span>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export function Badge({ children, className = '' }) {
    return (
        <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-black/5 hover:brightness-95 transition-all duration-300 cursor-default select-none ${className}`}>
            {children}
        </span>
    );
}
