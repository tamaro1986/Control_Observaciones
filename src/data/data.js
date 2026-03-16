// ===== AuditFlow — Data Models & Mock Data =====

export const ENTIDADES = [
    { id: 1, nombre: 'Banco Agrícola, S.A.', tipo: 'Banco', categoria: 'Sucursal Central' },
    { id: 2, nombre: 'Gestora Banagrícola', tipo: 'Gestora', categoria: 'Activos' },
    { id: 3, nombre: 'Leasing Corp', tipo: 'Leasing', categoria: 'Legal' },
    { id: 4, nombre: 'Valores Banagrícola', tipo: 'Casa de Valores', categoria: 'Operaciones' },
    { id: 5, nombre: 'Inmobiliaria Provivienda', tipo: 'Inmobiliaria', categoria: 'Proyectos' },
    { id: 6, nombre: 'Gestora de Fondos de Inversión Benagrícola, S.A.', tipo: 'Gestora', categoria: 'Fondos' },
];

export const TIPOS_VISITA = ['Focalizada', 'Ampliada'];

export const NIVELES_RIESGO = [
    { value: 'Crítico', color: 'risk-critico', label: 'Crítico' },
    { value: 'Alto', color: 'risk-alto', label: 'Alto' },
    { value: 'Medio', color: 'risk-medio', label: 'Medio' },
    { value: 'Bajo', color: 'risk-bajo', label: 'Bajo' },
];

export const TIPOS_RIESGO = ['Operacional', 'LA/FT/PADM', 'Cumplimiento', 'Crédito', 'Liquidez', 'Mercado', 'Legal'];


// ===== Catálogos Adicionales =====
export const UNIDADES_AUDITABLES = [
    'Riesgo Operativo',
    'Riesgo de Mercado',
    'Riesgo de Crédito',
    'Riesgo de Liquidez',
    'Ciberseguridad',
    'Prevención de Lavado de Dinero',
    'Gobierno Corporativo',
    'Cumplimiento Normativo',
    'Tecnología de la Información',
    'Operaciones y Procesos',
];

export const PUNTOS_NORMATIVOS = [
    'Art. 20 - Gestión de Riesgos',
    'Art. 45 - Control Interno',
    'Art. 12 - Capital Mínimo',
    'NRP-33 - Manual de Riesgos',
    'NCMC-10 - Divulgación de Información',
    'LFI Art. 15 - Inversiones Permitidas',
    'LTA Art. 8 - Patrimonios Separados',
    'Gobierno Corporativo - Mejores Prácticas',
    'Seguridad de la Información - ISO 27001',
    'Continuidad del Negocio',
];

export const ESTADOS = [
    { value: 'Pendiente', color: 'estado-pendiente' },
    { value: 'En Curso', color: 'estado-encurso' },
    { value: 'Subsanada', color: 'estado-subsanada' },
    { value: 'Parcialmente Subsanada', color: 'estado-parcial' },
    { value: 'Vencida', color: 'estado-vencida' },
];

export const RESPONSABLES = [
    'Enrique Alexander García',
    'Ada Hernández',
    'Ricardo Meza',
    'Laura Castro',
    'Pedro Méndez',
    'Jorge Sosa',
    'Ana Vilanova',
    'Karen Torres',
    'José Castellanos',
    'AUDITORIA_INTERNA',
    'COMITE_AUDITORIA',
];

export const FONDOS_INVERSION = [
    'Fondo de Inversión Abierto Liquidez de Corto Plazo',
    'Fondo de Inversión Abierto de Crecimiento',
    'Fondo de Inversión Cerrado Inmobiliario No. 1',
    'Fondo de Inversión Cerrado Inmobiliario No. 2',
    'Fondo de Inversión Cerrado de Capital de Riesgo',
];

