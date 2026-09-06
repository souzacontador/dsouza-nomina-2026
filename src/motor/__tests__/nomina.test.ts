import { describe, expect, it } from 'vitest';
import { calcularNomina } from '../nomina';
import type { EntradaNomina } from '../tipos';

const base: EntradaNomina = {
  cuotaDiaria: 500,
  periodicidad: 'Quincenal',
  zona: 'General',
  mes: 'Resto',
  modoSBC: 'Antiguedad',
  factorIdx: 0,
  sbcManual: 0,
  primaRiesgoPct: 0.5,
  jornada: 'Diurna',
  semanas: [],
};

describe('Nómina integrada — caso 500 diarios, quincenal, zona general, feb-dic 2026', () => {
  const r = calcularNomina(base);

  it('bruto 7,500; ISR 709.86; sin subsidio (ingreso > 5,670.72)', () => {
    expect(r.dias).toBe(15);
    expect(r.bruto).toBeCloseTo(7500, 2);
    expect(r.isr.isrAntesSubsidio).toBeCloseTo(709.86, 2);
    expect(r.subsidio.aplica).toBe(false);
    expect(r.subsidioAcreditado).toBe(0);
    expect(r.isrRetenido).toBeCloseTo(709.86, 2);
  });

  it('IMSS obrero 197.27; neto 6,592.87', () => {
    expect(r.imss.totalImssObrero).toBeCloseTo(197.27, 2);
    expect(r.totalDeducciones).toBeCloseTo(907.13, 2);
    expect(r.neto).toBeCloseTo(6592.87, 2);
  });

  it('costo social patrón 1,923.09 (IMSS 1,529.60 + INFONAVIT 393.49); costo empresa 9,423.09', () => {
    expect(r.costoSocialPatron).toBeCloseTo(1923.09, 2);
    expect(r.costoTotalEmpresa).toBeCloseTo(9423.09, 2);
  });

  it('CEAV patrón 591.25 (7.513 %), no 934.53 (11.875 % del código anterior)', () => {
    expect(r.imss.cesantiaVejez.patron).toBeCloseTo(591.25, 2);
  });

  it('sin avisos para una entrada válida', () => {
    expect(r.avisos).toHaveLength(0);
  });
});

describe('Regla transitoria de enero 2026 vs febrero-diciembre (cuota 350, quincenal)', () => {
  const enero = calcularNomina({ ...base, cuotaDiaria: 350, mes: 'Enero' });
  const resto = calcularNomina({ ...base, cuotaDiaria: 350, mes: 'Resto' });

  it('ISR quincenal antes de subsidio 394.11 en ambos meses (misma tarifa B.IV)', () => {
    expect(enero.isr.isrAntesSubsidio).toBeCloseTo(394.11, 2);
    expect(resto.isr.isrAntesSubsidio).toBeCloseTo(394.11, 2);
  });

  it('enero: subsidio 264.58 (15.59 % × 3,439.46 ÷ 30.4 × 15) → ISR retenido 129.53', () => {
    expect(enero.subsidio.aplica).toBe(true);
    expect(enero.subsidio.subsidioPeriodo).toBeCloseTo(264.58, 2);
    expect(enero.subsidioAcreditado).toBeCloseTo(264.58, 2);
    expect(enero.isrRetenido).toBeCloseTo(129.53, 2);
    expect(enero.uma).toBe(113.14);
    expect(enero.sbc.tope25UMA).toBeCloseTo(2828.5, 2);
  });

  it('feb-dic: subsidio 264.30 (15.02 % × 3,566.22 ÷ 30.4 × 15) → ISR retenido 129.81', () => {
    expect(resto.subsidio.subsidioPeriodo).toBeCloseTo(264.3, 2);
    expect(resto.isrRetenido).toBeCloseTo(129.81, 2);
    expect(resto.uma).toBe(117.31);
  });

  it('la cuota fija EyM cambia con la UMA del mes', () => {
    expect(enero.imss.cuotaFija.patron).toBeCloseTo(113.14 * 15 * 0.204, 2);
    expect(resto.imss.cuotaFija.patron).toBeCloseTo(117.31 * 15 * 0.204, 2);
  });
});

describe('Subsidio mayor que el ISR: el subsidio acreditado se limita al ISR y nada se paga en efectivo', () => {
  it('cuota 320 quincenal general', () => {
    const r = calcularNomina({ ...base, cuotaDiaria: 320 });
    // ISR B.IV sobre 4,800: (4,800 − 3,537.16) × 10.88 % + 207.75 = 345.15
    expect(r.isr.isrAntesSubsidio).toBeCloseTo(345.15, 2);
    expect(r.subsidio.subsidioPeriodo).toBeCloseTo(264.3, 2);
    expect(r.isrRetenido).toBeCloseTo(80.85, 2);
    expect(r.subsidioAcreditado).toBeCloseTo(264.3, 2);
  });

  it('cuota 316 mensual general: ISR 621.18 − subsidio 535.65 = 85.53 retenido', () => {
    const r = calcularNomina({ ...base, cuotaDiaria: 316, periodicidad: 'Mensual' });
    // 9,480: (9,480 − 7,168.52) × 10.88 % + 420.95 = 672.44
    expect(r.isr.isrAntesSubsidio).toBeCloseTo(672.44, 2);
    expect(r.isrRetenido).toBeCloseTo(136.79, 2);
    expect(r.subsidioAcreditado).toBeCloseTo(535.65, 2);
  });
});

