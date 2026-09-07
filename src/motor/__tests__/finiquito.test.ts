import { describe, expect, it } from 'vitest';
import { calcularFiniquito } from '../finiquito';
import { isrMensual } from '../metodosISR';

const UMA = 117.31;
const base = { cuotaDiaria: 500, uma: UMA, zona: 'General' as const, anios: 3, diasTrabajadosAnio: 365, diasVacacionesPendientes: 6 };

describe('Liquidación por despido injustificado (3 años, cuota 500)', () => {
  const r = calcularFiniquito({ ...base, motivo: 'despido' });

  it('partes proporcionales: aguinaldo 7,500 / vacaciones 3,000 / prima vacacional 750', () => {
    expect(r.aguinaldo.monto).toBeCloseTo(7500, 2);
    expect(r.aguinaldo.exento).toBeCloseTo(3519.3, 2);
    expect(r.vacaciones.monto).toBeCloseTo(3000, 2);
    expect(r.vacaciones.gravado).toBeCloseTo(3000, 2);
    expect(r.primaVacacional.monto).toBeCloseTo(750, 2);
    expect(r.primaVacacional.gravado).toBe(0);
  });

  it('indemnización: 3 meses 45,000 + 20 días/año 30,000 + prima antigüedad 18,000', () => {
    expect(r.aplicaIndemnizacion).toBe(true);
    expect(r.tresMeses.monto).toBeCloseTo(45000, 2);
    expect(r.veinteDiasPorAnio.monto).toBeCloseTo(30000, 2);
    expect(r.aplicaPrimaAntiguedad).toBe(true);
    expect(r.primaAntiguedad.monto).toBeCloseTo(18000, 2); // tope 2 SM = 630.08 > 500 → cuota 500
  });

  it('exención de separación 90 UMA × 3 años = 31,673.70; gravado separación 61,326.30', () => {
    expect(r.aniosExencion).toBe(3);
    // exención repartida entre los 3 componentes
    const exSep = r.tresMeses.exento + r.veinteDiasPorAnio.exento + r.primaAntiguedad.exento;
    expect(exSep).toBeCloseTo(31673.7, 1);
    expect(r.gravadoSeparacion).toBeCloseTo(61326.3, 1);
  });

  it('ISR de separación por art. 95 (proxy mensual)', () => {
    const smo = 15200;
    const tasa = isrMensual(smo) / smo;
    const esperado = isrMensual(smo) + (61326.3 - smo) * tasa;
    expect(r.isrSeparacion).toBeCloseTo(esperado, 0);
  });

  it('totales: percepciones 104,250; neto ≈ 97,195', () => {
    expect(r.totalPercepciones).toBeCloseTo(104250, 2);
    expect(r.neto).toBeCloseTo(r.totalPercepciones - r.isrTotal, 6);
    expect(r.neto).toBeGreaterThan(96000);
    expect(r.neto).toBeLessThan(98000);
  });
});

describe('Renuncia', () => {
  it('sin 15 años: no hay indemnización ni prima de antigüedad', () => {
    const r = calcularFiniquito({ ...base, anios: 3, motivo: 'renuncia' });
    expect(r.aplicaIndemnizacion).toBe(false);
    expect(r.tresMeses.monto).toBe(0);
    expect(r.veinteDiasPorAnio.monto).toBe(0);
    expect(r.aplicaPrimaAntiguedad).toBe(false);
    expect(r.primaAntiguedad.monto).toBe(0);
    // Solo partes proporcionales
    expect(r.totalPercepciones).toBeCloseTo(7500 + 3000 + 750, 2);
  });

  it('con 16 años: prima de antigüedad sí aplica, sin indemnización', () => {
    const r = calcularFiniquito({ ...base, anios: 16, motivo: 'renuncia' });
    expect(r.aplicaIndemnizacion).toBe(false);
    expect(r.aplicaPrimaAntiguedad).toBe(true);
    expect(r.primaAntiguedad.monto).toBeCloseTo(500 * 12 * 16, 2);
  });
});

describe('Tope de la prima de antigüedad a 2 SM (art. 486)', () => {
  it('cuota 1,000 → salario tope 630.08 (2 × 315.04)', () => {
    const r = calcularFiniquito({ ...base, cuotaDiaria: 1000, anios: 5, motivo: 'despido' });
    expect(r.primaAntiguedad.monto).toBeCloseTo(630.08 * 12 * 5, 2);
  });
});
