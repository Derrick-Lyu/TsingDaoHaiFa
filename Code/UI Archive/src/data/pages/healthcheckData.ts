export type HealthDimension = {
  id: string
  name: string
  color: string
  weight: number
  defaultWeight: number
  score: number
}

export const HEALTH_DEFAULT_DIMENSIONS: HealthDimension[] = [
  { id: 'governance', name: '合规与治理', color: '#1a3f6f', weight: 38, defaultWeight: 38, score: 77 },
  { id: 'finance', name: '十大重点领域健康', color: '#287a4a', weight: 45, defaultWeight: 45, score: 48 },
  { id: 'disposal', name: '风险处置效率', color: '#c8870e', weight: 37, defaultWeight: 37, score: 27 },
  { id: 'coverage', name: '穿透覆盖度', color: '#6c4faa', weight: 40, defaultWeight: 40, score: 88 },
  { id: 'exposure', name: '重大风险暴露', color: '#c0392b', weight: 15, defaultWeight: 15, score: 0 },
]

export const HEALTH_VETO_ITEMS = [
  { label: '3件重大风险未处置', deduction: 6 },
  { label: '处置率低于目标', deduction: 3 },
]

export const HEALTH_VETO_TOTAL = HEALTH_VETO_ITEMS.reduce((sum, item) => sum + item.deduction, 0)
