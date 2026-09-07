/**
 * Constantes fiscales y de seguridad social — ejercicio 2026.
 * Cada bloque indica su fuente normativa y el archivo del corpus del despacho
 * donde fue verificado. Ver también docs/FUENTES_NORMATIVAS.md.
 *
 * Para actualizar a 2027: sustituir UMA, SM, tarifas del Anexo 8, parámetros del
 * subsidio y la columna del año en CEAV_PATRON; el resto de tasas de la LSS son fijas.
 */
import type { MesCalculo, Periodicidad, Tarifa, TipoJornada, Zona } from './tipos';

export const VERSION_NORMATIVA = 'Ejercicio 2026 · corte normativo 06-09-2026';

// ─── UMA (INEGI, DOF 09-01-2026; enero rige la UMA 2025, DOF 10-01-2025) ─────
export const UMA_DIARIA: Record<MesCalculo, number> = { Enero: 113.14, Resto: 117.31 };
export const UMA_MENSUAL: Record<MesCalculo, number> = { Enero: 3439.46, Resto: 3566.22 };
export const FUENTE_UMA =
  'Ley para Determinar el Valor de la UMA, art. 5; INEGI DOF 09-01-2026 (117.31, vigente 01-feb-2026 a 31-ene-2027) y DOF 10-01-2025 (113.14, vigente en enero 2026).';

// ─── Salarios mínimos 2026 (CONASAMI, DOF 19-12-2025) ─────────────────────────
export const SALARIO_MINIMO: Record<Zona, number> = { General: 315.04, Frontera: 440.87 };
export const FUENTE_SM = 'Resolución del H. Consejo de Representantes de la CONASAMI, DOF 19-12-2025.';

export const ETIQUETA_ZONA: Record<Zona, string> = {
  General: 'SMG RESTO PAÍS',
  Frontera: 'SMG ZLFN',
};

export const ETIQUETA_MES: Record<MesCalculo, string> = {
  Enero: 'Enero 2026 (UMA 2025 · subsidio 15.59 %)',
  Resto: 'Febrero a Diciembre 2026',
};

// ─── Periodicidades ───────────────────────────────────────────────────────────
export const PERIODOS: Record<Periodicidad, { dias: number; label: string }> = {
  Semanal: { dias: 7, label: 'Semanal (7 días)' },
  Catorcenal: { dias: 14, label: 'Catorcenal (14 días)' },
  Quincenal: { dias: 15, label: 'Quincenal (15 días)' },
  Mensual: { dias: 30, label: 'Mensual (30 días)' },
};

/** Divisor que usa el Decreto de subsidio para prorratear el mes (Art. Segundo, párr. 3). */
export const DIVISOR_MENSUAL_DECRETO = 30.4;

// ─── Tarifas ISR — Anexo 8 RMF 2026 (DOF 28-12-2025), rubro B ─────────────────
export const FUENTE_TARIFAS =
  'Anexo 8 RMF 2026, DOF 28-12-2025, rubro B (arts. 96 LISR, 175 y 176 RLISR, regla 3.12.2 RMF).';

const t = (limInf: number, limSup: number | null, cuota: number, pct: number) => ({
  limInf,
  limSup,
  cuota,
  pct,
});

/** B.I — calculada en días (RLISR art. 175). Se usa para la periodicidad catorcenal. */
export const TARIFA_DIARIA: Tarifa = {
  clave: 'Anexo 8 RMF 2026, B.I (tarifa calculada en días) × 14',
  dias: 1,
  renglones: [
    t(0.01, 27.78, 0.0, 0.0192),
    t(27.79, 235.81, 0.53, 0.064),
    t(235.82, 414.41, 13.85, 0.1088),
    t(414.42, 481.73, 33.28, 0.16),
    t(481.74, 576.76, 44.05, 0.1792),
    t(576.77, 1163.25, 61.08, 0.2136),
    t(1163.26, 1833.44, 186.35, 0.2352),
    t(1833.45, 3500.35, 343.98, 0.3),
    t(3500.36, 4667.13, 844.05, 0.32),
    t(4667.14, 14001.38, 1217.42, 0.34),
    t(14001.39, null, 4391.07, 0.35),
  ],
};

