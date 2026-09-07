import { DIAS_MES_CALENDARIO, TARIFA_MENSUAL } from './constantes2026';
import { aplicarTarifa } from './isr';

/**
 * Métodos de retención de ISR para conceptos especiales y separación.
 * Comentados para auditoría: cada fórmula cita su fundamento.
 */

/** ISR mensual ordinario sobre una base mensual (art. 96 LISR, tarifa B.V del Anexo 8). */
export function isrMensual(base: number): number {
  return aplicarTarifa(base, TARIFA_MENSUAL).isr;
}

export interface ResultadoArt174 {
  isr: number;
  tasa: number;
  mensualizado: number;
  isrOrdinario: number;
  isrConConcepto: number;
}

/**
 * Retención opcional de gratificación anual (aguinaldo), PTU y primas dominical y
 * vacacional — art. 174 RLISR. Se aplica a la parte GRAVADA (después de exención).
 *
 *   I.   mensualizado   = gravado ÷ 365 × 30.4
 *   II.  isrConConcepto = tarifaMensual( sueldoMensualOrdinario + mensualizado )
 *   III. isrMarginal    = isrConConcepto − tarifaMensual( sueldoMensualOrdinario )
 *   V.   tasa           = isrMarginal ÷ mensualizado
 *   IV.  ISR a retener   = gravado × tasa
 */
export function isrArt174(gravado: number, sueldoMensualOrdinario: number): ResultadoArt174 {
  if (!(gravado > 0)) return { isr: 0, tasa: 0, mensualizado: 0, isrOrdinario: 0, isrConConcepto: 0 };
  const mensualizado = (gravado / 365) * DIAS_MES_CALENDARIO; // I
  const isrConConcepto = isrMensual(sueldoMensualOrdinario + mensualizado); // II
  const isrOrdinario = isrMensual(sueldoMensualOrdinario); // III (base)
  const isrMarginal = Math.max(0, isrConConcepto - isrOrdinario); // III
  const tasa = mensualizado > 0 ? isrMarginal / mensualizado : 0; // V
  return { isr: gravado * tasa, tasa, mensualizado, isrOrdinario, isrConConcepto }; // IV
}

export interface ResultadoSeparacion {
  isr: number;
  tasa: number;
  todoOrdinario: boolean;
}

/**
 * ISR sobre primas de antigüedad, retiro e indemnizaciones por separación — art. 95 LISR.
 * Se aplica a la parte GRAVADA (después de la exención de 90 UMA/año, art. 93-XIII).
 *
 * El art. 95 estricto usa la tarifa anual (art. 152) con los demás ingresos del año.
 * En la retención del finiquito se usa el proxy mensual estándar con la tarifa del
 * art. 96 sobre el último sueldo mensual ordinario (SMO):
 *
 *   Si gravado ≤ SMO  → todo se grava como ingreso ordinario (art. 95-I, último párrafo).
 *   Si gravado > SMO:
 *     I.  isrBase   = tarifaMensual( SMO )
 *     V.  tasa      = isrBase ÷ SMO
 *     II. isrExced  = (gravado − SMO) × tasa
 *     ISR = isrBase + isrExced
 */
export function isrSeparacion(gravado: number, sueldoMensualOrdinario: number): ResultadoSeparacion {
  if (!(gravado > 0)) return { isr: 0, tasa: 0, todoOrdinario: false };
  if (!(sueldoMensualOrdinario > 0) || gravado <= sueldoMensualOrdinario) {
    return { isr: isrMensual(gravado), tasa: 0, todoOrdinario: true };
  }
  const isrBase = isrMensual(sueldoMensualOrdinario); // fracc. I (proxy mensual)
  const tasa = isrBase / sueldoMensualOrdinario; // tasa art. 95
  const isrExcedente = (gravado - sueldoMensualOrdinario) * tasa; // fracc. II
  return { isr: isrBase + isrExcedente, tasa, todoOrdinario: false };
}

/** Años para la exención de separación: fracción de más de 6 meses cuenta como año completo (art. 93-XIII). */
export function aniosExencionSeparacion(anios: number): number {
  if (!(anios > 0)) return 0;
  const enteros = Math.floor(anios);
  return enteros + (anios - enteros > 0.5 ? 1 : 0);
}
