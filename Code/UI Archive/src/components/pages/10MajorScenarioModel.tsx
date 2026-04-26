import { SCENARIO_DOMAIN_CARDS, SCENARIO_SUMMARY } from '../../data/pages/majorScenarioModelData'

type MajorScenarioModelProps = {
  onPrompt: (text: string) => void
  onOpenModelLibrary: (domain?: string) => void
}

export function MajorScenarioModel({ onPrompt, onOpenModelLibrary }: MajorScenarioModelProps) {
  return (
    <>
      <div className="mc-section-hd">
        <div className="mc-section-title">十大核心领域监管模型</div>
        <span className="mc-count-badge">共9个领域 · 点击进入穿透监管模型库</span>
      </div>

      <div style={{ fontSize: 11, color: '#6b84a0', marginBottom: 14, padding: '10px 12px', background: '#fff', borderRadius: 8, borderLeft: '3px solid #1a3f6f' }}>
        ℹ 本页展示9大重点监管领域的核心模型汇总。点击各领域卡片可跳转至穿透式监管模型库并自动筛选该领域模型。
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
        {SCENARIO_DOMAIN_CARDS.map((item) => (
          <div
            key={item.domain}
            style={{ background: '#fff', border: '1px solid #dde4ec', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'all .18s', position: 'relative' }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = 'translateY(-3px)'
              event.currentTarget.style.boxShadow = item.hoverShadow
              event.currentTarget.style.borderColor = item.hoverBorderColor
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = ''
              event.currentTarget.style.boxShadow = ''
              event.currentTarget.style.borderColor = '#dde4ec'
            }}
            onClick={() => onOpenModelLibrary(item.domain)}
          >
            <div style={{ height: 6, background: item.topGradient, borderRadius: '12px 12px 0 0' }}></div>
            <div style={{ padding: '16px 16px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1a2a3a' }}>{item.domain}</div>
                  <div style={{ fontSize: 10, color: '#94a8bc', marginTop: 2 }}>{item.englishName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <div style={{ fontSize: 32, fontWeight: 500, color: item.color, lineHeight: 1 }}>{item.modelCount}</div>
                <div style={{ fontSize: 11, color: '#6b84a0' }}>个监管模型</div>
              </div>

              <div style={{ fontSize: 10, color: '#6b84a0', lineHeight: 1.6, marginBottom: 10 }}>{item.desc}</div>

              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 7, background: '#fdeded', color: '#c0392b', border: '1px solid #f5c6c6' }}>{item.highRisk}</span>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 7, background: '#fef6e8', color: '#b07d10', border: '1px solid #f5dfa0' }}>{item.warning}</span>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 7, background: '#eaf5ee', color: '#287a4a', border: '1px solid #b8dfc8' }}>{item.normal}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f4f8', paddingTop: 8 }}>
                <span style={{ fontSize: 10, color: '#94a8bc' }}>{item.foot}</span>
                <span style={{ fontSize: 11, color: item.color, fontWeight: 500 }}>进入模型库 →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #dde4ec', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {SCENARIO_SUMMARY.map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: 10, color: '#94a8bc', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="act-btn act-p" onClick={() => onOpenModelLibrary()}>进入完整模型库 →</button>
          <button className="act-btn act-s" onClick={() => onPrompt('生成9大领域监管模型运行效果评估报告，包含触发次数、准确率、漏报率分析')}>生成模型效果报告 ↗</button>
        </div>
      </div>
    </>
  )
}
