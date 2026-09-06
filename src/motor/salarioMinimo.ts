import { SALARIO_MINIMO } from './constantes2026';
import type { Zona } from './tipos';

/** Tolerancia técnica de un centavo para comparar la cuota diaria con el salario mínimo. */
export const TOLERANCIA_SM = 0.01;

/**
 * Trabajador de salario mínimo: cuota diaria exactamente igual al SM del área
 * geográfica (± 1 centavo). Activa el art. 96 párr. 1 LISR (sin retención de ISR),
 * el art. 36 LSS (cuota obrera a cargo del patrón) y la exención del art. 93-I LISR.
 * Una cuota mayor pierde el tratamiento ("únicamente"); una menor no se reconoce
 * como salario mínimo legal y debe generar advertencia laboral.
 */
export function esTrabajadorSalarioMinimo(cuotaDiaria: number, zona: Zona): boolean {
  return Number.isFinite(cuotaDiaria) && Math.abs(cuotaDiaria - SALARIO_MINIMO[zona]) <= TOLERANCIA_SM;
}

export function esInferiorAlMinimo(cuotaDiaria: number, zona: Zona): boolean {
  return Number.isFinite(cuotaDiaria) && cuotaDiaria > 0 && cuotaDiaria < SALARIO_MINIMO[zona] - TOLERANCIA_SM;
}
