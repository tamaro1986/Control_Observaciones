import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ConfirmProvider } from './context/ConfirmContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <ConfirmProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ConfirmProvider>
        </AuthProvider>
    </React.StrictMode>,
)
