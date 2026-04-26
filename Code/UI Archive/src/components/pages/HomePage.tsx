import { useEffect, useRef } from 'react'
import { LineRiskChart } from '../charts/LineRiskChart'
import { HealthScoreDonut } from '../charts/HealthScoreDonut'
import type { PortalPage } from '../../data/shared/navigationData'
import { domainCards } from '../../data/shared/domainData'
import {
  HOME_DOMAIN_TREND_LABELS,
  HOME_DOMAIN_TREND_VALUES,
  HOME_RISK_FEED_ITEMS,
  HOME_TODO_ITEMS,
} from '../../data/pages/homeData'

type HomePageProps = {
  onPrompt: (text: string) => void
  onNavigate: (page: PortalPage, prompt?: string) => void
  healthScore: number
  healthStatusText: string
  healthStatusColor: string
}



export function HomePage(props: HomePageProps) {
  const { onPrompt, onNavigate, healthScore, healthStatusText, healthStatusColor } = props
  const riskFeedRef = useRef<HTMLDivElement | null>(null)
  const todoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const setupCycle = (container: HTMLDivElement | null) => {
      if (!container) {
        return null
      }

      const track = container.firstElementChild as HTMLDivElement | null
      if (!track || track.children.length < 2) {
        return null
      }

      let paused = false
      let offset = 0
      let head = track.firstElementChild as HTMLElement | null
      let headHeight = head?.offsetHeight ?? 0

      if (!head || headHeight <= 0) {
        return null
      }

      const onEnter = () => {
        paused = true
      }
      const onLeave = () => {
        paused = false
      }

      container.addEventListener('mouseenter', onEnter)
      container.addEventListener('mouseleave', onLeave)

      return {
        isPaused: () => paused,
        step: (delta: number) => {
          if (!head || headHeight <= 0) {
            return
          }

          offset += delta
          while (offset >= headHeight) {
            offset -= headHeight
            track.appendChild(head)
            head = track.firstElementChild as HTMLElement | null
            headHeight = head?.offsetHeight ?? 0
            if (!head || headHeight <= 0) {
              offset = 0
              track.style.transform = 'translate3d(0,0,0)'
              return
            }
          }

          track.style.transform = `translate3d(0,-${offset}px,0)`
        },
        cleanup: () => {
          container.removeEventListener('mouseenter', onEnter)
          container.removeEventListener('mouseleave', onLeave)
          offset = 0
          track.style.transform = 'translate3d(0,0,0)'
        },
      }
    }

    const cycles = [setupCycle(riskFeedRef.current), setupCycle(todoRef.current)].filter(
      (item): item is NonNullable<ReturnType<typeof setupCycle>> => item !== null,
    )

    if (!cycles.length) {
      return
    }

    const speed = 22
    let rafId = 0
    let lastTs = 0

    const tick = (ts: number) => {
      if (!lastTs) {
        lastTs = ts
      }

      const elapsed = Math.min(ts - lastTs, 48)
      lastTs = ts
      const delta = (elapsed / 1000) * speed

      cycles.forEach((cycle) => {
        if (cycle.isPaused()) return
        cycle.step(delta)
      })

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(rafId)
      cycles.forEach((cycle) => cycle.cleanup())
    }
  }, [])

  return (
    <>
      <div className="row1">
        <div className="hcard">
          <div style={{ fontSize: '12px', color: '#6b84a0', marginBottom: '3px' }}>穿透监管健康指数</div>
          <div className="sring">
            <HealthScoreDonut score={healthScore} />
            <div className="snum"><div className="sv" style={{ color: healthStatusColor }}>{healthScore}</div><div className="sl">综合评分</div></div>
          </div>
          <div style={{ fontSize: '11px', marginBottom: '8px' }}>状态：<span style={{ color: healthStatusColor, fontWeight: '500' }}>{healthStatusText}</span></div>
          <div style={{ width: '100%' }}>
            <div style={{ height: '5px', borderRadius: '3px', overflow: 'hidden', display: 'flex', position: 'relative' }}>
              <div style={{ width: '60%', background: '#c0392b' }}></div>
              <div style={{ width: '20%', background: '#e8a020' }}></div>
              <div style={{ width: '20%', background: '#287a4a' }}></div>
              <div
                style={{
                  position: 'absolute',
                  top: '-3px',
                  width: '2px',
                  height: '11px',
                  background: '#1a2a3a',
                  borderRadius: '1px',
                  transform: 'translateX(-50%)',
                  left: `${Math.max(0, Math.min(100, healthScore))}%`,
                }}
              ></div>
            </div>
            <div
              style={{
                position: 'relative',
                height: '12px',
                fontSize: '9px',
                color: '#94a8bc',
                marginTop: '2px',
              }}
            >
              <span style={{ position: 'absolute', left: 0 }}>危险</span>
              <span style={{ position: 'absolute', left: '70%', transform: 'translateX(-50%)' }}>预警</span>
              <span style={{ position: 'absolute', right: 0 }}>健康</span>
            </div>
          </div>
          <button onClick={() => onNavigate('healthcheck', '进入集团综合健康指数')} style={{ marginTop: '10px', fontSize: '11px', padding: '5px 12px', background: '#eef3fa', border: '1px solid #c5d5e8', color: '#1a3f6f', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>查看体检报告 ↗</button>
        </div>

        <div className="kg">
          <div className="kc r">
            <div className="kt">高风险主体数</div>
            <div className="kv r">23</div>
            <div className="ks">占比8.4% / 共274个主体</div>
            <div className="kt2" style={{ color: '#c0392b' }}>↑ 较上月+3</div>
          </div>
          <div className="kc a">
            <div className="kt">层级超限、空壳、僵尸主体</div>
            <div className="kv a">47</div>
            <div className="ks">待处置31 / 处置中16</div>
            <div className="kt2" style={{ color: '#c0392b' }}>↑ 新增7</div>
          </div>
          <div className="kc g">
            <div className="kt">境外主体覆盖率</div>
            <div className="kv g">72.3%</div>
            <div className="ks">389家·未覆盖109家</div>
            <div className="kt2" style={{ color: '#c8870e' }}>↓ 低于目标5.7%</div>
          </div>
          <div className="kc b">
            <div className="kt">模型监控覆盖率</div>
            <div className="kv b">89.2%</div>
            <div className="ks">已覆盖244个主体</div>
            <div className="kt2" style={{ color: '#287a4a' }}>↑ 较上季+4.1%</div>
          </div>
          <div className="kc r">
            <div className="kt">重大穿透问题</div>
            <div className="kv r">3</div>
            <div className="ks">需董事会关注</div>
            <div className="kt2" style={{ color: '#c0392b' }}>● 需立即处置</div>
          </div>
          <div className="kc a">
            <div className="kt">问题消缺率</div>
            <div className="kv a">89%</div>
            <div className="ks">32条·处置中4条</div>
            <div className="kt2" style={{ color: '#c0392b' }}>↓ 低于目标8.5%</div>
          </div>
          <div className="kc g">
            <div className="kt">重点项目穿透跟踪率</div>
            <div className="kv g">91.5%</div>
            <div className="ks">同比去年提升3.2%</div>
            <div className="kt2" style={{ color: '#287a4a' }}>↑ 持续改善</div>
          </div>
          <div className="kc b">
            <div className="kt">资产负债率</div>
            <div className="kv b">64.8%</div>
            <div className="ks">集团合并口径</div>
            <div className="kt2" style={{ color: '#c8870e' }}>▲ 接近预警线70%</div>
          </div>
        </div>
      </div>

      <section className="dwrap home-domain-block">
        <div className="dwhd">
          <div className="sec blue" style={{ margin: 0 }}>十大重点领域穿透</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#94a8bc' }}>数据更新：今日09:00</span>
            <button
              onClick={() => onNavigate('domain')}
              style={{ fontSize: 10, padding: '3px 10px', background: '#eef3fa', border: '1px solid #c5d5e8', color: '#1a3f6f', borderRadius: 5, cursor: 'pointer' }}
            >
              进入全览 ↗
            </button>
          </div>
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

        <div className="cleg">
          <span><span className="cdot" style={{ background: '#c0392b' }}></span>高风险</span>
          <span><span className="cdot" style={{ background: '#c8870e' }}></span>中风险</span>
          <span><span className="cdot" style={{ background: '#287a4a' }}></span>低风险</span>
        </div>

        <div className="cwrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 10, color: '#94a8bc' }}>近6个月问题数趋势</span>
          </div>
          <div className="home-trend-chart">
            <LineRiskChart labels={HOME_DOMAIN_TREND_LABELS} values={HOME_DOMAIN_TREND_VALUES} label="近6个月问题数" color="#1a3f6f" />
          </div>
        </div>
      </section>

      <div className="home-scroll-row">
        <section className="rtcard home-scroll-card">
          <div className="sec blue home-card-title" style={{ marginBottom: 8 }}>穿透监管动态 · 实时预警</div>
          <div className="home-scroll-list no-scroll" ref={riskFeedRef}>
            <div className="home-scroll-track">
              {HOME_RISK_FEED_ITEMS.map((item, index) => (
                <div key={`risk-feed-${index}`} className="rti">
                  <div className={`rdot ${item.level}`}></div>
                  <div className="rmain">{item.message}</div>
                  <div className="rmeta">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
          <button
            className="home-scroll-btn"
            onClick={() => onPrompt('列出近30天内所有高风险预警事项，按紧急程度排序并给出处置建议')}
          >
            查看全部动态 ↗
          </button>
        </section>

        <section className="alcard home-scroll-card">
          <div className="sec blue home-card-title" style={{ marginBottom: 8 }}>待办事项 · 总经理关注</div>
          <div className="home-scroll-list no-scroll" ref={todoRef}>
            <div className="home-scroll-track">
              {HOME_TODO_ITEMS.map((item, index) => (
                <div key={`todo-${index}`} className="ali">
                  <div className={`alico ${item.level}`}>{item.mark}</div>
                  <div className="altx">
                    <div className="altt">{item.title}</div>
                    <div className="alts">{item.desc}</div>
                  </div>
                  <div className="alac" onClick={() => onPrompt(item.prompt)}>
                    {item.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="home-todo-actions">
            <button
              className="abtn ap"
              onClick={() => onPrompt('生成本周集团风险管理工作汇报')}
            >
              生成周报 ↗
            </button>
            <button
              className="abtn at2"
              onClick={() => onPrompt('对照国资委2026年2号文，评估集团穿透式监管建设现状')}
            >
              2号文对标 ↗
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
