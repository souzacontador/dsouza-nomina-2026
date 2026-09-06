# Design System local — Calculadora Nómina 2026 y Carga Social

Sistema de diseño para la calculadora de nómina de **DSouza Consultores Fiscales**. Proyecta autoridad técnica y estabilidad institucional (Inteligencia Fiscal Preventiva) frente a firmas grandes, y es legible tanto para contadores como para empresarios.

- **Fuente de identidad:** manual de marca DSouza (GUIA DE MARCA DSV + Diagnóstico Marca DSouza, 18-04-2026).
- **Paleta:** Refinada 2026 (default del manual). La Guía DSV original `#003366 / #0099CC` queda como alternativa sancionada.
- **Implementación:** tokens en `tailwind.config.js` y `src/index.css`; identidad en `src/ui/marca.ts`.

---

## 1. Principios

1. **Jerarquía por profundidad de azul, no por saturación.** El azul meridiano estructura; el cian marca lo accionable y lo tecnológico. No se mezclan colores ajenos a la marca.
2. **Cifra siempre en monoespaciada tabular.** Todo importe usa IBM Plex Mono con `tabular-nums` para que las columnas de pesos alineen. Ningún dato financiero va en la sans.
3. **Legibilidad a un brazo de distancia.** Cuerpo mínimo 16 px en móvil (público del despacho mayor de 50 años), interlineado 1.5.
4. **El ámbar es exclusivo de alertas.** Nunca decorativo: solo advertencias, montos topados o incumplimientos.
5. **Todo cálculo lleva su fundamento.** Cada resultado se acompaña de artículo/DOF; la leyenda legal y la atribución son obligatorias en pantalla, impresión y CSV.

---

## 2. Paleta (Refinada 2026)

### Colores de marca

| Rol | Nombre | Base | Uso |
|---|---|---|---|
| Jerarquía / estabilidad | Azul Meridiano | `#0A2540` (azul-600) | Encabezados, superficies oscuras, cifra neta, totales |
| Acento tecnológico / CTA | Cian Algorítmico | `#00B8D9` (cian-600) | Botón primario, filetes, íconos, positivos técnicos, foco |
| Detalle / grafo fiscal | Acento Algorítmico | `#7AA7FF` (acento-600) | Tiempo extra, realces suaves, INFONAVIT |
| Texto secundario / pies | Gris Analítico | `#999999` (gris) | Notas, pies; **nunca** cuerpo de texto |
| Alerta / urgencia | Ámbar Conversión | `#F5A623` (ambar-600) | Advertencias, SBC topado, horas ilegales |

### Escala tonal (100 claro → 900 oscuro)

Cada escala es el mismo color a distinta profundidad (mezcla con blanco o negro), disponible como utilidades Tailwind `azul-{100..900}`, `cian-{100..900}`, `acento-{100..900}`, `ambar-{100..900}`.

```
azul   900 #061423  800 #081D32  700 #09213A  600 #0A2540  500 #364C62  400 #627385  300 #98A3AF  200 #C4CBD1  100 #EBEEF0
cian   900 #006577  800 #0090A9  700 #00A6C3  600 #00B8D9  500 #2EC5E0  400 #5CD2E7  300 #94E1EF  200 #C2EEF6  100 #EBF9FC
acento 900 #435C8C  800 #5F82C7  700 #6E96E6  600 #7AA7FF  500 #92B7FF  400 #AAC7FF  300 #C7DAFF  200 #DFEAFF  100 #F4F8FF
ambar  900 #875B13  800 #BF811B  700 #DC9520  600 #F5A623  500 #F7B64B  400 #F9C672  300 #FBDAA3  200 #FDEACA  100 #FEF8ED
```

### Neutros y complementarios semánticos

| Token | Hex | Uso |
|---|---|---|
| `neutro-hueso` | `#F7F5F1` | Lienzo de lectura (fondo de la app) |
| `neutro-arena` | `#EDE9E2` | Divisores suaves, filas alternas |
| `neutro-niebla` | `#DCE3EA` | Bordes de tarjetas y tablas |
| `neutro-grafito` | `#3A4652` | Texto de cuerpo secundario |
| `positivo-600` | `#0E7C66` | Exento, subsidio, neto, cuota absorbida (art. 36) |
| `negativo-600` | `#C0392B` | ISR retenido, IMSS obrero, deducciones |

