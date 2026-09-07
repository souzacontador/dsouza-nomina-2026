import { CONCEPTOS_LFT, DIAS_MES_CALENDARIO, EXENCIONES_93 } from './constantes2026';
import { isrArt174 } from './metodosISR';

/**
 * Aguinaldo, prima vacacional, PTU y prima dominical: parte gravada/exenta (art. 93-XIV
 * LISR) e ISR por el método del art. 174 RLISR. Comentado para auditoría.
 */
export interface EntradaConceptos {
  cuotaDiaria: number;
  /** UMA diaria del mes de cálculo (base de las exenciones del art. 93). */
  uma: number;
  /** Días de aguinaldo pactados (mínimo 15, art. 87 LFT). */
  aguinaldoDias: number;
  /** Días efectivamente trabajados en el año, para el aguinaldo proporcional. */
  diasTrabajadosAnio: number;
  /** Días de vacaciones que dan base a la prima vacacional (según antigüedad, art. 76 LFT). */
  diasVacaciones: number;
  /** Monto de PTU asignado al trabajador (se captura; depende de la utilidad de la empresa). */
  ptuMonto: number;
  /** Domingos laborados en el periodo (prima dominical, 25 % adicional). */
  domingosLaborados: number;
}

export interface ConceptoDetalle {
  monto: number;
  exento: number;
  gravado: number;
}

export interface ResultadoConceptos {
  aguinaldo: ConceptoDetalle;
  primaVacacional: ConceptoDetalle;
  ptu: ConceptoDetalle;
  primaDominical: ConceptoDetalle;
  totalPercepciones: number;
  totalExento: number;
  totalGravado: number;
  sueldoMensualOrdinario: number;
  isr: number;
  tasaArt174: number;
  neto: number;
}

const detalle = (monto: number, exencion: number): ConceptoDetalle => {
  const m = monto > 0 ? monto : 0;
  const exento = Math.min(m, exencion > 0 ? exencion : 0);
  return { monto: m, exento, gravado: m - exento };
};

export function calcularConceptosAnuales(e: EntradaConceptos): ResultadoConceptos {
  const cuota = e.cuotaDiaria > 0 ? e.cuotaDiaria : 0;
  const propAnio = e.diasTrabajadosAnio > 0 ? Math.min(e.diasTrabajadosAnio, 365) / 365 : 1;

  // Aguinaldo (art. 87 LFT): días × cuota × proporción del año. Exención 30 UMA (art. 93-XIV).
  const aguinaldoDias = e.aguinaldoDias > 0 ? e.aguinaldoDias : CONCEPTOS_LFT.aguinaldoDiasMin;
  const aguinaldoMonto = cuota * aguinaldoDias * propAnio;
  const aguinaldo = detalle(aguinaldoMonto, EXENCIONES_93.aguinaldoUMA * e.uma);

  // Prima vacacional (art. 80 LFT): 25 % sobre los días de vacaciones. Exención 15 UMA.
  const primaVacMonto = cuota * (e.diasVacaciones > 0 ? e.diasVacaciones : 0) * CONCEPTOS_LFT.primaVacacionalPct * propAnio;
  const primaVacacional = detalle(primaVacMonto, EXENCIONES_93.primaVacacionalUMA * e.uma);

  // PTU (monto capturado). Exención 15 UMA.
  const ptu = detalle(e.ptuMonto, EXENCIONES_93.ptuUMA * e.uma);

  // Prima dominical (25 % de la cuota por domingo). Exención 1 UMA por domingo.
  const primaDomMonto = cuota * CONCEPTOS_LFT.primaVacacionalPct * (e.domingosLaborados > 0 ? e.domingosLaborados : 0);
  const primaDominical = detalle(primaDomMonto, EXENCIONES_93.primaDominicalUMAporDomingo * e.uma * (e.domingosLaborados > 0 ? e.domingosLaborados : 0));

  const conceptos = [aguinaldo, primaVacacional, ptu, primaDominical];
  const totalPercepciones = conceptos.reduce((s, c) => s + c.monto, 0);
  const totalExento = conceptos.reduce((s, c) => s + c.exento, 0);
  const totalGravado = conceptos.reduce((s, c) => s + c.gravado, 0);

  // ISR por el procedimiento del art. 174 RLISR sobre el total gravado.
  const sueldoMensualOrdinario = cuota * DIAS_MES_CALENDARIO;
  const art174 = isrArt174(totalGravado, sueldoMensualOrdinario);

  return {
    aguinaldo,
    primaVacacional,
    ptu,
    primaDominical,
    totalPercepciones,
    totalExento,
    totalGravado,
    sueldoMensualOrdinario,
    isr: art174.isr,
    tasaArt174: art174.tasa,
    neto: totalPercepciones - art174.isr,
  };
}
