import { SUBSIDIO_EMPLEO, UMA_MENSUAL } from './constantes2026';
import type { MesCalculo, Periodicidad, ResultadoSubsidio } from './tipos';

/**
 * Subsidio para el empleo — Decreto DOF 01-05-2024, reformado DOF 31-12-2024 y DOF 31-12-2025.
 *
 * - Monto mensual = UMA mensual × 15.02 % (enero 2026: 15.59 % sobre la UMA 2025,
 *   Transitorio Segundo).
 * - Pagos menores a un mes: (monto mensual ÷ 30.4) × días del periodo, sin exceder el
 *   monto mensual (Art. Segundo, párrs. 3 y 4).
 * - Elegibilidad: ingresos mensuales base del ISR ≤ $11,492.66. Para periodos menores
 *   a un mes el límite se prorratea con el mismo divisor 30.4 (criterio del despacho,
 *   consistente con el mecanismo del Decreto).
 * - El subsidio sólo se acredita contra el ISR a cargo; nunca se entrega en efectivo.
 */
export function calcularSubsidio(
  ingresoPeriodo: number,
  dias: number,
  mes: MesCalculo,
  periodicidad: Periodicidad,
): ResultadoSubsidio {
  const umaMensual = UMA_MENSUAL[mes];
  const pctAplicado = SUBSIDIO_EMPLEO.pct[mes];
  const subsidioMensual = umaMensual * pctAplicado;
  const limiteMensual = SUBSIDIO_EMPLEO.limiteMensual;

  const esMensual = periodicidad === 'Mensual';
  const limitePeriodo = esMensual ? limiteMensual : (limiteMensual / SUBSIDIO_EMPLEO.divisor) * dias;
  const montoPeriodo = esMensual
    ? subsidioMensual
    : Math.min((subsidioMensual / SUBSIDIO_EMPLEO.divisor) * dias, subsidioMensual);

  // Comparación a centavos para evitar falsos negativos por punto flotante.
  const aplica = ingresoPeriodo > 0 && redondear2(ingresoPeriodo) <= redondear2(limitePeriodo);

  return {
    aplica,
    subsidioMensual,
    subsidioPeriodo: aplica ? montoPeriodo : 0,
    limiteMensual,
    limitePeriodo,
    pctAplicado,
    umaMensual,
  };
}

function redondear2(x: number): number {
  return Math.round(x * 100) / 100;
}
