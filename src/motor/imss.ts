import { CEAV_PATRON_1SM, CEAV_PATRON_2026, INFONAVIT, LSS } from './constantes2026';
import type { CuotaRamo, DesgloseIMSS } from './tipos';

export interface EntradaIMSS {
  sbcAcotado: number;
  dias: number;
  uma: number;
  salarioMinimo: number;
  /** Prima de riesgo de trabajo como fracción (0.005 = 0.5 %), ya validada. */
  primaRiesgo: number;
}

/**
 * Porcentaje patronal de Cesantía en edad avanzada y Vejez, columna 2026
 * (art. 168-II-a LSS y Transitorio Segundo del Decreto DOF 16-12-2020).
 * El primer rango aplica cuando el SBC es exactamente 1 salario mínimo; a partir
 * de ahí el rango se determina en veces UMA.
 */
export function pctCesantiaPatron(
  sbc: number,
  salarioMinimo: number,
  uma: number,
): { pct: number; etiqueta: string } {
  if (sbc <= salarioMinimo + 0.005) return CEAV_PATRON_1SM;
  const vecesUMA = sbc / uma;
  for (const rango of CEAV_PATRON_2026) {
    if (rango.hastaUMA === null || vecesUMA <= rango.hastaUMA + 1e-9) {
      return { pct: rango.pct, etiqueta: rango.etiqueta };
    }
  }
  const ultimo = CEAV_PATRON_2026[CEAV_PATRON_2026.length - 1];
  return { pct: ultimo.pct, etiqueta: ultimo.etiqueta };
}

const ramo = (base: number, patron: number, obrero: number): CuotaRamo => ({
  patron: base * patron,
  obrero: base * obrero,
});

/** Cuotas obrero-patronales IMSS y aportación INFONAVIT del periodo. */
export function calcularIMSS(e: EntradaIMSS): DesgloseIMSS {
  const baseSBC = e.sbcAcotado * e.dias;
  const baseUMA = e.uma * e.dias;
  const baseExcedenteDiaria = Math.max(0, e.sbcAcotado - LSS.excedente.umbralUMA * e.uma);
  const baseExcedente = baseExcedenteDiaria * e.dias;

  const ceav = pctCesantiaPatron(e.sbcAcotado, e.salarioMinimo, e.uma);

  const cuotaFija = ramo(baseUMA, LSS.cuotaFijaPatron, 0);
  const excedente = ramo(baseExcedente, LSS.excedente.patron, LSS.excedente.obrero);
  const prestacionesDinero = ramo(baseSBC, LSS.prestacionesDinero.patron, LSS.prestacionesDinero.obrero);
  const gastosMedicosPensionados = ramo(
    baseSBC,
    LSS.gastosMedicosPensionados.patron,
    LSS.gastosMedicosPensionados.obrero,
  );
  const riesgoTrabajo = ramo(baseSBC, e.primaRiesgo, 0);
  const invalidezVida = ramo(baseSBC, LSS.invalidezVida.patron, LSS.invalidezVida.obrero);
  const guarderias = ramo(baseSBC, LSS.guarderias.patron, LSS.guarderias.obrero);
  const retiro = ramo(baseSBC, LSS.retiro.patron, LSS.retiro.obrero);
  const cesantiaVejez = ramo(baseSBC, ceav.pct, LSS.cesantiaVejezObrero);
  const infonavit = ramo(baseSBC, INFONAVIT.pctPatron, 0);

  const ramosImss = [
    cuotaFija,
    excedente,
    prestacionesDinero,
    gastosMedicosPensionados,
    riesgoTrabajo,
    invalidezVida,
    guarderias,
    retiro,
    cesantiaVejez,
  ];
  const totalImssPatron = ramosImss.reduce((s, r) => s + r.patron, 0);
  const totalImssObrero = ramosImss.reduce((s, r) => s + r.obrero, 0);

  return {
    cuotaFija,
    excedente,
    prestacionesDinero,
    gastosMedicosPensionados,
    riesgoTrabajo,
    invalidezVida,
    guarderias,
    retiro,
    cesantiaVejez,
    infonavit,
    pctCesantiaPatron: ceav.pct,
    etiquetaCesantia: ceav.etiqueta,
    primaRiesgoAplicada: e.primaRiesgo,
    baseExcedenteDiaria,
    totalImssPatron,
    totalImssObrero,
    totalInfonavit: infonavit.patron,
  };
}