/** B.II — pagos por periodo de 7 días. */
export const TARIFA_7_DIAS: Tarifa = {
  clave: 'Anexo 8 RMF 2026, B.II (7 días)',
  dias: 7,
  renglones: [
    t(0.01, 194.46, 0.0, 0.0192),
    t(194.47, 1650.67, 3.71, 0.064),
    t(1650.68, 2900.87, 96.95, 0.1088),
    t(2900.88, 3372.11, 232.96, 0.16),
    t(3372.12, 4037.32, 308.35, 0.1792),
    t(4037.33, 8142.75, 427.56, 0.2136),
    t(8142.76, 12834.08, 1304.45, 0.2352),
    t(12834.09, 24502.45, 2407.86, 0.3),
    t(24502.46, 32669.91, 5908.35, 0.32),
    t(32669.92, 98009.66, 8521.94, 0.34),
    t(98009.67, null, 30737.49, 0.35),
  ],
};

/** B.IV — pagos por periodo de 15 días. */
export const TARIFA_15_DIAS: Tarifa = {
  clave: 'Anexo 8 RMF 2026, B.IV (15 días)',
  dias: 15,
  renglones: [
    t(0.01, 416.7, 0.0, 0.0192),
    t(416.71, 3537.15, 7.95, 0.064),
    t(3537.16, 6216.15, 207.75, 0.1088),
    t(6216.16, 7225.95, 499.2, 0.16),
    t(7225.96, 8651.4, 660.75, 0.1792),
    t(8651.41, 17448.75, 916.2, 0.2136),
    t(17448.76, 27501.6, 2795.25, 0.2352),
    t(27501.61, 52505.25, 5159.7, 0.3),
    t(52505.26, 70006.95, 12660.75, 0.32),
    t(70006.96, 210020.7, 18261.3, 0.34),
    t(210020.71, null, 65866.05, 0.35),
  ],
};

/** B.V — tarifa mensual (art. 96 LISR). */
export const TARIFA_MENSUAL: Tarifa = {
  clave: 'Anexo 8 RMF 2026, B.V (mensual, art. 96 LISR)',
  dias: 30,
  renglones: [
    t(0.01, 844.59, 0.0, 0.0192),
    t(844.6, 7168.51, 16.22, 0.064),
    t(7168.52, 12598.02, 420.95, 0.1088),
    t(12598.03, 14644.64, 1011.68, 0.16),
    t(14644.65, 17533.64, 1339.14, 0.1792),
    t(17533.65, 35362.83, 1856.84, 0.2136),
    t(35362.84, 55736.68, 5665.16, 0.2352),
    t(55736.69, 106410.5, 10457.09, 0.3),
    t(106410.51, 141880.66, 25659.23, 0.32),
    t(141880.67, 425641.99, 37009.69, 0.34),
    t(425642.0, null, 133488.54, 0.35),
  ],
};

// ─── Subsidio para el empleo (Decreto DOF 01-05-2024, reformado DOF 31-12-2024 y DOF 31-12-2025) ──
export const SUBSIDIO_EMPLEO = {
  /** Art. Segundo, párr. 1: ingresos mensuales base del ISR que no excedan de esta cantidad. */
  limiteMensual: 11492.66,
  /** Art. Segundo (15.02 %) y Transitorio Segundo (15.59 % sólo enero 2026). */
  pct: { Enero: 0.1559, Resto: 0.1502 } as Record<MesCalculo, number>,
  divisor: DIVISOR_MENSUAL_DECRETO,
  fuente:
    'Decreto que otorga el subsidio para el empleo (DOF 01-05-2024), modificado por Decretos DOF 31-12-2024 y DOF 31-12-2025, Artículo Segundo y Transitorio Segundo.',
};

