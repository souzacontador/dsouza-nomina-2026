import { describe, expect, it } from 'vitest';
import { TARIFA_15_DIAS, TARIFA_7_DIAS, TARIFA_DIARIA, TARIFA_MENSUAL } from '../constantes2026';
import { aplicarTarifa, calcularISR, tarifaPara } from '../isr';

describe('Tarifas Anexo 8 RMF 2026 — integridad', () => {
  it.each([TARIFA_DIARIA, TARIFA_7_DIAS, TARIFA_15_DIAS, TARIFA_MENSUAL])('$clave: 11 renglones contiguos', (tarifa) => {
    expect(tarifa.renglones).toHaveLength(11);
    for (let i = 1; i < tarifa.renglones.length; i++) {
      const prev = tarifa.renglones[i - 1];
      expect(prev.limSup).not.toBeNull();
      expect(tarifa.renglones[i].limInf).toBeCloseTo((prev.limSup as number) + 0.01, 2);
    }
    expect(tarifa.renglones[10].limSup).toBeNull();
    expect(tarifa.renglones[10].pct).toBe(0.35);
  });

  it('aplicarTarifa con base 0 o negativa regresa 0', () => {
    expect(aplicarTarifa(0, TARIFA_MENSUAL).isr).toBe(0);
    expect(aplicarTarifa(-5, TARIFA_MENSUAL).isr).toBe(0);
  });
});

describe('ISR por periodicidad (art. 96 LISR, arts. 175-176 RLISR, regla 3.12.2)', () => {
  it('quincenal 7,500 (500 × 15) con B.IV → 709.86', () => {
    const r = calcularISR(7500, 'Quincenal', 500, 'General');
    expect(r.tarifaClave).toContain('B.IV');
    expect(r.renglon?.limInf).toBe(7225.96);
    expect(r.isrAntesSubsidio).toBeCloseTo(709.86, 2);
    expect(r.exentoArt96).toBe(false);
  });

  it('mensual 15,000 con B.V → 1,402.82', () => {
    const r = calcularISR(15000, 'Mensual', 500, 'General');
    expect(r.tarifaClave).toContain('B.V');
    expect(r.isrAntesSubsidio).toBeCloseTo(1402.82, 2);
  });

  it('semanal 3,500 (500 × 7) con B.II → 331.27', () => {
    const r = calcularISR(3500, 'Semanal', 500, 'General');
    expect(r.tarifaClave).toContain('B.II');
    expect(r.isrAntesSubsidio).toBeCloseTo(331.27, 2);
  });

  it('catorcenal 7,000 (500 × 14) usa B.I sobre el salario diario × 14 → 662.51', () => {
    const r = calcularISR(7000, 'Catorcenal', 500, 'General');
    expect(r.tarifaClave).toContain('B.I');
    expect(r.multiplicador).toBe(14);
    expect(r.baseAplicada).toBeCloseTo(500, 6);
    expect(r.renglon?.limInf).toBe(481.74);
    expect(r.isrAntesSubsidio).toBeCloseTo(662.51, 2);
  });

  it('tarifaPara mapea cada periodicidad a su tabla', () => {
    expect(tarifaPara('Semanal').tarifa).toBe(TARIFA_7_DIAS);
    expect(tarifaPara('Quincenal').tarifa).toBe(TARIFA_15_DIAS);
    expect(tarifaPara('Mensual').tarifa).toBe(TARIFA_MENSUAL);
    expect(tarifaPara('Catorcenal').tarifa).toBe(TARIFA_DIARIA);
  });

  it('exención art. 96: quien percibe únicamente el salario mínimo no tiene retención', () => {
    const general = calcularISR(315.04 * 15, 'Quincenal', 315.04, 'General');
    expect(general.exentoArt96).toBe(true);
    expect(general.isrAntesSubsidio).toBe(0);

    const zlfn = calcularISR(440.87 * 15, 'Quincenal', 440.87, 'Frontera');
    expect(zlfn.exentoArt96).toBe(true);

    // 440.87 en zona general ya excede el SM general: sí hay retención.
    const noExento = calcularISR(440.87 * 15, 'Quincenal', 440.87, 'General');
    expect(noExento.exentoArt96).toBe(false);
    expect(noExento.isrAntesSubsidio).toBeGreaterThan(0);

    // Una cuota inferior al SM no es "salario mínimo": se retiene.
    expect(calcularISR(300 * 15, 'Quincenal', 300, 'General').exentoArt96).toBe(false);

    // SM con base gravable adicional pierde la exención ("únicamente").
    const conGravado = calcularISR(315.04 * 15 + 200, 'Quincenal', 315.04, 'General');
    expect(conGravado.exentoArt96).toBe(false);
    expect(conGravado.isrAntesSubsidio).toBeGreaterThan(0);
  });
});
