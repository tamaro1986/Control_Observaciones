import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
    const [dialogState, setDialogState] = useState({ isOpen: false, message: '', resolve: null, title: 'Confirmar Acción' });

    const confirm = useCallback((message, title = 'Confirmar Acción') => {
        return new Promise((resolve) => {
            setDialogState({ isOpen: true, message, resolve, title });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (dialogState.resolve) dialogState.resolve(true);
        setDialogState({ ...dialogState, isOpen: false });
    }, [dialogState]);

    const handleCancel = useCallback(() => {
        if (dialogState.resolve) dialogState.resolve(false);
        setDialogState({ ...dialogState, isOpen: false });
    }, [dialogState]);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {dialogState.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-sm w-full animate-slide-in">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{dialogState.title}</h3>
                            <p className="text-gray-600 font-medium whitespace-pre-line">{dialogState.message}</p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:ring-2 focus:ring-gray-200 outline-none"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 border border-transparent transition-colors focus:ring-2 focus:ring-red-600 outline-none"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    return useContext(ConfirmContext);
}