// ===== Mock Observations =====
export const MOCK_OBSERVACIONES = [
    {
        id: 1024,
        entidadId: 1,
        tipoVisita: 'Focalizada',
        fechaInicio: '2025-03-05',
        fechaFin: '2025-03-21',
        titulo: 'Desviaciones en segregación de funciones',
        descripcion: 'Desviaciones significativas en la segregación de funciones dentro del módulo de tesorería central. Se identificaron roles con permisos excesivos que permiten la aprobación y ejecución de transacciones por el mismo usuario.',
        nivelRiesgo: 'Crítico',
        tipoRiesgo: 'Operacional',
        estado: 'Pendiente',
        normativa: 'NRP-08, Art. 15',
        nroInforme: 'INF-2025-001',
        nota: 'Nota 1.1',
        responsable: 'Enrique Alexander García',
        fechaPlanAccion: '2025-12-31',
        historialEstados: [
            {
                fecha: '2025-03-21',
                estadoAnterior: null,
                estadoNuevo: 'Pendiente',
                nroInforme: 'INF-2025-001',
                nota: 'Nota 1.1',
                respuestaEntidad: '',
                analisisAuditor: 'Hallazgo inicial identificado durante visita focalizada.',
                planAccion: 'La entidad debe implementar controles de segregación de funciones en el módulo de tesorería.',
                fechaPlanAccion: '2025-12-31',
            },
        ],
    },
    {
        id: 1025,
        entidadId: 2,
        tipoVisita: 'Ampliada',
        fechaInicio: '2025-02-03',
        fechaFin: '2025-04-28',
        titulo: 'Vulnerabilidades en acceso físico a servidores',
        descripcion: 'Vulnerabilidades detectadas en el acceso físico a los servidores de respaldo de datos del área LDA. Las bitácoras de acceso presentan inconsistencias y no se cumplen los protocolos de doble autenticación.',
        nivelRiesgo: 'Alto',
        tipoRiesgo: 'LA/FT/PADM',
        estado: 'Vencida',
        normativa: 'NRP-12, Art. 8',
        nroInforme: 'INF-2025-002',
        nota: 'Nota 2.1',
        responsable: 'Ada Hernández',
        fechaPlanAccion: '2025-05-15',
        historialEstados: [
            {
                fecha: '2025-04-28',
                estadoAnterior: null,
                estadoNuevo: 'Pendiente',
                nroInforme: 'INF-2025-002',
                nota: 'Nota 2.1',
                respuestaEntidad: '',
                analisisAuditor: 'Se requiere acción inmediata por el nivel de exposición.',
                planAccion: 'Implementar controles de acceso biométrico y sistema de CCTV.',
                fechaPlanAccion: '2025-05-15',
            },
            {
                fecha: '2025-06-01',
                estadoAnterior: 'Pendiente',
                estadoNuevo: 'Vencida',
                nroInforme: 'INF-2025-002',
                nota: 'Nota 2.1-A',
                respuestaEntidad: 'Se está evaluando proveedores para el sistema biométrico.',
                analisisAuditor: 'La entidad no cumplió con la fecha de plan de acción. Se mantiene el riesgo.',
                planAccion: 'Se requiere nuevo plan de acción con fecha extendida.',
                fechaPlanAccion: '2025-08-30',
            },
        ],
    },
    {
        id: 1026,
        entidadId: 1,
        tipoVisita: 'Focalizada',
        fechaInicio: '2024-09-01',
        fechaFin: '2024-09-30',
        titulo: 'Retraso en mantenimiento preventivo de ATMs',
        descripcion: 'Retraso en el programa de mantenimiento preventivo de cajeros automáticos en sucursales norte. El 35% de los ATMs presentan fallas recurrentes sin atención programada.',
        nivelRiesgo: 'Medio',
        tipoRiesgo: 'Operacional',
        estado: 'Subsanada',
        normativa: 'Circular BC-001/2024',
        nroInforme: 'INF-2024-008',
        nota: 'Nota 3.2',
        responsable: 'Ricardo Meza',
        fechaPlanAccion: '2025-01-15',
        historialEstados: [
            {
                fecha: '2024-09-30',
                estadoAnterior: null,
                estadoNuevo: 'Pendiente',
                nroInforme: 'INF-2024-008',
                nota: 'Nota 3.2',
                respuestaEntidad: '',
                analisisAuditor: 'Se requiere plan de mantenimiento correctivo.',
                planAccion: 'Implementar calendario de mantenimiento trimestral.',
                fechaPlanAccion: '2025-01-15',
            },
            {
                fecha: '2025-01-10',
                estadoAnterior: 'Pendiente',
                estadoNuevo: 'Subsanada',
                nroInforme: 'INF-2024-008',
                nota: 'Nota 3.2-B',
                respuestaEntidad: 'Se implementó el programa de mantenimiento preventivo trimestral. Se adjunta cronograma.',
                analisisAuditor: 'La entidad cumplió satisfactoriamente con el plan de acción.',
                planAccion: 'N/A - Subsanado',
                fechaPlanAccion: '2025-01-10',
            },
        ],
    },
    {
        id: 1027,
        entidadId: 3,
        tipoVisita: 'Focalizada',
        fechaInicio: '2025-01-15',
        fechaFin: '2025-02-28',
        titulo: 'Actualización de contratos de arrendamiento',
        descripcion: 'Actualización pendiente de contratos de arrendamiento que no cumplen con las nuevas disposiciones regulatorias. Se identificaron 12 contratos con cláusulas obsoletas.',
        nivelRiesgo: 'Bajo',
        tipoRiesgo: 'Legal',
        estado: 'En Curso',
        normativa: 'Ley de Arrendamiento, Art. 45',
        nroInforme: 'INF-2025-003',
        nota: 'Nota 4.1',
        responsable: 'Laura Castro',
        fechaPlanAccion: '2025-06-30',
        historialEstados: [
            {
                fecha: '2025-02-28',
                estadoAnterior: null,
                estadoNuevo: 'Pendiente',
                nroInforme: 'INF-2025-003',
                nota: 'Nota 4.1',
                respuestaEntidad: '',
                analisisAuditor: 'Los contratos deben actualizarse conforme a la nueva normativa.',
                planAccion: 'Revisión y actualización de los 12 contratos identificados.',
                fechaPlanAccion: '2025-06-30',
            },
            {
                fecha: '2025-04-15',
                estadoAnterior: 'Pendiente',
                estadoNuevo: 'En Curso',
                nroInforme: 'INF-2025-003',
                nota: 'Nota 4.1-A',
                respuestaEntidad: 'Se han actualizado 5 de 12 contratos. Los restantes están en proceso de revisión legal.',
                analisisAuditor: 'Avance parcial aceptable. Se monitoreará progreso.',
                planAccion: 'Completar actualización de los 7 contratos restantes.',
                fechaPlanAccion: '2025-06-30',
            },
        ],
    },
    {
        id: 1028,
        entidadId: 1,
        tipoVisita: 'Ampliada',
        fechaInicio: '2025-04-01',
        fechaFin: '2025-05-15',
        titulo: 'Falta de evidencia en debida diligencia',
        descripcion: 'Falta de evidencia en los procesos de debida diligencia para clientes de alto riesgo en el segmento corporativo. Se detectaron expedientes incompletos en un 18% de la muestra analizada.',
        nivelRiesgo: 'Crítico',
        tipoRiesgo: 'LA/FT/PADM',
        estado: 'Pendiente',
        normativa: 'NRP-08, Art. 22, NRP-12',
        nroInforme: 'INF-2025-005',
        nota: 'Nota 5.1',
        responsable: 'Pedro Méndez',
        fechaPlanAccion: '2025-09-30',
        historialEstados: [
            {
                fecha: '2025-05-15',
                estadoAnterior: null,
                estadoNuevo: 'Pendiente',
                nroInforme: 'INF-2025-005',
                nota: 'Nota 5.1',
                respuestaEntidad: '',
                analisisAuditor: 'Hallazgo crítico. Se requiere plan de remediación urgente.',
                planAccion: 'Completar expedientes y reforzar procedimientos de KYC.',
                fechaPlanAccion: '2025-09-30',
            },
        ],
    },
    {
        id: 1029,
        entidadId: 4,
        tipoVisita: 'Focalizada',
        fechaInicio: '2025-03-10',
        fechaFin: '2025-04-20',
        titulo: 'Inconsistencias en conciliación diaria de cartera',
        descripcion: 'Inconsistencias en la conciliación diaria de la cartera de instrumentos financieros. Se encontraron diferencias no conciliadas por más de 5 días hábiles en el 22% de las posiciones.',
        nivelRiesgo: 'Alto',
        tipoRiesgo: 'Operacional',
        estado: 'Vencida',
        normativa: 'NIIF 9, Circular SSF-012',
        nroInforme: 'INF-2025-006',
        nota: 'Nota 6.1',
        responsable: 'Jorge Sosa',
        fechaPlanAccion: '2025-06-30',
        historialEstados: [
            {
                fecha: '2025-04-20',
                estadoAnterior: null,
                estadoNuevo: 'Pendiente',
                nroInforme: 'INF-2025-006',
                nota: 'Nota 6.1',
                respuestaEntidad: '',
                analisisAuditor: 'Las diferencias pueden representar riesgo de pérdida material.',
                planAccion: 'Automatizar proceso de conciliación diaria.',
                fechaPlanAccion: '2025-06-30',
            },
            {
                fecha: '2025-07-05',
                estadoAnterior: 'Pendiente',
                estadoNuevo: 'Vencida',
                nroInforme: 'INF-2025-006',
                nota: 'Nota 6.1-A',
                respuestaEntidad: 'El proyecto de automatización está en fase de licitación.',
                analisisAuditor: 'No se cumplió la fecha del plan de acción. Se requiere seguimiento intensivo.',
                planAccion: 'Presentar nuevo cronograma con hitos medibles.',
                fechaPlanAccion: '2025-09-30',
            },
        ],
    },
    {
        id: 1030,
        entidadId: 5,
        tipoVisita: 'Ampliada',
        fechaInicio: '2024-10-01',
        fechaFin: '2024-12-15',
        titulo: 'Retraso en liquidación de garantías de obra',
        descripcion: 'Retraso en la liquidación de garantías de obra para proyectos finalizados. Se identificaron 8 garantías pendientes de liberación con más de 90 días de atraso.',
        nivelRiesgo: 'Medio',
        tipoRiesgo: 'Operacional',
        estado: 'Subsanada',
        normativa: 'Reglamento Interno, Cap. VII',
        nroInforme: 'INF-2024-012',
        nota: 'Nota 7.1',
        responsable: 'Ana Vilanova',
        fechaPlanAccion: '2025-03-31',
        historialEstados: [
            {
                fecha: '2024-12-15',
                estadoAnterior: null,
                estadoNuevo: 'Pendiente',
                nroInforme: 'INF-2024-012',
                nota: 'Nota 7.1',
                respuestaEntidad: '',
                analisisAuditor: 'Se requiere agilizar el proceso de liberación.',
                planAccion: 'Procesar las 8 garantías pendientes.',
                fechaPlanAccion: '2025-03-31',
            },
            {
                fecha: '2025-02-15',
                estadoAnterior: 'Pendiente',
                estadoNuevo: 'En Curso',
                nroInforme: 'INF-2024-012',
                nota: 'Nota 7.1-A',
                respuestaEntidad: 'Se han procesado 5 de 8 garantías. Las 3 restantes están en revisión jurídica.',
                analisisAuditor: 'Avance significativo. Se da seguimiento a las 3 pendientes.',
                planAccion: 'Completar las 3 garantías en revisión jurídica.',
                fechaPlanAccion: '2025-03-31',
            },
            {
                fecha: '2025-03-28',
                estadoAnterior: 'En Curso',
                estadoNuevo: 'Subsanada',
                nroInforme: 'INF-2024-012',
                nota: 'Nota 7.1-B',
                respuestaEntidad: 'Todas las garantías fueron procesadas y liberadas satisfactoriamente.',
                analisisAuditor: 'Observación subsanada dentro del plazo. Se cierra el hallazgo.',
                planAccion: 'N/A - Subsanado',
                fechaPlanAccion: '2025-03-28',
            },
        ],
    },
    {
        id: 1031,
        entidadId: 1,
        tipoVisita: 'Focalizada',
        fechaInicio: '2025-05-01',
        fechaFin: '2025-06-15',
        titulo: 'Falla en proceso automático de depuración',
        descripcion: 'Falla en el proceso automático de depuración de cuentas inactivas del sistema core bancario. El proceso no se ejecutó durante 3 meses consecutivos, acumulando 1,200 cuentas sin depurar.',
        nivelRiesgo: 'Alto',
        tipoRiesgo: 'Operacional',
        estado: 'En Curso',
        normativa: 'Manual de Operaciones, Sección 4.3',
        nroInforme: 'INF-2025-008',
        nota: 'Nota 8.1',
        responsable: 'Karen Torres',
        fechaPlanAccion: '2025-08-31',
        historialEstados: [
            {
                fecha: '2025-06-15',
                estadoAnterior: null,
                estadoNuevo: 'Pendiente',
                nroInforme: 'INF-2025-008',
                nota: 'Nota 8.1',
                respuestaEntidad: '',
                analisisAuditor: 'Falla técnica que requiere corrección del proceso batch.',
                planAccion: 'Corregir el proceso de depuración automática y ejecutar depuración manual de las cuentas acumuladas.',
                fechaPlanAccion: '2025-08-31',
            },
            {
                fecha: '2025-07-20',
                estadoAnterior: 'Pendiente',
                estadoNuevo: 'En Curso',
                nroInforme: 'INF-2025-008',
                nota: 'Nota 8.1-A',
                respuestaEntidad: 'El equipo de TI identificó la causa raíz y está desarrollando la corrección. Se ha depurado manualmente el 60% de las cuentas acumuladas.',
                analisisAuditor: 'Progreso aceptable. Se verifica en próxima visita.',
                planAccion: 'Completar depuración manual y desplegar fix del proceso batch.',
                fechaPlanAccion: '2025-08-31',
            },
        ],
    },
    {
        id: 1032,
        entidadId: 6,
        tipoVisita: 'Focalizada',
        fechaInicio: '2025-01-10',
        fechaFin: '2025-02-20',
        titulo: 'Diferencias en metodología de valuación',
        descripcion: 'Diferencias entre la metodología de valuación presentada en las actas de comité y la información remitida a la Superintendencia. Se identificaron inconsistencias en 4 fondos de inversión.',
        nivelRiesgo: 'Alto',
        tipoRiesgo: 'Cumplimiento',
        estado: 'Pendiente',
        normativa: 'NRP-05, Art. 12',
        nroInforme: 'INF-2025-004',
        nota: 'Nota 9.1',
        responsable: 'José Castellanos',
        fechaPlanAccion: '2025-06-30',
        historialEstados: [
            {
                fecha: '2025-02-20',
                estadoAnterior: null,
                estadoNuevo: 'Pendiente',
                nroInforme: 'INF-2025-004',
                nota: 'Nota 9.1',
                respuestaEntidad: '',
                analisisAuditor: 'Se requiere alinear la metodología de valuación entre documentos internos y reportes regulatorios.',
                planAccion: 'Revisar y unificar metodología de valuación en los 4 fondos afectados.',
                fechaPlanAccion: '2025-06-30',
            },
        ],
    },
    {
        id: 1033,
        entidadId: 1,
        tipoVisita: 'Focalizada',
        fechaInicio: '2025-02-01',
        fechaFin: '2025-03-15',
        titulo: 'Inconsistencias en registro de aportes',
        descripcion: 'Inconsistencias en el uso del sistema informático para el registro de aportes. Se detectaron errores de documentación que generan inconsistencias en la generación de reportes regulatorios.',
        nivelRiesgo: 'Medio',
        tipoRiesgo: 'Operacional',
        estado: 'Parcialmente Subsanada',
        normativa: 'Circular SSF-005/2025',
        nroInforme: 'INF-2025-009',
        nota: 'Nota 10.1',
        responsable: 'Enrique Alexander García',
        fechaPlanAccion: '2025-07-31',
        historialEstados: [
            {
                fecha: '2025-03-15',
                estadoAnterior: null,
                estadoNuevo: 'Pendiente',
                nroInforme: 'INF-2025-009',
                nota: 'Nota 10.1',
                respuestaEntidad: '',
                analisisAuditor: 'Se requiere corrección en el proceso de registro.',
                planAccion: 'Capacitar al personal y corregir registros históricos.',
                fechaPlanAccion: '2025-07-31',
            },
            {
                fecha: '2025-05-20',
                estadoAnterior: 'Pendiente',
                estadoNuevo: 'Parcialmente Subsanada',
                nroInforme: 'INF-2025-009',
                nota: 'Nota 10.1-A',
                respuestaEntidad: 'Se realizó la capacitación al 80% del personal. Los registros históricos están en proceso de corrección.',
                analisisAuditor: 'Avance parcial. Falta completar capacitación y corrección de registros.',
                planAccion: 'Completar capacitación del 20% restante y finalizar corrección de registros.',
                fechaPlanAccion: '2025-07-31',
            },
        ],
    },
];