// ─── Ley del Seguro Social (última reforma DOF 15-01-2026) ────────────────────
export const LSS = {
  /** Art. 106-I + Transitorio Décimo Noveno (DOF 21-12-1995): 13.9 % + 0.65 × 10 = 20.40 % de UMA. */
  cuotaFijaPatron: 0.204,
  /** Art. 106-II + Transitorio Décimo Noveno: 6 % − 0.49 × 10 = 1.10 %; 2 % − 0.16 × 10 = 0.40 %. */
  excedente: { patron: 0.011, obrero: 0.004, umbralUMA: 3 },
  /** Art. 107: 1 % del SBC; 70 % patrón, 25 % obrero (5 % Estado). */
  prestacionesDinero: { patron: 0.007, obrero: 0.0025 },
  /** Art. 25 párr. 2: 1.5 % del SBC; 1.05 % patrón, 0.375 % obrero. */
  gastosMedicosPensionados: { patron: 0.0105, obrero: 0.00375 },
  /** Art. 147: 1.75 % patrón, 0.625 % obrero. */
  invalidezVida: { patron: 0.0175, obrero: 0.00625 },
  /** Arts. 211 y 212: 1 % patrón. */
  guarderias: { patron: 0.01, obrero: 0 },
  /** Art. 168-I: 2 % patrón. */
  retiro: { patron: 0.02, obrero: 0 },
  /** Art. 168-II-b: 1.125 % obrero. */
  cesantiaVejezObrero: 0.01125,
  /** Art. 74: prima mínima 0.5 %, máxima 15 %. Art. 73: prima media clase I 0.54355 %. */
  riesgoTrabajo: { primaMinimaPct: 0.5, primaMaximaPct: 15, primaMediaClaseIPct: 0.54355 },
  /** Art. 28 LSS + Transitorio Vigésimo Quinto (DOF 21-12-1995): tope 25 veces SM DF → UMA por desindexación. */
  topeSBCenUMA: 25,
  fuente: 'Ley del Seguro Social, última reforma DOF 15-01-2026.',
};

/**
 * Cuota patronal de Cesantía en edad avanzada y Vejez — columna 2026 de la tabla
 * gradual del Transitorio Segundo del Decreto DOF 16-12-2020 (art. 168-II-a LSS).
 * El límite superior de cada rango se expresa en veces UMA; el primer rango
 * (CEAV_PATRON_1SM) es exactamente 1 salario mínimo.
 */
export const CEAV_PATRON_1SM = { pct: 0.0315, etiqueta: '1.00 SM' };
export const CEAV_PATRON_2026: { hastaUMA: number | null; pct: number; etiqueta: string }[] = [
  { hastaUMA: 1.5, pct: 0.03676, etiqueta: '1.01 SM a 1.50 UMA' },
  { hastaUMA: 2.0, pct: 0.04851, etiqueta: '1.51 a 2.00 UMA' },
  { hastaUMA: 2.5, pct: 0.05556, etiqueta: '2.01 a 2.50 UMA' },
  { hastaUMA: 3.0, pct: 0.06026, etiqueta: '2.51 a 3.00 UMA' },
  { hastaUMA: 3.5, pct: 0.06361, etiqueta: '3.01 a 3.50 UMA' },
  { hastaUMA: 4.0, pct: 0.06613, etiqueta: '3.51 a 4.00 UMA' },
  { hastaUMA: null, pct: 0.07513, etiqueta: '4.01 UMA en adelante' },
];
export const FUENTE_CEAV =
  'LSS art. 168-II-a y Transitorio Segundo del Decreto DOF 16-12-2020 (tabla gradual 2023-2030, columna 2026).';

// ─── INFONAVIT ────────────────────────────────────────────────────────────────
export const INFONAVIT = {
  pctPatron: 0.05,
  fuente:
    'Ley del INFONAVIT art. 29-II (5 % sobre el salario; base y límite superior conforme a la LSS: 25 UMA).',
};

