import { useState } from 'react';
import { Card } from './SharedComponents';

/**
 * Componente para gestionar listas de catálogos (tags, strings, o código|nombre)
 * @param {string} title - Título del catálogo
 * @param {any[]} items - Lista de elementos actuales
 * @param {function} onUpdate - Función que recibe la nueva lista completa
 * @param {boolean} isComplex - Si el catálogo usa el formato CÓDIGO | Nombre
 */
export default function CatalogManager({ title, items = [], onUpdate, isComplex = false }) {
    const [newItem, setNewItem] = useState('');
    const [newItemNombre, setNewItemNombre] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingValue, setEditingValue] = useState('');
    const [editingValueNombre, setEditingValueNombre] = useState('');

    const handleAdd = () => {
        let itemToAdd;
        
        if (isComplex) {
            if (!newItem.trim() || !newItemNombre.trim()) return;
            itemToAdd = { 
                codigo: newItem.trim().toUpperCase(), 
                nombre: newItemNombre.trim() 
            };
        } else {
            if (!newItem.trim()) return;
            itemToAdd = newItem.trim();
        }

        // Evitar duplicados
        const isDuplicate = items.some(i => {
            if (isComplex) {
                return i.codigo === itemToAdd.codigo;
            }
            return i === itemToAdd;
        });

        if (isDuplicate) {
            alert('Este elemento ya existe en el catálogo.');
            return;
        }

        onUpdate([...items, itemToAdd]);
        setNewItem('');
        setNewItemNombre('');
    };

    const handleRemove = (index) => {
        if (!confirm('¿Está seguro de eliminar este elemento?')) return;
        const newList = [...items];
        newList.splice(index, 1);
        onUpdate(newList);
    };

    const startEditing = (idx, item) => {
        setEditingIndex(idx);
        if (isComplex) {
            setEditingValue(item.codigo);
            setEditingValueNombre(item.nombre);
        } else {
            setEditingValue(item);
        }
    };

    const saveEdit = () => {
        const newList = [...items];
        if (isComplex) {
            newList[editingIndex] = {
                codigo: editingValue.toUpperCase(),
                nombre: editingValueNombre
            };
        } else {
            newList[editingIndex] = editingValue;
        }
        onUpdate(newList);
        setEditingIndex(null);
    };

    return (
        <Card className="overflow-hidden border-slate-200/60 shadow-sm flex flex-col h-full bg-slate-50/30">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{items.length} elementos registrados</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-lg">settings_suggest</span>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Input Section */}
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Añadir Nuevo</h4>
                    {isComplex ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-1">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Código</label>
                                <input 
                                    type="text" 
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder="EJ: C1"
                                    className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-slate-900/5 focus:outline-none uppercase bg-slate-50/50"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Descripción</label>
                                <input 
                                    type="text" 
                                    value={newItemNombre}
                                    onChange={(e) => setNewItemNombre(e.target.value)}
                                    placeholder="Nombre descriptivo..."
                                    className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-slate-900/5 focus:outline-none bg-slate-50/50"
                                />
                            </div>
                            <div className="flex items-end">
                                <button 
                                    onClick={handleAdd}
                                    className="w-full h-10 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 cursor-pointer"
                                >
                                    REGISTRAR
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    placeholder="Escriba aquí..."
                                    className="w-full h-10 px-4 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-slate-900/5 focus:outline-none bg-slate-50/50"
                                />
                            </div>
                            <button 
                                onClick={handleAdd}
                                className="h-10 px-8 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 cursor-pointer"
                                title="Agregar nuevo elemento al catálogo"
                            >
                                REGISTRAR
                            </button>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="flex-1 overflow-y-auto max-h-96 pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-2">
                        {items.map((item, idx) => {
                            const isEditing = editingIndex === idx;
                            const isObject = typeof item === 'object' && item !== null;

                            return (
                                <div 
                                    key={idx} 
                                    className={`group flex items-center justify-between p-3.5 bg-white border ${isEditing ? 'border-primary shadow-md' : 'border-slate-100'} rounded-2xl hover:border-slate-300 hover:shadow-md transition-all animate-in fade-in slide-in-from-right-2`}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                                            {idx + 1}
                                        </div>
                                        
                                        <div className="flex-1">
                                            {isEditing ? (
                                                <div className="flex gap-2 w-full">
                                                    {isComplex ? (
                                                        <>
                                                            <input 
                                                                type="text" 
                                                                value={editingValue}
                                                                onChange={(e) => setEditingValue(e.target.value)}
                                                                className="w-20 px-2 h-8 border border-slate-200 rounded-lg text-[11px] font-bold uppercase"
                                                            />
                                                            <input 
                                                                type="text" 
                                                                value={editingValueNombre}
                                                                onChange={(e) => setEditingValueNombre(e.target.value)}
                                                                className="flex-1 px-2 h-8 border border-slate-200 rounded-lg text-[11px]"
                                                            />
                                                        </>
                                                    ) : (
                                                        <input 
                                                            type="text" 
                                                            value={editingValue}
                                                            onChange={(e) => setEditingValue(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                                            autoFocus
                                                            className="w-full px-2 h-8 border border-slate-200 rounded-lg text-[11px] font-bold"
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    {isObject ? (
                                                        <p className="text-[12px] font-bold text-slate-800">
                                                            <span className="text-slate-400 mr-2 font-black">{item.codigo}</span>
                                                            {item.nombre}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[12px] font-bold text-slate-800">{item}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 ml-2">
                                        {isEditing ? (
                                            <>
                                                <button 
                                                    onClick={saveEdit}
                                                    className="w-8 h-8 rounded-lg text-emerald-500 hover:bg-emerald-50 flex items-center justify-center transition-all cursor-pointer"
                                                    title="Guardar cambios"
                                                >
                                                    <span className="material-symbols-outlined text-lg">check</span>
                                                </button>
                                                <button 
                                                    onClick={() => setEditingIndex(null)}
                                                    className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                                                    title="Cancelar"
                                                >
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => startEditing(idx, item)}
                                                    className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-slate-200"
                                                    title="Editar este elemento"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleRemove(idx)}
                                                    className="w-9 h-9 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-rose-100"
                                                    title="Eliminar este elemento"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {items.length === 0 && (
                            <div className="h-32 flex flex-col items-center justify-center text-slate-300 space-y-2">
                                <span className="material-symbols-outlined text-3xl">inbox</span>
                                <p className="text-[10px] font-black uppercase tracking-widest italic opacity-50">Sin registros</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

