# Calculadora Nómina 2026 y Carga Social

Proyección de nómina para el ejercicio 2026 (México): ISR por salarios con las tarifas del Anexo 8 RMF 2026, subsidio para el empleo (Decreto DOF 31-12-2025), cuotas obrero-patronales IMSS e INFONAVIT (LSS con última reforma DOF 15-01-2026) y tiempo extraordinario conforme a la LFT reformada el 01-05-2026.

Elaborada para C.P. Daniel Souza. Reemplaza al archivo único `legacy/calculadora_n_mina_2026.tsx`, que se conserva sin cambios como referencia.

## Requisitos

- Node.js 18 o superior (probado con 22.20) y npm.

## Instalar, probar y ejecutar

```bash
npm install
```

```bash
npm test
```

```bash
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

Otros scripts: `npm run typecheck` (TypeScript estricto), `npm run build` (compila a `dist/`, incluye typecheck), `npm run preview` (sirve `dist/`), `npm run test:watch`.

## Qué calcula

| Bloque | Regla aplicada |
|---|---|
| Periodicidades | Semanal 7, catorcenal 14, quincenal 15 y mensual 30 días |
| Mes de cálculo | Enero 2026 (UMA 113.14, subsidio 15.59 %) o febrero–diciembre 2026 (UMA 117.31, subsidio 15.02 %) |
| Zona | SMG resto del país (315.04) o SMG ZLFN (440.87); sólo afecta el piso del SBC y la identificación del trabajador de salario mínimo |
| SBC | Cuota diaria × factor de integración (LFT 76/80/87) o SBC manual; piso SM, tope 25 UMA |
| ISR | Tarifa del Anexo 8 por periodicidad (B.II semanal, B.IV quincenal, B.V mensual; catorcenal = B.I diaria × 14). Sin retención a quien percibe únicamente el salario mínimo (art. 96 LISR) |
| Subsidio para el empleo | UMA mensual × 15.02 % (15.59 % en enero) ÷ 30.4 × días; límite de ingresos 11,492.66 mensuales prorrateado con 30.4; sólo se acredita contra ISR |
| Tiempo extra | Captura por semana: hasta 9 h dobles (art. 66), hasta 4 h más triples (art. 68), exceso marcado; descanso trabajado a salario doble (art. 73). Exención art. 93-I: 100 % para salario mínimo, 50 % con tope 5 UMA/semana para los demás |
| IMSS | Todas las ramas de la LSS; Cesantía y Vejez patronal con la columna 2026 del Transitorio Segundo (Decreto DOF 16-12-2020); art. 36 LSS: la cuota obrera del trabajador de salario mínimo la paga el patrón |
| INFONAVIT | 5 % sobre el SBC topado a 25 UMA |
| Precisión | El motor no redondea; la interfaz y el CSV muestran centavos |

### Herramientas (pestañas)

| Pestaña | Qué calcula | Fundamento |
|---|---|---|
| Nómina | ISR, subsidio, IMSS/INFONAVIT y tiempo extra del periodo | Anexo 8, Decreto subsidio, LSS, LFT |
| Aguinaldo / PTU | Aguinaldo, prima vacacional, PTU y prima dominical: parte exenta/gravada e ISR | LISR art. 93-XIV; RLISR art. 174 |
| Finiquito | Finiquito (partes proporcionales) y liquidación (3 meses + 20 días/año + prima de antigüedad) con ISR de separación | LFT arts. 48, 50, 162, 486; LISR arts. 93-XIII, 95 |
| ISR anual | Impuesto anual del ejercicio y saldo a favor o a cargo | LISR art. 152; tarifa anual derivada de B.V × 12 (pendiente de cotejo DOF) |
| SBC variable | Salario base de cotización con elementos variables o mixtos | LSS art. 30 |

Detalle de cada constante y su fundamento: [docs/FUENTES_NORMATIVAS.md](docs/FUENTES_NORMATIVAS.md). Sistema de diseño: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) y `docs/guia-estilo.html`. Copia del decreto de subsidio: `docs/fuentes/`.

## Estructura

```
src/
  motor/            TypeScript puro, sin React
    constantes2026.ts   UMA, SM, tarifas, subsidio, tasas LSS, CEAV 2026, LFT 2026, art. 93-I
    sbc.ts              factor de integración, piso y tope
    isr.ts              tarifas por periodicidad, exención art. 96
    subsidio.ts         Decreto DOF 31-12-2025
    percepcionesExtra.ts tiempo extra y descanso trabajado por semana
    imss.ts             cuotas por ramo, INFONAVIT
    salarioMinimo.ts    identificación del trabajador de salario mínimo
    nomina.ts           orquestador, validaciones, avisos y leyendas
    __tests__/          pruebas Vitest (tolerancia 0.01)
  ui/                 React + Tailwind (App, paneles, recibo, tabla, impresión)
  exportar/csv.ts     exportación CSV completa
legacy/               archivo original
docs/                 fuentes normativas y copia del decreto
```

## Cómo actualizar para 2027

Editar únicamente `src/motor/constantes2026.ts`:

1. `UMA_DIARIA`, `UMA_MENSUAL` (INEGI, enero) y `SALARIO_MINIMO` (CONASAMI, diciembre).
2. Tarifas del Anexo 8 de la RMF del ejercicio (`TARIFA_DIARIA`, `TARIFA_7_DIAS`, `TARIFA_15_DIAS`, `TARIFA_MENSUAL`).
3. `SUBSIDIO_EMPLEO` (porcentaje y límite si el Ejecutivo emite nuevo decreto).
4. `CEAV_PATRON_2026`: tomar la columna del año en el Transitorio Segundo del Decreto DOF 16-12-2020.
5. `LFT_2026`: jornada semanal y horas extra máximas según los Transitorios Segundo y Cuarto del Decreto DOF 01-05-2026 (2027: 46 h y 9 h).
6. Ajustar `VERSION_NORMATIVA` y actualizar los valores esperados de las pruebas.

## Alcance no cubierto

Crédito INFONAVIT del trabajador (descuento del acreditado), conciliación anual completa multi-ingreso, y exportación PDF/CSV de las pestañas distintas de Nómina (por ahora la exportación vive en la pestaña Nómina).

> La tarifa anual 2026 (art. 152) se deriva de la mensual B.V × 12 porque el rubro C.II del Anexo 8 se perdió en la conversión del corpus. Está marcada como pendiente de cotejo contra el DOF 28-12-2025.
