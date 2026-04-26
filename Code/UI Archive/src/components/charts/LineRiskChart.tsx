import { useMemo } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { BaseChart } from './BaseChart'

type LineRiskChartProps = {
  labels: string[]
  values: number[]
  label: string
  color: string
}

export function LineRiskChart({ labels, values, label, color }: LineRiskChartProps) {
  const config = useMemo<ChartConfiguration<'line'>>(
    () => ({
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data: values,
            borderColor: color,
            backgroundColor: `${color}33`,
            fill: true,
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b84a0', font: { size: 10 } },
          },
          y: {
            grid: { color: '#edf1f5' },
            ticks: { color: '#94a8bc', font: { size: 10 } },
          },
        },
      },
    }),
    [color, label, labels, values],
  )

  return <BaseChart config={config} />
}
