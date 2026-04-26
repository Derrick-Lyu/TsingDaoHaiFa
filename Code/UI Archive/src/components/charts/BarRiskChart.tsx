import { useMemo } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { BaseChart } from './BaseChart'

type BarRiskChartProps = {
  labels: string[]
  values: number[]
  color: string
}

export function BarRiskChart({ labels, values, color }: BarRiskChartProps) {
  const config = useMemo<ChartConfiguration<'bar'>>(
    () => ({
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: color,
            borderRadius: 4,
            barThickness: 14,
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
    [color, labels, values],
  )

  return <BaseChart config={config} />
}
