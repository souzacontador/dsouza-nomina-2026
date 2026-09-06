import { describe, expect, it } from 'vitest';
import { calcularNomina } from '../../motor/nomina';
import { construirCSV } from '../csv';

describe('Exportación CSV', () => {
  const r = calcularNomina({
    cuotaDiaria: 500,
    periodicidad: 'Quincenal',
    zona: 'General',
    mes: 'Resto',
    modoSBC: 'Antiguedad',
    factorIdx: 0,
    sbcManual: 0,
    primaRiesgoPct: 0.5,
    jornada: 'Diurna',
    semanas: [{ horasExtra: 6, diasDescansoTrabajados: 0 }],
  });
  const csv = construirCSV(r);
  const lineas = csv.split('\r\n');

  it('inicia con BOM UTF-8 y contiene todas las secciones', () => {
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    for (const s of ['PARÁMETROS', 'TIEMPO EXTRA Y DESCANSO TRABAJADO', 'LIQUIDACIÓN AL TRABAJADOR', 'COSTO SOCIAL — IMSS E INFONAVIT', 'AVISOS', 'LEYENDAS NORMATIVAS', 'FUENTES']) {
      expect(lineas).toContain(s);
    }
  });

  it('importes con 2 decimales y punto decimal', () => {
    expect(lineas).toContain('NETO A PAGAR,' + r.neto.toFixed(2));
    expect(lineas).toContain('ISR retenido,' + r.isrRetenido.toFixed(2));
    expect(lineas.find((l) => l.startsWith('Cesantía en edad avanzada y vejez,'))).toMatch(/^Cesantía en edad avanzada y vejez,\d+\.\d{2},\d+\.\d{2},\d+\.\d{2}$/);
  });

  it('escapa celdas con comas o comillas', () => {
    const conComa = lineas.find((l) => l.includes('Anexo 8 RMF 2026, B.IV'));
    expect(conComa).toBeDefined();
    expect(conComa).toMatch(/"Anexo 8 RMF 2026, B\.IV \(15 días\)"/);
  });

  it('incluye la semana de tiempo extra capturada', () => {
    const s = r.extras.semanas[0];
    const esperada = [s.numero, s.horasCapturadas, s.horasDentroLimite, s.horasArt68, s.horasExceso, s.diasDescansoTrabajados, s.pagoHorasDobles, s.pagoHorasTriples, s.pagoDescanso, s.exento, s.gravado]
      .map((v) => v.toFixed(2))
      .join(',');
    expect(lineas).toContain(esperada);
    // cuota 500 ÷ 8 h = 62.50 × 2 × 6 h = 750.00
    expect(esperada).toContain('750.00');
  });
});
