import { describe, expect, it } from 'vitest';
import { calcularSubsidio } from '../subsidio';

describe('Subsidio para el empleo — Decreto DOF 31-12-2025', () => {
  it('enero 2026: 15.59 % × UMA mensual 2025 (3,439.46) = 536.21', () => {
    const r = calcularSubsidio(8000, 30, 'Enero', 'Mensual');
    expect(r.pctAplicado).toBe(0.1559);
    expect(r.umaMensual).toBe(3439.46);
    expect(r.subsidioMensual).toBeCloseTo(536.21, 2);
    expect(r.subsidioPeriodo).toBeCloseTo(536.21, 2);
    expect(r.aplica).toBe(true);
  });

  it('feb-dic 2026: 15.02 % × UMA mensual 3,566.22 = 535.65 (fórmula del Art. Segundo, no el 536.22 del considerando)', () => {
    const r = calcularSubsidio(8000, 30, 'Resto', 'Mensual');
    expect(r.pctAplicado).toBe(0.1502);
    expect(r.subsidioMensual).toBeCloseTo(535.65, 2);
  });

  it('quincenal feb-dic: 535.65 ÷ 30.4 × 15 = 264.30; límite prorrateado 5,670.72', () => {
    const r = calcularSubsidio(5000, 15, 'Resto', 'Quincenal');
    expect(r.subsidioPeriodo).toBeCloseTo(264.3, 2);
    expect(r.limitePeriodo).toBeCloseTo(5670.72, 2);
    expect(r.aplica).toBe(true);
  });

  it('semanal feb-dic: 535.65 ÷ 30.4 × 7 = 123.34', () => {
    const r = calcularSubsidio(2000, 7, 'Resto', 'Semanal');
    expect(r.subsidioPeriodo).toBeCloseTo(123.34, 2);
    expect(r.limitePeriodo).toBeCloseTo(2646.34, 2);
  });

  it('catorcenal feb-dic: 535.65 ÷ 30.4 × 14 = 246.68; límite 5,292.67', () => {
    const r = calcularSubsidio(4000, 14, 'Resto', 'Catorcenal');
    expect(r.subsidioPeriodo).toBeCloseTo(246.68, 2);
    expect(r.limitePeriodo).toBeCloseTo(5292.67, 2);
  });

  it('quincenal enero: 536.21 ÷ 30.4 × 15 = 264.58', () => {
    const r = calcularSubsidio(5000, 15, 'Enero', 'Quincenal');
    expect(r.subsidioPeriodo).toBeCloseTo(264.58, 2);
  });

  it('elegibilidad quincenal: 5,670.72 aplica; 5,700 no aplica', () => {
    expect(calcularSubsidio(5670.72, 15, 'Resto', 'Quincenal').aplica).toBe(true);
    const fuera = calcularSubsidio(5700, 15, 'Resto', 'Quincenal');
    expect(fuera.aplica).toBe(false);
    expect(fuera.subsidioPeriodo).toBe(0);
  });

  it('elegibilidad mensual: 11,492.66 aplica; 11,492.67 no aplica', () => {
    expect(calcularSubsidio(11492.66, 30, 'Resto', 'Mensual').aplica).toBe(true);
    expect(calcularSubsidio(11492.67, 30, 'Resto', 'Mensual').aplica).toBe(false);
  });

  it('el subsidio del periodo nunca excede el monto mensual', () => {
    const r = calcularSubsidio(1000, 15, 'Resto', 'Quincenal');
    expect(r.subsidioPeriodo).toBeLessThanOrEqual(r.subsidioMensual);
  });

  it('ingreso cero no genera subsidio', () => {
    expect(calcularSubsidio(0, 15, 'Resto', 'Quincenal').aplica).toBe(false);
  });
});
