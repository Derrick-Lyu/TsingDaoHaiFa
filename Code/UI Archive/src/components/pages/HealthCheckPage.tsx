import { type CSSProperties, useMemo, useState } from 'react'
import { HealthScoreDonut } from '../charts/HealthScoreDonut'
import type { PortalPage } from '../../data/shared/navigationData'
import {
  HEALTH_DEFAULT_DIMENSIONS,
  HEALTH_VETO_ITEMS,
  HEALTH_VETO_TOTAL,
  type HealthDimension,
} from '../../data/pages/healthcheckData'

type HealthCheckPageProps = {
  onNavigate?: (page: PortalPage, prompt?: string) => void
  onPrompt?: (text: string) => void
  healthScore: number
  healthStatusText: string
  healthStatusColor: string
  dimensions: HealthDimension[]
  onDimensionsChange: (dimensions: HealthDimension[]) => void
}


function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function HealthCheckPage({
  onNavigate,
  onPrompt,
  healthScore,
  healthStatusText,
  healthStatusColor,
  dimensions,
  onDimensionsChange,
}: HealthCheckPageProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(HEALTH_DEFAULT_DIMENSIONS.map((dim) => [dim.id, false])),
  )

  const weightTotal = useMemo(() => dimensions.reduce((sum, dim) => sum + dim.weight, 0), [dimensions])

  // const ghiResult = useMemo(() => {
  //   const weighted = dimensions.reduce((sum, dim) => sum + dim.score * (dim.weight / 100), 0)
  //   const raw = Math.round(weighted)
  //   const final = clamp(Math.round(weighted - HEALTH_VETO_TOTAL), 0, 100)
  //   return { raw, final }
  // }, [dimensions])

  const updateWeight = (dimensionId: string, value: number) => {
    const next = clamp(Math.round(value), 0, 50)
    onDimensionsChange(dimensions.map((dim) => (dim.id === dimensionId ? { ...dim, weight: next } : dim)))
  }

  const resetWeights = () => {
    onDimensionsChange(dimensions.map((dim) => ({ ...dim, weight: dim.defaultWeight })))
  }

  const toggleSection = (dimensionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [dimensionId]: !prev[dimensionId],
    }))
  }

  const pointerLeft = `${clamp(healthScore, 0, 100)}%`

  return (
    <div className="ghi-layout">
      <div className="ghi-score-panel">
        <div style={{ fontSize: 14, color: '#6b84a0', textAlign: 'center', marginBottom: 8 }}>穿透监管健康指数</div>
        <div className="ghi-ring-wrap">
          <HealthScoreDonut score={healthScore} />
          <div className="ghi-score-center">
            <div className="ghi-score-big" style={{ color: healthStatusColor }}>
              {healthScore}
            </div>
            <div className="ghi-score-label">/ 100 分</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span className="ghi-grade" style={{ color: healthStatusColor, borderColor: `${healthStatusColor}55` }}>
            {healthStatusText}
          </span>
        </div>

        <div style={{ position: 'relative', marginBottom: 4 }}>
          <div className="ghi-scale">
            <div className="ghi-scale-seg" style={{ width: '60%', background: '#c0392b' }}></div>
            <div className="ghi-scale-seg" style={{ width: '20%', background: '#e8a020' }}></div>
            <div className="ghi-scale-seg" style={{ width: '20%', background: '#287a4a' }}></div>
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              width: 3,
              height: 5,
              background: '#1a2a3a',
              borderRadius: 1,
              transform: 'translateX(-50%)',
              transition: 'left .3s',
              left: pointerLeft,
            }}
          ></div>
        </div>
        <div
          style={{
            position: 'relative',
            height: 12,
            fontSize: 11,
            color: '#94a8bc',
            marginBottom: 12,
          }}
        >
          <span style={{ position: 'absolute', left: 0 }}>危险</span>
          <span style={{ position: 'absolute', left: '70%', transform: 'translateX(-50%)' }}>预警</span>
          <span style={{ position: 'absolute', right: 0 }}>健康</span>
        </div>

        <div className="ghi-dim-breakdown">
          <div style={{ fontSize: 13, color: '#2a3d50', fontWeight: 500, marginBottom: 4 }}>五维度得分拆解</div>
          {dimensions.map((dim) => (
            <div className="ghi-dim-row" key={dim.id}>
              <div className="ghi-dim-dot" style={{ background: dim.color }}></div>
              <div className="ghi-dim-name">{dim.name}</div>
              <div className="ghi-dim-bar">
                <div className="ghi-dim-fill" style={{ background: dim.color, width: `${dim.score}%` }}></div>
              </div>
              <div className="ghi-dim-score" style={{ color: dim.color }}>
                {dim.score}
              </div>
            </div>
          ))}
        </div>

        <div className="ghi-veto">
          <div className="ghi-veto-title">一票否决项扣分</div>
          {HEALTH_VETO_ITEMS.map((item) => (
            <div className="ghi-veto-item" key={item.label}>
              <span>{item.label}</span>
              <span>-{item.deduction}</span>
            </div>
          ))}
          <div className="ghi-veto-total">
            <span>小计</span>
            <span>-{HEALTH_VETO_TOTAL}</span>
          </div>
        </div>
      </div>

      <div className="ghi-right">
        <div className="ghi-formula-box">
          <strong style={{ color: '#1a3f6f' }}>GHI 计算公式</strong>
          <br />
          <code>GHI = Σ（维度固定分 × 维度权重）− 一票否决扣分</code>
          <br />
          正向指标：<code>子分 = min(100, 实际值/目标值 × 100)</code><br />
          负向指标：<code>子分 = max(0, (1 − 实际值/阈值) × 100)</code><br />
          <div style={{ color: '#c0392b' }}>
            一票否决：重大风险未处置每件扣 <code>2分</code>，处置率低于目标每低1%扣 <code>0.5分</code>
          </div>
        </div>

        <div className="ghi-section">
          <div className="ghi-sec-header">
            <div className="ghi-sec-title">
              <span style={{ fontSize: 18 }}>⚖</span>权重配置调节
            </div>
            <div className="ghi-sec-meta">
              <span style={{ fontSize: 12, color: '#94a8bc' }}>调整维度权重，评分口径固定</span>
              <span className="chev">▼</span>
            </div>
          </div>
          <div className="pdetail open">
            <div style={{ padding: 14 }}>
              <div className="ghi-weight-editor">
                <div className="gwe-title">
                  维度权重 <span className={`gwe-total ${weightTotal === 100 ? 'ok' : 'warn'}`}>合计：{weightTotal}%</span>
                </div>
                <div className="gwe-rows">
                  {dimensions.map((dim) => {
                    const rangeStyle = {
                      ['--gwe-accent' as const]: dim.color,
                      ['--gwe-fill' as const]: `${(dim.weight / 50) * 100}%`,
                    } as CSSProperties

                    return (
                      <div className="gwe-row" key={`weight-${dim.id}`}>
                        <div className="gwe-name" style={{ color: dim.color }}>
                          {dim.name}
                        </div>
                        <input
                          className="ghi-range gwe-range"
                          type="range"
                          min={0}
                          max={50}
                          step={1}
                          value={dim.weight}
                          style={rangeStyle}
                          onChange={(event) => updateWeight(dim.id, Number(event.target.value))}
                        />
                        <div className="gwe-value">{dim.weight}%</div>
                      </div>
                    )
                  })}
                </div>
                <button
                  type="button"
                  style={{
                    fontSize: 11,
                    padding: '4px 12px',
                    background: '#f5f8fc',
                    border: '1px solid #dde4ec',
                    color: '#6b84a0',
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginTop: 6,
                  }}
                  onClick={resetWeights}
                >
                  重置默认权重
                </button>
              </div>
            </div>
          </div>
        </div>

        {dimensions.map((dim) => (
          <div className="ghi-section" key={`dim-${dim.id}`}>
            <div className="ghi-sec-header" style={{ cursor: 'pointer' }} onClick={() => toggleSection(dim.id)}>
              <div className="ghi-sec-title">
                <div className="ghi-sec-dot" style={{ background: dim.color }}></div>
                {dim.name}
              </div>
              <div className="ghi-sec-meta">
                <span className="ghi-sec-weight">权重 {dim.weight}%</span>
                <span className="ghi-sec-score" style={{ color: dim.color }}>
                  {dim.score}
                </span>
                <span className={`chev ${openSections[dim.id] ? 'open' : ''}`}>▼</span>
              </div>
            </div>
            <div className={`pdetail ${openSections[dim.id] ? 'open' : ''}`}></div>
          </div>
        ))}

        <div className="ghi-section">
          <div className="ghi-sec-header">
            <div className="ghi-sec-title">
              <span style={{ fontSize: 18 }}>📈</span>指数历史趋势
            </div>
            <div className="ghi-sec-meta">
              <span className="chev">▼</span>
            </div>
          </div>
          <div className="pdetail open">
            <div style={{ padding: 14 }}>
              {/* <div className="ghi-hist-wrap">
                <div className="ghi-timeline-row">近12月模拟指数：{Math.max(0, healthScore - 6)} → {Math.max(0, healthScore - 3)} → {healthScore}</div>
              </div> */}
            </div>
          </div>
        </div>

        <div className="action-bar">
          <button
            type="button"
            className="act-btn act-p"
            onClick={() =>
              onPrompt?.('根据集团综合健康指数当前得分和五维度拆解，分析主要失分原因，给出提升建议和优先改进路径')
            }
          >
            生成提升建议报告 ↗
          </button>
          <button
            type="button"
            className="act-btn act-t"
            onClick={() =>
              onPrompt?.('模拟如果将三单处置率提升至90%、减少重大风险事项至1件，集团综合健康指数预计提升多少分，分析改善路径')
            }
          >
            改善情景模拟 ↗
          </button>
          <button type="button" className="act-btn act-g" onClick={() => onNavigate?.('home')}>
            ← 返回领导门户
          </button>
        </div>
      </div>
    </div>
  )
}