describe('Salario mínimo y zonas', () => {
  it('SM general 315.04 quincenal: exento art. 96, subsidio no acreditable, SBC con FI, cuota obrera absorbida (art. 36 LSS)', () => {
    const r = calcularNomina({ ...base, cuotaDiaria: 315.04 });
    expect(r.esSalarioMinimo).toBe(true);
    expect(r.isr.exentoArt96).toBe(true);
    expect(r.isrRetenido).toBe(0);
    expect(r.subsidioAcreditado).toBe(0);
    expect(r.sbc.sbcAcotado).toBeCloseTo(315.04 * 1.0493, 2);
    // Art. 36 LSS
    expect(r.imssObreroRetenido).toBe(0);
    expect(r.cuotaObreraAbsorbida).toBeCloseTo(r.imss.totalImssObrero, 9);
    expect(r.cuotaObreraAbsorbida).toBeGreaterThan(0);
    expect(r.totalDeducciones).toBe(0);
    expect(r.neto).toBeCloseTo(r.bruto, 9);
    expect(r.costoSocialPatron).toBeCloseTo(r.imss.totalImssPatron + r.imss.totalInfonavit + r.cuotaObreraAbsorbida, 9);
    // CEAV: SBC 330.57 = 2.82 UMA → 6.026 %, no 3.150 %
    expect(r.imss.pctCesantiaPatron).toBe(0.06026);
    // Leyendas ISR e IMSS
    expect(r.leyendas.some((l) => l.ambito === 'ISR' && l.fundamento.includes('Art. 96'))).toBe(true);
    expect(r.leyendas.some((l) => l.ambito === 'IMSS' && l.fundamento.includes('Art. 36'))).toBe(true);
  });

  it('SM ZLFN 440.87 con SBC manual igual al SM: CEAV 3.150 % y art. 36', () => {
    const r = calcularNomina({ ...base, cuotaDiaria: 440.87, zona: 'Frontera', modoSBC: 'Manual', sbcManual: 440.87 });
    expect(r.esSalarioMinimo).toBe(true);
    expect(r.imss.pctCesantiaPatron).toBe(0.0315);
    expect(r.imssObreroRetenido).toBe(0);
  });

  it('cuota 315.06 (2 centavos arriba) NO es salario mínimo; 315.05 sí (tolerancia 1 centavo)', () => {
    expect(calcularNomina({ ...base, cuotaDiaria: 315.06 }).esSalarioMinimo).toBe(false);
    expect(calcularNomina({ ...base, cuotaDiaria: 315.05 }).esSalarioMinimo).toBe(true);
  });

  it('cuota 314 (inferior al SM): no es SM, aviso de incumplimiento, sí retiene ISR e IMSS obrero', () => {
    const r = calcularNomina({ ...base, cuotaDiaria: 314 });
    expect(r.esSalarioMinimo).toBe(false);
    expect(r.avisos.some((a) => a.nivel === 'error' && a.mensaje.includes('inferior al salario mínimo'))).toBe(true);
    // 4,710: (4,710 − 3,537.16) × 10.88 % + 207.75 = 335.35; subsidio 264.30 → 71.06
    expect(r.isr.isrAntesSubsidio).toBeCloseTo(335.35, 2);
    expect(r.isrRetenido).toBeCloseTo(71.06, 2);
    expect(r.imssObreroRetenido).toBeGreaterThan(0);
    expect(r.cuotaObreraAbsorbida).toBe(0);
  });

  it('SM con tiempo extra dentro de límites: sigue exento art. 96 y todo el extra es exento (93-I)', () => {
    const r = calcularNomina({ ...base, cuotaDiaria: 315.04, semanas: [{ horasExtra: 9, diasDescansoTrabajados: 1 }] });
    expect(r.extras.gravado).toBe(0);
    expect(r.baseGravable).toBeCloseTo(r.bruto, 9);
    expect(r.isr.exentoArt96).toBe(true);
    expect(r.isrRetenido).toBe(0);
    expect(r.neto).toBeCloseTo(r.bruto + r.extras.total, 9);
    expect(r.leyendas.some((l) => l.ambito === 'LFT' && l.titulo.includes('100 %'))).toBe(true);
  });

  it('SM con horas del art. 68: pierde art. 96 y retiene sobre la base gravable', () => {
    const r = calcularNomina({ ...base, cuotaDiaria: 315.04, semanas: [{ horasExtra: 11, diasDescansoTrabajados: 0 }] });
    expect(r.extras.gravado).toBeGreaterThan(0);
    expect(r.isr.exentoArt96).toBe(false);
    expect(r.baseGravable).toBeCloseTo(r.bruto + r.extras.gravado, 9);
    expect(r.isr.isrAntesSubsidio).toBeGreaterThan(0);
    expect(r.avisos.some((a) => a.mensaje.includes('pierde la protección'))).toBe(true);
    // Art. 36 LSS se mantiene: depende de la cuota diaria
    expect(r.imssObreroRetenido).toBe(0);
  });

  it('demás trabajadores con extras: base gravable = sueldo + gravado; neto suma el total de extras', () => {
    const r = calcularNomina({ ...base, cuotaDiaria: 400, semanas: [{ horasExtra: 6, diasDescansoTrabajados: 0 }] });
    expect(r.extras.total).toBeCloseTo(600, 2);
    expect(r.extras.exento).toBeCloseTo(300, 2);
    expect(r.baseGravable).toBeCloseTo(6000 + 300, 2);
    expect(r.totalPercepciones).toBeCloseTo(6600, 2);
    expect(r.neto).toBeCloseTo(6600 - r.isrRetenido - r.imssObreroRetenido, 6);
    expect(r.costoTotalEmpresa).toBeCloseTo(6600 + r.costoSocialPatron, 6);
  });

  it('semanas se normalizan al número de semanas del periodo', () => {
    const r = calcularNomina({ ...base, semanas: [{ horasExtra: 2, diasDescansoTrabajados: 0 }] });
    expect(r.entrada.semanas).toHaveLength(3);
    expect(r.entrada.semanas[1]).toEqual({ horasExtra: 0, diasDescansoTrabajados: 0 });
  });

  it('ZLFN con cuota 300: SBC al piso 440.87 y aviso', () => {
    const r = calcularNomina({ ...base, cuotaDiaria: 300, zona: 'Frontera' });
    expect(r.salarioMinimo).toBe(440.87);
    expect(r.sbc.sbcAcotado).toBeCloseTo(440.87, 2);
    expect(r.avisos.some((a) => a.mensaje.includes('piso'))).toBe(true);
  });

  it('la zona no altera UMA, tarifa ISR ni cuota fija', () => {
    const g = calcularNomina({ ...base, cuotaDiaria: 800 });
    const f = calcularNomina({ ...base, cuotaDiaria: 800, zona: 'Frontera' });
    expect(f.uma).toBe(g.uma);
    expect(f.isr.isrAntesSubsidio).toBeCloseTo(g.isr.isrAntesSubsidio, 6);
    expect(f.imss.cuotaFija.patron).toBeCloseTo(g.imss.cuotaFija.patron, 6);
  });
});

