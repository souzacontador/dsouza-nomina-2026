import { describe, expect, it } from 'vitest';
import { calcularSBCVariable } from '../sbcVariable';

const base = { factorIntegracion: 1.0493, diasBimestre: 60, zona: 'General' as const, mes: 'Resto' as const };

describe('SBC variable/mixto (art. 30 LSS)', () => {
  it('mixto: fija 300 × F.I. + variable 12,000/60 = 314.79 + 200 = 514.79', () => {
    const r = calcularSBCVariable({ ...base, cuotaFija: 300, totalVariableBimestre: 12000 });
    expect(r.fijoIntegrado).toBeCloseTo(314.79, 2);
    expect(r.promedioVariable).toBeCloseTo(200, 2);
    expect(r.sbcAcotado).toBeCloseTo(514.79, 2);
    expect(r.esMixto).toBe(true);
  });

  it('puro variable: 30,000/60 = 500', () => {
    const r = calcularSBCVariable({ ...base, cuotaFija: 0, totalVariableBimestre: 30000 });
    expect(r.promedioVariable).toBeCloseTo(500, 2);
    expect(r.sbcAcotado).toBeCloseTo(500, 2);
    expect(r.esMixto).toBe(false);
  });

  it('se ajusta al piso SM cuando el SBC queda por debajo', () => {
    const r = calcularSBCVariable({ ...base, cuotaFija: 0, totalVariableBimestre: 6000 });
    expect(r.sbcBruto).toBeCloseTo(100, 2);
    expect(r.sbcAcotado).toBeCloseTo(315.04, 2);
    expect(r.ajustadoAlPiso).toBe(true);
  });

  it('se topa a 25 UMA feb-dic', () => {
    const r = calcularSBCVariable({ ...base, cuotaFija: 2000, totalVariableBimestre: 120000 });
    expect(r.sbcAcotado).toBeCloseTo(2932.75, 2);
    expect(r.topado25UMA).toBe(true);
  });

  it('días del bimestre distintos de 60', () => {
    const r = calcularSBCVariable({ ...base, cuotaFija: 0, totalVariableBimestre: 30000, diasBimestre: 61 });
    expect(r.promedioVariable).toBeCloseTo(30000 / 61, 2);
  });
});
