import { PERIODOS, TARIFA_15_DIAS, TARIFA_7_DIAS, TARIFA_DIARIA, TARIFA_MENSUAL } from './constantes2026';
import { esTrabajadorSalarioMinimo } from './salarioMinimo';
import type { Periodicidad, RenglonTarifa, ResultadoISR, Tarifa, Zona } from './tipos';

export interface AplicacionTarifa {
  renglon: RenglonTarifa | null;
  excedente: number;
  impuestoMarginal: number;
  isr: number;
}

/** Aplica una tarifa de límite inferior / cuota fija / % sobre excedente (art. 96 LISR). */
export function aplicarTarifa(base: number, tarifa: Tarifa): AplicacionTarifa {
  if (!(base > 0)) return { renglon: null, excedente: 0, impuestoMarginal: 0, isr: 0 };
  let renglon: RenglonTarifa | null = null;
  for (let i = tarifa.renglones.length - 1; i >= 0; i--) {
    if (base >= tarifa.renglones[i].limInf) {
      renglon = tarifa.renglones[i];
      break;
    }
  }
  if (!renglon) renglon = tarifa.renglones[0];
  const excedente = base - renglon.limInf;
  const impuestoMarginal = excedente * renglon.pct;
  return { renglon, excedente, impuestoMarginal, isr: impuestoMarginal + renglon.cuota };
}

/**
 * Tarifa del Anexo 8 RMF 2026 que corresponde a cada periodicidad.
 * Catorcenal no tiene tabla propia: se usa la tarifa calculada en días (B.I)
 * conforme al art. 175 RLISR (salario diario → impuesto diario × días).
 */
export function tarifaPara(periodicidad: Periodicidad): { tarifa: Tarifa; multiplicador: number } {
  switch (periodicidad) {
    case 'Semanal':
      return { tarifa: TARIFA_7_DIAS, multiplicador: 1 };
    case 'Quincenal':
      return { tarifa: TARIFA_15_DIAS, multiplicador: 1 };
    case 'Mensual':
      return { tarifa: TARIFA_MENSUAL, multiplicador: 1 };
    case 'Catorcenal':
      return { tarifa: TARIFA_DIARIA, multiplicador: PERIODOS.Catorcenal.dias };
  }
}

/**
 * ISR antes de subsidio para el periodo.
 * Art. 96 LISR, párr. 1: no se efectúa retención a quien en el mes perciba
 * únicamente un salario mínimo general del área geográfica (cuota diaria = SM).
 * `baseGravable` es el ingreso del periodo ya depurado de exenciones (art. 93 LISR).
 * Si el trabajador de salario mínimo percibe ingresos gravados adicionales al
 * salario, pierde la protección ("únicamente") y se retiene sobre la base gravable.
 */
export function calcularISR(
  baseGravable: number,
  periodicidad: Periodicidad,
  cuotaDiaria: number,
  zona: Zona,
  dias: number = PERIODOS[periodicidad].dias,
): ResultadoISR {
  const { tarifa, multiplicador } = tarifaPara(periodicidad);
  const soloSalarioMinimo =
    esTrabajadorSalarioMinimo(cuotaDiaria, zona) && baseGravable <= cuotaDiaria * dias + 0.005;
  const exentoArt96 = soloSalarioMinimo;

  const baseAplicada = multiplicador > 1 ? baseGravable / multiplicador : baseGravable;
  const ap = aplicarTarifa(baseAplicada, tarifa);
  const isrCalculado = ap.isr * multiplicador;

  return {
    isrAntesSubsidio: exentoArt96 ? 0 : isrCalculado,
    exentoArt96,
    tarifaClave: tarifa.clave,
    baseAplicada,
    renglon: ap.renglon,
    excedente: ap.excedente,
    impuestoMarginal: ap.impuestoMarginal,
    multiplicador,
  };
}
