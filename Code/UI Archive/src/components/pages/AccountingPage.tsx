import { BarRiskChart } from '../charts/BarRiskChart'
import { LineRiskChart } from '../charts/LineRiskChart'
import type { ModelTab, PortalPage } from '../../data/shared/navigationData'
import {
  ACCOUNTING_KEY_RISKS,
  ACCOUNTING_MODEL_HITS,
  ACCOUNTING_MODEL_TREND,
  ACCOUNTING_MODULE_RISKS,
  ACCOUNTING_OVERDUE_BANDS,
  ACCOUNTING_POLICY_ROWS,
  ACCOUNTING_RECTIFY_PROGRESS,
  ACCOUNTING_SUMMARY_STATS,
  ACCOUNTING_TIMELINE,
  ACCOUNTING_VOUCHER_GAUGES,
} from '../../data/pages/accountingData'

type AccountingPageProps = {
  onPrompt: (text: string) => void
  onNavigate?: (page: PortalPage, prompt?: string) => void
  onModelTabChange?: (tab: ModelTab) => void
}

export function AccountingPage({ onPrompt, onNavigate, onModelTabChange }: AccountingPageProps) {
  const goModelLibrary = () => {
    onModelTabChange?.('modellib')
    onNavigate?.('model', '进入模型库筛选：会计管理')
  }

  return (
    <section>
      <div className="domain-header">
        <div className="dh-left">
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#6c4faa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>账</div>
          <div>
            <div className="dh-title">财务管理穿透</div>
            <div className="dh-sub">对标国资委2026年2号文 · 会计核算专项 · 覆盖凭证管理、资产核算、预算管理、税务合规、费用报销、往来账户全模块</div>
            <div className="dh-badges">
              <span className="dh-badge" style={{ background: '#f0ecfa', color: '#6c4faa', border: '1px solid #c9bbe8' }}>低风险 · 1条问题</span>
              {/* <span className="dh-badge dh-ref">2号文第17-21条</span> */}
              <span className="dh-badge" style={{ background: '#eaf5ee', color: '#287a4a', border: '1px solid #b8dfc8' }}>↓ 较上月-1条</span>
              <span className="dh-badge" style={{ background: '#f5f8fc', color: '#1a3f6f', border: '1px solid #dde4ec', cursor: 'pointer' }} onClick={() => onNavigate?.('domain', '返回总览')}>← 返回总览</span>
            </div>
          </div>
        </div>
        <div className="dh-kpis">
          <div className="dh-kpi"><div className="dh-kv b">100,878</div><div className="dh-kk">资金收支（万元）</div><div className="dh-kt" style={{ color: '#287a4a' }}>↑ 同比+3.2%</div></div>
          <div className="dh-kpi"><div className="dh-kv b">9,143</div><div className="dh-kk">资产规模（万元）</div><div className="dh-kt" style={{ color: '#287a4a' }}>↑ 同比+2.1%</div></div>
          <div className="dh-kpi"><div className="dh-kv p">20,580</div><div className="dh-kk">凭证笔数（笔）</div><div className="dh-kt" style={{ color: '#94a8bc' }}>本月全量</div></div>
          <div className="dh-kpi"><div className="dh-kv a">478,580</div><div className="dh-kk">发票池（张）</div><div className="dh-kt" style={{ color: '#c8870e' }}>待核销1,240张</div></div>
          <div className="dh-kpi"><div className="dh-kv r">2,400万</div><div className="dh-kk">异常凭证金额</div><div className="dh-kt" style={{ color: '#c0392b' }}>● 待专项核查</div></div>
        </div>
      </div>

      <div className="stat-strip">
        {ACCOUNTING_SUMMARY_STATS.map((item) => (
          <div className="stat-block" key={item.label}>
            <div className={`stat-val ${item.valueCls}`}>{item.value}</div>
            <div className="stat-label">{item.label}</div>
            <div className="stat-sub" style={{ color: item.subColor }}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="mid-grid3">
        <div className="mid-card">
          <div className="sec purple" style={{ marginBottom: 8 }}>会计核算六大模块风险</div>
          <div className="rml">
            {ACCOUNTING_MODULE_RISKS.map((item) => (
              <div className="rml-item" key={item.name}>
                <div className={`rml-icon rml-${item.iconCls}`}>{item.icon}</div>
                <div className="rml-name">{item.name}</div>
                <div className={`rml-val ${item.valueCls}`}>{item.value}<span className="rml-unit">%</span></div>
                <span className={`rml-badge ${item.badgeCls}`}>{item.badge}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mid-card">
          <div className="sec purple" style={{ marginBottom: 8 }}>凭证异常穿透分析</div>
          <div className="gauge-row">
            {ACCOUNTING_VOUCHER_GAUGES.map((item) => (
              <div className="gauge-card" key={item.label}>
                <div className="gauge-label">{item.label}</div>
                <div style={{ fontSize: 11, color: '#94a8bc', marginBottom: 4 }}>
                  {item.meta} <span style={{ color: item.amountColor }}>{item.amount}</span>
                </div>
                <div className={`gauge-val ${item.valueCls}`}>{item.value}</div>
                <div className="gauge-sub">占异常比</div>
                <div className="gauge-bar"><div className={`gauge-fill ${item.fillCls}`} style={{ width: `${item.width}%` }}></div></div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #edf1f5', paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 6 }}>异常凭证主体分布（近6个月）</div>
            <div className="cleg2"><span><span className="cdot" style={{ background: '#c0392b' }}></span>摘要缺失</span><span><span className="cdot" style={{ background: '#6c4faa' }}></span>越权审批</span><span><span className="cdot" style={{ background: '#c8870e' }}></span>拆分入账</span></div>
            <div className="chart-wrap-sm">
              <LineRiskChart labels={['11月', '12月', '1月', '2月', '3月', '4月']} values={[31, 38, 35, 42, 40, 47]} label="异常凭证笔数" color="#6c4faa" />
            </div>
          </div>
        </div>

        <div className="mid-card">
          <div className="sec purple" style={{ marginBottom: 8 }}>重点风险穿透监控</div>
          <table className="anm-table">
            <thead><tr><th>风险类型</th><th>涉及主体</th><th>金额</th><th>状态</th><th></th></tr></thead>
            <tbody>
              {ACCOUNTING_KEY_RISKS.map((item) => (
                <tr key={item.title}>
                  <td><div style={{ fontWeight: 500, color: item.titleColor }}>{item.title}</div><div style={{ fontSize: 10, color: '#94a8bc' }}>{item.desc}</div></td>
                  <td style={{ fontSize: 10 }}>{item.entity}</td>
                  <td style={{ color: item.amountColor, fontWeight: 500 }}>{item.amount}</td>
                  <td><span className={`risk-pill ${item.riskCls}`}>{item.risk}</span></td>
                  <td><span style={{ fontSize: 10, color: '#1a3f6f', cursor: 'pointer' }} onClick={() => onPrompt(item.prompt)}>{item.action}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mid-grid2">
        <div className="mid-card">
          <div className="sec purple" style={{ marginBottom: 8 }}>资产权属与过度负债趋势（近4年）</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 5 }}>资产权属不清主体数</div>
              <div className="chart-wrap" style={{ height: 100 }}>
                <BarRiskChart labels={['2023', '2024', '2025', '2026']} values={[18, 16, 14, 12]} color="#c0392b" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 5 }}>过度负债主体户均情况（万元）</div>
              <div className="chart-wrap" style={{ height: 100 }}>
                <LineRiskChart labels={['2023', '2024', '2025', '2026']} values={[960, 920, 870, 820]} label="户均负债" color="#c8870e" />
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #edf1f5', paddingTop: 8 }}>
            <div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 5 }}>国资委2号文重点关注事项</div>
            <div className="tag-strip">
              <span className="tag hot">资产账实不符</span>
              <span className="tag hot">过度负债未压降</span>
              <span className="tag warn">贸易净额法入账</span>
              <span className="tag warn">违规担保未披露</span>
              <span className="tag">预算执行偏差大</span>
              <span className="tag">费用票据不合规</span>
            </div>
          </div>
        </div>

        <div className="mid-card">
          <div className="sec purple" style={{ marginBottom: 8 }}>发票与往来账款管理</div>
          <div className="gauge-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="gauge-card"><div className="gauge-label">发票核销率</div><div className="gauge-val g">97.4%</div><div className="gauge-sub">478,580张已核销97.4%</div><div className="gauge-bar"><div className="gauge-fill g" style={{ width: '97%' }}></div></div></div>
            <div className="gauge-card"><div className="gauge-label">发票超期率</div><div className="gauge-val a">2.6%</div><div className="gauge-sub">1,240张待核销</div><div className="gauge-bar"><div className="gauge-fill a" style={{ width: '26%' }}></div></div></div>
            <div className="gauge-card"><div className="gauge-label">发票合规率</div><div className="gauge-val g">99.1%</div><div className="gauge-sub">虚开检测模型覆盖</div><div className="gauge-bar"><div className="gauge-fill g" style={{ width: '99%' }}></div></div></div>
          </div>
          <div style={{ borderTop: '1px solid #edf1f5', paddingTop: 10, marginTop: 6 }}>
            <div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 6 }}>往来账款逾期分析</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {ACCOUNTING_OVERDUE_BANDS.map((item) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} key={item.label}>
                  <span style={{ fontSize: 10, color: '#2a3d50', width: 80 }}>{item.label}</span>
                  <div style={{ flex: 1, height: 6, background: '#edf1f5', borderRadius: 3, overflow: 'hidden' }}><div style={{ width: `${item.width}%`, height: '100%', background: item.color, borderRadius: 3 }}></div></div>
                  <span style={{ fontSize: 10, color: item.color, width: 40, textAlign: 'right' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, background: '#f0ecfa', borderRadius: 7, padding: '8px 10px', borderLeft: '3px solid #6c4faa' }}>
              <div style={{ fontSize: 11, color: '#6c4faa', fontWeight: 500, marginBottom: 3 }}>模型中心 · 会计合规AI引擎</div>
              <div style={{ fontSize: 10, color: '#2a3d50' }}>本月新增7项凭证异常检测规则，涵盖摘要关键词识别、金额拆分检测、审批链路完整性验证，系统自动拦截率提升至96.3%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bot-row">
        <div className="bot-card">
          <div className="sec purple" style={{ marginBottom: 10 }}>会计风险预警时间线</div>
          {ACCOUNTING_TIMELINE.map((item) => (
            <div className="atl-item" key={item.time + item.title}>
              <div className="atl-time">{item.time}</div>
              <div className={`atl-line ${item.lineCls}`}></div>
              <div className="atl-body">
                <div className="atl-title">{item.title}</div>
                <div className="atl-desc">
                  {item.desc}
                  {item.amount ? <span className="atl-amount">{item.amount}</span> : null}
                  {item.tail ? item.tail : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bot-card">
          <div className="sec purple" style={{ marginBottom: 10 }}>国资委2号文对标 · 会计专项</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {ACCOUNTING_POLICY_ROWS.map((item) => (
              <div key={item.clause} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: item.bg, borderRadius: 7, borderLeft: `3px solid ${item.border}` }}>
                {/* <div style={{ fontSize: 10, color: item.border, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.clause}</div> */}
                <div style={{ flex: 1, fontSize: 11, color: '#2a3d50' }}>{item.text} · <span style={{ color: item.statusColor }}>{item.status}</span></div>
                <div style={{ fontSize: 10, color: '#94a8bc' }}>{item.sideText}</div>
                {item.prompt ? <span style={{ fontSize: 10, color: '#1a3f6f', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => onPrompt(item.prompt!)}>{item.action}</span> : <span style={{ fontSize: 10, color: '#94a8bc' }}>{item.action}</span>}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #edf1f5', paddingTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><span style={{ fontSize: 11, color: '#2a3d50', fontWeight: 500 }}>整改完成进度</span><span style={{ fontSize: 10, color: '#6b84a0' }}>共10项整改任务</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {ACCOUNTING_RECTIFY_PROGRESS.map((item) => (
                <div key={item.label} style={{ background: '#f5f8fc', borderRadius: 6, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: item.color, flexShrink: 0 }}>{item.ratio}</div>
                  <div><div style={{ fontSize: 11, color: '#2a3d50' }}>{item.label}</div><div style={{ fontSize: 10, color: '#94a8bc' }}>{item.sub}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #c9bbe8', borderRadius: 10, padding: 0, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: 'linear-gradient(90deg,#f5f0fc,#fff)', borderBottom: '1px solid #e0d4f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#6c4faa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>⬡</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a2a3a' }}>模型中心 · 财务管理检查结果</div>
              <div style={{ fontSize: 10, color: '#94a8bc', marginTop: 1 }}>
                16个监管模型 · 本月运行结果汇总 ·
                <span style={{ color: '#6c4faa', cursor: 'pointer' }} onClick={goModelLibrary}> 进入模型库筛选 ↗</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            <div style={{ textAlign: 'center', padding: '0 12px', borderRight: '1px solid #f0f4f8' }}><div style={{ fontSize: 17, fontWeight: 500, color: '#c0392b' }}>6</div><div style={{ fontSize: 10, color: '#94a8bc' }}>高风险命中</div></div>
            <div style={{ textAlign: 'center', padding: '0 12px', borderRight: '1px solid #f0f4f8' }}><div style={{ fontSize: 17, fontWeight: 500, color: '#c8870e' }}>7</div><div style={{ fontSize: 10, color: '#94a8bc' }}>预警命中</div></div>
            <div style={{ textAlign: 'center', padding: '0 12px', borderRight: '1px solid #f0f4f8' }}><div style={{ fontSize: 17, fontWeight: 500, color: '#287a4a' }}>3</div><div style={{ fontSize: 10, color: '#94a8bc' }}>正常通过</div></div>
            <div style={{ textAlign: 'center', padding: '0 12px' }}><div style={{ fontSize: 17, fontWeight: 500, color: '#6c4faa' }}>16</div><div style={{ fontSize: 10, color: '#94a8bc' }}>模型总数</div></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 14px' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#1a2a3a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 3, height: 12, background: '#6c4faa', borderRadius: 2, display: 'inline-block' }}></span>模型命中明细（高风险 / 预警）</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {ACCOUNTING_MODEL_HITS.map((item) => (
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
              <div style={{ background: '#f5f8fc', borderRadius: 8, padding: '10px 12px' }}><div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 4 }}>模型触发总次数</div><div style={{ fontSize: 22, fontWeight: 500, color: '#1a2a3a' }}>3,847</div><div style={{ fontSize: 10, color: '#c0392b', marginTop: 2 }}>↑ 较上月+18.4%（凭证量增加）</div></div>
              <div style={{ background: '#f5f8fc', borderRadius: 8, padding: '10px 12px' }}><div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 4 }}>自动拦截率</div><div style={{ fontSize: 22, fontWeight: 500, color: '#6c4faa' }}>96.3%</div><div style={{ fontSize: 10, color: '#287a4a', marginTop: 2 }}>↑ 本月新增7项规则</div></div>
              <div style={{ background: '#f5f8fc', borderRadius: 8, padding: '10px 12px' }}><div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 4 }}>有效命中率</div><div style={{ fontSize: 22, fontWeight: 500, color: '#c8870e' }}>78.9%</div><div style={{ fontSize: 10, color: '#287a4a', marginTop: 2 }}>↑ 较上月+2.3%</div></div>
              <div style={{ background: '#f5f8fc', borderRadius: 8, padding: '10px 12px' }}><div style={{ fontSize: 10, color: '#6b84a0', marginBottom: 4 }}>异常金额合计</div><div style={{ fontSize: 22, fontWeight: 500, color: '#c0392b' }}>3,352万</div><div style={{ fontSize: 10, color: '#c0392b', marginTop: 2 }}>含待追偿金额</div></div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 500, color: '#1a2a3a', marginBottom: 7 }}>凭证异常检测趋势（近6月）</div>
            <table className="ttbl" style={{ fontSize: 10 }}>
              <thead><tr><th>月份</th><th>触发次数</th><th>命中笔数</th><th>异常金额</th><th>命中率</th></tr></thead>
              <tbody>
                {ACCOUNTING_MODEL_TREND.map((row) => (
                  <tr key={row.month} style={row.highlight ? { fontWeight: 500 } : undefined}>
                    <td>{row.month}</td>
                    <td style={row.highlight ? { color: '#6c4faa' } : undefined}>{row.trigger}</td>
                    <td style={row.highlight ? { color: '#c0392b' } : undefined}>{row.hitCount}</td>
                    <td style={{ color: row.amountColor }}>{row.amount}</td>
                    <td style={{ color: row.hitRateColor }}>{row.hitRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f4f8' }}>
              <button className="act-btn act-pp" style={{ flex: 1 }} onClick={goModelLibrary}>查看财务管理领域全部16个模型 →</button>
              <button className="act-btn act-p" onClick={() => onPrompt('生成财务管理领域16个监管模型本月运行效果评估报告，包含命中分析、异常金额分布、趋势预测和规则优化建议')}>生成模型效果报告 ↗</button>
            </div>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <button className="act-btn act-t" onClick={() => onPrompt('针对越权审批凭证860万元，生成专项调查报告，识别责任人和处置建议，评估内控失效风险')}>凭证越权审批专项报告 ↗</button>
        <button className="act-btn act-pp" onClick={() => onPrompt('针对12项资产权属不清问题，制定资产盘点确权方案，明确各子公司时间节点和责任人')}>资产确权专项方案 ↗</button>
        <button className="act-btn act-s" onClick={() => onPrompt('针对国资委2号文第17-21条会计信息管理要求，评估集团达标情况并生成整改路线图')}>生成2号文整改路线图 ↗</button>
        <button className="act-btn act-p" onClick={() => onPrompt('对18家过度负债主体进行分析，制定差异化压降方案，包括债务重组、资产处置、业务收缩三个路径')}>过度负债压降方案 ↗</button>
        <button className="act-btn act-g" onClick={() => onNavigate?.('home', '返回领导门户')}>← 返回领导门户</button>
      </div>
    </section>
  )
}
