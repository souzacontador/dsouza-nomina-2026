import { LFT_2026, LISR_93_I, PERIODOS } from './constantes2026';
import type {
  Aviso,
  Periodicidad,
  ResultadoPercepcionesExtra,
  SemanaExtra,
  SemanaExtraResultado,
  TipoJornada,
} from './tipos';

export interface EntradaExtras {
  cuotaDiaria: number;
  jornada: TipoJornada;
  semanas: SemanaExtra[];
  esSalarioMinimo: boolean;
  /** UMA diaria del mes de cálculo (tope 5 UMA por semana, art. 93-I LISR). */
  uma: number;
}

/** Número de semanas (completas o parciales) que abarca el periodo de pago. */
export function semanasDelPeriodo(periodicidad: Periodicidad): number {
  return Math.ceil(PERIODOS[periodicidad].dias / 7);
}

const noNeg = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);

/**
 * Tiempo extraordinario y días de descanso trabajados — cálculo semana por semana.
 *
 * LFT 2026 (reforma DOF 01-05-2026):
 *  - Art. 66 + Transitorio Cuarto: hasta 9 h extra/semana al 100 % más (hora doble).
 *  - Art. 68: hasta 4 h adicionales/semana al 200 % más (hora triple).
 *  - Más de 13 h/semana: incumplimiento; se paga triple y se marca.
 *  - Art. 73: día de descanso trabajado sin sustitución → salario doble adicional.
 *  - Art. 61: valor hora = cuota diaria ÷ horas de la jornada (8 / 7.5 / 7).
 *
 * LISR art. 93-I:
 *  - Salario mínimo: 100 % exento lo pagado dentro del límite laboral (horas art. 66 y
 *    descanso trabajado). Las horas del art. 68 y el exceso gravan al 100 %.
 *  - Demás trabajadores: 50 % exento de lo pagado dentro del límite, sin exceder
 *    5 UMA por semana; el resto grava (art. 93-II).
 */
export function calcularPercepcionesExtra(e: EntradaExtras): ResultadoPercepcionesExtra {
  const horasJornada = LFT_2026.horasJornada[e.jornada];
  const valorHora = e.cuotaDiaria > 0 ? e.cuotaDiaria / horasJornada : 0;
  const avisos: Aviso[] = [];
  const regimen = e.esSalarioMinimo ? 'SalarioMinimo' : 'Demas';
  const topeExencionSemana = LISR_93_I.topeUMAsPorSemana * e.uma;

  const semanas: SemanaExtraResultado[] = e.semanas.map((s, i) => {
    const horas = noNeg(s.horasExtra);
    const dias = Math.trunc(noNeg(s.diasDescansoTrabajados));

    const horasDentroLimite = Math.min(horas, LFT_2026.horasExtraMaxSemana);
    const horasArt68 = Math.min(Math.max(0, horas - LFT_2026.horasExtraMaxSemana), LFT_2026.horasArt68MaxSemana);
    const horasExceso = Math.max(0, horas - LFT_2026.horasExtraMaxSemana - LFT_2026.horasArt68MaxSemana);

    const pagoHorasDobles = horasDentroLimite * valorHora * LFT_2026.factorHoraDoble;
    const pagoHorasTriples = (horasArt68 + horasExceso) * valorHora * LFT_2026.factorHoraTriple;
    const pagoDescanso = dias * e.cuotaDiaria * LFT_2026.factorDescansoTrabajado;
    const totalSemana = pagoHorasDobles + pagoHorasTriples + pagoDescanso;

    const baseExencion = pagoHorasDobles + pagoDescanso;
    const exento = e.esSalarioMinimo
      ? baseExencion * LISR_93_I.pctExentoSalarioMinimo
      : Math.min(baseExencion * LISR_93_I.pctExentoDemas, topeExencionSemana);
    const gravado = totalSemana - exento;

    const n = i + 1;
    if (horasArt68 > 0) {
      avisos.push({
        nivel: 'advertencia',
        mensaje: `Semana ${n}: ${fmtH(horasArt68)} h exceden las 9 h del art. 66 LFT; se pagan triples (art. 68) y gravan ISR al 100 %.`,
      });
    }
    if (horasExceso > 0) {
      avisos.push({
        nivel: 'error',
        mensaje: `Semana ${n}: ${fmtH(horasExceso)} h rebasan el máximo legal de 13 h/semana (arts. 66 y 68 LFT). Posible incumplimiento laboral; se pagan triples y gravan al 100 %.`,
      });
    }
    if (dias > LFT_2026.diasDescansoPorSemana) {
      avisos.push({
        nivel: 'advertencia',
        mensaje: `Semana ${n}: ${dias} días de descanso trabajados; la LFT prevé un descanso por cada seis días (art. 69). Verificar días de descanso obligatorio (art. 74).`,
      });
    }

    return {
      numero: n,
      horasCapturadas: horas,
      horasDentroLimite,
      horasArt68,
      horasExceso,
      diasDescansoTrabajados: dias,
      pagoHorasDobles,
      pagoHorasTriples,
      pagoDescanso,
      totalSemana,
      baseExencion,
      exento,
      gravado,
      topeExencionSemana,
    };
  });

  const sum = (f: (s: SemanaExtraResultado) => number) => semanas.reduce((a, s) => a + f(s), 0);
  const total = sum((s) => s.totalSemana);

  if (total > 0 && (sum((s) => s.horasArt68 + s.horasExceso) > 0 || sum((s) => s.diasDescansoTrabajados) > 0)) {
    avisos.push({
      nivel: 'info',
      mensaje:
        'El tiempo extra que excede los márgenes de la LFT y el pago por descanso trabajado integran el SBC como salario variable (arts. 27 fracc. IX y 30 LSS); esta calculadora no modifica el SBC fijo capturado.',
    });
  }

  return {
    valorHora,
    horasJornada,
    semanas,
    horasDentroLimite: sum((s) => s.horasDentroLimite),
    horasArt68: sum((s) => s.horasArt68),
    horasExceso: sum((s) => s.horasExceso),
    diasDescansoTrabajados: sum((s) => s.diasDescansoTrabajados),
    pagoHorasDobles: sum((s) => s.pagoHorasDobles),
    pagoHorasTriples: sum((s) => s.pagoHorasTriples),
    pagoDescanso: sum((s) => s.pagoDescanso),
    total,
    exento: sum((s) => s.exento),
    gravado: sum((s) => s.gravado),
    regimen,
    avisos,
  };
}

function fmtH(h: number): string {
  return Number.isInteger(h) ? String(h) : h.toFixed(2);
}
