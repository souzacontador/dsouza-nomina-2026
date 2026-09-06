import { describe, expect, it } from 'vitest';
import { calcularPercepcionesExtra, semanasDelPeriodo } from '../percepcionesExtra';

const UMA = 117.31;

describe('Semanas del periodo', () => {
  it('semanal 1, catorcenal 2, quincenal 3, mensual 5 (semanas completas o parciales)', () => {
    expect(semanasDelPeriodo('Semanal')).toBe(1);
    expect(semanasDelPeriodo('Catorcenal')).toBe(2);
    expect(semanasDelPeriodo('Quincenal')).toBe(3);
    expect(semanasDelPeriodo('Mensual')).toBe(5);
  });
});

describe('Valor hora por jornada (art. 61 LFT)', () => {
  it('cuota 400: diurna 50.00, mixta 53.33, nocturna 57.14', () => {
    const base = { cuotaDiaria: 400, semanas: [], esSalarioMinimo: false, uma: UMA };
    expect(calcularPercepcionesExtra({ ...base, jornada: 'Diurna' }).valorHora).toBeCloseTo(50, 6);
    expect(calcularPercepcionesExtra({ ...base, jornada: 'Mixta' }).valorHora).toBeCloseTo(53.3333, 3);
    expect(calcularPercepcionesExtra({ ...base, jornada: 'Nocturna' }).valorHora).toBeCloseTo(57.1429, 3);
  });
});

describe('Tiempo extra — demás trabajadores (50 % exento, tope 5 UMA/semana)', () => {
  it('cuota 400, 6 h en la semana: pago doble 600; exento 300; gravado 300', () => {
    const r = calcularPercepcionesExtra({
      cuotaDiaria: 400,
      jornada: 'Diurna',
      semanas: [{ horasExtra: 6, diasDescansoTrabajados: 0 }],
      esSalarioMinimo: false,
      uma: UMA,
    });
    expect(r.horasDentroLimite).toBe(6);
    expect(r.horasArt68).toBe(0);
    expect(r.pagoHorasDobles).toBeCloseTo(600, 2);
    expect(r.total).toBeCloseTo(600, 2);
    expect(r.exento).toBeCloseTo(300, 2);
    expect(r.gravado).toBeCloseTo(300, 2);
    expect(r.avisos).toHaveLength(0);
  });

  it('tope 5 UMA: cuota 1,000, 9 h → pago 2,250; 50 % = 1,125 pero exento 586.55', () => {
    const r = calcularPercepcionesExtra({
      cuotaDiaria: 1000,
      jornada: 'Diurna',
      semanas: [{ horasExtra: 9, diasDescansoTrabajados: 0 }],
      esSalarioMinimo: false,
      uma: UMA,
    });
    expect(r.pagoHorasDobles).toBeCloseTo(2250, 2);
    expect(r.semanas[0].topeExencionSemana).toBeCloseTo(586.55, 2);
    expect(r.exento).toBeCloseTo(586.55, 2);
    expect(r.gravado).toBeCloseTo(1663.45, 2);
  });

  it('11 h: 9 dobles (900) + 2 triples art. 68 (300); exento 450; gravado 750; aviso art. 68', () => {
    const r = calcularPercepcionesExtra({
      cuotaDiaria: 400,
      jornada: 'Diurna',
      semanas: [{ horasExtra: 11, diasDescansoTrabajados: 0 }],
      esSalarioMinimo: false,
      uma: UMA,
    });
    expect(r.horasDentroLimite).toBe(9);
    expect(r.horasArt68).toBe(2);
    expect(r.horasExceso).toBe(0);
    expect(r.pagoHorasDobles).toBeCloseTo(900, 2);
    expect(r.pagoHorasTriples).toBeCloseTo(300, 2);
    expect(r.exento).toBeCloseTo(450, 2);
    expect(r.gravado).toBeCloseTo(750, 2);
    expect(r.avisos.some((a) => a.nivel === 'advertencia' && a.mensaje.includes('art. 68'))).toBe(true);
  });

  it('15 h: 9 dobles + 4 art. 68 + 2 exceso ilegal; aviso de error', () => {
    const r = calcularPercepcionesExtra({
      cuotaDiaria: 400,
      jornada: 'Diurna',
      semanas: [{ horasExtra: 15, diasDescansoTrabajados: 0 }],
      esSalarioMinimo: false,
      uma: UMA,
    });
    expect(r.horasArt68).toBe(4);
    expect(r.horasExceso).toBe(2);
    expect(r.pagoHorasTriples).toBeCloseTo(6 * 50 * 3, 2);
    expect(r.avisos.some((a) => a.nivel === 'error' && a.mensaje.includes('13 h'))).toBe(true);
  });

  it('día de descanso trabajado (art. 73): salario doble adicional = 800; 50 % exento', () => {
    const r = calcularPercepcionesExtra({
      cuotaDiaria: 400,
      jornada: 'Diurna',
      semanas: [{ horasExtra: 0, diasDescansoTrabajados: 1 }],
      esSalarioMinimo: false,
      uma: UMA,
    });
    expect(r.pagoDescanso).toBeCloseTo(800, 2);
    expect(r.exento).toBeCloseTo(400, 2);
    expect(r.gravado).toBeCloseTo(400, 2);
  });

  it('el tope de 5 UMA se aplica por semana y se acumula por periodo', () => {
    const r = calcularPercepcionesExtra({
      cuotaDiaria: 1000,
      jornada: 'Diurna',
      semanas: [
        { horasExtra: 9, diasDescansoTrabajados: 0 },
        { horasExtra: 9, diasDescansoTrabajados: 0 },
        { horasExtra: 0, diasDescansoTrabajados: 0 },
      ],
      esSalarioMinimo: false,
      uma: UMA,
    });
    expect(r.exento).toBeCloseTo(2 * 586.55, 2);
    expect(r.total).toBeCloseTo(4500, 2);
  });

  it('más de un día de descanso trabajado en la semana genera advertencia (art. 69)', () => {
    const r = calcularPercepcionesExtra({
      cuotaDiaria: 400,
      jornada: 'Diurna',
      semanas: [{ horasExtra: 0, diasDescansoTrabajados: 2 }],
      esSalarioMinimo: false,
      uma: UMA,
    });
    expect(r.avisos.some((a) => a.mensaje.includes('art. 69'))).toBe(true);
  });
});

