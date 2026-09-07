# Fuentes normativas — Calculadora Nómina 2026 y Carga Social

Versión normativa: **Ejercicio 2026 · corte 06-09-2026**. Toda constante del motor (`src/motor/constantes2026.ts`) se verificó contra los archivos indicados. Corpus canónico del despacho: `DSOUZAFISCAL/01 CONOCIMIENTOS/` y `DSOUZA SEGURIDAD SOCIAL MX/RAG/`. Donde el corpus no contenía la disposición se indica la fuente alterna y su nivel de certeza.

## 1. Valores 2026

| Constante | Valor | Fundamento | Verificado en |
|---|---|---|---|
| UMA diaria feb–dic 2026 | 117.31 | INEGI, DOF 09-01-2026 (vigente 01-feb-2026 a 31-ene-2027) | `RAG/Valores_Fiscales_2026_UMA_SM_INPC_Recargos_llm.md`; tabla UMA aportada por el usuario (06-09-2026) |
| UMA diaria enero 2026 | 113.14 | INEGI, DOF 10-01-2025 (UMA 2025 rige hasta 31-ene-2026; art. 5 Ley UMA) | ídem |
| UMA mensual | 3,566.22 / 3,439.46 | UMA diaria × 30.4 (art. 26-B CPEUM, Ley UMA) | ídem |
| SM general 2026 | 315.04 | CONASAMI, DOF 19-12-2025 | ídem |
| SM ZLFN 2026 | 440.87 | CONASAMI, DOF 19-12-2025 | ídem |

## 2. ISR — retención por salarios

| Elemento | Fundamento | Verificado en |
|---|---|---|
| Procedimiento de retención mensual; sin retención a quien perciba únicamente SM | LISR art. 96, párr. 1 | `01 CONOCIMIENTOS/LISR_01_claude_llm.md` |
| Opción de tarifas por periodo (7, 10, 15 días) y en días | RLISR arts. 175 y 176; regla 3.12.2 RMF 2026 | `Reg_LISR_060516_claude_llm.md`; `RMF2026_T03_Cap3.12_..._llm.md` |
| Tarifa B.I (días), B.II (7 días), B.IV (15 días) | Anexo 8 RMF 2026, DOF 28-12-2025 | `Anexo-8-RMF-2026_DOF-28122025_claude_llm.md` |
| Tarifa B.V (mensual) | Anexo 8 RMF 2026, DOF 28-12-2025 | ⚠ El `.md` del Anexo 8 en `DSOUZAFISCAL` perdió la tabla de la fracción V en la conversión y `LISR_01` perdió la tarifa del art. 96. Se verificó en `AUDITOR CFDI NOMINAS 2026/RAG CFDI NOMINA/Tarifas_ISR_Anexo8_2026.md` y en los PDF Fiscalia aportados por el usuario (`2026 ACTUALIDADES/INDICADORES ECONOMICOS/Tabla {Mensual,Quincenal,Semanal} Salarios 2026.pdf`). Pendiente: reparar el corpus. |
| Catorcenal (14 días): tarifa en días × 14 | RLISR art. 175 (no existe tabla de 14 días en el Anexo 8) | criterio del despacho |
| Exención de tiempo extra y descanso trabajado | LISR art. 93, fracciones I y II | `LISR_01_claude_llm.md` |
| Tope de 5 veces por semana leído en UMA | Desindexación del SM (CPEUM, Transitorio DOF 27-01-2016) | criterio del despacho (decisión 06-09-2026) |

Los PDF Fiscalia traen renglones de subsidio obsoletos (enero 10,171 → 474.64; feb–dic vacío; tabla 2013 derogada). No se usan.

## 3. Subsidio para el empleo

