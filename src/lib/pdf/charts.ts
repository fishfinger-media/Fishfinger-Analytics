// Chart.js setup for PDF slide rendering.
// All charts use animation:false so they draw synchronously to canvas,
// allowing html2canvas to capture them immediately after construction.

import {
  Chart,
  LineController,
  BarController,
  PieController,
  DoughnutController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration,
} from 'chart.js';

// Register only what we use (keeps bundle lean)
Chart.register(
  LineController,
  BarController,
  PieController,
  DoughnutController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

// Disable ALL animations globally — charts draw synchronously on construction
Chart.defaults.animation = false as never;
Chart.defaults.animations = {};
Chart.defaults.transitions = {};

// Shared colour palettes — dark editorial theme
export const ACCENT = '#f59e0b';     // amber
export const ACCENT2 = '#60a5fa';    // sky blue
export const PALETTE = [
  '#f59e0b', // amber
  '#60a5fa', // sky
  '#34d399', // emerald
  '#a78bfa', // violet
  '#fb7185', // rose
  '#22d3ee', // cyan
  '#fb923c', // orange
  '#f472b6', // pink
  '#a3e635', // lime
  '#818cf8', // indigo
];

export function createChart(
  canvas: HTMLCanvasElement,
  config: ChartConfiguration
): Chart {
  return new Chart(canvas, config);
}

/** One double-rAF flush — ensures the browser has committed canvas pixels */
export function waitForRender(): Promise<void> {
  return new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}
