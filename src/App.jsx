import { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NuevoRegistro from './pages/NuevoRegistro';
import SeguimientoList from './pages/SeguimientoList';
import NuevoSeguimiento from './pages/NuevoSeguimiento';
import Correlativos from './pages/Correlativos';
import CorrelativosNotas from './pages/CorrelativosNotas';
import InformesGlobal from './pages/InformesGlobal';
import DetalleObservacion from './pages/DetalleObservacion';
import useObservaciones from './hooks/useObservaciones';
import {
    MOCK_OBSERVACIONES, MOCK_CORRELATIVOS, MOCK_CORRELATIVOS_NOTAS,
    CLASIFICACIONES_CORR, INDUSTRIAS_CORR, TIPOS_INFORME_CORR,
    ACCIONES_SUPERVISION, NORMAS_CORR, RESPONSABLES, ENTIDADES,
    TIPOS_CORRESPONDENCIA, NORMAS_NOTAS_EXTRA,
    NIVELES_RIESGO, ESTADOS, TIPOS_RIESGO, TIPOS_VISITA
} from './data/data.js';
import Configuracion from './pages/Configuracion.jsx';

export default function App() {
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedObsId, setSelectedObsId] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [correlativos, setCorrelativos] = useState(() => {
        try {
            const saved = localStorage.getItem('auditflow_correlativos_v1');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const [notas, setNotas] = useState(() => {
        try {
            const saved = localStorage.getItem('auditflow_notas_v1');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const [catalogos, setCatalogos] = useState(() => {
        const defaultCats = {
            clasificaciones: CLASIFICACIONES_CORR,
            industrias: INDUSTRIAS_CORR,
            tiposInforme: TIPOS_INFORME_CORR,
            accionesSupervision: ACCIONES_SUPERVISION,
            normas: NORMAS_CORR,
            responsables: RESPONSABLES,
            entidades: ENTIDADES,
            tiposCorrespondencia: TIPOS_CORRESPONDENCIA,
            normasExtra: NORMAS_NOTAS_EXTRA,
            nivelesRiesgo: NIVELES_RIESGO.map(n => n.value),
            estados: ESTADOS.map(e => e.value),
            tiposRiesgo: TIPOS_RIESGO,
            tiposVisita: TIPOS_VISITA,
            descripcionesAccion: [
                'Visita de supervisión focalizada en controles de seguridad de la información.',
                'Revisión de gestión de inversión y cumplimiento normativo en fondo de inversión.',
                'Visita de supervisión focalizada en accesos y ciberseguridad.',
                'Análisis técnico sobre resultados de estados financieros y uso de plataformas.',
                'Elaboración de informe técnico para Junta General Ordinaria y Extraordinaria.',
                'Seguimiento a revisión de la implementación del sistema contable.',
                'Atención a Junta General de Accionistas y Asambleas de Partícipes.',
                'Respuesta a solicitud de prórroga de envío de seguimiento a plan de acción.',
            ],
        };
        try {
            const saved = localStorage.getItem('auditflow_catalogos');
            return saved ? JSON.parse(saved) : defaultCats;
        } catch (e) { return defaultCats; }
    });

    // Persistent storage effects
    useEffect(() => {
        localStorage.setItem('auditflow_correlativos_v1', JSON.stringify(correlativos));
    }, [correlativos]);

    useEffect(() => {
        localStorage.setItem('auditflow_notas_v1', JSON.stringify(notas));
    }, [notas]);

    useEffect(() => {
        localStorage.setItem('auditflow_catalogos', JSON.stringify(catalogos));
    }, [catalogos]);

    const [activeTab, setActiveTab] = useState('dashboard');
    const {
        observaciones,
        crearAuditoria,
        cambiarEstado,
        getObservacion,
        filtrar,
        getEstadisticas,
    } = useObservaciones();

    const handleSelectObservacion = useCallback((id, view = 'detalle') => {
        setSelectedObsId(id);
        setActiveView(view);
    }, []);

    const handleBack = useCallback(() => {
        setSelectedObsId(null);
        // Si regresamos desde nuevo_seguimiento, volvemos a listar seguimientos
        if (activeView === 'nuevo_seguimiento') {
            setActiveView('seguimiento');
        } else {
            setActiveView('reportes');
        }
    }, [activeView]);

    const handleNavigate = useCallback((view) => {
        setSelectedObsId(null);
        setActiveView(view);
    }, []);

    const handleAgregarCorrelativo = useCallback((nuevo) => {
        setCorrelativos(prev => [nuevo, ...prev]);
    }, []);

    const handleAgregarNota = useCallback((nuevo) => {
        setNotas(prev => [nuevo, ...prev]);
    }, []);

    const selectedObs = selectedObsId ? getObservacion(selectedObsId) : null;

    const renderContent = () => {
        if (activeView === 'detalle' && selectedObs) {
            return (
                <DetalleObservacion
                    observacion={selectedObs}
                    cambiarEstado={cambiarEstado}
                    onBack={handleBack}
                    catalogos={catalogos}
                />
            );
        }

        switch (activeView) {
            case 'dashboard':
                return (
                    <Dashboard
                        observaciones={observaciones}
                        getEstadisticas={getEstadisticas}
                        onNavigate={handleNavigate}
                        onSelectObservacion={handleSelectObservacion}
                    />
                );
            case 'nuevo':
                return <NuevoRegistro crearAuditoria={crearAuditoria} catalogos={catalogos} correlativos={correlativos} />;
            case 'seguimiento':
                return <SeguimientoList observaciones={observaciones} onSelectObservacion={handleSelectObservacion} />;
            case 'nuevo_seguimiento':
                if (!selectedObs) return null;
                return (
                    <NuevoSeguimiento
                        observacion={selectedObs}
                        cambiarEstado={cambiarEstado}
                        onBack={handleBack}
                        catalogos={catalogos}
                        correlativos={correlativos}
                    />
                );
            case 'correlativos':
                return (
                    <Correlativos
                        correlativos={correlativos}
                        onAgregarCorrelativo={handleAgregarCorrelativo}
                        catalogos={catalogos}
                    />
                );
            case 'notas':
                return (
                    <CorrelativosNotas
                        notas={notas}
                        onAgregarNota={handleAgregarNota}
                        catalogos={catalogos}
                        correlativos={correlativos}
                    />
                );
            case 'config':
                return (
                    <Configuracion
                        catalogos={catalogos}
                        setCatalogos={setCatalogos}
                    />
                );
            case 'reportes':
            case 'informes':
                return (
                    <InformesGlobal
                        observaciones={observaciones}
                        correlativos={correlativos}
                        notas={notas}
                        filtrar={filtrar}
                        getEstadisticas={getEstadisticas}
                        onSelectObservacion={handleSelectObservacion}
                        catalogos={catalogos}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-surface-alt flex text-text-primary">
            <Sidebar
                activeView={activeView}
                onNavigate={handleNavigate}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            <div
                className="flex-1 min-h-screen flex flex-col"
                style={{
                    marginLeft: sidebarCollapsed ? '64px' : '220px',
                    transition: 'margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                {/* Top Navbar */}
                <header className="h-14 bg-white/70 backdrop-blur-lg border-b border-border sticky top-0 z-30 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <h1 className="text-sm font-black text-text-primary uppercase tracking-widest leading-none">
                                {activeView === 'dashboard' && 'Panel de Control — Casos Abiertos'}
                                {activeView === 'nuevo' && 'Registro de Hallazgo — Observaciones'}
                                {activeView === 'seguimiento' && 'Módulo de Seguimiento'}
                                {activeView === 'nuevo_seguimiento' && 'Documentación de Seguimiento'}
                                {activeView === 'correlativos' && 'Correlativos de Informes'}
                                {activeView === 'notas' && 'Correlativos de Notas'}
                                {activeView === 'reportes' && 'Reportes y Analítica'}
                                {activeView === 'detalle' && 'Expediente de Observación'}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    {observaciones.length} registros activos
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface-hover/50 rounded-xl border border-border/40 backdrop-blur-sm">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {new Date().toLocaleDateString('es-SV', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>

                        <button className="relative w-9 h-9 rounded-xl hover:bg-surface-hover flex items-center justify-center transition-colors cursor-pointer group">
                            <svg className="w-4.5 h-4.5 text-slate-500 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 flex-1 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}


