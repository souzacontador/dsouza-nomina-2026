/**
 * Tipos del motor de nómina 2026.
 * El motor es TypeScript puro (sin React) y conserva precisión completa:
 * el redondeo a centavos ocurre únicamente en la capa de presentación.
 */

export type Periodicidad = 'Semanal' | 'Catorcenal' | 'Quincenal' | 'Mensual';
export type Zona = 'General' | 'Frontera';
/** Enero 2026 tiene reglas propias (UMA 2025 vigente y subsidio 15.59 %). */
export type MesCalculo = 'Enero' | 'Resto';
export type ModoSBC = 'Antiguedad' | 'Manual';

export interface RenglonTarifa {
  limInf: number;
  limSup: number | null; // null = "En adelante"
  cuota: number;
  pct: number; // fracción (0.1792 = 17.92 %)
}

export interface Tarifa {
  clave: string; // p. ej. "Anexo 8 RMF 2026, B.IV (15 días)"
  dias: number;
  renglones: RenglonTarifa[];
}

export type TipoJornada = 'Diurna' | 'Mixta' | 'Nocturna';

/** Captura de tiempo extraordinario por semana real de servicios. */
export interface SemanaExtra {
  horasExtra: number;
  /** Días de descanso (semanal u obligatorio) trabajados sin disfrutar otro en sustitución. */
  diasDescansoTrabajados: number;
}

export interface EntradaNomina {
  cuotaDiaria: number;
  periodicidad: Periodicidad;
  zona: Zona;
  mes: MesCalculo;
  modoSBC: ModoSBC;
  factorIdx: number;
  sbcManual: number;
  /** Prima de riesgo de trabajo en por ciento (0.5 = 0.5 %). */
  primaRiesgoPct: number;
  /** Tipo de jornada para el valor de la hora ordinaria (art. 61 LFT). */
  jornada: TipoJornada;
  /** Una entrada por semana del periodo; puede venir vacía si no hubo tiempo extra. */
  semanas: SemanaExtra[];
}

export interface SemanaExtraResultado {
  numero: number;
  horasCapturadas: number;
  /** Horas dentro del límite del art. 66 (≤ 9 en 2026): pago doble, base de exención. */
  horasDentroLimite: number;
  /** Horas que exceden el art. 66 hasta el máximo del art. 68 (≤ 4): pago triple, gravadas. */
  horasArt68: number;
  /** Horas más allá del art. 68: pago triple, gravadas, incumplimiento LFT. */
  horasExceso: number;
  diasDescansoTrabajados: number;
  pagoHorasDobles: number;
  pagoHorasTriples: number;
  pagoDescanso: number;
  totalSemana: number;
  /** Importe con derecho a exención (horas dentro de límite + descanso trabajado). */
  baseExencion: number;
  exento: number;
  gravado: number;
  topeExencionSemana: number;
}

export interface ResultadoPercepcionesExtra {
  valorHora: number;
  horasJornada: number;
  semanas: SemanaExtraResultado[];
  horasDentroLimite: number;
  horasArt68: number;
  horasExceso: number;
  diasDescansoTrabajados: number;
  pagoHorasDobles: number;
  pagoHorasTriples: number;
  pagoDescanso: number;
  total: number;
  exento: number;
  gravado: number;
  /** Régimen aplicado: 100 % (salario mínimo) o 50 % con tope 5 UMA/semana. */
  regimen: 'SalarioMinimo' | 'Demas';
  avisos: Aviso[];
}

export interface ResultadoSBC {
  sbcBruto: number;
  sbcAcotado: number;
  factorAplicado: number;
  topado25UMA: boolean;
  ajustadoAlPiso: boolean;
  tope25UMA: number;
  pisoSM: number;
}

export interface ResultadoISR {
  /** ISR determinado con la tarifa, antes de acreditar el subsidio. */
  isrAntesSubsidio: number;
  exentoArt96: boolean;
  tarifaClave: string;
  /** Base a la que se aplicó la tarifa (para catorcenal es el salario diario). */
  baseAplicada: number;
  renglon: RenglonTarifa | null;
  excedente: number;
  impuestoMarginal: number;
  /** Para catorcenal: 14; en los demás casos 1. */
  multiplicador: number;
}

export interface ResultadoSubsidio {
  aplica: boolean;
  subsidioMensual: number;
  subsidioPeriodo: number;
  limiteMensual: number;
  limitePeriodo: number;
  pctAplicado: number;
  umaMensual: number;
}

export interface CuotaRamo {
  patron: number;
  obrero: number;
}

export interface DesgloseIMSS {
  cuotaFija: CuotaRamo;
  excedente: CuotaRamo;
  prestacionesDinero: CuotaRamo;
  gastosMedicosPensionados: CuotaRamo;
  riesgoTrabajo: CuotaRamo;
  invalidezVida: CuotaRamo;
  guarderias: CuotaRamo;
  retiro: CuotaRamo;
  cesantiaVejez: CuotaRamo;
  infonavit: CuotaRamo;
  pctCesantiaPatron: number;
  etiquetaCesantia: string;
  primaRiesgoAplicada: number; // fracción
  baseExcedenteDiaria: number;
  totalImssPatron: number;
  totalImssObrero: number;
  totalInfonavit: number;
}

export type NivelAviso = 'info' | 'advertencia' | 'error';

export interface Aviso {
  nivel: NivelAviso;
  mensaje: string;
}

export interface Leyenda {
  ambito: 'ISR' | 'IMSS' | 'LFT' | 'Subsidio';
  titulo: string;
  texto: string;
  fundamento: string;
}

export interface ResultadoNomina {
  entrada: EntradaNomina;
  dias: number;
  uma: number;
  umaMensual: number;
  salarioMinimo: number;
  /** Cuota diaria exactamente igual al SM de la zona (± 1 centavo). */
  esSalarioMinimo: boolean;
  /** Sueldo ordinario del periodo (cuota diaria × días). */
  bruto: number;
  /** Tiempo extraordinario y días de descanso trabajados (LFT 66, 68, 73; LISR 93-I). */
  extras: ResultadoPercepcionesExtra;
  /** Sueldo + percepciones extra (total de percepciones del periodo). */
  totalPercepciones: number;
  /** Base gravable del periodo = sueldo + parte gravada de las percepciones extra. */
  baseGravable: number;
  sbc: ResultadoSBC;
  isr: ResultadoISR;
  subsidio: ResultadoSubsidio;
  /** Subsidio efectivamente acreditado = min(ISR antes de subsidio, subsidio del periodo). */
  subsidioAcreditado: number;
  isrRetenido: number;
  imss: DesgloseIMSS;
  /** Cuota obrera efectivamente retenida al trabajador (0 si es salario mínimo, art. 36 LSS). */
  imssObreroRetenido: number;
  /** Art. 36 LSS: cuota obrera que el patrón paga íntegramente cuando la cuota diaria es el SM. */
  cuotaObreraAbsorbida: number;
  totalDeducciones: number;
  neto: number;
  costoSocialPatron: number; // IMSS patrón + INFONAVIT + cuota obrera absorbida
  costoTotalEmpresa: number; // bruto + costo social patrón
  avisos: Aviso[];
  leyendas: Leyenda[];
}
