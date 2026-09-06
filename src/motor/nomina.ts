import { LSS, PERIODOS, SALARIO_MINIMO, SUBSIDIO_EMPLEO, UMA_DIARIA, UMA_MENSUAL } from './constantes2026';
import { calcularIMSS } from './imss';
import { calcularISR } from './isr';
import { calcularPercepcionesExtra, semanasDelPeriodo } from './percepcionesExtra';
import { esInferiorAlMinimo, esTrabajadorSalarioMinimo } from './salarioMinimo';
import { calcularSBC } from './sbc';
import { calcularSubsidio } from './subsidio';
import type { Aviso, EntradaNomina, Leyenda, ResultadoNomina, SemanaExtra } from './tipos';

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);

/** Ajusta la lista de semanas capturadas al número de semanas del periodo. */
export function normalizarSemanas(semanas: SemanaExtra[] | undefined, n: number): SemanaExtra[] {
  const base = Array.isArray(semanas) ? semanas : [];
  return Array.from({ length: n }, (_, i) => ({
    horasExtra: num(base[i]?.horasExtra) > 0 ? num(base[i]?.horasExtra) : 0,
    diasDescansoTrabajados:
      num(base[i]?.diasDescansoTrabajados) > 0 ? Math.trunc(num(base[i]?.diasDescansoTrabajados)) : 0,
  }));
}

/**
 * Orquestador: valida la entrada, calcula SBC, percepciones extra, ISR, subsidio,
 * IMSS e INFONAVIT y arma el resultado del periodo. No redondea: la presentación
 * lo hace a centavos.
 */
