import { useMemo, useState } from 'react'
import {
  INDICATOR_DOMAIN_OPTIONS,
  INDICATOR_PIERCE_OPTIONS,
  INDICATORS,
  MODELS,
  MODEL_DOMAIN_OPTIONS,
} from '../../data/shared/modelCenterData'
import { MODEL_TABS, type ModelTab } from '../../data/shared/navigationData'
import { MajorDomainModel } from './11MajorDomainModel'
import { MajorScenarioModel } from './10MajorScenarioModel'
import { SupervisionModelBase } from './SupervisionModelBase'

type ModelPageProps = {
  modelTab: ModelTab
  onTabChange: (tab: ModelTab) => void
  onPrompt: (text: string) => void
}

export function ModelPage({ modelTab, onTabChange, onPrompt }: ModelPageProps) {
  const [modelDomain, setModelDomain] = useState('全部')
  const [indicatorDomain, setIndicatorDomain] = useState('全部')
  const [indicatorPierce, setIndicatorPierce] = useState('全部')

  const filteredIndicators = useMemo(() => {
    return INDICATORS.filter((item) => {
      const domainPass = indicatorDomain === '全部' || item[0] === indicatorDomain
      const piercePass = indicatorPierce === '全部' || item[1] === indicatorPierce
      return domainPass && piercePass
    })
  }, [indicatorDomain, indicatorPierce])

  const openModelLibrary = (domain?: string) => {
    onTabChange('modellib')
    setModelDomain(domain ?? '全部')
  }

  return (
    <section className="mc-wrap">
      <aside className="mc-sidebar">
        <div className="mc-sb-title">模型中心</div>
        {MODEL_TABS.map((tab) => (
          <div key={tab.id} className={`mc-sb-item ${modelTab === tab.id ? 'active' : ''}`} onClick={() => onTabChange(tab.id)}>
            <span>{tab.label}</span>
            <span className="mc-sb-count">
              {tab.id === 'indlib' ? INDICATORS.length : tab.id === 'modellib' ? MODELS.length : tab.id === 'scene10' ? 10 : 11}
            </span>
          </div>
        ))}
      </aside>

      <div className="mc-main">
        <div className={`mc-tab ${modelTab === 'key11' ? 'active' : ''}`}>
          {modelTab === 'key11' ? <MajorDomainModel onPrompt={onPrompt} /> : null}
        </div>

        <div className={`mc-tab ${modelTab === 'scene10' ? 'active' : ''}`}>
          {modelTab === 'scene10' ? <MajorScenarioModel onPrompt={onPrompt} onOpenModelLibrary={openModelLibrary} /> : null}
        </div>

        <div className={`mc-tab ${modelTab === 'modellib' ? 'active' : ''}`}>
          {modelTab === 'modellib' ? (
            <SupervisionModelBase
              modelDomain={modelDomain}
              onModelDomainChange={setModelDomain}
              modelDomainOptions={MODEL_DOMAIN_OPTIONS}
              models={MODELS}
              onPrompt={onPrompt}
            />
          ) : null}
        </div>

        <div className={`mc-tab ${modelTab === 'indlib' ? 'active' : ''}`}>
          <div className="mc-section-hd">
            <div className="mc-section-title">穿透式监管指标库</div>
            <div className="mc-count-badge">共 {filteredIndicators.length} 条</div>
          </div>

          <div className="mc-ind-filters">
            <button className={`mc-filter-btn ${indicatorDomain === '全部' ? 'active' : ''}`} onClick={() => setIndicatorDomain('全部')}>
              全部领域
            </button>
            {INDICATOR_DOMAIN_OPTIONS.map((domain) => (
              <button
                key={domain}
                className={`mc-filter-btn ${indicatorDomain === domain ? 'active' : ''}`}
                onClick={() => setIndicatorDomain(domain)}
              >
                {domain}
              </button>
            ))}
          </div>

          <div className="mc-ind-filters">
            <button className={`mc-filter-btn ${indicatorPierce === '全部' ? 'active' : ''}`} onClick={() => setIndicatorPierce('全部')}>
              全部穿透维度
            </button>
            {INDICATOR_PIERCE_OPTIONS.map((option) => (
              <button
                key={option}
                className={`mc-filter-btn ${indicatorPierce === option ? 'active' : ''}`}
                onClick={() => setIndicatorPierce(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mc-ind-table-wrap">
            <table className="mc-ind-table">
              <thead>
                <tr>
                  <th>监管领域</th>
                  <th>穿透维度</th>
                  <th>指标名称</th>
                  <th>指标含义</th>
                  <th>作用</th>
                  <th>预警规则</th>
                  <th>计算口径</th>
                  <th>数据来源</th>
                  <th>频率</th>
                  <th>责任部门</th>
                  <th>展示方式</th>
                </tr>
              </thead>
              <tbody>
                {filteredIndicators.map((row, index) => (
                  <tr key={`${row[2]}-${index}`} onClick={() => onPrompt(`查看指标：${row[2]}`)}>
                    <td>{row[0]}</td>
                    <td><span className="pierce-pill">{row[1]}</span></td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                    <td>{row[4]}</td>
                    <td><span className="risk-rule-cell">{row[5]}</span></td>
                    <td>{row[6]}</td>
                    <td>{row[7]}</td>
                    <td><span className="freq-pill">{row[8]}</span></td>
                    <td>{row[9]}</td>
                    <td>{row[10]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
