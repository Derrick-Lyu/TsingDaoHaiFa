import { useEffect, useState } from 'react'

type HealthScoreDonutProps = {
  size?: number
  score?: number
}

const SCORE_SEGMENTS = [
  { start: 0, end: 60, color: '#c0392b' },
  { start: 60, end: 80, color: '#e8a020' },
  { start: 80, end: 100, color: '#287a4a' },
]

export function HealthScoreDonut({ size = 100, score = 75 }: HealthScoreDonutProps) {
  const ringRadius = 42
  const ringCircumference = 2 * Math.PI * ringRadius
  const clampedScore = Math.max(0, Math.min(100, score))
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let rafId = 0
    let startTs = 0
    const from = animatedScore
    const to = clampedScore
    const duration = 700

    const tick = (ts: number) => {
      if (!startTs) {
        startTs = ts
      }

      const progress = Math.min((ts - startTs) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(from + (to - from) * eased)

      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick)
      }
    }

    rafId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [clampedScore])

  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r={ringRadius} fill="none" stroke="#edf1f5" strokeWidth="8"></circle>
      {SCORE_SEGMENTS.map((segment) => {
        const visibleEnd = Math.min(segment.end, animatedScore)
        if (visibleEnd <= segment.start) {
          return null
        }

        const segmentPercent = visibleEnd - segment.start
        const dashLength = (ringCircumference * segmentPercent) / 100
        const dashGap = ringCircumference - dashLength
        const dashOffset = ringCircumference * (1 - segment.start / 100)

        return (
          <circle
            key={`${segment.start}-${segment.end}`}
            cx="50"
            cy="50"
            r={ringRadius}
            fill="none"
            stroke={segment.color}
            strokeWidth="8"
            strokeDasharray={`${dashLength} ${dashGap}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            transform="rotate(-90 50 50)"
          ></circle>
        )
      })}
    </svg>
  )
}
