import { CONCEPTOS_LFT, DIAS_MES_CALENDARIO, EXENCIONES_93, SALARIO_MINIMO, SEPARACION_LFT } from './constantes2026';
import { aniosExencionSeparacion, isrArt174, isrSeparacion } from './metodosISR';
import type { Zona } from './tipos';

/**
 * Finiquito y liquidación — LFT (arts. 48, 50, 76, 80, 87, 162, 486) y su ISR
 * (LISR arts. 93-XIII/XIV, 95; RLISR art. 174). Comentado para auditoría.
 *
 * - Finiquito (todos los motivos): partes proporcionales de aguinaldo, vacaciones
 *   no gozadas y prima vacacional. ISR por el método del art. 174 RLISR.
 * - Liquidación (despido injustificado): 3 meses (art. 48/50-III) + 20 días por año
 *   (art. 50-II). ISR de separación por el art. 95 (proxy mensual del art. 96).
 * - Prima de antigüedad (art. 162): 12 días/año con salario topado a 2 SM (art. 486);
 *   se paga en despido, en separación justificada y en renuncia con ≥15 años.
 * - Exención de separación: 90 UMA por año de servicio (art. 93-XIII); fracción de
 *   más de 6 meses = año completo.
 *
 * No se incluyen salarios vencidos ni intereses (art. 48), propios de un litigio, ni
 * las cuotas IMSS del finiquito (se determinan en el SUA del periodo de baja).
 */
export type MotivoSeparacion = 'renuncia' | 'despido' | 'mutuo';

export interface EntradaFiniquito {
  cuotaDiaria: number;
  uma: number;
  zona: Zona;
  motivo: MotivoSeparacion;
  /** Años de servicio (admite fracción; p. ej. 3.5). */
  anios: number;
  /** Días trabajados en el último año, para el aguinaldo proporcional. */
  diasTrabajadosAnio: number;
  /** Días de vacaciones no gozadas pendientes de pago. */
  diasVacacionesPendientes: number;
}

export interface Componente {
  monto: number;
  exento: number;
  gravado: number;
}

export interface ResultadoFiniquito {
  // Partes proporcionales (finiquito)
  aguinaldo: Componente;
  vacaciones: Componente;
  primaVacacional: Componente;
  // Indemnización (liquidación)
  tresMeses: Componente;
  veinteDiasPorAnio: Componente;
  primaAntiguedad: Componente;
  aplicaPrimaAntiguedad: boolean;
  aplicaIndemnizacion: boolean;
  // Bases de ISR
  sueldoMensualOrdinario: number;
  aniosExencion: number;
  gravadoOrdinario: number;
  gravadoSeparacion: number;
  isrOrdinario: number;
  isrSeparacion: number;
  tasaSeparacion: number;
  // Totales
  totalPercepciones: number;
  totalExento: number;
  totalGravado: number;
  isrTotal: number;
  neto: number;
}

const comp = (monto: number, exencion: number): Componente => {
  const m = monto > 0 ? monto : 0;
  const exento = Math.min(m, exencion > 0 ? exencion : 0);
  return { monto: m, exento, gravado: m - exento };
};

