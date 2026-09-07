import { describe, expect, it } from 'vitest';
import { TARIFA_ANUAL } from '../constantes2026';
import { calcularISRAnual } from '../isrAnual';

describe('Tarifa anual 2026 (Anexo 8 rubro C.II, DOF 28-12-2025 — valores oficiales)', () => {
  it('límites y cuota fija de la tabla publicada (no coinciden con B.V × 12)', () => {
    expect(TARIFA_ANUAL.renglones[0].limSup).toBe(10135.11);
    expect(TARIFA_ANUAL.renglones[1].limInf).toBe(10135.12);
    expect(TARIFA_ANUAL.renglones[1].cuota).toBe(194.59);
    expect(TARIFA_ANUAL.renglones[10].limInf).toBe(5107703.93);
    expect(TARIFA_ANUAL.renglones[10].pct).toBe(0.35);
  });
});

describe('ISR anual (art. 152 LISR)', () => {
  it('gravable 180,000 → ISR (tramo 17.92 %, límite 175,735.67, cuota 16,069.64)', () => {
    const r = calcularISRAnual({ ingresoGravableAnual: 180000, isrRetenidoAnual: 15000 });
    expect(r.renglon?.limInf).toBe(175735.67);
    expect(r.isrAnual).toBeCloseTo(16069.64 + (180000 - 175735.67) * 0.1792, 2);
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

  it('la tarifa anual está verificada contra el DOF', () => {
    expect(calcularISRAnual({ ingresoGravableAnual: 100000, isrRetenidoAnual: 0 }).tarifaVerificada).toBe(true);
  });
});