// ===== Helper Functions =====
export function getEntidadById(id) {
    return ENTIDADES.find(e => e.id === id);
}

export function getRiesgoStyle(nivel) {
    const map = {
        'Crítico': { bg: 'bg-risk-critico-bg', text: 'text-risk-critico', border: 'border-risk-critico' },
        'Alto': { bg: 'bg-risk-alto-bg', text: 'text-risk-alto', border: 'border-risk-alto' },
        'Medio': { bg: 'bg-risk-medio-bg', text: 'text-risk-medio', border: 'border-risk-medio' },
        'Bajo': { bg: 'bg-risk-bajo-bg', text: 'text-risk-bajo', border: 'border-risk-bajo' },
    };
    return map[nivel] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };
}

export function getEstadoStyle(estado) {
    const map = {
        'Pendiente': { bg: 'bg-estado-pendiente-bg', text: 'text-estado-pendiente', dot: 'bg-estado-pendiente' },
        'En Curso': { bg: 'bg-estado-encurso-bg', text: 'text-estado-encurso', dot: 'bg-estado-encurso' },
        'Subsanada': { bg: 'bg-estado-subsanada-bg', text: 'text-estado-subsanada', dot: 'bg-estado-subsanada' },
        'Parcialmente Subsanada': { bg: 'bg-estado-parcial-bg', text: 'text-estado-parcial', dot: 'bg-estado-parcial' },
        'Vencida': { bg: 'bg-estado-vencida-bg', text: 'text-estado-vencida', dot: 'bg-estado-vencida' },
    };
    return map[estado] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
}

