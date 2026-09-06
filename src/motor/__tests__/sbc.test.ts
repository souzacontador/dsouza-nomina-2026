import { describe, expect, it } from 'vitest';
import { calcularSBC } from '../sbc';

const base = { modoSBC: 'Antiguedad' as const, factorIdx: 0, sbcManual: 0, zona: 'General' as const, mes: 'Resto' as const };

describe('SBC — factor de integración, piso SM y tope 25 UMA (arts. 27-30 LSS)', () => {
  it('cuota 500 × FI 1.0493 = 524.65', () => {
    const r = calcularSBC({ ...base, cuotaDiaria: 500 });
    expect(r.sbcBruto).toBeCloseTo(524.65, 2);
    expect(r.sbcAcotado).toBeCloseTo(524.65, 2);
    expect(r.factorAplicado).toBe(1.0493);
    expect(r.topado25UMA).toBe(false);
    expect(r.ajustadoAlPiso).toBe(false);
  });

  it('cuota 3,000 se topa a 25 UMA feb-dic (2,932.75)', () => {
    const r = calcularSBC({ ...base, cuotaDiaria: 3000 });
    expect(r.sbcBruto).toBeCloseTo(3147.9, 2);
    expect(r.sbcAcotado).toBeCloseTo(2932.75, 2);
    expect(r.topado25UMA).toBe(true);
  });

  it('tope 25 UMA en enero usa UMA 2025 (2,828.50)', () => {
    const r = calcularSBC({ ...base, cuotaDiaria: 3000, mes: 'Enero' });
    expect(r.sbcAcotado).toBeCloseTo(2828.5, 2);
  });

  it('cuota 300 en zona general se ajusta al piso 315.04', () => {
    const r = calcularSBC({ ...base, cuotaDiaria: 300 });
    expect(r.sbcBruto).toBeCloseTo(314.79, 2);
    expect(r.sbcAcotado).toBeCloseTo(315.04, 2);
    expect(r.ajustadoAlPiso).toBe(true);
  });

  it('cuota 300 en ZLFN se ajusta al piso 440.87', () => {
    const r = calcularSBC({ ...base, cuotaDiaria: 300, zona: 'Frontera' });
    expect(r.sbcAcotado).toBeCloseTo(440.87, 2);
    expect(r.ajustadoAlPiso).toBe(true);
  });

  it('SBC manual 200 se ajusta al piso SM y reporta el factor implícito', () => {
    const r = calcularSBC({ ...base, cuotaDiaria: 190, modoSBC: 'Manual', sbcManual: 200 });
    expect(r.sbcAcotado).toBeCloseTo(315.04, 2);
    expect(r.factorAplicado).toBeCloseTo(200 / 190, 6);
  });

  it('factores de integración por antigüedad (LFT 76/80/87)', () => {
    const esperados = [1.0493, 1.0507, 1.0521, 1.0534, 1.0548, 1.0562, 1.0575, 1.0589, 1.0603, 1.0616, 1.063];
    esperados.forEach((fi, idx) => {
      expect(calcularSBC({ ...base, cuotaDiaria: 1000, factorIdx: idx }).factorAplicado).toBe(fi);
    });
  });

  it('índice de factor fuera de rango se acota', () => {
    expect(calcularSBC({ ...base, cuotaDiaria: 1000, factorIdx: 99 }).factorAplicado).toBe(1.063);
    expect(calcularSBC({ ...base, cuotaDiaria: 1000, factorIdx: -3 }).factorAplicado).toBe(1.0493);
  });
});