export function calcularFiniquito(e: EntradaFiniquito): ResultadoFiniquito {
  const cuota = e.cuotaDiaria > 0 ? e.cuotaDiaria : 0;
  const anios = e.anios > 0 ? e.anios : 0;
  const propAnio = e.diasTrabajadosAnio > 0 ? Math.min(e.diasTrabajadosAnio, 365) / 365 : 0;
  const sueldoMensualOrdinario = cuota * DIAS_MES_CALENDARIO;
  const despido = e.motivo === 'despido';

  // ── Partes proporcionales (todos los motivos) ────────────────────────────
  // Aguinaldo proporcional (art. 87 LFT), exención 30 UMA (art. 93-XIV).
  const aguinaldo = comp(cuota * CONCEPTOS_LFT.aguinaldoDiasMin * propAnio, EXENCIONES_93.aguinaldoUMA * e.uma);
  // Vacaciones no gozadas: salario ordinario, gravan al 100 % (la exención es de la prima).
  const vacaciones = comp(cuota * (e.diasVacacionesPendientes > 0 ? e.diasVacacionesPendientes : 0), 0);
  // Prima vacacional 25 % sobre las vacaciones pendientes (art. 80), exención 15 UMA.
  const primaVacacional = comp(
    cuota * (e.diasVacacionesPendientes > 0 ? e.diasVacacionesPendientes : 0) * CONCEPTOS_LFT.primaVacacionalPct,
    EXENCIONES_93.primaVacacionalUMA * e.uma,
  );

  // ── Indemnización por despido injustificado (art. 48/50) ─────────────────
  const aplicaIndemnizacion = despido;
  const tresMeses = comp(aplicaIndemnizacion ? cuota * SEPARACION_LFT.indemnizacion3MesesDias : 0, 0);
  const veinteDiasPorAnio = comp(aplicaIndemnizacion ? cuota * SEPARACION_LFT.veinteDiasPorAnio * anios : 0, 0);

  // ── Prima de antigüedad (art. 162): despido siempre; renuncia sólo con ≥15 años ──
  const aplicaPrimaAntiguedad = despido || (e.motivo === 'renuncia' && anios >= SEPARACION_LFT.primaAntiguedadAniosMinRenuncia) || e.motivo === 'mutuo';
  const salarioTope = Math.min(cuota, SEPARACION_LFT.primaAntiguedadTopeSM * SALARIO_MINIMO[e.zona]);
  const primaAntiguedad = comp(
    aplicaPrimaAntiguedad ? salarioTope * SEPARACION_LFT.primaAntiguedadDiasPorAnio * anios : 0,
    0,
  );

  // ── ISR ───────────────────────────────────────────────────────────────────
  // Ordinario (partes proporcionales) → art. 174 RLISR sobre su total gravado.
  const gravadoOrdinario = aguinaldo.gravado + vacaciones.gravado + primaVacacional.gravado;
  const art174 = isrArt174(gravadoOrdinario, sueldoMensualOrdinario);

  // Separación (indemnización + prima de antigüedad) → exención 90 UMA/año, art. 95.
  const aniosExencion = aniosExencionSeparacion(anios);
  const totalSeparacion = tresMeses.monto + veinteDiasPorAnio.monto + primaAntiguedad.monto;
  const exencionSeparacion = Math.min(totalSeparacion, EXENCIONES_93.separacionUMAporAnio * e.uma * aniosExencion);
  const gravadoSeparacion = totalSeparacion - exencionSeparacion;
  const sep = isrSeparacion(gravadoSeparacion, sueldoMensualOrdinario);

  // Repartir la exención de separación en sus componentes (para el desglose).
  const repartir = (montoComp: number) => {
    if (totalSeparacion <= 0) return { monto: montoComp, exento: 0, gravado: montoComp };
    const exento = exencionSeparacion * (montoComp / totalSeparacion);
    return { monto: montoComp, exento, gravado: montoComp - exento };
  };
  const tresMesesFinal = repartir(tresMeses.monto);
  const veinteFinal = repartir(veinteDiasPorAnio.monto);
  const primaAntigFinal = repartir(primaAntiguedad.monto);

  const componentes = [aguinaldo, vacaciones, primaVacacional, tresMesesFinal, veinteFinal, primaAntigFinal];
  const totalPercepciones = componentes.reduce((s, c) => s + c.monto, 0);
  const totalExento = componentes.reduce((s, c) => s + c.exento, 0);
  const totalGravado = componentes.reduce((s, c) => s + c.gravado, 0);
  const isrTotal = art174.isr + sep.isr;

  return {
    aguinaldo,
    vacaciones,
    primaVacacional,
    tresMeses: tresMesesFinal,
    veinteDiasPorAnio: veinteFinal,
    primaAntiguedad: primaAntigFinal,
    aplicaPrimaAntiguedad,
    aplicaIndemnizacion,
    sueldoMensualOrdinario,
    aniosExencion,
    gravadoOrdinario,
    gravadoSeparacion,
    isrOrdinario: art174.isr,
    isrSeparacion: sep.isr,
    tasaSeparacion: sep.tasa,
    totalPercepciones,
    totalExento,
    totalGravado,
    isrTotal,
    neto: totalPercepciones - isrTotal,
  };
}