// ─── Factores de integración (LFT arts. 76, 80 y 87; reforma DOF 27-12-2022) ──
/** FI = 1 + 15/365 (aguinaldo) + (días de vacaciones × 25 %)/365 (prima vacacional). */
export const FACTORES_INTEGRACION: { label: string; valor: number; vac: number }[] = [
  { label: '1 año (nuevo ingreso)', valor: 1.0493, vac: 12 },
  { label: '2 años', valor: 1.0507, vac: 14 },
  { label: '3 años', valor: 1.0521, vac: 16 },
  { label: '4 años', valor: 1.0534, vac: 18 },
  { label: '5 años', valor: 1.0548, vac: 20 },
  { label: '6 a 10 años', valor: 1.0562, vac: 22 },
  { label: '11 a 15 años', valor: 1.0575, vac: 24 },
  { label: '16 a 20 años', valor: 1.0589, vac: 26 },
  { label: '21 a 25 años', valor: 1.0603, vac: 28 },
  { label: '26 a 30 años', valor: 1.0616, vac: 30 },
  { label: '31 a 35 años', valor: 1.063, vac: 32 },
];
export const FUENTE_FI =
  'LFT arts. 76 (vacaciones, reforma DOF 27-12-2022), 80 (prima 25 %) y 87 (aguinaldo 15 días).';

// ─── LFT 2026 — jornada y tiempo extraordinario (reforma DOF 01-05-2026, ref. 52) ──
export const LFT_2026 = {
  /** Art. 61: horas de la jornada diaria por tipo (para el valor de la hora ordinaria). */
  horasJornada: { Diurna: 8, Mixta: 7.5, Nocturna: 7 } as Record<TipoJornada, number>,
  /** Transitorio Segundo del Decreto DOF 01-05-2026: 48 h/semana en 2026 (40 h en 2030). */
  jornadaSemanalMax: 48,
  /** Art. 66 + Transitorio Cuarto: máximo 9 h extra por semana en 2026, pagadas al 100 % más (doble). */
  horasExtraMaxSemana: 9,
  factorHoraDoble: 2,
  /** Art. 68: hasta 4 h adicionales por semana, pagadas al 200 % más (triple). */
  horasArt68MaxSemana: 4,
  factorHoraTriple: 3,
  /** Art. 73: día de descanso trabajado sin sustitución → salario doble adicional al del descanso. */
  factorDescansoTrabajado: 2,
  /** Art. 69: un día de descanso por cada seis de trabajo. */
  diasDescansoPorSemana: 1,
  fuente:
    'LFT arts. 59, 61, 66, 68, 69 y 73 (reforma DOF 01-05-2026, ref. 52) y Transitorios Segundo y Cuarto del Decreto (jornada 48 h y 9 h extra máximas por semana en 2026).',
};
export const ETIQUETA_JORNADA: Record<TipoJornada, string> = {
  Diurna: 'Diurna (8 h)',
  Mixta: 'Mixta (7.5 h)',
  Nocturna: 'Nocturna (7 h)',
};

// ─── LISR art. 93-I — exención de tiempo extra y descanso trabajado ────────────
export const LISR_93_I = {
  /** Trabajadores de salario mínimo: 100 % exento dentro de los límites de la LFT. */
  pctExentoSalarioMinimo: 1,
  /** Demás trabajadores: 50 % exento dentro de los límites de la LFT... */
  pctExentoDemas: 0.5,
  /** ...sin exceder 5 veces el SM del área geográfica por semana → 5 UMA (desindexación, criterio del despacho). */
  topeUMAsPorSemana: 5,
  fuente:
    'LISR art. 93, fracciones I y II (exención de tiempo extraordinario y servicios en días de descanso; tope de 5 veces por semana leído en UMA por la desindexación del salario mínimo, CPEUM Transitorio DOF 27-01-2016).',
};

// ─── Tarifa ANUAL 2026 (art. 152 LISR) ────────────────────────────────────────
/**
 * La tarifa anual del art. 152 se construye multiplicando límites y cuota fija de la
 * tarifa mensual (art. 96, rubro B.V) por 12, conservando los por cientos. El rubro
 * C.II del Anexo 8 (tabla anual 2026) se perdió en la conversión del corpus; se deriva
 * de B.V × 12 y queda PENDIENTE de cotejo contra el DOF 28-12-2025.
 */