describe('Validaciones de entrada', () => {
  it('prima RT 0.2 % se ajusta a 0.5 % con aviso', () => {
    const r = calcularNomina({ ...base, primaRiesgoPct: 0.2 });
    expect(r.entrada.primaRiesgoPct).toBe(0.5);
    expect(r.imss.primaRiesgoAplicada).toBeCloseTo(0.005, 9);
    expect(r.avisos.some((a) => a.nivel === 'advertencia' && a.mensaje.includes('mínima'))).toBe(true);
  });

  it('prima RT 20 % se ajusta a 15 %', () => {
    const r = calcularNomina({ ...base, primaRiesgoPct: 20 });
    expect(r.entrada.primaRiesgoPct).toBe(15);
  });

  it('prima RT NaN usa la mínima y no propaga NaN', () => {
    const r = calcularNomina({ ...base, primaRiesgoPct: Number.NaN });
    expect(r.entrada.primaRiesgoPct).toBe(0.5);
    expect(Number.isFinite(r.costoTotalEmpresa)).toBe(true);
  });

  it('cuota diaria NaN o negativa se trata como 0 con aviso de error', () => {
    for (const c of [Number.NaN, -10, 0]) {
      const r = calcularNomina({ ...base, cuotaDiaria: c });
      expect(r.bruto).toBe(0);
      expect(r.neto).toBe(0);
      expect(r.isrRetenido).toBe(0);
      expect(r.avisos.some((a) => a.nivel === 'error')).toBe(true);
      expect(Number.isFinite(r.costoTotalEmpresa)).toBe(true);
    }
  });

  it('SBC topado a 25 UMA genera aviso informativo', () => {
    const r = calcularNomina({ ...base, cuotaDiaria: 3000 });
    expect(r.sbc.topado25UMA).toBe(true);
    expect(r.avisos.some((a) => a.mensaje.includes('25 UMA'))).toBe(true);
  });
});
