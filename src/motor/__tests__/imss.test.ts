import { describe, expect, it } from 'vitest';
import { calcularIMSS, pctCesantiaPatron } from '../imss';

const UMA = 117.31;
const SM = 315.04;

describe('IMSS — quincena, SBC 524.65, UMA 117.31, prima RT 0.5 %', () => {
  const r = calcularIMSS({ sbcAcotado: 524.65, dias: 15, uma: UMA, salarioMinimo: SM, primaRiesgo: 0.005 });

  it('cuota fija EyM 20.40 % UMA × 15 = 358.97 (art. 106-I + Trans. Décimo Noveno)', () => {
    expect(r.cuotaFija.patron).toBeCloseTo(358.97, 2);
    expect(r.cuotaFija.obrero).toBe(0);
  });

  it('excedente 3 UMA: base diaria 172.72 → patrón 28.50 / obrero 10.36 (art. 106-II)', () => {
    expect(r.baseExcedenteDiaria).toBeCloseTo(172.72, 2);
    expect(r.excedente.patron).toBeCloseTo(28.5, 2);
    expect(r.excedente.obrero).toBeCloseTo(10.36, 2);
  });

  it('prestaciones en dinero 0.70 / 0.25 % (art. 107)', () => {
    expect(r.prestacionesDinero.patron).toBeCloseTo(55.09, 2);
    expect(r.prestacionesDinero.obrero).toBeCloseTo(19.67, 2);
  });

  it('gastos médicos pensionados 1.05 / 0.375 % (art. 25)', () => {
    expect(r.gastosMedicosPensionados.patron).toBeCloseTo(82.63, 2);
    expect(r.gastosMedicosPensionados.obrero).toBeCloseTo(29.51, 2);
  });

  it('riesgo de trabajo prima mínima 0.5 % (art. 74)', () => {
    expect(r.riesgoTrabajo.patron).toBeCloseTo(39.35, 2);
    expect(r.riesgoTrabajo.obrero).toBe(0);
  });

  it('invalidez y vida 1.75 / 0.625 % (art. 147)', () => {
    expect(r.invalidezVida.patron).toBeCloseTo(137.72, 2);
    expect(r.invalidezVida.obrero).toBeCloseTo(49.19, 2);
  });

  it('guarderías 1 % y retiro 2 % (arts. 211, 168-I)', () => {
    expect(r.guarderias.patron).toBeCloseTo(78.7, 2);
    expect(r.retiro.patron).toBeCloseTo(157.4, 2);
  });

  it('CEAV 2026: SBC 4.47 UMA → 7.513 % patrón = 591.25; obrero 1.125 % = 88.53', () => {
    expect(r.pctCesantiaPatron).toBe(0.07513);
    expect(r.cesantiaVejez.patron).toBeCloseTo(591.25, 2);
    expect(r.cesantiaVejez.obrero).toBeCloseTo(88.53, 2);
  });

  it('INFONAVIT 5 % sobre SBC topado a 25 UMA = 393.49', () => {
    expect(r.infonavit.patron).toBeCloseTo(393.49, 2);
    expect(r.totalInfonavit).toBeCloseTo(393.49, 2);
  });

  it('totales: patrón 1,529.60 (sin INFONAVIT) / obrero 197.27', () => {
    expect(r.totalImssPatron).toBeCloseTo(1529.6, 2);
    expect(r.totalImssObrero).toBeCloseTo(197.27, 2);
  });

  it('SBC ≤ 3 UMA no genera cuota de excedente', () => {
    const sin = calcularIMSS({ sbcAcotado: 350, dias: 15, uma: UMA, salarioMinimo: SM, primaRiesgo: 0.005 });
    expect(sin.excedente.patron).toBe(0);
    expect(sin.excedente.obrero).toBe(0);
  });
});

describe('CEAV patronal — columna 2026 del Transitorio Segundo (Decreto DOF 16-12-2020)', () => {
  it('SBC igual a 1 SM → 3.150 %', () => {
    expect(pctCesantiaPatron(SM, SM, UMA).pct).toBe(0.0315);
    expect(pctCesantiaPatron(440.87, 440.87, UMA).pct).toBe(0.0315);
  });

  it('SBC 2.71 UMA (1.01 SM zona general) → 6.026 %', () => {
    expect(pctCesantiaPatron(318.19, SM, UMA).pct).toBe(0.06026);
  });

  it('rangos por veces UMA (con SM hipotético de 100 para alcanzar los rangos bajos)', () => {
    expect(pctCesantiaPatron(1.2 * UMA, 100, UMA).pct).toBe(0.03676);
    expect(pctCesantiaPatron(1.5 * UMA, 100, UMA).pct).toBe(0.03676);
    expect(pctCesantiaPatron(1.51 * UMA, 100, UMA).pct).toBe(0.04851);
    expect(pctCesantiaPatron(2.2 * UMA, 100, UMA).pct).toBe(0.05556);
    expect(pctCesantiaPatron(2.8 * UMA, 100, UMA).pct).toBe(0.06026);
    expect(pctCesantiaPatron(3.2 * UMA, 100, UMA).pct).toBe(0.06361);
    expect(pctCesantiaPatron(3.76 * UMA, 100, UMA).pct).toBe(0.06613);
    expect(pctCesantiaPatron(4.5 * UMA, 100, UMA).pct).toBe(0.07513);
    expect(pctCesantiaPatron(25 * UMA, 100, UMA).pct).toBe(0.07513);
  });

  it('ZLFN: SBC 441 (3.76 UMA, arriba del SM 440.87) → 6.613 %', () => {
    expect(pctCesantiaPatron(441, 440.87, UMA).pct).toBe(0.06613);
  });

  it('ya no se usan los porcentajes 2023/2030 del código anterior', () => {
    const pcts = new Set(
      [1.2, 1.8, 2.2, 2.8, 3.2, 3.8, 5].map((v) => pctCesantiaPatron(v * UMA, 100, UMA).pct),
    );
    for (const viejo of [0.03281, 0.04202, 0.06556, 0.07962, 0.09368, 0.10774, 0.11875]) {
      expect(pcts.has(viejo)).toBe(false);
    }
  });
});
