// ===== AuditFlow — Constants & Catalogs =====

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
    { codigo: 'RO', nombre: 'Riesgo Operativo' },
    { codigo: 'RM', nombre: 'Riesgo de Mercado' },
    { codigo: 'RC', nombre: 'Riesgo de Crédito' },
    { codigo: 'RL', nombre: 'Riesgo de Liquidez' },
    { codigo: 'CIBER', nombre: 'Ciberseguridad' },
    { codigo: 'PLD', nombre: 'Prevención de Lavado de Dinero' },
    { codigo: 'GC', nombre: 'Gobierno Corporativo' },
    { codigo: 'CN', nombre: 'Cumplimiento Normativo' },
    { codigo: 'TI', nombre: 'Tecnología de la Información' },
    { codigo: 'OPP', nombre: 'Operaciones y Procesos' },
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
    { codigo: 'LIQP1', nombre: 'Fondo de Inversión Abierto Liquidez de Corto Plazo' },
    { codigo: 'CRECI', nombre: 'Fondo de Inversión Abierto de Crecimiento' },
    { codigo: 'INMO1', nombre: 'Fondo de Inversión Cerrado Inmobiliario No. 1' },
    { codigo: 'INMO2', nombre: 'Fondo de Inversión Cerrado Inmobiliario No. 2' },
    { codigo: 'CRISC', nombre: 'Fondo de Inversión Cerrado de Capital de Riesgo' },
];

// ===== Correlativos — Catálogos =====
export const TIPOS_OPERACION = ['Supervisión', 'Sancionatorio', 'Autorización', 'Registro'];

export const TIPOS_ENTIDAD = [
    'Banco', 'Gestora', 'Leasing', 'Casa de Valores', 'Inmobiliaria', 
    'Titularizadora', 'Bolsa de Valores', 'Sociedad de Seguros', 
    'Fondo de Inversión', 'Conglomerado Financiero'
];

export const CATEGORIAS_ENTIDAD = [
    'Sucursal Central', 'Activos', 'Legal', 'Operaciones', 
    'Proyectos', 'Fondos', 'Seguros', 'Gobierno'
];

export const CLASIFICACIONES_CORR = [
    'Operatividad',
    'Gestión de Fondos de Inversión y Titularización',
    'Gobierno Corporativo',
    'Cumplimiento Normativo',
    'Titularización',
    'Comité Administrador de Fondos',
    'Unidad Reguladora',
];

export const INDUSTRIAS_CORR = [
    'Titularizadoras',
    'Fondos de Inversión y Titularización',
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

// ===== Correlativos Notas — Catálogos =====
export const TIPOS_CORRESPONDENCIA = ['Carta', 'Memo'];

export const NORMAS_NOTAS_EXTRA = [
    { codigo: 'LFI', nombre: 'Ley de Fondos de Inversión' },
    { codigo: 'LSPEF', nombre: 'Ley del Sistema de Pensiones y Fondo de Empleados' },
    { codigo: 'MRP-33', nombre: 'Manual de Riesgos y Procedimientos NRP-33' },
    { codigo: 'NCMC-10', nombre: 'Normas Técnicas para la Remisión y Divulgación de Información de Fondos de Inversión' },
];
