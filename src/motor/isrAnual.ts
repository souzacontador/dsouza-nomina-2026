import { TARIFA_ANUAL, TARIFA_ANUAL_VERIFICADA } from './constantes2026';
import { aplicarTarifa } from './isr';
import type { RenglonTarifa } from './tipos';

/**
 * ISR anual por sueldos y salarios — art. 152 LISR.
 * Se aplica la tarifa anual a los ingresos gravados del ejercicio y se compara contra
 * las retenciones efectuadas para obtener el saldo a favor o a cargo.
 *
 * El subsidio para el empleo entregado durante el año ya redujo las retenciones
 * mensuales; no se vuelve a acreditar en el cálculo anual (Decreto DOF 31-12-2025).
 *
 * ⚠ La tarifa anual 2026 se deriva de la mensual (B.V) × 12: el rubro C.II del Anexo 8
 * se perdió en la conversión del corpus. Pendiente de cotejo contra el DOF.
 */
export interface EntradaISRAnual {
  /** Total de ingresos gravados por salarios en el ejercicio. */
  ingresoGravableAnual: number;
  /** ISR efectivamente retenido durante el ejercicio. */
  isrRetenidoAnual: number;
}

export interface ResultadoISRAnual {
  ingresoGravableAnual: number;
  renglon: RenglonTarifa | null;
  excedente: number;
  impuestoMarginal: number;
  cuotaFija: number;
  isrAnual: number;
  isrRetenidoAnual: number;
  /** Positivo = a cargo (falta pagar); negativo = a favor (procede devolución/compensación). */
  saldo: number;
  aFavor: boolean;
  tarifaClave: string;
  tarifaVerificada: boolean;
}

export function calcularISRAnual(e: EntradaISRAnual): ResultadoISRAnual {
  const base = e.ingresoGravableAnual > 0 ? e.ingresoGravableAnual : 0;
  const ap = aplicarTarifa(base, TARIFA_ANUAL);
  const isrAnual = ap.isr;
  const retenido = e.isrRetenidoAnual > 0 ? e.isrRetenidoAnual : 0;
  const saldo = isrAnual - retenido;
  return {
    ingresoGravableAnual: base,
    renglon: ap.renglon,
    excedente: ap.excedente,
    impuestoMarginal: ap.impuestoMarginal,
    cuotaFija: ap.renglon?.cuota ?? 0,
    isrAnual,
    isrRetenidoAnual: retenido,
    saldo,
    aFavor: saldo < 0,
    tarifaClave: TARIFA_ANUAL.clave,
    tarifaVerificada: TARIFA_ANUAL_VERIFICADA,
  };
}
