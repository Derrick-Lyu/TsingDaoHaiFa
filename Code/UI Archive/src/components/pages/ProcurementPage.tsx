import { LineRiskChart } from '../charts/LineRiskChart'
import type { ModelTab, PortalPage } from '../../data/shared/navigationData'
import {
  PROCUREMENT_EMERGENCY_MONITOR,
  PROCUREMENT_INVENTORY_GAUGES,
  PROCUREMENT_MODEL_HITS,
  PROCUREMENT_MODEL_TOP5,
  PROCUREMENT_POLICY_ROWS,
  PROCUREMENT_SCENES,
  PROCUREMENT_SUPPLIER_RELATIONS,
  PROCUREMENT_TIMELINE,
} from '../../data/pages/procurementData'

type ProcurementPageProps = {
  onPrompt: (text: string) => void
  onNavigate?: (page: PortalPage, prompt?: string) => void
  onModelTabChange?: (tab: ModelTab) => void
}

export function ProcurementPage({ onPrompt, onNavigate, onModelTabChange }: ProcurementPageProps) {
  const goModelLibrary = () => {
    onModelTabChange?.('modellib')
    onNavigate?.('model', '进入模型库筛选：采购与供应链管理')
  }

  return (
    <section>
      <div className="domain-header">
        <div className="dh-left">
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#c8870e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>购</div>
          <div>
            <div className="dh-title">采购供应链穿透</div>
            <div className="dh-sub">对标国资委2026年2号文 · 采购管理专项 · 覆盖集采、招采、紧急采购、供应商管理全链条</div>
            <div className="dh-badges">
              <span className="dh-badge dh-risk">高风险 · 6条问题</span>
              {/* <span className="dh-badge dh-ref">2号文第12-15条</span> */}
              <span className="dh-badge" style={{ background: '#fef6e8', color: '#b07d10', border: '1px solid #f5dfa0' }}>↑ 较上月+1条</span>
              <span className="dh-badge" style={{ background: '#f5f8fc', color: '#1a3f6f', border: '1px solid #dde4ec', cursor: 'pointer' }} onClick={() => onNavigate?.('domain', '返回总览')}>← 返回总览</span>
            </div>
          </div>
        </div>
        <div className="dh-kpis">
          <div className="dh-kpi"><div className="dh-kv r">41.2%</div><div className="dh-kk">供应商集中度</div><div className="dh-kt" style={{ color: '#c0392b' }}>▲ 超预警线35%</div></div>
          <div className="dh-kpi"><div className="dh-kv a">3家</div><div className="dh-kk">关联供应商</div><div className="dh-kt" style={{ color: '#c8870e' }}>同实控人未披露</div></div>
          <div className="dh-kpi"><div className="dh-kv r">1.4亿</div><div className="dh-kk">涉险合同金额</div><div className="dh-kt" style={{ color: '#c0392b' }}>待核查处置</div></div>
          <div className="dh-kpi"><div className="dh-kv g">96%</div><div className="dh-kk">招标合规率</div><div className="dh-kt" style={{ color: '#287a4a' }}>↑ 较上季+1.2%</div></div>
          <div className="dh-kpi"><div className="dh-kv b">233万</div><div className="dh-kk">采购合同数</div><div className="dh-kt" style={{ color: '#94a8bc' }}>全量监控</div></div>
        </div>
      </div>

      <div className="sec amber">全链条采购场景监控</div>

      <div className="scene-row">
        {PROCUREMENT_SCENES.map((scene, index) => (
          <div className="scene-flow-item scene-flow-reveal" key={scene.label} style={{ animationDelay: `${index * 200}ms` }}>
            {index > 0 ? (
              <span className="scene-flow-double-arrow" aria-hidden="true">
                <span className="scene-flow-double-chevron"></span>
                <span className="scene-flow-double-chevron"></span>
              </span>
            ) : null}
            <div
              className="scene-card"
              style={scene.alert ? { borderLeft: '3px solid #c0392b', borderRadius: '0 8px 8px 0' } : undefined}
            >
              <div className="sc-label">{scene.label}</div>
              <div><span className="sc-val" style={scene.alert ? { color: '#c0392b' } : undefined}>{scene.value}</span><span className="sc-unit">{scene.unit}</span></div>
              <div className="sc-sub">{scene.sub}</div>
              <div className="sc-trend" style={{ color: scene.color }}>{scene.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mid-grid3">
        <div className="mid-card">
          <div className="sec amber" style={{ marginBottom: 8 }}>紧急采购场景监控</div>
          <div className="rml">
            {PROCUREMENT_EMERGENCY_MONITOR.map((item) => (
              <div className="rml-item" key={item.name}>
                <div className={`rml-icon ${item.badgeCls === 'r' ? 'rml-r' : 'rml-g'}`}>{item.icon}</div>
                <div className="rml-name">{item.name}</div>
                <div className={`rml-val ${item.valueCls}`}>{item.value}<span className="rml-unit">%</span></div>
                <span className={`rml-badge ${item.badgeCls}`}>{item.badge}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, borderTop: '1px solid #edf1f5', paddingTop: 8 }}>
            <div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 5 }}>2号文合规要点</div>
            <div className="tag-strip">
              <span className="tag hot">紧急采购比例过高</span>
              <span className="tag hot">价格偏离市场</span>
              <span className="tag">供应商固化</span>
              <span className="tag">审批流程缺失</span>
            </div>
          </div>
        </div>

        <div className="mid-card">
          <div className="sec amber" style={{ marginBottom: 8 }}>物资出入库管理</div>
          <div className="gauge-row">
            {PROCUREMENT_INVENTORY_GAUGES.map((item) => (
              <div className="gauge-card" key={item.label}>
                <div className="gauge-label">{item.label}</div>
                <div style={{ fontSize: 11, color: '#94a8bc', marginBottom: 4 }}>
                  {item.meta}
                  {item.metaAmount ? <span style={{ color: item.amountColor }}> {item.metaAmount}</span> : null}
                </div>
                <div className={`gauge-val ${item.valueCls}`}>{item.value}</div>
                <div className="gauge-sub">{item.sub}</div>
                <div className="gauge-bar"><div className={`gauge-fill ${item.fillCls}`} style={{ width: `${item.width}%` }}></div></div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #edf1f5', paddingTop: 8, marginTop: 4 }}>
            <div className="cleg2"><span><span className="cdot" style={{ background: '#c0392b' }}></span>批次发生类</span><span><span className="cdot" style={{ background: '#c8870e' }}></span>重点监控类</span><span><span className="cdot" style={{ background: '#1a3f6f' }}></span>通报警告类</span></div>
            <div className="chart-wrap-sm">
              <LineRiskChart labels={['1月', '2月', '3月', '4月', '5月', '6月']} values={[41, 46, 39, 52, 48, 55]} label="供应商履约风险分布" color="#1a3f6f" />
            </div>
          </div>
        </div>

        <div className="mid-card">
          <div className="sec amber" style={{ marginBottom: 8 }}>供应商关联关系穿透</div>
          <table className="anm-table">
            <thead><tr><th>供应商</th><th>关联类型</th><th>金额</th><th>风险</th><th></th></tr></thead>
            <tbody>
              {PROCUREMENT_SUPPLIER_RELATIONS.map((item) => (
                <tr key={item.name}>
                  <td><div style={{ fontWeight: 500 }}>{item.name}</div><div style={{ fontSize: 10, color: '#94a8bc' }}>{item.desc}</div></td>
                  <td><span className={`risk-pill ${item.relationCls}`}>{item.relation}</span></td>
                  <td style={{ color: item.amountColor, fontWeight: 500 }}>{item.amount}</td>
                  <td><span className={`risk-pill ${item.riskCls}`}>{item.risk}</span></td>
                  <td><span style={{ fontSize: 10, color: '#1a3f6f', cursor: 'pointer' }} onClick={() => onPrompt(item.prompt)}>{item.action}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bot-row">
        <div className="bot-card">
          <div className="sec amber" style={{ marginBottom: 10 }}>采购风险预警时间线</div>
          {PROCUREMENT_TIMELINE.map((item) => (
            <div className="atl-item" key={item.time + item.title}>
              <div className="atl-time">{item.time}</div>
              <div className={`atl-line ${item.lineCls}`}></div>
              <div className="atl-body">
                <div className="atl-title">{item.title}</div>
                <div className="atl-desc">
                  {item.desc}
                  {item.amount ? <span className="atl-amount">{item.amount}</span> : null}
                  {'tail' in item && item.tail ? item.tail : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bot-card">
          <div className="sec amber" style={{ marginBottom: 10 }}>国资委2号文对标 · 采购专项</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PROCUREMENT_POLICY_ROWS.map((item) => (
              <div key={item.clause} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: item.bg, borderRadius: 7, borderLeft: `3px solid ${item.border}` }}>
                {/* <div style={{ fontSize: 10, color: item.border, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.clause}</div> */}
                <div style={{ flex: 1, fontSize: 11, color: '#2a3d50' }}>{item.text} · <span style={{ color: item.statusColor }}>{item.status}</span></div>
                <div style={{ fontSize: 10, color: '#94a8bc' }}>{item.sideText}</div>
                {'prompt' in item && item.prompt ? (
                  <span style={{ fontSize: 10, color: '#1a3f6f', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => onPrompt(item.prompt)}>{item.action}</span>
                ) : (
                  <span style={{ fontSize: 10, color: '#94a8bc' }}>{item.action}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #f5dfa0', borderRadius: 10, padding: 0, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: 'linear-gradient(90deg,#fef6e8,#fff)', borderBottom: '1px solid #f5dfa0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#c8870e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>⬡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a2a3a' }}>模型中心 · 采购与供应链管理检查结果</div>
              <div style={{ fontSize: 10, color: '#94a8bc', marginTop: 1 }}>
                21个监管模型 · 本月运行结果汇总 ·
                <span style={{ color: '#c8870e', cursor: 'pointer' }} onClick={goModelLibrary}> 进入模型库筛选 ↗</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            <div style={{ textAlign: 'center', padding: '0 12px', borderRight: '1px solid #f0f4f8' }}><div style={{ fontSize: 17, fontWeight: 500, color: '#c0392b' }}>8</div><div style={{ fontSize: 10, color: '#94a8bc' }}>高风险命中</div></div>
            <div style={{ textAlign: 'center', padding: '0 12px', borderRight: '1px solid #f0f4f8' }}><div style={{ fontSize: 17, fontWeight: 500, color: '#c8870e' }}>9</div><div style={{ fontSize: 10, color: '#94a8bc' }}>预警命中</div></div>
            <div style={{ textAlign: 'center', padding: '0 12px', borderRight: '1px solid #f0f4f8' }}><div style={{ fontSize: 17, fontWeight: 500, color: '#287a4a' }}>4</div><div style={{ fontSize: 10, color: '#94a8bc' }}>正常通过</div></div>
            <div style={{ textAlign: 'center', padding: '0 12px' }}><div style={{ fontSize: 17, fontWeight: 500, color: '#1a3f6f' }}>21</div><div style={{ fontSize: 10, color: '#94a8bc' }}>模型总数</div></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '12px 14px', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#1a2a3a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 3, height: 12, background: '#c8870e', borderRadius: 2, display: 'inline-block' }}></span>模型命中明细（高风险 / 预警）</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {PROCUREMENT_MODEL_HITS.map((item) => (
                <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: item.bg, borderRadius: 7, borderLeft: `3px solid ${item.borderColor}` }}>
                  <div style={{ fontSize: 10, fontWeight: 500, color: item.levelColor, width: 16, textAlign: 'center' }}>{item.level}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#1a2a3a' }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: '#94a8bc' }}>{item.desc}</div>
                  </div>
                  <span
                    style={{ fontSize: 10, color: '#1a3f6f', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onClick={() => {
                      if (item.onAction === 'model') {
                        goModelLibrary()
                        return
                      }
                      if (item.prompt) {
                        onPrompt(item.prompt)
                      }
                    }}
                  >
                    {item.action}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#1a2a3a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 3, height: 12, background: '#1a3f6f', borderRadius: 2, display: 'inline-block' }}></span>本月模型运行统计</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
              <div style={{ background: '#f5f8fc', borderRadius: 8, padding: '10px 12px' }}><div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 4 }}>模型触发总次数</div><div style={{ fontSize: 22, fontWeight: 500, color: '#1a2a3a' }}>1,284</div><div style={{ fontSize: 10, color: '#c0392b', marginTop: 2 }}>↑ 较上月+12.3%</div></div>
              <div style={{ background: '#f5f8fc', borderRadius: 8, padding: '10px 12px' }}><div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 4 }}>有效预警命中率</div><div style={{ fontSize: 22, fontWeight: 500, color: '#c8870e' }}>82.4%</div><div style={{ fontSize: 10, color: '#287a4a', marginTop: 2 }}>↑ 较上月+3.1%</div></div>
              <div style={{ background: '#f5f8fc', borderRadius: 8, padding: '10px 12px' }}><div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 4 }}>误报率</div><div style={{ fontSize: 22, fontWeight: 500, color: '#287a4a' }}>17.6%</div><div style={{ fontSize: 10, color: '#287a4a', marginTop: 2 }}>↓ 持续优化中</div></div>
              <div style={{ background: '#f5f8fc', borderRadius: 8, padding: '10px 12px' }}><div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 4 }}>涉及资金总额</div><div style={{ fontSize: 22, fontWeight: 500, color: '#c0392b' }}>2.8亿</div><div style={{ fontSize: 10, color: '#c0392b', marginTop: 2 }}>待核查处置</div></div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 500, color: '#1a2a3a', marginBottom: 7 }}>触发频次 TOP 5 模型</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PROCUREMENT_MODEL_TOP5.map((item) => (
                <div key={item.rank + item.name} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 10, color: '#fff', background: item.color, borderRadius: 4, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>{item.rank}</span>
                  <span style={{ fontSize: 10, color: '#2a3d50', flex: 1 }}>{item.name}</span>
                  <div style={{ width: 80, height: 5, background: '#edf1f5', borderRadius: 3, overflow: 'hidden' }}><div style={{ width: item.width, height: '100%', background: item.color, borderRadius: 3 }}></div></div>
                  <span style={{ fontSize: 10, fontWeight: 500, color: item.color, width: 30, textAlign: 'right' }}>{item.count}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f4f8' }}>
              <button className="act-btn act-s" style={{ flex: 1 }} onClick={goModelLibrary}>查看采购领域全部21个模型 →</button>
              <button className="act-btn act-p" onClick={() => onPrompt('生成采购与供应链管理领域21个监管模型本月运行效果评估报告，包含命中率、准确率、误报率和优化建议')}>生成模型效果报告 ↗</button>
            </div>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <button className="act-btn act-t" onClick={() => onPrompt('针对采购供应链3家同实控人供应商，生成专项调查报告和处置建议')}>生成供应商关联调查报告 ↗</button>
        <button className="act-btn act-s" onClick={() => onPrompt('针对国资委2号文采购专项要求，生成集团采购合规整改路线图')}>生成2号文整改路线图 ↗</button>
        <button className="act-btn act-p" onClick={() => onPrompt('分析集团采购供应链全链条风险，给出穿透式管控建议')}>全链条风险穿透分析 ↗</button>
        <button className="act-btn act-g" onClick={() => onNavigate?.('home', '返回领导门户')}>← 返回领导门户</button>
      </div>
    </section>
  )
}
