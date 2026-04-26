import type { PortalPage } from '../../data/shared/navigationData'
import { domainCards } from '../../data/shared/domainData'

type DomainPageProps = {
  onNavigate: (page: PortalPage, prompt?: string) => void
  onPrompt: (text: string) => void
}


export function DomainPage({ onNavigate, onPrompt }: DomainPageProps) {
  return (
    <section>
      <div className="dwrap domain-overview-block">
        <div className="domain-header domain-header-merged">
          <div className="dh-left">
            <div>
              <div className="dh-title">十大重点领域穿透总览</div>
              <div className="dh-sub">对标国资委2026年2号文重点监管领域 · 点击色卡穿透至对应领域详情</div>
            </div>
          </div>
          <div className="domain-config-tools">
            <button
              type="button"
              className="domain-config-btn"
              aria-label="自定义配置"
              title="此处支持自定义配置"
            >
              ⚙
            </button>
          </div>
          {/* <div className="dh-kpis">
          <div className="dh-kpi">
            <div className="dh-kv r">23</div>
            <div className="dh-kk">高风险事项</div>
          </div>
          <div className="dh-kpi">
            <div className="dh-kv a">48</div>
            <div className="dh-kk">预警事项</div>
          </div>
          <div className="dh-kpi">
            <div className="dh-kv g">89%</div>
            <div className="dh-kk">总体治理评分</div>
          </div>
        </div> */}
        </div>

        <div className="dcards">
          {domainCards.map((card) => (
            <div
              key={card.name}
              className={`dc ${card.level}`}
              onClick={() => {
                if (card.page) {
                  onNavigate(card.page)
                  return
                }
                onPrompt(card.prompt)
              }}
            >
              <div className="dcn">{card.name}</div>
              <div className="dcl">{card.levelLabel}</div>
              <div className="dcc">{card.count}</div>
              {card.count && <div className="dcu">问题条数</div>}
              <div className={`dct ${card.trendClass}`}>{card.trend}</div>
            </div>
          ))}
        </div>
        <div className="domain-ready-tip">
          <span className="domain-ready-icon">💡</span>
          <span>
            <strong>采购供应链</strong>、<strong>财务管理</strong>
            已完成穿透屏建设，点击对应色卡可进入详情。其余8个领域穿透屏建设中。
          </span>
        </div>
        
      </div>
      <div className="domain-back-wrap">
          <button className="domain-back-btn" onClick={() => onNavigate('home', '返回领导门户')}>
            ← 返回领导门户
          </button>
        </div>

      {/* <div className="fp-grid">
        <div className="fp-card amber" onClick={() => onNavigate('procurement', '进入采购供应链穿透')}>
          <div className="fp-icon-wrap amber">📦</div>
          <div className="fp-card-title">采购与供应链</div>
          <div className="fp-card-desc">覆盖采购计划、招采执行、供应商集中度与异常交易。</div>
          <div className="fp-tags">
            <span className="fp-tag amber" onClick={() => onPrompt('查看采购集中度异常')}>供应商集中度</span>
            <span className="fp-tag amber" onClick={() => onPrompt('查看单一来源采购风险')}>单一来源风险</span>
          </div>
        </div>

        <div className="fp-card teal" onClick={() => onNavigate('accounting', '进入会计信息穿透')}>
          <div className="fp-icon-wrap teal">🧾</div>
          <div className="fp-card-title">会计信息</div>
          <div className="fp-card-desc">覆盖账务一致性、凭证质量、报表及时性与会计差错风险。</div>
          <div className="fp-tags">
            <span className="fp-tag teal" onClick={() => onPrompt('查看账表差异率')}>账表差异</span>
            <span className="fp-tag teal" onClick={() => onPrompt('查看跨期调整凭证风险')}>跨期调整</span>
          </div>
        </div>

        <div className="fp-card purple" onClick={() => onNavigate('issue', '进入问题跟进穿透')}>
          <div className="fp-icon-wrap purple">📌</div>
          <div className="fp-card-title">问题跟进</div>
          <div className="fp-card-desc">覆盖疑点、评估、分发、整改、销号全生命周期管理。</div>
          <div className="fp-tags">
            <span className="fp-tag purple" onClick={() => onPrompt('查看待分发问题')}>待分发事项</span>
            <span className="fp-tag purple" onClick={() => onPrompt('查看整改逾期清单')}>整改逾期</span>
          </div>
        </div>
      </div> */}
    </section>
  )
}