export function getInitials(name) {
    return name?.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '';
}

export function getAvatarColor(name) {
    const colors = [
        'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
        'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

// ===== Correlativos — Catálogos =====
export const CLASIFICACIONES_CORR = [
    'Operatividad',
    'Gestión de Fondos de Inversión',
    'Gobierno Corporativo',
    'Cumplimiento Normativo',
    'Titularización',
    'Comité Administrador de Fondos',
    'Unidad Reguladora',
];

export const INDUSTRIAS_CORR = [
    'Titularizadoras',
    'Fondos de Inversión',
    'Bolsas de Valores',
    'Casas de Valores',
    'Gestoras',
];

export const TIPOS_INFORME_CORR = [
    'Informe de supervisión',
    'Informe de auditoría',
    'Informe de JSTV',
    'Informe de auditoría de TI',
    'Memo',
    'Memorándum',
];

export const ACCIONES_SUPERVISION = ['In Situ', 'Extra Sitio'];

export const NORMAS_CORR = [
    { codigo: 'NCMC-18', nombre: 'Norma para la Administración del Riesgo Operacional en Entidades Financieras' },
    { codigo: 'NCMC-21', nombre: 'Normas Técnicas para la Gestión de la Seguridad de la Información' },
    { codigo: 'NCMC-25', nombre: 'Normas Técnicas para la Gestión de la Continuidad del Negocio' },
    { codigo: 'LTA', nombre: 'Ley de Titularización de Activos' },
    { codigo: 'NF-21', nombre: 'Normas Técnicas para los Fondos de Inversión' },
    { codigo: 'NF-18', nombre: 'Normas Técnicas para la Autorización de Fondos de Inversión' },
    { codigo: 'REGLAMENTO-FI', nombre: 'Reglamento para la Administración de Fondos de Inversión' },
    { codigo: 'CIRCULAR-SSF-10', nombre: 'Circular SSF sobre Mercado de Valores' },
];

// ===== Correlativos — Datos de ejemplo =====
export const MOCK_CORRELATIVOS = [
    {
        id: 'corr-1',
        codigo: 'DSFIT-035/2026',
        numero: 35,
        año: 2026,
        blfOtro: '10/02/2026',
        fecha: '2026-02-10',
        codigoNorma: 'NCMC-21',
        nombreNorma: 'Normas Técnicas para la Gestión de la Seguridad de la Información',
        cantidadUnidades: 1,
        clasificacion: 'Operatividad',
        industria: 'Titularizadoras',
        tipoInforme: 'Informe de supervisión',
        accionSupervision: 'In Situ',
        descripcionAccion: 'Visita de supervisión focalizada en controles de seguridad de la información de la plataforma de titularización.',
        responsable: 'Ada Hernández',
        asunto: 'Propuesta de visita de supervisión in situ para atender el plan de supervisión anual de la SSF sobre medidas de seguridad implementadas en la plataforma tecnológica.',
        entidad: 'Atlántida Titlarizadora, S.A.',
    },
    {
        id: 'corr-2',
        codigo: 'DSFIT-036/2026',
        numero: 36,
        año: 2026,
        blfOtro: '10/02/2026',
        fecha: '2026-02-10',
        codigoNorma: 'NCMC-23',
        nombreNorma: 'Normas Técnicas para la Gestión de la Seguridad de la Información',
        cantidadUnidades: 1,
        clasificacion: 'Gestión de Fondos de Inversión',
        industria: 'Fondos de Inversión',
        tipoInforme: 'Informe de supervisión',
        accionSupervision: 'In Situ',
        descripcionAccion: 'Revisión de gestión de inversión y cumplimiento normativo en fondo de inversión.',
        responsable: 'Ada Hernández',
        asunto: 'Memorándum de planeación de visita de supervisión focalizada en Atlántida Capital, S.A. Gestora de Fondos de Inversión.',
        entidad: 'Atlántida Capital, S.A. Gestora de Fondos de Inversión',
    },
    {
        id: 'corr-3',
        codigo: 'DSFIT-037/2026',
        numero: 37,
        año: 2026,
        blfOtro: '10/02/2026',
        fecha: '2026-02-10',
        codigoNorma: 'NCMC-23',
        nombreNorma: 'Normas Técnicas para la Gestión de la Seguridad de la Información',
        cantidadUnidades: 1,
        clasificacion: 'Operatividad',
        industria: 'Titularizadoras',
        tipoInforme: 'Informe de supervisión',
        accionSupervision: 'In Situ',
        descripcionAccion: 'Visita de supervisión focalizada en accesos y ciberseguridad.',
        responsable: 'Sandra Margarita Castro de Barahona',
        asunto: 'Memorándum de planeación de visita de supervisión focalizada en Hercorp Valores LTDA sobre medidas de Seguridad de la Información y Ciberseguridad.',
        entidad: 'Hercorp Valores, LTDA.',
    },
    {
        id: 'corr-4',
        codigo: 'DSFIT-038/2026',
        numero: 38,
        año: 2026,
        blfOtro: '10/02/2026',
        fecha: '2026-02-10',
        codigoNorma: 'NF-18',
        nombreNorma: 'Normas Técnicas para la Autorización de Fondos de Inversión',
        cantidadUnidades: 1,
        clasificacion: 'Gestión de Fondos de Inversión',
        industria: 'Fondos de Inversión',
        tipoInforme: 'Informe de auditoría',
        accionSupervision: 'Extra Sitio',
        descripcionAccion: 'Análisis técnico sobre resultados de estados financieros y uso de plataformas de fondos.',
        responsable: 'Carmen Azucena de Artiga',
        asunto: 'Opinión técnica sobre resultados de auditoría de los estados financieros y las condiciones de los contratos de administración de fondos de inversión.',
        entidad: 'Hercorp Gestora de Fondos de Inversión, S.A.',
    },
    {
        id: 'corr-5',
        codigo: 'DSFIT-039/2026',
        numero: 39,
        año: 2026,
        blfOtro: '17/02/2026',
        fecha: '2026-02-17',
        codigoNorma: 'LTA',
        nombreNorma: 'Ley de Titularización de Activos',
        cantidadUnidades: 1,
        clasificacion: 'Gobierno Corporativo',
        industria: 'Titularizadoras',
        tipoInforme: 'Informe de JSTV',
        accionSupervision: 'Extra Sitio',
        descripcionAccion: 'Elaboración de informe técnico para Junta General Ordinaria y Extraordinaria de tenedores de valores.',
        responsable: 'Ada Hernández de Barahona',
        asunto: 'Informe sobre el desarrollo de la Junta General Ordinaria y Extraordinaria de tenedores de valores del Fondo de Titularización Inmuebles Hercorp.',
        entidad: 'Hercorp Valores, LTDA.',
    },
    {
        id: 'corr-6',
        codigo: 'DSFIT-040/2026',
        numero: 40,
        año: 2026,
        blfOtro: '17/02/2026',
        fecha: '2026-02-17',
        codigoNorma: 'NF-18',
        nombreNorma: 'Normas Técnicas para la Autorización de Fondos de Inversión',
        cantidadUnidades: 1,
        clasificacion: 'Gestión de Fondos de Inversión',
        industria: 'Fondos de Inversión',
        tipoInforme: 'Informe de auditoría',
        accionSupervision: 'Extra Sitio',
        descripcionAccion: 'Revisión del sistema contable implementado y seguimiento a propuestas de mejora.',
        responsable: 'Lucia Esther Martínez Tejada',
        asunto: 'Seguimiento a revisión de la implementación del sistema contable del Fondo de Inversión Cerrado Inmobiliario Hercorp Commercial Properties.',
        entidad: 'Hercorp Gestora de Fondos de Inversión, S.A.',
    },
];

// ===== Correlativos — Helper de auto-código =====
/**
 * Devuelve el siguiente código correlativo para el año dado.
 * El contador se reinicia cada año: DSFIT-001/AAAA
 * @param {Array} correlativos - lista actual de correlativos
 * @param {number} [año] - año objetivo (default: año actual)
 * @returns {string} código formateado
 */
export function getNextCorrelativo(correlativos, año = new Date().getFullYear()) {
    const targetYear = Number(año);
    const delAño = (correlativos || []).filter(c => Number(c.año) === targetYear);

    // Obtenemos el máximo número actual para ese año
    const numeros = delAño.map(c => Number(c.numero)).filter(num => !isNaN(num));
    const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;

    return {
        codigo: `DSFIT-${String(siguiente).padStart(3, '0')}/${targetYear}`,
        numero: siguiente,
        año: targetYear,
    };
}

// ===== Correlativos Notas — Catálogos =====
export const TIPOS_CORRESPONDENCIA = ['Carta', 'Memo'];

// Extra Normas para notas/cartas
export const NORMAS_NOTAS_EXTRA = [
    { codigo: 'LFI', nombre: 'Ley de Fondos de Inversión' },
    { codigo: 'LSPEF', nombre: 'Ley del Sistema de Pensiones y Fondo de Empleados' },
    { codigo: 'MRP-33', nombre: 'Manual de Riesgos y Procedimientos NRP-33' },
    { codigo: 'NCMC-10', nombre: 'Normas Técnicas para la Remisión y Divulgación de Información de Fondos de Inversión' },
];


// ===== Correlativos Notas — Datos de ejemplo =====
export const MOCK_CORRELATIVOS_NOTAS = [
    {
        id: 'nota-1',
        codigo: 'SAV-DSFIT-M39',
        numero: 39,
        año: 2026,
        fecha: '2026-02-15',
        codigoNorma: 'LFI',
        nombreNorma: 'Ley de Fondos de Inversión',
        clasificacion: 'Gobierno Corporativo',
        cantidadUnidades: 1,
        industria: 'Fondos de Inversión',
        tipoCorrespondencia: 'Carta',
        accionSupervision: 'Extra Sitio',
        descripcionAccion: 'Atención a Junta General de Accionistas, Junta General de Tenedores de Valores y Asambleas de Partícipes.',
        responsable: 'Henryjoé Castellanos Moréjoca',
        entidad: 'Hercorp Gestora de Fondos de Inversión, S.A.',
        asunto: 'Acompañamiento para asistir a Junta General de Accionistas de Hercorp Gestora de Fondos de Inversión.',
        visasInforme: 'NO',
        vinculado: '',
    },
    {
        id: 'nota-2',
        codigo: 'SAV-DSFIT-M40',
        numero: 40,
        año: 2026,
        fecha: '2026-02-18',
        codigoNorma: 'MRP-33',
        nombreNorma: 'Manual de Riesgos y Procedimientos NRP-33',
        clasificacion: 'Operatividad',
        cantidadUnidades: 1,
        industria: 'Fondos de Inversión',
        tipoCorrespondencia: 'Carta',
        accionSupervision: 'In Situ',
        descripcionAccion: 'Visita de supervisión focalizada de ciberseguridad en Gestora de Fondos de Inversión.',
        responsable: 'Ada Carolina Hernández de Barahona',
        entidad: 'Gestora de Fondos de Inversión Benagrícola, S.A.',
        asunto: 'Visita de supervisión focalizada de ciberseguridad en Gestora de Fondos de Inversión Benagrícola, S.A.',
        visasInforme: 'NO',
        vinculado: '',
    },
    {
        id: 'nota-3',
        codigo: 'SAV-DSFIT-M761',
        numero: 761,
        año: 2026,
        fecha: '2026-01-21',
        codigoNorma: 'LSPEF',
        nombreNorma: 'Ley del Sistema de Pensiones y Fondo de Empleados',
        clasificacion: 'Gestión de Fondos de Inversión',
        cantidadUnidades: 1,
        industria: 'Fondos de Inversión',
        tipoCorrespondencia: 'Carta',
        accionSupervision: 'Extra Sitio',
        descripcionAccion: 'Atención a prórroga solicitada por las Entidades.',
        responsable: 'Henryjoé Castellanos Moréjoca',
        entidad: 'Atlántida Capital, S.A. Gestora de Fondos de Inversión',
        asunto: 'Respuesta a solicitud de prórroga de envío de seguimiento a plan de acción.',
        visasInforme: 'NO',
        vinculado: '',
    },
    {
        id: 'nota-4',
        codigo: 'SAV-DSFIT-M765',
        numero: 765,
        año: 2026,
        fecha: '2026-01-21',
        codigoNorma: 'MRP-33',
        nombreNorma: 'Manual de Riesgos y Procedimientos NRP-33',
        clasificacion: 'Operatividad',
        cantidadUnidades: 1,
        industria: 'Fondos de Inversión',
        tipoCorrespondencia: 'Carta',
        accionSupervision: 'In Situ',
        descripcionAccion: 'Visita de supervisión focalizada de ciberseguridad.',
        responsable: 'Enrique Alomarcor García',
        entidad: 'SSB Fondos de Inversión, S.A. Gestora de Fondos de Inversión',
        asunto: 'Visita de supervisión focalizada de ciberseguridad en SSB Fondos de Inversión, S.A.',
        visasInforme: 'NO',
        vinculado: '',
    },
    {
        id: 'nota-5',
        codigo: 'DS-SAV-274',
        numero: 274,
        año: 2026,
        fecha: '2026-01-21',
        codigoNorma: 'NCMC-10',
        nombreNorma: 'Normas Técnicas para la Remisión y Divulgación de Información de Fondos de Inversión',
        clasificacion: 'Gestión de Fondos de Inversión',
        cantidadUnidades: 1,
        industria: 'Fondos de Inversión',
        tipoCorrespondencia: 'Carta',
        accionSupervision: 'Extra Sitio',
        descripcionAccion: 'Remisión y uso de bienes para el envío de información mediante el Sistema de Control de Gestión de Fondos de Inversión y Valorización y Percepción de Información (VAPE).',
        responsable: 'Henryjoé Castellanos Moréjoca',
        entidad: 'SSB Fondos de Inversión, S.A. Gestora de Fondos de Inversión',
        asunto: 'Remisión y uso de bienes para el envío de información mediante el Sistema de Control de Gestión.',
        visasInforme: 'SI',
        vinculado: 'RDZSAV/SAT11 brindar a Valores y Conexiones DSFIT-\nCOndorans/SAY213 Fondos de Inversión Planeación',
    },
    {
        id: 'nota-6',
        codigo: 'DS-SAV-3631',
        numero: 3631,
        año: 2026,
        fecha: '2026-01-21',
        codigoNorma: 'NCMC-10',
        nombreNorma: 'Normas Técnicas para la Remisión y Divulgación de Información de Fondos de Inversión',
        clasificacion: 'Gestión de Fondos de Inversión',
        cantidadUnidades: 1,
        industria: 'Fondos de Inversión',
        tipoCorrespondencia: 'Carta',
        accionSupervision: 'Extra Sitio',
        descripcionAccion: 'Remisión y uso de bienes para el envío de información mediante el Sistema VAPE.',
        responsable: 'Henryjoé Castellanos Moréjoca',
        entidad: 'Atlántida Capital, S.A. Gestora de Fondos de Inversión',
        asunto: 'Remisión y uso de bienes para el envío de información mediante el Sistema de Control de Gestión (VAPE) - Atlántida Capital.',
        visasInforme: 'SI',
        vinculado: 'RDZSAV/SAT11 brindar a Valores y Conexiones DSFIT-\nDAY213 Fondos de Inversión Planeación',
    },
    {
        id: 'nota-7',
        codigo: 'SAV-DSFIT-M722',
        numero: 722,
        año: 2026,
        fecha: '2026-01-29',
        codigoNorma: 'LFI',
        nombreNorma: 'Ley de Fondos de Inversión',
        clasificacion: 'Gobierno Corporativo',
        cantidadUnidades: 1,
        industria: 'Fondos de Inversión',
        tipoCorrespondencia: 'Carta',
        accionSupervision: 'Extra Sitio',
        descripcionAccion: 'Atención a Junta General de Accionistas, Junta General de Tenedores de Valores y Asambleas de Partícipes.',
        responsable: 'Enrique Alomarcor García',
        entidad: 'SSB Gestora de Fondos de Inversión, S.A.',
        asunto: 'Acompañamiento para asistir a Junta de Accionistas de SSB Gestora de Fondos de Inversión, S.A.',
        visasInforme: 'NO',
        vinculado: '',
    },
    {
        id: 'nota-8',
        codigo: 'DS-SAV-1074',
        numero: 1074,
        año: 2026,
        fecha: '2026-01-29',
        codigoNorma: 'LTA',
        nombreNorma: 'Ley de Titularización de Activos',
        clasificacion: 'Operatividad',
        cantidadUnidades: 1,
        industria: 'Titularizadoras',
        tipoCorrespondencia: 'Carta',
        accionSupervision: 'Extra Sitio',
        descripcionAccion: 'Nota para el Fondo de Titularización de Inmuebles Hercorp referente al Reporte de visita de inspección Extra Sitio enviado a FIGORP Titularizadora, S.A.',
        responsable: 'Sandra Magalha Castro de Bianco',
        entidad: 'FIGORP Titularizadora, S.A.',
        asunto: 'Nota de seguimiento al Fondo de Titularización de Inmuebles Hercorp — Reporte de inspección.',
        visasInforme: 'SI',
        vinculado: '',
    },
    {
        id: 'nota-9',
        codigo: 'SAV-DSFIT-M759',
        numero: 759,
        año: 2026,
        fecha: '2026-01-31',
        codigoNorma: 'MRP-33',
        nombreNorma: 'Manual de Riesgos y Procedimientos NRP-33',
        clasificacion: 'Gestión de Fondos de Inversión',
        cantidadUnidades: 1,
        industria: 'Fondos de Inversión',
        tipoCorrespondencia: 'Carta',
        accionSupervision: 'In Situ',
        descripcionAccion: 'Visita de supervisión focalizada de ciberseguridad.',
        responsable: 'Henryjoé Castellanos Moréjoca',
        entidad: 'SSB Fondos de Inversión, S.A. Gestora de Fondos de Inversión',
        asunto: 'Acompañamiento para efectuar visita de supervisión focalizada.',
        visasInforme: 'SI',
        vinculado: '',
    },
    {
        id: 'nota-10',
        codigo: 'SAV-DSFIT-M021',
        numero: 21,
        año: 2026,
        fecha: '2026-02-03',
        codigoNorma: 'NCMC-10',
        nombreNorma: 'Normas Técnicas para la Remisión y Divulgación de Información de Fondos de Inversión',
        clasificacion: 'Operatividad',
        cantidadUnidades: 1,
        industria: 'Fondos de Inversión',
        tipoCorrespondencia: 'Carta',
        accionSupervision: 'Extra Sitio',
        descripcionAccion: 'Instrucciones en la remisión de información mediante el Sistema de Control de Gestión y VAPE.',
        responsable: 'Ada Carolina Hernández de Barahona',
        entidad: 'Hercorp Gestora de Fondos de Inversión, S.A.',
        asunto: 'Instrucciones en la remisión de información mediante el Sistema de Control de Gestión y Valorización y Percepción de Información (VAPE).',
        visasInforme: 'SI',
        vinculado: 'RDZSAV/SAT11 brindar a Valores DSFIT-COndorsans/SAY213  semestre 2025CH',
    },
];

// ===== Correlativos Notas — Helper de auto-código =====
/**
 * Genera el siguiente código SAV-DSFIT-MNNN para el año dado.
 * El contador reinicia cada año.
 */
export function getNextCorrelativoNota(notas, año = new Date().getFullYear()) {
    const targetYear = Number(año);
    const delAño = (notas || []).filter(n =>
        Number(n.año) === targetYear &&
        (n.codigo || '').startsWith('SAV-DSFIT-M')
    );

    const numeros = delAño.map(n => Number(n.numero)).filter(num => !isNaN(num));
    const siguiente = numeros.length > 0 ? Math.max(...numeros) + 1 : 1;

    return {
        codigo: `SAV-DSFIT-M${String(siguiente).padStart(3, '0')}`,
        numero: siguiente,
        año: targetYear,
    };
}