| Elemento | Valor 2026 | Fundamento | Verificado en |
|---|---|---|---|
| Porcentaje feb–dic | 15.02 % de la UMA mensual → 535.65 | Decreto DOF 31-12-2025, Artículo Segundo (reforma al Decreto DOF 01-05-2024, modificado DOF 31-12-2024) | `docs/fuentes/Decreto_Subsidio_Empleo_DOF-31122025.md` (copia de `2026 ACTUALIDADES/SAT/MD/`); Minuta 1ª Reunión Síndicos 2026 |
| Porcentaje enero 2026 | 15.59 % de la UMA mensual 2025 → 536.21 | Transitorio Segundo del mismo Decreto | ídem |
| Límite de ingresos mensuales | 11,492.66 | Artículo Segundo, párr. 1 | ídem |
| Prorrateo de periodos menores a un mes | monto mensual ÷ 30.4 × días; nunca mayor al mensual | Artículo Segundo, párrs. 3 y 4 | ídem |
| Límite del periodo | 11,492.66 ÷ 30.4 × días | criterio del despacho, consistente con el divisor del Decreto | decisión 06-09-2026 |

El considerando del Decreto menciona $536.22; prevalece la fórmula operativa del Artículo Segundo (3,566.22 × 15.02 % = 535.65). El subsidio sólo se acredita contra el ISR; no se entrega en efectivo.

## 4. IMSS — Ley del Seguro Social (última reforma DOF 15-01-2026)

| Ramo | Tasa | Fundamento | Verificado en |
|---|---|---|---|
| Piso y tope del SBC | SM del área / 25 UMA | LSS art. 28; Transitorio Vigésimo Quinto (DOF 21-12-1995); desindexación | `RAG/LSS_2026_vigente_llm.md` |
| EyM cuota fija | 20.40 % UMA, patrón | Art. 106-I (13.9 %) + Transitorio Décimo Noveno (+0.65 × 10) | ídem |
| EyM excedente 3 UMA | 1.10 % / 0.40 % | Art. 106-II (6 % / 2 %) + Transitorio Décimo Noveno (−0.49 y −0.16 × 10) | ídem |
| EyM prestaciones en dinero | 0.70 % / 0.25 % | Art. 107 | ídem |
| Gastos médicos pensionados | 1.05 % / 0.375 % | Art. 25, párr. 2 | ídem |
| Invalidez y vida | 1.75 % / 0.625 % | Art. 147 | ídem |
| Guarderías y prestaciones sociales | 1.00 % patrón | Arts. 211 y 212 | ídem |
| Retiro | 2.00 % patrón | Art. 168-I | ídem |
| Cesantía y vejez obrero | 1.125 % | Art. 168-II-b | ídem |
| Cesantía y vejez patrón (columna 2026) | 3.150 % (SBC = 1 SM); 3.676 / 4.851 / 5.556 / 6.026 / 6.361 / 6.613 / 7.513 % por rangos en UMA | Art. 168-II-a y Transitorio Segundo del Decreto DOF 16-12-2020 | ídem (tabla gradual 2023-2030) |
| Riesgo de trabajo | prima mín. 0.5 %, máx. 15 %; media clase I 0.54355 % | Arts. 73 y 74 | ídem |
| Cuota obrera del trabajador de salario mínimo a cargo del patrón | — | Art. 36 | ídem |
| Tiempo extra dentro de márgenes LFT no integra SBC | — | Art. 27-IX | ídem |

Criterio CEAV (decisión 06-09-2026): el SBC integrado se clasifica en veces UMA; el renglón "1.00 SM" aplica sólo cuando el SBC es exactamente el salario mínimo.

## 5. INFONAVIT

| Elemento | Fundamento | Verificado en |
|---|---|---|
| Aportación patronal 5 % sobre el salario; base y límite superior conforme a la LSS (25 UMA) | Ley INFONAVIT art. 29-II; Transitorio Quinto (1997) | `RAG/LEY INFONAVIT 2026_claude_llm.md` |

## 6. LFT 2026 (reforma DOF 01-05-2026, ref. 52)

