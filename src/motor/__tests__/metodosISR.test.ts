import { describe, expect, it } from 'vitest';
import { aniosExencionSeparacion, isrArt174, isrMensual, isrSeparacion } from '../metodosISR';

describe('isrMensual (tarifa B.V art. 96)', () => {
  it('15,200 → 1,438.66 (bracket 14,644.65–17,533.64)', () => {
    expect(isrMensual(15200)).toBeCloseTo(1438.66, 2);
  });
  it('base 0 → 0', () => {
    expect(isrMensual(0)).toBe(0);
  });
});

describe('isrArt174 (RLISR art. 174)', () => {
  it('gravado dentro del mismo tramo que el sueldo → tasa = % del tramo', () => {
    const r = isrArt174(3980.7, 15200); // SMO 15,200 en tramo 17.92 %
    expect(r.tasa).toBeCloseTo(0.1792, 4);
    expect(r.isr).toBeCloseTo(3980.7 * 0.1792, 2);
    expect(r.mensualizado).toBeCloseTo((3980.7 / 365) * 30.4, 2);
  });
  it('gravado 0 → ISR 0', () => {
    expect(isrArt174(0, 15200).isr).toBe(0);
  });
});

describe('isrSeparacion (art. 95, proxy mensual)', () => {
  it('gravado ≤ SMO → todo ordinario', () => {
    const r = isrSeparacion(10000, 15200);
    expect(r.todoOrdinario).toBe(true);
    expect(r.isr).toBeCloseTo(isrMensual(10000), 6);
  });
  it('gravado > SMO → isrBase + excedente por la tasa del art. 95', () => {
    const smo = 15200;
    const gravado = 61326.3;
    const isrBase = isrMensual(smo);
    const tasa = isrBase / smo;
    const esperado = isrBase + (gravado - smo) * tasa;
    const r = isrSeparacion(gravado, smo);
    expect(r.tasa).toBeCloseTo(tasa, 6);
    expect(r.isr).toBeCloseTo(esperado, 4);
  });
});

describe('aniosExencionSeparacion (fracción > 6 meses = año completo, art. 93-XIII)', () => {
  it.each([
    [3, 3],
    [3.4, 3],
    [3.5, 3],
    [3.6, 4],
    [0.7, 1],
    [0, 0],
  ])('%d años → %d', (input, esperado) => {
    expect(aniosExencionSeparacion(input)).toBe(esperado);
  });
});