export function calcularNomina(entradaOriginal: EntradaNomina): ResultadoNomina {
  const avisos: Aviso[] = [];
  const leyendas: Leyenda[] = [];
  const entrada: EntradaNomina = { ...entradaOriginal };

  // ── Validaciones de entrada ──────────────────────────────────────────────
  if (!(num(entrada.cuotaDiaria) > 0)) {
    avisos.push({ nivel: 'error', mensaje: 'La cuota diaria debe ser un número mayor que cero.' });
    entrada.cuotaDiaria = 0;
  }
  const { primaMinimaPct, primaMaximaPct } = LSS.riesgoTrabajo;
  if (!Number.isFinite(num(entrada.primaRiesgoPct))) {
    avisos.push({
      nivel: 'advertencia',
      mensaje: `Prima de riesgo de trabajo no válida; se aplicó la mínima de ley (${primaMinimaPct} %, art. 74 LSS).`,
    });
    entrada.primaRiesgoPct = primaMinimaPct;
  } else if (entrada.primaRiesgoPct < primaMinimaPct) {
    avisos.push({
      nivel: 'advertencia',
      mensaje: `La prima de riesgo capturada es menor a la mínima de ley; se ajustó a ${primaMinimaPct} % (art. 74 LSS).`,
    });
    entrada.primaRiesgoPct = primaMinimaPct;
  } else if (entrada.primaRiesgoPct > primaMaximaPct) {
    avisos.push({
      nivel: 'advertencia',
      mensaje: `La prima de riesgo capturada excede la máxima de ley; se ajustó a ${primaMaximaPct} % (art. 74 LSS).`,
    });
    entrada.primaRiesgoPct = primaMaximaPct;
  }
  if (entrada.modoSBC === 'Manual' && !(num(entrada.sbcManual) > 0)) {
    avisos.push({ nivel: 'advertencia', mensaje: 'SBC manual no válido; se aplicó el salario mínimo de la zona.' });
    entrada.sbcManual = 0;
  }
  if (!entrada.jornada) entrada.jornada = 'Diurna';

  // ── Valores del periodo ──────────────────────────────────────────────────
  const dias = PERIODOS[entrada.periodicidad].dias;
  const uma = UMA_DIARIA[entrada.mes];
  const umaMensual = UMA_MENSUAL[entrada.mes];
  const salarioMinimo = SALARIO_MINIMO[entrada.zona];
  const bruto = entrada.cuotaDiaria * dias;
  entrada.semanas = normalizarSemanas(entrada.semanas, semanasDelPeriodo(entrada.periodicidad));

  // ── Trabajador de salario mínimo ────────────────────────────────────────
  const esSalarioMinimo = esTrabajadorSalarioMinimo(entrada.cuotaDiaria, entrada.zona);
  if (esInferiorAlMinimo(entrada.cuotaDiaria, entrada.zona)) {
    avisos.push({
      nivel: 'error',
      mensaje: `La cuota diaria es inferior al salario mínimo de la zona ($${salarioMinimo.toFixed(2)}). Posible incumplimiento laboral (arts. 85 y 90 LFT); no se reconoce como salario mínimo legal.`,
    });
  }

  // ── SBC ─────────────────────────────────────────────────────────────────
  const sbc = calcularSBC(entrada);
  if (sbc.ajustadoAlPiso) {
    avisos.push({
      nivel: 'advertencia',
      mensaje: `El SBC resultó inferior al salario mínimo de la zona; se ajustó al piso de $${salarioMinimo.toFixed(2)} (art. 28 LSS).`,
    });
  }
  if (sbc.topado25UMA) {
    avisos.push({
      nivel: 'info',
      mensaje: `SBC topado a 25 UMA ($${sbc.tope25UMA.toFixed(2)} diarios, art. 28 LSS).`,
    });
  }

  // ── Percepciones extra (LFT 66/68/73, LISR 93-I) ────────────────────────
  const extras = calcularPercepcionesExtra({
    cuotaDiaria: entrada.cuotaDiaria,
    jornada: entrada.jornada,
    semanas: entrada.semanas,
    esSalarioMinimo,
    uma,
  });
  avisos.push(...extras.avisos);
  const totalPercepciones = bruto + extras.total;
  const baseGravable = bruto + extras.gravado;

  // ── ISR y subsidio ──────────────────────────────────────────────────────
  const isr = calcularISR(baseGravable, entrada.periodicidad, entrada.cuotaDiaria, entrada.zona, dias);
  if (esSalarioMinimo && !isr.exentoArt96 && extras.gravado > 0) {
    avisos.push({
      nivel: 'advertencia',
      mensaje:
        'El trabajador de salario mínimo percibe remuneraciones gravadas adicionales; se pierde la protección del art. 96 párr. 1 LISR y se retiene sobre la base gravable con la tarifa progresiva.',
    });
  }
  const subsidio = calcularSubsidio(baseGravable, dias, entrada.mes, entrada.periodicidad);
  const subsidioAcreditado = Math.min(isr.isrAntesSubsidio, subsidio.subsidioPeriodo);
  const isrRetenido = Math.max(0, isr.isrAntesSubsidio - subsidio.subsidioPeriodo);

  // ── IMSS / INFONAVIT ────────────────────────────────────────────────────
  // Sin cuota diaria válida no hay salario que cotizar: el desglose queda en ceros.
  const imss = calcularIMSS({
    sbcAcotado: entrada.cuotaDiaria > 0 ? sbc.sbcAcotado : 0,
    dias: entrada.cuotaDiaria > 0 ? dias : 0,
    uma,
    salarioMinimo,
    primaRiesgo: entrada.primaRiesgoPct / 100,
  });
  // Art. 36 LSS: al trabajador de salario mínimo no se le retiene cuota obrera; la paga el patrón.
  const cuotaObreraAbsorbida = esSalarioMinimo ? imss.totalImssObrero : 0;
  const imssObreroRetenido = esSalarioMinimo ? 0 : imss.totalImssObrero;

  const totalDeducciones = isrRetenido + imssObreroRetenido;
  const neto = totalPercepciones - totalDeducciones;
  const costoSocialPatron = imss.totalImssPatron + imss.totalInfonavit + cuotaObreraAbsorbida;
  const costoTotalEmpresa = totalPercepciones + costoSocialPatron;

  // ── Leyendas normativas ─────────────────────────────────────────────────
  if (esSalarioMinimo) {
    leyendas.push({
      ambito: 'ISR',
      titulo: isr.exentoArt96 ? 'Sin retención de ISR — trabajador de salario mínimo' : 'Trabajador de salario mínimo con ingresos gravados adicionales',
      texto: isr.exentoArt96
        ? 'No se efectúa retención de ISR porque el trabajador percibe únicamente el salario mínimo general del área geográfica.'
        : 'Al percibir remuneraciones gravadas distintas del salario mínimo, se calcula y retiene el ISR sobre la base gravable con la tarifa del periodo.',
      fundamento: 'Art. 96, primer párrafo, LISR.',
    });
    leyendas.push({
      ambito: 'IMSS',
      titulo: 'Cuota obrera a cargo del patrón',
      texto:
        'No se retiene cuota obrera IMSS al trabajador; corresponde al patrón pagarla íntegramente porque la cuota diaria es el salario mínimo. El importe se suma al costo patronal.',
      fundamento: 'Art. 36 LSS (última reforma DOF 15-01-2026).',
    });
    leyendas.push({
      ambito: 'IMSS',
      titulo: 'Cesantía y Vejez patronal',
      texto: `El SBC integrado ($${sbc.sbcAcotado.toFixed(2)}) se clasifica en veces UMA para la tabla gradual; el renglón "1.00 SM" (3.150 %) aplica sólo cuando el SBC es exactamente el salario mínimo. Porcentaje aplicado: ${(imss.pctCesantiaPatron * 100).toFixed(3)} % (${imss.etiquetaCesantia}).`,
      fundamento: 'Art. 168-II-a LSS y Transitorio Segundo del Decreto DOF 16-12-2020 (columna 2026).',
    });
    if (extras.total > 0) {
      leyendas.push({
        ambito: 'LFT',
        titulo: 'Tiempo extra y descanso trabajado 100 % exentos',
        texto:
          'Las remuneraciones por tiempo extraordinario dentro de las 9 h semanales (art. 66 LFT, Transitorio Cuarto 2026) y por servicios en días de descanso sin sustitución (art. 73 LFT) están totalmente exentas de ISR para el trabajador de salario mínimo. Las horas del art. 68 y cualquier exceso gravan al 100 %.',
        fundamento: 'Art. 93, fracciones I y II, LISR; arts. 66, 68 y 73 LFT.',
      });
    }
  } else if (extras.total > 0) {
    leyendas.push({
      ambito: 'LFT',
      titulo: 'Tiempo extra y descanso trabajado: 50 % exento con tope de 5 UMA por semana',
      texto: `Se exenta el 50 % de lo pagado dentro del límite laboral (9 h/semana y días de descanso trabajados), sin exceder 5 UMA por semana ($${(5 * uma).toFixed(2)}). El resto y las horas del art. 68 gravan.`,
      fundamento: 'Art. 93, fracciones I y II, LISR; arts. 66, 68 y 73 LFT.',
    });
  }
  if (subsidio.aplica && subsidioAcreditado > 0) {
    leyendas.push({
      ambito: 'Subsidio',
      titulo: 'Subsidio para el empleo acreditado contra el ISR',
      texto: `Ingreso del periodo dentro del límite (${entrada.periodicidad === 'Mensual' ? '$11,492.66 mensuales' : `$${subsidio.limitePeriodo.toFixed(2)} prorrateados`}). Subsidio del periodo: UMA mensual × ${(subsidio.pctAplicado * 100).toFixed(2)} %${entrada.periodicidad === 'Mensual' ? '' : ' ÷ 30.4 × días'}. Sólo se acredita contra el ISR; nunca se entrega en efectivo.`,
      fundamento: SUBSIDIO_EMPLEO.fuente,
    });
  }

  return {
    entrada,
    dias,
    uma,
    umaMensual,
    salarioMinimo,
    esSalarioMinimo,
    bruto,
    extras,
    totalPercepciones,
    baseGravable,
    sbc,
    isr,
    subsidio,
    subsidioAcreditado,
    isrRetenido,
    imss,
    imssObreroRetenido,
    cuotaObreraAbsorbida,
    totalDeducciones,
    neto,
    costoSocialPatron,
    costoTotalEmpresa,
    avisos,
    leyendas,
  };
}