Los complementarios se usan **solo** para semántica de signo (ingreso/deducción); son tonos armónicos con la marca, no colores nuevos de identidad.

### Contraste

Cuerpo ≥ 4.5:1, titulares ≥ 3:1 (WCAG). Texto sobre azul-600: blanco o azul-200; nunca azul-300 o más claro en tamaños pequeños. Sobre cian-600 el texto va en **azul-900** (7.8:1), nunca blanco (2.4:1, insuficiente).

**Excepción conocida:** el Gris Analítico `#999999` sobre hueso da 2.6:1 y no alcanza el umbral de cuerpo. El manual lo reserva para pies y notas menores; para texto de nota que deba cumplir accesibilidad, usar `neutro-grafito` (#3A4652, 8.9:1) en lugar de gris.

---

## 3. Tipografía

| Familia | Rol | Aplicación |
|---|---|---|
| **Source Serif 4** (400/600/700) | Títulos | `<h1>`–`<h3>`, encabezados de tarjeta y de sección. Autoridad editorial. |
| **IBM Plex Sans** (400/500/600/700) | Cuerpo | Etiquetas, párrafos, controles. Sans humanista con señal tecnológica. |
| **IBM Plex Mono** (400/600) | Datos | Importes, porcentajes, factores, folios. Siempre con `tabular-nums`. |

Fuentes empaquetadas localmente en `src/assets/fonts/` (`.woff2`, `font-display: swap`). Utilidades: `font-serif`, `font-sans`, `font-mono`, `.tabular`.

Sustitución del usuario (Times New Roman / Arial-Calibri): se documentó y se sustituyó por las fuentes de marca por decisión del 06-09-2026; los stacks de respaldo conservan Calibri/Arial y Georgia por si faltan las woff2.

### Escala tipográfica

| Nivel | Tamaño | Peso / familia |
|---|---|---|
| Título de app | 28 px (móvil 24) | 700 serif |
| Título de sección | 18 px | 700 serif |
| Título de tarjeta | 16 px | 700 serif |
| Cuerpo | 16 px | 400 sans |
| Etiqueta / nota | 12–13 px | 400–600 sans |
| Pie / gris | 10–11 px | 400 sans |
| Cifra destacada (neto) | 48 px | 700 mono |
| Cifra en tablas | 12–14 px | 400/600 mono |

---

## 4. Estructura de contenedores

```
┌ Header institucional ─ isotipo en caja azul · título serif · badge "Inteligencia Fiscal Preventiva" · [PDF] [Excel]
│
├ Grid 12 columnas ─────────────────────────────────────────────
│  ┌ Entrada (col-span-5) ───────┐   ┌ Resultado (col-span-7) ──────┐
│  │ Datos generales (filete cian)│   │ Avisos (si hay)              │
│  │ Variables IMSS (filete azul) │   │ Recibo — cabecera azul + neto│
│  │ Tiempo extra (filete acento) │   │ Desglose ISR (acordeón cian) │
│  └──────────────────────────────┘   │ Leyendas normativas          │
│                                       │ Disclaimer legal             │
│                                       └──────────────────────────────┘
│
├ Costo social — banda azul plegable + tabla obrero-patronal
│
└ Footer institucional ─ isotipo · despacho · atribución obligatoria
```

**Tarjetas de entrada:** fondo blanco, borde `neutro-niebla`, radio 16 px (`rounded-2xl`), filete vertical de 6 px que codifica el bloque (cian = datos, azul = IMSS, acento = tiempo extra). Título serif con ícono en el color del filete.

**Recibo:** cabecera `azul-600` con el neto en mono 48 px y badges de estado (salario mínimo, sin retención, subsidio). Cuerpo con secciones Percepciones / Deducciones y pie de total en `neutro-hueso`.

**Tabla de costo social:** encabezado `neutro-hueso`, filas con filete izquierdo de color por naturaleza del ramo (ámbar = riesgo, cian = RCV, acento = INFONAVIT, positivo = cuota absorbida art. 36), fila total en `azul-600`. Una sola fuente de datos (`filasCostoSocial`) alimenta app, impresión y CSV.

---

## 5. Componentes y estados

| Componente | Reposo | Hover | Foco | Activo/seleccionado |
|---|---|---|---|---|
| Botón primario (PDF) | `azul-600` texto blanco | `azul-700` | anillo `azul-400` | — |
| Botón tecnológico (Excel/CTA) | `cian-600` texto blanco | `cian-700` | anillo `cian-400` | — |
| Toggle (zona, modo SBC) | blanco, borde niebla, texto gris | `neutro-hueso` | anillo cian | `azul-600`/`cian-600` texto blanco + anillo |
| Input numérico | borde niebla | — | anillo `cian-500` + borde cian | valor en mono tabular |
| Acordeón | banda color | tinte más claro | anillo interno | ícono chevron rota |

**Semáforo de avisos:** error `negativo-100`, advertencia `ambar-100`, info `cian-100`, cada uno con ícono y borde propios.

**Leyendas normativas:** tarjeta blanca con filete izquierdo por ámbito (ISR rojo, IMSS azul, LFT acento, Subsidio cian), rótulo de ámbito + título + texto + fundamento en itálica.

---

## 6. Comportamiento responsivo

| Rango | Layout |
|---|---|
| **Móvil** < 640 px | Una columna; isotipo del header oculto (ícono calculadora en su lugar); botones full width apilables; tabla de costo social con `overflow-x: auto`; cifra neta reduce a 40 px. |
| **Tablet** 640–1024 px | Header en fila; tarjetas a una columna, resultado debajo de la entrada. |
| **Escritorio** ≥ 1024 px | Grid 12: entrada `col-span-5`, resultado `col-span-7`; contenedor `max-w-6xl` centrado. |

Reglas: unidades relativas, `max-width: 100%` en imágenes, ninguna tabla desborda el cuerpo (scroll propio). Piso de 16 px en controles para evitar zoom automático en iOS.

---

## 7. Impresión (PDF / Carta vertical)

- Hoja blanca `21.59 cm`, márgenes `0.8 cm`, `print-color-adjust: exact`.
- Encabezado: isotipo en caja azul + título serif + datos del profesional; filete inferior `azul-600` de 2 px.
- Bloques: parámetros, liquidación al trabajador (percepciones vs deducciones), tabla de costo social compacta, leyendas.
- Cierre obligatorio: costo total empresa, **leyenda legal**, fuentes normativas plegables y **pie con isotipo + atribución**.
- La barra de herramientas (`.no-print`) desaparece al imprimir.

---

## 8. Contenido institucional obligatorio

- **Leyenda legal** (en app, impresión y CSV):
  > Los resultados son estimativos e informativos. No sustituyen asesoría profesional ni una determinación fiscal definitiva. Verifique la información y la normativa vigente antes de presentar declaraciones o realizar pagos.
- **Atribución de pie:**
  > Elaborado por C.P. Daniel Souza Vázquez | daniel@dsouzaconsultores.mx
- **Reglas de marca:** correo institucional siempre; nunca el hotmail en piezas públicas; isotipo sobre fondo oscuro dentro de caja de protección; no rotar, deformar ni aplicar efectos al logo.

Ambos textos viven en `src/ui/marca.ts` (fuente única).

---

## 9. Tokens de referencia rápida

```css
--ds-fondo:            #F7F5F1;  /* neutro hueso */
--ds-superficie:       #FFFFFF;
--ds-borde:            #DCE3EA;  /* neutro niebla */
--ds-jerarquia:        #0A2540;  /* azul meridiano */
--ds-tecnologico:      #00B8D9;  /* cian algorítmico */
--ds-texto:            #0A2540;
--ds-texto-secundario: #3A4652;  /* grafito */
--ds-texto-tenue:      #999999;  /* gris analítico — solo pies */
```

Guía interactiva de estilo: `docs/guia-estilo.html` (abrir en el navegador; se puede compartir por enlace).
