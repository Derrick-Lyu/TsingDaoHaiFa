import { useMemo } from 'react'
import { DEFAULT_TONE, DOMAIN_TONES } from '../../data/pages/supervisionModelBaseData'

type ModelBaseItem = {
  domain: string
  name: string
  desc: string
  fields: string
}

type SupervisionModelBaseProps = {
  modelDomain: string
  onModelDomainChange: (domain: string) => void
  modelDomainOptions: string[]
  models: ModelBaseItem[]
  onPrompt: (text: string) => void
}


export function SupervisionModelBase({
  modelDomain,
  onModelDomainChange,
  modelDomainOptions,
  models,
  onPrompt,
}: SupervisionModelBaseProps) {
  const filteredModels = useMemo(() => {
    if (modelDomain === '全部') {
      return models
    }
    return models.filter((item) => item.domain === modelDomain)
  }, [modelDomain, models])

  return (
    <>
      <div className="mc-section-hd">
        <div className="mc-section-title">穿透式监管模型库</div>
        <span className="mc-count-badge">共{filteredModels.length}个模型</span>
      </div>

      <div className="mc-lib-filters" id="modellib-filters">
        <button className={`mc-filter-btn ${modelDomain === '全部' ? 'active' : ''}`} onClick={() => onModelDomainChange('全部')}>
          全部（{models.length}）
        </button>
        {modelDomainOptions.map((domain) => (
          <button
            key={domain}
            className={`mc-filter-btn ${modelDomain === domain ? 'active' : ''}`}
            onClick={() => onModelDomainChange(domain)}
          >
            {domain}
          </button>
        ))}
      </div>

      <div className="mc-lib-grid" id="modellib-grid">
        {filteredModels.map((item) => {
          const tone = DOMAIN_TONES[item.domain] ?? DEFAULT_TONE
          return (
            <div
              key={item.name}
              className="mc-lib-card"
              style={{ borderLeftColor: tone.border }}
              onClick={() => onPrompt(`详细解读「${item.name}」模型的检测逻辑、数据字段和预警规则`)}
            >
              <span className="mc-lib-card-domain" style={{ background: tone.badgeBg, color: tone.badgeColor }}>
                {item.domain}
              </span>
              <div className="mc-lib-card-name">{item.name}</div>
              <div className="mc-lib-card-desc">{item.desc}</div>
              <div className="mc-lib-card-fields">{item.fields}</div>
            </div>
          )
        })}
      </div>
    </>
  )
}
