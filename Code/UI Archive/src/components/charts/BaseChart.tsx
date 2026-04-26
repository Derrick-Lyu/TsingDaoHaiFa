import { useEffect, useRef } from 'react'
import { Chart as ChartJS, registerables, type ChartConfiguration } from 'chart.js'

ChartJS.register(...registerables)

type BaseChartProps = {
  config: ChartConfiguration
  className?: string
}

export function BaseChart({ config, className }: BaseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<ChartJS | null>(null)

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }

    chartRef.current?.destroy()
    chartRef.current = new ChartJS(canvasRef.current, config)

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [config])

  return <canvas ref={canvasRef} className={className} />
}