| Elemento | Valor 2026 | Fundamento | Verificado en |
|---|---|---|---|
| Jornada semanal máxima | 48 h | Art. 59 + Transitorio Segundo (40 h en 2030) | `RAG/LFT_2026_vigente_llm.md`; `RAG/2026-05-01_DOF_DECRETO_Reduccion_Jornada_Laboral_LFT_ref52.md` |
| Jornada diaria | 8 / 7.5 / 7 h (diurna / mixta / nocturna) | Art. 61 | ídem |
| Horas extra al 100 % más | máx. 9 h/semana en 2026 | Art. 66 + Transitorio Cuarto | ídem |
| Horas extra al 200 % más | hasta 4 h/semana adicionales | Art. 68 | ídem |
| Descanso semanal | 1 por cada 6 días | Art. 69 | ídem |
| Descanso trabajado sin sustitución | salario doble adicional | Art. 73 | ídem |
| Salario nunca menor al mínimo | — | Arts. 85 y 90 | ídem |
| Factores de integración | 1.0493 … 1.0630 | Arts. 76 (reforma DOF 27-12-2022), 80 y 87 | ídem |

Criterio (decisión 06-09-2026): sólo las horas del art. 66 (9 h/semana) están "dentro del límite" para la exención del art. 93-I LISR; las del art. 68 gravan al 100 % y generan aviso; más de 13 h/semana se marca como posible incumplimiento.

## 7. Conceptos especiales, separación e ISR anual

| Elemento | Fundamento | Verificado en |
|---|---|---|
| Exención aguinaldo 30 UMA, prima vacacional 15 UMA, PTU 15 UMA, prima dominical 1 UMA/domingo | LISR art. 93, fracción XIV | `LISR_01_claude_llm.md` |
| Exención separación 90 UMA por año (fracción >6 meses = año) | LISR art. 93, fracción XIII | ídem |
| Método de retención de aguinaldo/PTU/primas | RLISR art. 174 | `Reg_LISR_060516_claude_llm.md` |
| ISR de separación (último sueldo mensual ordinario) | LISR art. 95 (proxy mensual con art. 96) | `LISR_01_claude_llm.md` |
| Aguinaldo 15 días; prima vacacional 25 % | LFT arts. 87 y 80 | `LFT_2026_vigente_llm.md` |
| Indemnización 3 meses + 20 días/año | LFT arts. 48 y 50 | ídem |
| Prima de antigüedad 12 días/año, tope 2 SM | LFT arts. 162 y 486 | ídem |
| SBC variable/mixto (promedio bimestre ÷ días devengados) | LSS art. 30 fracciones I-III | `LSS_2026_vigente_llm.md` |
| Tarifa anual (art. 152) | Anexo 8 rubro C.II | ✅ Verificada 06-09-2026 con el PDF oficial de la tarifa anual 2026 aportado por el usuario (`2026 ACTUALIDADES/HERRAMIENTAS/Tabla Anual 2026.xls`). Se transcribió a `TARIFA_ANUAL` (`TARIFA_ANUAL_VERIFICADA = true`) y se repuso en el corpus. No coincide con B.V × 12 (difiere por centavos). |

Criterio (06-09-2026): las exenciones del art. 93 se leen en UMA por la desindexación del salario mínimo. El ISR de separación usa el proxy mensual del art. 96 sobre el último sueldo mensual ordinario (= cuota diaria × 30.4), práctica estándar de retención en finiquito; el art. 95 estricto es anual.

## 8. Hallazgos colaterales fuera de alcance de esta app

- ✅ Corregido 06-09-2026 en `DSOUZAFISCAL/01 CONOCIMIENTOS/`: repuesta la tabla V del Anexo 8 y la tarifa del art. 96 en `LISR_01`; marcada la anual C.II faltante; incorporado el Decreto de subsidio DOF 31-12-2025; registrado en `CHANGELOG.md` (commit 9e097b1).
- ✅ Corregido 06-09-2026 en la skill `calculadora-nomina-mx`: UMA feb–dic 117.31 (antes 117.75), tope INFONAVIT 25 UMA (antes 10), tabla CEAV columna 2026 (antes 2023 con rango "4.51–5.00" inexistente).
- ✅ Cerrado 06-09-2026: la tarifa anual 2026 (rubro C.II) fue cotejada con el PDF oficial que aportó el usuario, transcrita a `TARIFA_ANUAL` y repuesta en el corpus.
