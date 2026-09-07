import { LSS, SALARIO_MINIMO, UMA_DIARIA } from './constantes2026';
import type { MesCalculo, Zona } from './tipos';

/**
 * Salario base de cotización con elementos variables o mixtos — art. 30 LSS.
 *
 *   I.   Elementos fijos y retribuciones periódicas de cuantía conocida → se integran
 *        con el factor de integración (SBC fijo = cuota fija × F.I.).
 *   II.  Elementos variables (no conocidos de antemano) → suma de los ingresos de los
 *        dos meses inmediatos anteriores ÷ número de días de salario devengado en ese
 *        período (bimestre ≈ 60 días).
 *   III. Mixto → SBC fijo integrado + promedio de variables.
 *
 * El resultado se acota al piso (SM del área, art. 28 LSS) y al tope de 25 UMA.
 */
export interface EntradaSBCVariable {
  /** Parte fija de la cuota diaria (0 si el salario es puramente variable). */
  cuotaFija: number;
  /** Factor de integración aplicable a la parte fija (art. 30-I). */
  factorIntegracion: number;
  /** Suma de percepciones variables de los dos meses inmediatos anteriores. */
  totalVariableBimestre: number;
  /** Días de salario devengado en ese bimestre (art. 30-II; por defecto 60). */
  diasBimestre: number;
  zona: Zona;
  mes: MesCalculo;
}

export interface ResultadoSBCVariable {
  fijoIntegrado: number;
  promedioVariable: number;
  sbcBruto: number;
  sbcAcotado: number;
  topado25UMA: boolean;
  ajustadoAlPiso: boolean;
  pisoSM: number;
  tope25UMA: number;
  esMixto: boolean;
}

export function calcularSBCVariable(e: EntradaSBCVariable): ResultadoSBCVariable {
  const fijoIntegrado = (e.cuotaFija > 0 ? e.cuotaFija : 0) * (e.factorIntegracion > 0 ? e.factorIntegracion : 1);
  const dias = e.diasBimestre > 0 ? e.diasBimestre : 60;
  const promedioVariable = e.totalVariableBimestre > 0 ? e.totalVariableBimestre / dias : 0;
  const sbcBruto = fijoIntegrado + promedioVariable;

  const pisoSM = SALARIO_MINIMO[e.zona];
  const tope25UMA = LSS.topeSBCenUMA * UMA_DIARIA[e.mes];

  let sbcAcotado = sbcBruto;
  let ajustadoAlPiso = false;
  let topado25UMA = false;
  if (!(sbcAcotado > pisoSM)) {
    ajustadoAlPiso = sbcAcotado < pisoSM;
    sbcAcotado = pisoSM;
  }
  if (sbcAcotado >= tope25UMA) {
    topado25UMA = true;
    sbcAcotado = tope25UMA;
  }

  return {
    fijoIntegrado,
    promedioVariable,
    sbcBruto,
    sbcAcotado,
    topado25UMA,
    ajustadoAlPiso,
    pisoSM,
    tope25UMA,
    esMixto: fijoIntegrado > 0 && promedioVariable > 0,
  };
}
