import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

interface ChartPanelProps {
  title: string;
  labels: string[];
  datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string }[];
}

export const ChartPanel: React.FC<ChartPanelProps> = ({ title, labels, datasets }) => {
  const data = useMemo(() => ({
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      tension: 0.35,
      pointRadius: 3,
      fill: 'start'
    }))
  }), [labels, datasets]);

  return (
    <section className="rounded-3xl bg-white/90 dark:bg-slate-800/80 p-4 shadow-md">
      <h3 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                usePointStyle: true
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              ticks: {
                autoSkip: true,
                maxTicksLimit: 6
              }
            },
            y: {
              beginAtZero: true
            }
          }
        }}
        className="h-56"
      />
    </section>
  );
};