export const TARIFA_ANUAL: Tarifa = {
  clave: 'Art. 152 LISR — tarifa anual 2026 (derivada de B.V × 12; rubro C.II Anexo 8, pendiente de cotejo DOF)',
  dias: 365,
  renglones: TARIFA_MENSUAL.renglones.map((r) => ({
    limInf: +(r.limInf * 12).toFixed(2),
    limSup: r.limSup === null ? null : +(r.limSup * 12).toFixed(2),
    cuota: +(r.cuota * 12).toFixed(2),
    pct: r.pct,
  })),
};
export const TARIFA_ANUAL_VERIFICADA = false;

/** Sueldo mensual ordinario = cuota diaria × 30.4 (mes de calendario, art. 174-I RLISR). */
export const DIAS_MES_CALENDARIO = 30.4;

// ─── Exenciones del art. 93 LISR (leídas en UMA por desindexación) ────────────
export const EXENCIONES_93 = {
  /** XIV: gratificación anual (aguinaldo), hasta 30 días de SM → 30 UMA. */
  aguinaldoUMA: 30,
  /** XIV: prima vacacional, hasta 15 días → 15 UMA. */
  primaVacacionalUMA: 15,
  /** XIV: PTU, hasta 15 días → 15 UMA. */
  ptuUMA: 15,
  /** XIV: prima dominical, 1 día por cada domingo laborado → 1 UMA/domingo. */
  primaDominicalUMAporDomingo: 1,
  /** XIII: primas de antigüedad, retiro e indemnizaciones por separación, 90 UMA por año de servicio. */
  separacionUMAporAnio: 90,
  fuente:
    'LISR art. 93, fracciones XIII y XIV (exenciones de aguinaldo 30, prima vacacional 15, PTU 15, prima dominical 1 por domingo y separación 90 por año; expresadas en UMA por la desindexación del salario mínimo).',
};

// ─── Conceptos y separación — LFT ─────────────────────────────────────────────
export const CONCEPTOS_LFT = {
  /** Art. 87: aguinaldo mínimo 15 días de salario. */
  aguinaldoDiasMin: 15,
  /** Art. 80: prima vacacional mínima 25 % sobre los días de vacaciones. */
  primaVacacionalPct: 0.25,
  fuente: 'LFT arts. 80 (prima vacacional 25 %) y 87 (aguinaldo 15 días).',
};

export const SEPARACION_LFT = {
  /** Art. 48 / 50-III: indemnización constitucional de 3 meses (90 días de salario). */
  indemnizacion3MesesDias: 90,
  /** Art. 50-II: 20 días de salario por cada año de servicios (relación por tiempo indeterminado). */
  veinteDiasPorAnio: 20,
  /** Art. 162: prima de antigüedad 12 días de salario por año... */
  primaAntiguedadDiasPorAnio: 12,
  /** ...con salario topado a 2 veces el salario mínimo del área (arts. 486 y 485 LFT). */
  primaAntiguedadTopeSM: 2,
  /** Art. 162-III: la prima de antigüedad por retiro voluntario exige al menos 15 años de servicio. */
  primaAntiguedadAniosMinRenuncia: 15,
  fuente:
    'LFT arts. 48 y 50 (indemnización 3 meses + 20 días/año), 162 (prima de antigüedad 12 días/año) y 486 (salario tope 2 SM).',
};

// ─── Método de retención de conceptos especiales y separación — LISR/RLISR ────
export const METODO_ISR = {
  fuenteArt174: 'RLISR art. 174 (retención opcional de gratificación anual, PTU, primas dominical y vacacional).',
  fuenteArt95: 'LISR art. 95 (impuesto sobre primas de antigüedad, retiro e indemnizaciones por separación).',
};

export const FUENTES = [
  FUENTE_UMA,
  FUENTE_SM,
  FUENTE_TARIFAS,
  SUBSIDIO_EMPLEO.fuente,
  LSS.fuente,
  FUENTE_CEAV,
  INFONAVIT.fuente,
  FUENTE_FI,
  LFT_2026.fuente,
  LISR_93_I.fuente,
  EXENCIONES_93.fuente,
  CONCEPTOS_LFT.fuente,
  SEPARACION_LFT.fuente,
  METODO_ISR.fuenteArt174,
  METODO_ISR.fuenteArt95,
  TARIFA_ANUAL.clave,
];