describe('Tiempo extra — trabajador de salario mínimo (100 % exento dentro de límites)', () => {
  it('SM 315.04, 9 h + 1 día de descanso: todo exento; gravado 0', () => {
    const r = calcularPercepcionesExtra({
      cuotaDiaria: 315.04,
      jornada: 'Diurna',
      semanas: [{ horasExtra: 9, diasDescansoTrabajados: 1 }],
      esSalarioMinimo: true,
      uma: UMA,
    });
    // valor hora 39.38; 9 h dobles = 708.84; descanso = 630.08
    expect(r.pagoHorasDobles).toBeCloseTo(708.84, 2);
    expect(r.pagoDescanso).toBeCloseTo(630.08, 2);
    expect(r.exento).toBeCloseTo(1338.92, 2);
    expect(r.gravado).toBe(0);
    expect(r.regimen).toBe('SalarioMinimo');
  });

  it('SM con 12 h: las 3 h del art. 68 (triples) gravan al 100 %', () => {
    const r = calcularPercepcionesExtra({
      cuotaDiaria: 315.04,
      jornada: 'Diurna',
      semanas: [{ horasExtra: 12, diasDescansoTrabajados: 0 }],
      esSalarioMinimo: true,
      uma: UMA,
    });
    expect(r.horasArt68).toBe(3);
    expect(r.pagoHorasTriples).toBeCloseTo(3 * 39.38 * 3, 2);
    expect(r.gravado).toBeCloseTo(r.pagoHorasTriples, 6);
    expect(r.exento).toBeCloseTo(r.pagoHorasDobles, 6);
  });
});

describe('Entradas inválidas', () => {
  it('horas negativas o NaN se tratan como 0', () => {
    const r = calcularPercepcionesExtra({
      cuotaDiaria: 400,
      jornada: 'Diurna',
      semanas: [{ horasExtra: -3, diasDescansoTrabajados: Number.NaN }],
      esSalarioMinimo: false,
      uma: UMA,
    });
    expect(r.total).toBe(0);
    expect(r.avisos).toHaveLength(0);
  });
});
