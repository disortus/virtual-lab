import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, Filler);

export function ScientificChart({ title, xLabel, yLabel, datasets, caption }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = canvas.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: datasets.map((ds) => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color || '#315BE8',
          backgroundColor: ds.fillColor || 'rgba(49, 91, 232, 0.08)',
          borderWidth: ds.borderWidth ?? 2.2,
          borderDash: ds.dashed ? [5, 4] : undefined,
          pointRadius: ds.pointRadius ?? 0,
          pointHoverRadius: 5,
          fill: Boolean(ds.fill),
          tension: ds.tension ?? 0.2,
          showLine: ds.showLine !== undefined ? ds.showLine : true,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
          mode: 'nearest',
          intersect: false,
        },
        plugins: {
          legend: {
            display: datasets.length > 1,
            labels: {
              color: '#17212B',
              boxWidth: 14,
              font: { family: "'IBM Plex Mono', monospace", size: 11 },
            },
          },
          title: {
            display: Boolean(title),
            text: title,
            align: 'start',
            color: '#17212B',
            font: { family: "'Space Grotesk', sans-serif", size: 13, weight: '600' },
            padding: { bottom: 10 },
          },
          tooltip: {
            backgroundColor: '#17212B',
            titleFont: { family: "'IBM Plex Mono', monospace", size: 11 },
            bodyFont: { family: "'IBM Plex Mono', monospace", size: 11 },
          },
        },
        scales: {
          x: {
            type: 'linear',
            title: {
              display: Boolean(xLabel),
              text: xLabel,
              color: '#505862',
              font: { family: "'IBM Plex Mono', monospace", size: 11 },
            },
            ticks: {
              color: '#505862',
              font: { family: "'IBM Plex Mono', monospace", size: 11 },
            },
            grid: { color: 'rgba(23, 33, 43, 0.08)' },
          },
          y: {
            type: 'linear',
            beginAtZero: true,
            title: {
              display: Boolean(yLabel),
              text: yLabel,
              color: '#505862',
              font: { family: "'IBM Plex Mono', monospace", size: 11 },
            },
            ticks: {
              color: '#505862',
              font: { family: "'IBM Plex Mono', monospace", size: 11 },
            },
            grid: { color: 'rgba(23, 33, 43, 0.08)' },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [title, xLabel, yLabel, datasets]);

  return (
    <figure style={{ margin: 0 }}>
      <div style={{ position: 'relative', height: '240px', width: '100%' }}>
        <canvas ref={canvasRef} role="img" aria-label={title || 'Научный график эксперимента'} />
      </div>
      {caption ? (
        <figcaption className="eyebrow" style={{ marginTop: '0.5rem' }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
