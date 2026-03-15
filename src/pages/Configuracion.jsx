import { useState } from 'react';
import { Card } from '../components/SharedComponents';

export default function Configuracion({ catalogos, setCatalogos, exportData, importData }) {
    const [activeSubTab, setActiveSubTab] = useState('correlativos');
    const [editingList, setEditingList] = useState(null); // { key: string, label: string }
    const [newItem, setNewItem] = useState('');

    const subTabs = [
        { id: 'correlativos', label: 'Cartas e Informes', icon: '📄' },
        { id: 'observaciones', label: 'Observaciones', icon: '🔍' },
        { id: 'respaldo', label: 'Respaldo de Datos', icon: '💾' },
    ];

    const correlativosLists = [
        { key: 'normas', label: 'Normas (Código y Nombre)', isComplex: true },
        { key: 'clasificaciones', label: 'Clasificaciones' },
        { key: 'industrias', label: 'Industrias' },
        { key: 'tiposInforme', label: 'Tipos de Informe' },
        { key: 'tiposCorrespondencia', label: 'Tipos de Correspondencia' },
        { key: 'accionesSupervision', label: 'Acciones de Supervisión' },
        { key: 'responsables', label: 'Responsables' },
        { key: 'entidades', label: 'Entidades', isComplex: true },
        { key: 'descripcionesAccion', label: 'Descripciones Predeterminadas' },
    ];

    const observacionesLists = [
        { key: 'nivelesRiesgo', label: 'Niveles de Riesgo' },
        { key: 'estados', label: 'Estados de Hallazgo' },
        { key: 'tiposRiesgo', label: 'Tipos de Riesgo' },
        { key: 'tiposVisita', label: 'Tipos de Visita' },
    ];

    function handleAdd(key, isComplex) {
        if (!newItem.trim()) return;
        setCatalogos(prev => {
            const list = [...(prev[key] || [])];
            if (isComplex) {
                if (key === 'normas') {
                    const [codigo, ...rest] = newItem.split('|').map(s => s.trim());
                    list.push({ codigo, nombre: rest.join(' ') });
                } else if (key === 'entidades') {
                    const [nombre, tipo, categoria] = newItem.split('|').map(s => s.trim());
                    list.push({ id: Date.now(), nombre, tipo: tipo || 'Banco', categoria: categoria || 'General' });
                }
            } else {
                list.push(newItem.trim());
            }
            return { ...prev, [key]: list };
        });
        setNewItem('');
    }

    function handleDelete(key, index) {
        if (!window.confirm('¿Eliminar este elemento?')) return;
        setCatalogos(prev => {
            const list = [...(prev[key] || [])];
            list.splice(index, 1);
            return { ...prev, [key]: list };
        });
    }

    const exportarDatos = async () => {
        const data = await exportData();
        if (!data) return;

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `respaldo_SCO_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const importarDatos = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const success = await importData(data);
                if (success) {
                    alert("Importación exitosa. Los cambios se han aplicado.");
                } else {
                    throw new Error("Error en la importación");
                }
            } catch (err) {
                alert("Error al importar: " + err.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-2xl">
                    ⚙️
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configuración del Sistema</h1>
                    <p className="text-sm font-medium text-slate-500">Gestione los catálogos y parámetros globales de la aplicación</p>
                </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                {subTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeSubTab === tab.id ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeSubTab === 'correlativos' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* List of Catalogs */}
                    <Card className="md:col-span-1 space-y-1 !p-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Catálogos Disponibles</p>
                        {correlativosLists.map(list => (
                            <button
                                key={list.key}
                                onClick={() => { setEditingList(list); setNewItem(''); }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${editingList?.key === list.key ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}
                            >
                                {list.label}
                                <svg className={`w-4 h-4 transition-transform ${editingList?.key === list.key ? 'translate-x-1' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </Card>

                    {/* Editor area */}
                    <Card className="md:col-span-2 min-h-[500px] flex flex-col">
                        {!editingList ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4">
                                <div className="text-6xl">👈</div>
                                <p className="font-bold uppercase tracking-widest text-xs">Seleccione un catálogo para editar</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">{editingList.label}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {catalogos[editingList.key].length} elementos registrados
                                        </p>
                                    </div>
                                </div>

                                {/* Add new item */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        {editingList.isComplex
                                            ? (editingList.key === 'normas' ? 'Nuevo (Formato: CÓDIGO | Nombre)' : 'Nuevo (Formato: Nombre | Tipo | Categoría)')
                                            : 'Nuevo Elemento'}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newItem}
                                            onChange={e => setNewItem(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAdd(editingList.key, editingList.isComplex)}
                                            placeholder={editingList.isComplex ? 'Ej: NCMC-30 | Seguridad de Datos' : 'Escriba aquí...'}
                                            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-slate-50"
                                        />
                                        <button
                                            onClick={() => handleAdd(editingList.key, editingList.isComplex)}
                                            className="h-11 px-6 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 cursor-pointer"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {catalogos[editingList.key].map((item, idx) => (
                                        <div key={idx} className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    {editingList.key === 'normas' ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-slate-900 border-r border-slate-200 pr-2">{item.codigo}</span>
                                                            <span className="text-xs font-medium text-slate-600">{item.nombre}</span>
                                                        </div>
                                                    ) : editingList.key === 'entidades' ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-slate-900">{item.nombre}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{item.tipo} · {item.categoria}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-700">{item}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(editingList.key, idx)}
                                                className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            ) : activeSubTab === 'observaciones' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* List of Catalogs for Observaciones */}
                    <Card className="md:col-span-1 space-y-1 !p-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Catálogos Disponibles</p>
                        {observacionesLists.map(list => (
                            <button
                                key={list.key}
                                onClick={() => { setEditingList(list); setNewItem(''); }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${editingList?.key === list.key ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}
                            >
                                {list.label}
                                <svg className={`w-4 h-4 transition-transform ${editingList?.key === list.key ? 'translate-x-1' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </Card>

                    {/* Editor area - Reuse from above because logic is the same */}
                    <Card className="md:col-span-2 min-h-[500px] flex flex-col">
                        {!editingList ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4">
                                <div className="text-6xl">👈</div>
                                <p className="font-bold uppercase tracking-widest text-xs">Seleccione un catálogo para editar</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">{editingList.label}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {catalogos[editingList.key]?.length || 0} elementos registrados
                                        </p>
                                    </div>
                                </div>

                                {/* Add new item */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Nuevo Elemento
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newItem}
                                            onChange={e => setNewItem(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAdd(editingList.key, false)}
                                            placeholder="Escriba aquí..."
                                            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-slate-50"
                                        />
                                        <button
                                            onClick={() => handleAdd(editingList.key, false)}
                                            className="h-11 px-6 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 cursor-pointer"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {catalogos[editingList.key]?.map((item, idx) => (
                                        <div key={idx} className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{item}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(editingList.key, idx)}
                                                className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card className="!p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto border border-emerald-100 shadow-sm">
                            💾
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Copia de Seguridad Local</h2>
                            <p className="text-sm text-slate-500 mt-2 font-medium">Respalde toda su información en un archivo físico para no perder su avance si se limpia el navegador.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            <button
                                onClick={exportarDatos}
                                className="flex flex-col items-center justify-center p-6 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl shadow-xl transition-all active:scale-95 group cursor-pointer"
                            >
                                <svg className="w-8 h-8 mb-3 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span className="text-sm font-black uppercase tracking-widest">Descargar Respaldo</span>
                                <span className="text-[10px] text-slate-400 mt-1 font-bold">Guarda en Descargas</span>
                            </button>

                            <label className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-200 hover:border-slate-900 hover:bg-slate-50 rounded-3xl transition-all active:scale-95 group cursor-pointer">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={importarDatos}
                                    className="hidden"
                                />
                                <svg className="w-8 h-8 mb-3 text-slate-400 group-hover:text-slate-900 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="text-sm font-black uppercase tracking-widest text-slate-700">Cargar Archivo</span>
                                <span className="text-[10px] text-slate-400 mt-1 font-bold">Selecciona tu .json</span>
                            </label>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-4 text-left">
                            <span className="text-2xl mt-1">⚠️</span>
                            <div>
                                <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Atención</p>
                                <p className="text-xs text-amber-800 mt-1 font-medium leading-relaxed">
                                    Al importar un archivo, se **sobrescribirán** todos los datos actuales del navegador. Se recomienda descargar un respaldo antes de realizar una importación.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
