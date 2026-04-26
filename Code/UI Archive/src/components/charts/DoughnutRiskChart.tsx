import { useMemo } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { BaseChart } from './BaseChart'

type DoughnutRiskChartProps = {
  labels: string[]
  values: number[]
  colors: string[]
}

export function DoughnutRiskChart({ labels, values, colors }: DoughnutRiskChartProps) {
  const config = useMemo<ChartConfiguration<'doughnut'>>(
    () => ({
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
        },
      },
    }),
    [colors, labels, values],
  )

  return <BaseChart config={config} />
}
