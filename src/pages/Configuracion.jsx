import { useState } from 'react';
import { Card } from '../components/SharedComponents';

export default function Configuracion({ 
    catalogos, 
    setCatalogos, 
    entidades,
    exportData, 
    importData, 
    updateConfig,
    agregarEntidad,
    editarEntidad,
    eliminarEntidad 
}) {
    const [activeTab, setActiveTab] = useState('general');
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [newItem, setNewItem] = useState('');
    const [editingEntity, setEditingEntity] = useState(null);
    const [entityForm, setEntityForm] = useState({ nombre: '', tipo: 'Banco', categoria: 'General' });

    const categories = [
        { id: 'general', label: 'Sistema', icon: '⚙️' },
        { id: 'operativo', label: 'Operación', icon: '💼' },
        { id: 'normativo', label: 'Normativa', icon: '⚖️' },
        { id: 'clasificacion', label: 'Parámetros', icon: '📋' },
        { id: 'hallazgos', label: 'Seguimiento', icon: '🔍' },
    ];

    const catalogsByCategory = {
        operativo: [
            { id: 'entidades', label: 'Entidades / Sujetos Obligados', custom: true },
            { id: 'responsables', label: 'Responsables / Auditores' },
            { id: 'fondosInversion', label: 'Fondos de Inversión' },
        ],
        normativo: [
            { id: 'normas', label: 'Normas Principales (Código | Nombre)', isComplex: true },
            { id: 'normasExtra', label: 'Normas Complementarias (Código | Nombre)', isComplex: true },
            { id: 'puntosNormativos', label: 'Puntos de Control Normativo' },
            { id: 'unidadesAuditables', label: 'Unidades Auditables (Código | Nombre)', isComplex: true },
        ],
        clasificacion: [
            { id: 'clasificaciones', label: 'Clasificaciones' },
            { id: 'industrias', label: 'Industrias / Sectores' },
            { id: 'tiposInforme', label: 'Tipos de Informe' },
            { id: 'tiposCorrespondencia', label: 'Tipos de Correspondencia' },
            { id: 'accionesSupervision', label: 'Acciones de Supervisión' },
            { id: 'descripcionesAccion', label: 'Frases Predeterminadas' },
        ],
        hallazgos: [
            { id: 'nivelesRiesgo', label: 'Niveles de Riesgo' },
            { id: 'estados', label: 'Estados de Hallazgo' },
            { id: 'tiposRiesgo', label: 'Tipos de Riesgo' },
            { id: 'tiposVisita', label: 'Tipos de Visita' },
        ]
    };

    const handleAddCatalogItem = async (catalogId, isComplex) => {
        if (!newItem.trim()) return;

        let valueToAdd = newItem.trim();
        if (isComplex) {
            const [codigo, ...rest] = newItem.split('|').map(s => s.trim());
            if (!codigo) {
                alert("Formato incorrecto. Use: CÓDIGO | Nombre");
                return;
            }
            valueToAdd = { codigo, nombre: rest.join(' ') || codigo };
        }

        const currentList = catalogos[catalogId] || [];
        const newList = [...currentList, valueToAdd];

        try {
            await updateConfig(catalogId, newList);
            setCatalogos(prev => ({ ...prev, [catalogId]: newList }));
            setNewItem('');
        } catch (err) {
            alert("Error al guardar: " + err.message);
        }
    };

    const handleDeleteCatalogItem = async (catalogId, index) => {
        if (!window.confirm('¿Confirmas que deseas eliminar este elemento?')) return;

        const currentList = [...(catalogos[catalogId] || [])];
        currentList.splice(index, 1);

        try {
            await updateConfig(catalogId, currentList);
            setCatalogos(prev => ({ ...prev, [catalogId]: currentList }));
        } catch (err) {
            alert("Error al actualizar: " + err.message);
        }
    };

    const handleSaveEntity = async () => {
        if (!entityForm.nombre.trim()) return;

        try {
            if (editingEntity) {
                await editarEntidad(editingEntity.id, entityForm);
            } else {
                await agregarEntidad(entityForm);
            }
            setEditingEntity(null);
            setEntityForm({ nombre: '', tipo: 'Banco', categoria: 'General' });
        } catch (err) {
            alert("Error al procesar entidad: " + err.message);
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                if (window.confirm("Esta acción sobrescribirá todos los datos actuales. ¿Deseas continuar?")) {
                    const ok = await importData(data);
                    if (ok) alert("Importación realizada con éxito.");
                }
            } catch (err) {
                alert("Error al leer el archivo: " + err.message);
            }
        };
        reader.readAsText(file);
    };

    const handleExport = async () => {
        try {
            const data = await exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SCO_Respaldo_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert("Error al exportar: " + err.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        Ajustes del Sistema
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuración del Centro de Control</h1>
                    <p className="text-sm text-slate-500 font-medium">Administre catálogos institucionales, parámetros normativos y respaldos de seguridad.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <aside className="lg:col-span-3 space-y-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveTab(cat.id); setSelectedCatalog(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === cat.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <span className="text-xl">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <main className="lg:col-span-9">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <Card className="!p-10 text-center space-y-8">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto border-2 border-emerald-100 shadow-sm">
                                    💾
                                </div>
                                <div className="max-w-md mx-auto space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Respaldo y Recuperación</h2>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Proteja su información descargando una copia completa de los registros. Puede restaurarla en cualquier momento.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <button
                                        onClick={handleExport}
                                        className="group flex flex-col items-center justify-center p-8 bg-slate-900 hover:bg-slate-800 text-white rounded-[2.5rem] transition-all hover:shadow-2xl hover:shadow-slate-200 active:scale-95 cursor-pointer"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <i className="ri-download-cloud-2-line text-2xl text-emerald-400"></i>
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-widest">Generar Respaldo</span>
                                        <span className="text-[10px] text-slate-400 mt-2 font-bold opacity-70">Formato .json unificado</span>
                                    </button>

                                    <label className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-200 hover:border-slate-900 hover:bg-slate-50 rounded-[2.5rem] transition-all hover:shadow-xl active:scale-95 cursor-pointer">
                                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                                        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-slate-100 group-hover:scale-110 transition-transform border border-slate-100">
                                            <i className="ri-upload-cloud-2-line text-2xl text-slate-600"></i>
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-widest text-slate-700">Restaurar Datos</span>
                                        <span className="text-[10px] text-slate-400 mt-2 font-bold opacity-70">Sobrescribe base actual</span>
                                    </label>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-5 text-left items-start">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                        <i className="ri-error-warning-fill text-2xl"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Aviso Importante</p>
                                        <p className="text-xs text-amber-800/80 font-medium leading-relaxed">
                                            La importación de datos es un proceso destructivo. Se recomienda encarecidamente realizar un respaldo previo antes de importar información nueva. Los cambios afectan a Observaciones, Seguimientos y Catálogos.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab !== 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            {/* Catalog Selection List */}
                            <div className="md:col-span-4 space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 pb-2 border-b border-slate-100">Catálogos</p>
                                <div className="space-y-1 pt-2">
                                    {catalogsByCategory[activeTab].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setSelectedCatalog(cat); setEditingEntity(null); }}
                                            className={`w-full text-left px-5 py-4 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-between border ${selectedCatalog?.id === cat.id ? 'bg-slate-100 border-slate-200 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 border-transparent'}`}
                                        >
                                            {cat.label}
                                            {selectedCatalog?.id === cat.id && <span className="w-2 h-2 rounded-full bg-slate-900" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Catalog Editor Area */}
                            <div className="md:col-span-8">
                                <Card className="min-h-[600px] flex flex-col !bg-slate-50 shadow-none border-slate-200/60">
                                    {!selectedCatalog ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                                            <i className="ri-layout-left-line text-6xl"></i>
                                            <p className="text-xs font-black uppercase tracking-widest">Seleccione un elemento para gestionar</p>
                                        </div>
                                    ) : selectedCatalog.id === 'entidades' ? (
                                        /* SPECIAL CASE: ENTIDADES */
                                        <div className="flex flex-col h-full space-y-6">
                                            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900">{selectedCatalog.label}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entidades.length} registros</p>
                                                </div>
                                                <button 
                                                    onClick={() => { setEditingEntity(null); setEntityForm({ nombre: '', tipo: 'Banco', categoria: 'General' }); }}
                                                    className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                                >
                                                    Nuevo
                                                </button>
                                            </div>

                                            {/* Entity Form / Filter */}
                                            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="sm:col-span-2 space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre de la Entidad</label>
                                                        <input 
                                                            type="text"
                                                            value={entityForm.nombre}
                                                            onChange={e => setEntityForm({...entityForm, nombre: e.target.value})}
                                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 bg-slate-50/50"
                                                            placeholder="Ej: Banco Nacional del Desarrollo"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo</label>
                                                        <select
                                                            value={entityForm.tipo}
                                                            onChange={e => setEntityForm({...entityForm, tipo: e.target.value})}
                                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 bg-slate-50/50"
                                                        >
                                                            <option>Banco</option>
                                                            <option>Cooperativa</option>
                                                            <option>Financiera</option>
                                                            <option>Empresa de Remesas</option>
                                                            <option>Caja de Crédito</option>
                                                            <option>Sociedad de Ahorro</option>
                                                            <option>Emisor de Dinero Electrónico</option>
                                                            <option>Punto de Atención</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoría</label>
                                                        <select
                                                            value={entityForm.categoria}
                                                            onChange={e => setEntityForm({...entityForm, categoria: e.target.value})}
                                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 bg-slate-50/50"
                                                        >
                                                            <option>General</option>
                                                            <option>Especializada</option>
                                                            <option>Gubernamental</option>
                                                            <option>Internacional</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleSaveEntity}
                                                    className="w-full h-12 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                                                >
                                                    {editingEntity ? 'Actualizar Registro' : 'Inscribir Entidad'}
                                                </button>
                                            </div>

                                            {/* Entities List */}
                                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                {entidades.map(ent => (
                                                    <div key={ent.id} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-3xl hover:border-slate-300 hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                                                                {ent.nombre.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-[13px] font-black text-slate-900 leading-tight">{ent.nombre}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">{ent.tipo}</span>
                                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">{ent.categoria}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => { setEditingEntity(ent); setEntityForm({nombre: ent.nombre, tipo: ent.tipo, categoria: ent.categoria}); }}
                                                                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
                                                            >
                                                                <i className="ri-edit-line"></i>
                                                            </button>
                                                            <button 
                                                                onClick={() => { if(window.confirm('¿Eliminar entidad?')) eliminarEntidad(ent.id); }}
                                                                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                                                            >
                                                                <i className="ri-delete-bin-line"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        /* STANDARD CATALOG CASE */
                                        <div className="flex flex-col h-full space-y-6">
                                            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900">{selectedCatalog.label}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {catalogos[selectedCatalog.id]?.length || 0} elementos registrados
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Entry Area */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Añadir Nuevo</label>
                                                <div className="flex gap-3">
                                                    <input 
                                                        type="text"
                                                        value={newItem}
                                                        onChange={e => setNewItem(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleAddCatalogItem(selectedCatalog.id, selectedCatalog.isComplex)}
                                                        placeholder={selectedCatalog.isComplex ? 'CÓDIGO | Nombre descriptivo' : 'Escriba aquí...'}
                                                        className="flex-1 h-12 px-5 rounded-2xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900"
                                                    />
                                                    <button 
                                                        onClick={() => handleAddCatalogItem(selectedCatalog.id, selectedCatalog.isComplex)}
                                                        className="h-12 px-8 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 cursor-pointer"
                                                    >
                                                        Registrar
                                                    </button>
                                                </div>
                                                {selectedCatalog.isComplex && (
                                                    <p className="text-[9px] font-bold text-slate-400 bg-slate-100 p-2 px-3 rounded-lg border border-slate-200">
                                                        💡 Consejo: Para normas, use la "barra vertical" ( | ) para separar el código del nombre.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Items List */}
                                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                {(catalogos[selectedCatalog.id] || []).map((item, idx) => (
                                                    <div key={idx} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl hover:border-slate-300 hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                {selectedCatalog.isComplex ? (
                                                                    <>
                                                                        <span className="text-[11px] font-black text-slate-900">{item.codigo}</span>
                                                                        <span className="text-[11px] font-bold text-slate-500">{item.nombre}</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-[12px] font-bold text-slate-700">{item}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleDeleteCatalogItem(selectedCatalog.id, idx)}
                                                            className="w-10 h-10 rounded-2xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                                        >
                                                            <i className="ri-delete-bin-7-line text-lg"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                                {(catalogos[selectedCatalog.id] || []).length === 0 && (
                                                    <div className="h-40 flex flex-col items-center justify-center text-slate-300 gap-3">
                                                        <i className="ri-inbox-line text-4xl"></i>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest">Sin elementos registrados</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
