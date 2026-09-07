import { describe, expect, it } from 'vitest';
import { TARIFA_ANUAL } from '../constantes2026';
import { calcularISRAnual } from '../isrAnual';

describe('Tarifa anual = mensual (B.V) × 12', () => {
  it('límites y cuota fija multiplicados por 12; % iguales', () => {
    expect(TARIFA_ANUAL.renglones[1].limInf).toBeCloseTo(844.6 * 12, 2); // 10,135.20
    expect(TARIFA_ANUAL.renglones[1].cuota).toBeCloseTo(16.22 * 12, 2); // 194.64
    expect(TARIFA_ANUAL.renglones[10].pct).toBe(0.35);
  });
});

describe('ISR anual (art. 152 LISR)', () => {
  it('gravable 180,000 → ISR ≈ 16,833.87 (tramo 17.92 %)', () => {
    const r = calcularISRAnual({ ingresoGravableAnual: 180000, isrRetenidoAnual: 15000 });
    // límite inferior del tramo = 14,644.65 × 12 = 175,735.80; cuota 16,069.68
    expect(r.renglon?.limInf).toBeCloseTo(175735.8, 2);
    expect(r.isrAnual).toBeCloseTo(16069.68 + (180000 - 175735.8) * 0.1792, 2);
  });

  it('saldo a cargo cuando el ISR anual supera lo retenido', () => {
    const r = calcularISRAnual({ ingresoGravableAnual: 180000, isrRetenidoAnual: 15000 });
    expect(r.saldo).toBeGreaterThan(0);
    expect(r.aFavor).toBe(false);
  });

  it('saldo a favor cuando lo retenido supera el ISR anual', () => {
    const r = calcularISRAnual({ ingresoGravableAnual: 180000, isrRetenidoAnual: 20000 });
    expect(r.saldo).toBeLessThan(0);
    expect(r.aFavor).toBe(true);
  });

  it('la tarifa anual está marcada como pendiente de cotejo con el DOF', () => {
    expect(calcularISRAnual({ ingresoGravableAnual: 100000, isrRetenidoAnual: 0 }).tarifaVerificada).toBe(false);
  });
});
