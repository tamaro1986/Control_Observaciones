import { useState, useCallback, useEffect, useMemo } from 'react';
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
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import {
    MOCK_OBSERVACIONES, MOCK_CORRELATIVOS, MOCK_CORRELATIVOS_NOTAS,
    CLASIFICACIONES_CORR, INDUSTRIAS_CORR, TIPOS_INFORME_CORR,
    ACCIONES_SUPERVISION, NORMAS_CORR, RESPONSABLES, ENTIDADES,
    TIPOS_CORRESPONDENCIA, NORMAS_NOTAS_EXTRA,
    NIVELES_RIESGO, ESTADOS, TIPOS_RIESGO, TIPOS_VISITA
} from './data/data.js';
import Configuracion from './pages/Configuracion.jsx';
import { useConfirm } from './context/ConfirmContext';

export default function App() {
    const { user, loading } = useAuth();
    const confirm = useConfirm();
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedObsId, setSelectedObsId] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Hook logic - Unified state
    const {
        observaciones,
        catalogos,
        setCatalogos,
        correlativos,
        setCorrelativos,
        entidades,
        setEntidades,
        notas,
        setNotas,
        getEntidadById,
        crearAuditoria,
        cambiarEstado,
        getObservacion,
        filtrar,
        getEstadisticas,
        editarObservacion,
        eliminarObservacion,
        agregarCorrelativo,
        editarCorrelativo,
        eliminarCorrelativo,
        agregarEntidad,
        editarEntidad,
        eliminarEntidad,
        agregarNota,
        editarNota,
        eliminarNota,
        exportData,
        importData,
        updateConfig,
        error,
        setError,
        loading: observationsLoading
    } = useObservaciones();

    // --- Alphabetic Sorting Logic for UI ---
    const sortedCorrelativos = useMemo(() => {
        return [...correlativos].sort((a, b) => {
            if (b.año !== a.año) return b.año - a.año;
            return (b.numero || 0) - (a.numero || 0);
        });
    }, [correlativos]);

    const sortedNotas = useMemo(() => {
        return [...notas].sort((a, b) => {
            if (b.año !== a.año) return b.año - a.año;
            return (b.numero || 0) - (a.numero || 0);
        });
    }, [notas]);

    // All hooks must be declared BEFORE conditional returns (Rules of Hooks)
    const sortedCatalogos = useMemo(() => {
        const sorted = { ...catalogos };
        Object.keys(sorted).forEach(key => {
            if (Array.isArray(sorted[key])) {
                if (key === 'normas' || key === 'normasExtra' || key === 'unidadesAuditables') {
                    sorted[key] = [...sorted[key]].sort((a, b) => (a.codigo || '').localeCompare(b.codigo || ''));
                } else if (key === 'entidades') {
                    sorted[key] = [...sorted[key]].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
                } else if (key === 'nivelesRiesgo' || key === 'estados') {
                    sorted[key] = [...sorted[key]].sort((a, b) => {
                        const valA = typeof a === 'object' ? a.value : a;
                        const valB = typeof b === 'object' ? b.value : b;
                        return String(valA).localeCompare(String(valB));
                    });
                } else {
                    sorted[key] = [...sorted[key]].sort((a, b) => String(a).localeCompare(String(b)));
                }
            }
        });
        return sorted;
    }, [catalogos]);
    const sortedEntidades = useMemo(() => {
        return [...entidades].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }, [entidades]);

    const handleSelectObservacion = useCallback((id, view = 'detalle') => {
        setSelectedObsId(id);
        setActiveView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBack = useCallback(() => {
        setSelectedObsId(null);
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

    // Handlers for Correlativos
    const handleAgregarCorrelativo = useCallback(async (nuevo) => {
        await agregarCorrelativo(nuevo);
    }, [agregarCorrelativo]);

    const handleEliminarCorrelativo = useCallback(async (id) => {
        if (!(await confirm('¿Está seguro de eliminar este correlativo?', 'Eliminar Correlativo'))) return;
        await eliminarCorrelativo(id);
    }, [eliminarCorrelativo, confirm]);

    const handleEditarCorrelativo = useCallback(async (updated) => {
        await editarCorrelativo(updated.id, updated);
    }, [editarCorrelativo]);

    // Handlers for Notas
    const handleAgregarNota = useCallback(async (nuevo) => {
        await agregarNota(nuevo);
    }, [agregarNota]);

    const handleEliminarNota = useCallback(async (id) => {
        if (!(await confirm('¿Está seguro de eliminar esta nota?', 'Eliminar Nota'))) return;
        await eliminarNota(id);
    }, [eliminarNota, confirm]);

    const handleEditarNota = useCallback(async (updated) => {
        await editarNota(updated.id, updated);
    }, [editarNota]);

    // Conditional renders AFTER all hooks
    if (loading) return null;
    if (!user) return <Login />;

    const selectedObs = selectedObsId ? getObservacion(selectedObsId) : null;

    const renderContent = () => {
        if (activeView === 'detalle' && selectedObs) {
            return (
                <DetalleObservacion
                    observacion={selectedObs}
                    cambiarEstado={cambiarEstado}
                    eliminarObservacion={eliminarObservacion}
                    editarObservacion={editarObservacion}
                    onBack={handleBack}
                    catalogos={sortedCatalogos}
                    entidades={sortedEntidades}
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
                        catalogos={sortedCatalogos}
                        entidades={sortedEntidades}
                    />
                );
            case 'nuevo':
                return <NuevoRegistro crearAuditoria={crearAuditoria} catalogos={sortedCatalogos} correlativos={sortedCorrelativos} entidades={sortedEntidades} />;
            case 'seguimiento':
                return (
                    <SeguimientoList
                        observaciones={observaciones}
                        onSelectObservacion={handleSelectObservacion}
                        eliminarObservacion={eliminarObservacion}
                        editarObservacion={editarObservacion}
                        filtrar={filtrar}
                        catalogos={sortedCatalogos}
                        entidades={sortedEntidades}
                    />
                );
            case 'nuevo_seguimiento':
                if (!selectedObs) return null;
                return (
                    <NuevoSeguimiento
                        observacion={selectedObs}
                        cambiarEstado={cambiarEstado}
                        onBack={handleBack}
                        catalogos={sortedCatalogos}
                        correlativos={sortedCorrelativos}
                        entidades={sortedEntidades}
                    />
                );
            case 'correlativos':
                return (
                    <Correlativos
                        correlativos={sortedCorrelativos}
                        onAgregarCorrelativo={handleAgregarCorrelativo}
                        onEliminarCorrelativo={handleEliminarCorrelativo}
                        onEditarCorrelativo={handleEditarCorrelativo}
                        catalogos={sortedCatalogos}
                    />
                );
            case 'notas':
                return (
                    <CorrelativosNotas
                        notas={sortedNotas}
                        onAgregarNota={handleAgregarNota}
                        onEliminarNota={handleEliminarNota}
                        onEditarNota={handleEditarNota}
                        catalogos={sortedCatalogos}
                        correlativos={sortedCorrelativos}
                    />
                );
            case 'config':
                return (
                    <Configuracion
                        catalogos={sortedCatalogos}
                        setCatalogos={setCatalogos}
                        entidades={entidades}
                        updateConfig={updateConfig}
                        agregarEntidad={agregarEntidad}
                        editarEntidad={editarEntidad}
                        eliminarEntidad={eliminarEntidad}
                        exportData={exportData}
                        importData={importData}
                    />
                );
            case 'reportes':
            case 'informes':
                return (
                    <InformesGlobal
                        observaciones={observaciones}
                        correlativos={sortedCorrelativos}
                        notas={sortedNotas}
                        filtrar={filtrar}
                        getEstadisticas={getEstadisticas}
                        onSelectObservacion={handleSelectObservacion}
                        eliminarObservacion={eliminarObservacion}
                        editarObservacion={editarObservacion}
                        catalogos={sortedCatalogos}
                        entidades={sortedEntidades}
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
                        {/* Aquí irían las acciones globales si hubiera */}
                    </div>
                </header>

                {error && (
                    <div className="m-4 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3">
                            <i className="ri-error-warning-fill text-red-500 text-xl"></i>
                            <div>
                                <p className="text-red-800 font-bold text-sm">Problema con la Base de Datos</p>
                                <p className="text-red-600 text-xs">{error}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setError(null)}
                            className="p-1 hover:bg-red-100 rounded text-red-400 transition-colors"
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>
                )}

                <main className="flex-1 p-8 overflow-y-auto">
                    {observationsLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
                             <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando con Supabase...</p>
                        </div>
                    ) : renderContent()}
                </main>
            </div>
        </div>
    );
}
