import { describe, expect, it } from 'vitest';
import { calcularConceptosAnuales } from '../conceptosAnuales';

const UMA = 117.31;

describe('Conceptos anuales (art. 93-XIV LISR, art. 174 RLISR)', () => {
  const r = calcularConceptosAnuales({
    cuotaDiaria: 500,
    uma: UMA,
    aguinaldoDias: 15,
    diasTrabajadosAnio: 365,
    diasVacaciones: 12,
    ptuMonto: 0,
    domingosLaborados: 0,
  });

  it('aguinaldo 15 días = 7,500; exención 30 UMA = 3,519.30; gravado 3,980.70', () => {
    expect(r.aguinaldo.monto).toBeCloseTo(7500, 2);
    expect(r.aguinaldo.exento).toBeCloseTo(3519.3, 2);
    expect(r.aguinaldo.gravado).toBeCloseTo(3980.7, 2);
  });

  it('prima vacacional 25 % × 12 días = 1,500; exención 15 UMA cubre todo → gravado 0', () => {
    expect(r.primaVacacional.monto).toBeCloseTo(1500, 2);
    expect(r.primaVacacional.gravado).toBe(0);
  });

  it('ISR por art. 174 sobre el total gravado (mismo tramo 17.92 %) ≈ 713.34', () => {
    expect(r.totalGravado).toBeCloseTo(3980.7, 2);
    expect(r.tasaArt174).toBeCloseTo(0.1792, 4);
    expect(r.isr).toBeCloseTo(3980.7 * 0.1792, 2);
    expect(r.neto).toBeCloseTo(9000 - 3980.7 * 0.1792, 2);
  });

  it('aguinaldo proporcional a medio año', () => {
    const m = calcularConceptosAnuales({ cuotaDiaria: 500, uma: UMA, aguinaldoDias: 15, diasTrabajadosAnio: 182, diasVacaciones: 0, ptuMonto: 0, domingosLaborados: 0 });
    expect(m.aguinaldo.monto).toBeCloseTo(500 * 15 * (182 / 365), 2);
  });

  it('PTU con exención 15 UMA', () => {
    const m = calcularConceptosAnuales({ cuotaDiaria: 500, uma: UMA, aguinaldoDias: 0, diasTrabajadosAnio: 365, diasVacaciones: 0, ptuMonto: 5000, domingosLaborados: 0 });
    expect(m.ptu.exento).toBeCloseTo(15 * UMA, 2);
    expect(m.ptu.gravado).toBeCloseTo(5000 - 15 * UMA, 2);
  });
});
