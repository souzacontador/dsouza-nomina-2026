/**
 * Design System DSouza — Calculadora Nómina 2026.
 * Paleta Refinada 2026 y escala tonal del manual de marca del despacho
 * (GUIA DE MARCA DSV + Diagnóstico Marca DSouza, 18-04-2026).
 * Ver docs/DESIGN_SYSTEM.md.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Azul Meridiano — jerarquía, estabilidad institucional, fondos oscuros.
        azul: {
          900: '#061423', 800: '#081D32', 700: '#09213A', 600: '#0A2540',
          500: '#364C62', 400: '#627385', 300: '#98A3AF', 200: '#C4CBD1', 100: '#EBEEF0',
        },
        // Cian Algorítmico — acento tecnológico, CTA, filetes, positivos técnicos.
        cian: {
          900: '#006577', 800: '#0090A9', 700: '#00A6C3', 600: '#00B8D9',
          500: '#2EC5E0', 400: '#5CD2E7', 300: '#94E1EF', 200: '#C2EEF6', 100: '#EBF9FC',
        },
        // Acento Algorítmico — detalles, grafo fiscal, realces suaves.
        acento: {
          900: '#435C8C', 800: '#5F82C7', 700: '#6E96E6', 600: '#7AA7FF',
          500: '#92B7FF', 400: '#AAC7FF', 300: '#C7DAFF', 200: '#DFEAFF', 100: '#F4F8FF',
        },
        // Ámbar Conversión — EXCLUSIVO para advertencias, montos críticos y urgencia.
        ambar: {
          900: '#875B13', 800: '#BF811B', 700: '#DC9520', 600: '#F5A623',
          500: '#F7B64B', 400: '#F9C672', 300: '#FBDAA3', 200: '#FDEACA', 100: '#FEF8ED',
        },
        gris: { DEFAULT: '#999999' },
        neutro: { hueso: '#F7F5F1', arena: '#EDE9E2', niebla: '#DCE3EA', grafito: '#3A4652' },
        // Complementarios semánticos (armónicos con la marca, uso funcional).
        positivo: { 700: '#0B6B58', 600: '#0E7C66', 100: '#E3F3EE' },
        negativo: { 700: '#A83228', 600: '#C0392B', 100: '#FBEAE8' },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"IBM Plex Sans"', 'Calibri', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Cascadia Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
