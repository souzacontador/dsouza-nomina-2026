import { FACTORES_INTEGRACION, LSS, SALARIO_MINIMO, UMA_DIARIA } from './constantes2026';
import type { MesCalculo, ModoSBC, ResultadoSBC, Zona } from './tipos';

export interface EntradaSBC {
  cuotaDiaria: number;
  modoSBC: ModoSBC;
  factorIdx: number;
  sbcManual: number;
  zona: Zona;
  mes: MesCalculo;
}

/**
 * Salario base de cotización (arts. 27 a 30 LSS).
 * - Modo "Antiguedad": SBC = cuota diaria × factor de integración (LFT 76/80/87).
 * - Modo "Manual": el usuario captura el SBC directamente.
 * En ambos casos se acota al piso (SM del área geográfica, art. 28 LSS) y al tope
 * de 25 UMA (art. 28 LSS + Transitorio Vigésimo Quinto; UMA por desindexación).
 */
export function calcularSBC(e: EntradaSBC): ResultadoSBC {
  const idx = Math.min(Math.max(0, Math.trunc(e.factorIdx || 0)), FACTORES_INTEGRACION.length - 1);
  const factorTabla = FACTORES_INTEGRACION[idx].valor;

  const sbcBruto = e.modoSBC === 'Antiguedad' ? e.cuotaDiaria * factorTabla : e.sbcManual;
  const factorAplicado =
    e.modoSBC === 'Antiguedad' ? factorTabla : e.cuotaDiaria > 0 ? e.sbcManual / e.cuotaDiaria : 0;

  const pisoSM = SALARIO_MINIMO[e.zona];
  const tope25UMA = LSS.topeSBCenUMA * UMA_DIARIA[e.mes];

  let sbcAcotado = sbcBruto;
  let ajustadoAlPiso = false;
  let topado25UMA = false;

  if (!(sbcAcotado > pisoSM)) {
    // Incluye NaN, cero, negativos y valores por debajo del salario mínimo.
    ajustadoAlPiso = sbcAcotado < pisoSM || !Number.isFinite(sbcAcotado);
    sbcAcotado = pisoSM;
  }
  if (sbcAcotado >= tope25UMA) {
    topado25UMA = true;
    sbcAcotado = tope25UMA;
  }

  return { sbcBruto, sbcAcotado, factorAplicado, topado25UMA, ajustadoAlPiso, tope25UMA, pisoSM };
}
