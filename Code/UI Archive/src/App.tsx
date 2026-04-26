import { useMemo, useState } from 'react'
import './styles/portal.css'
import {
  PAGE_TITLES,
  type IssueTab,
  type ModelTab,
  type PermTab,
  type PortalPage,
} from './data/shared/navigationData'
import { HomePage } from './components/pages/HomePage'
import { DomainPage } from './components/pages/DomainPage'
import { ProcurementPage } from './components/pages/ProcurementPage'
import { AccountingPage } from './components/pages/AccountingPage'
import { IssuePage } from './components/pages/IssuePage'
import { FuncPage } from './components/pages/FuncPage'
import { ModelPage } from './components/pages/ModelPage'
import { PermPage } from './components/pages/PermPage'
import { HealthCheckPage } from './components/pages/HealthCheckPage'
import { HEALTH_DEFAULT_DIMENSIONS, HEALTH_VETO_TOTAL } from './data/pages/healthcheckData'
import { invokePrompt } from './utils/promptBridge'

const TOP_NAV: PortalPage[] = ['home', 'domain', 'procurement', 'accounting', 'issue', 'func', 'model', 'perm']

const DOMAIN_FOCUS_ITEMS: { label: string; page?: PortalPage }[] = [
  { label: '投资管理' },
  { label: '产权管理' },
  { label: '财务管理', page: 'accounting' },
  { label: '会计管理' },
  { label: '薪酬管理' },
  { label: '金融风险' },
  { label: '采购供应链', page: 'procurement' },
  { label: '境外业务' },
  { label: '合同管理' },
  { label: '军品业务' },
]

const DOMAIN_PAGES: PortalPage[] = ['domain', 'procurement', 'accounting']

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function App() {
  const [currentPage, setCurrentPage] = useState<PortalPage>('home')
  const [issueTab, setIssueTab] = useState<IssueTab>('suspects')
  const [modelTab, setModelTab] = useState<ModelTab>('key11')
  const [permTab, setPermTab] = useState<PermTab>('config')
  const [, setLatestPrompt] = useState('')
  const [isDomainExpanded, setIsDomainExpanded] = useState(true)
  const isDomainSectionActive = DOMAIN_PAGES.includes(currentPage)
  const [healthDimensions, setHealthDimensions] = useState(() =>
    HEALTH_DEFAULT_DIMENSIONS.map((dim) => ({ ...dim })),
  )

  const healthScore = useMemo(() => {
    const weighted = healthDimensions.reduce((sum, dim) => sum + dim.score * (dim.weight / 100), 0)
    return clamp(Math.round(weighted - HEALTH_VETO_TOTAL), 0, 100)
  }, [healthDimensions])

  const { healthStatusText, healthStatusColor } = useMemo(() => {
    if (healthScore <= 60) {
      return { healthStatusText: '! 危险', healthStatusColor: '#c0392b' }
    }
    if (healthScore <= 80) {
      return { healthStatusText: '▲ 预警', healthStatusColor: '#e8a020' }
    }
    return { healthStatusText: '● 健康', healthStatusColor: '#287a4a' }
  }, [healthScore])

  const emitPrompt = (text: string) => {
    setLatestPrompt(text)
    invokePrompt(text)
  }

  const goPage = (page: PortalPage, prompt?: string) => {
    setCurrentPage(page)
    if (!DOMAIN_PAGES.includes(page)) {
      setIsDomainExpanded(false)
    }
    if (prompt) {
      emitPrompt(prompt)
    }
  }

  const goIssueStats = () => {
    setIssueTab('stats')
    goPage('issue', '进入问题统计报告')
  }

  const goIssueFollow = () => {
    if (issueTab === 'stats') {
      setIssueTab('suspects')
    }
    goPage('issue', '进入问题跟进穿透')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onPrompt={emitPrompt}
            onNavigate={goPage}
            healthScore={healthScore}
            healthStatusText={healthStatusText}
            healthStatusColor={healthStatusColor}
          />
        )
      case 'domain':
        return <DomainPage onNavigate={goPage} onPrompt={emitPrompt} />
      case 'procurement':
        return <ProcurementPage onPrompt={emitPrompt} onNavigate={goPage} onModelTabChange={setModelTab} />
      case 'accounting':
        return <AccountingPage onPrompt={emitPrompt} onNavigate={goPage} onModelTabChange={setModelTab} />
      case 'issue':
        return <IssuePage issueTab={issueTab} onTabChange={setIssueTab} onPrompt={emitPrompt} />
      case 'func':
        return (
          <FuncPage
            onNavigate={goPage}
            onPrompt={emitPrompt}
            onIssueTabChange={setIssueTab}
            onModelTabChange={setModelTab}
            onPermTabChange={setPermTab}
          />
        )
      case 'model':
        return <ModelPage modelTab={modelTab} onTabChange={setModelTab} onPrompt={emitPrompt} />
      case 'perm':
        return <PermPage permTab={permTab} onTabChange={setPermTab} onPrompt={emitPrompt} />
      case 'healthcheck':
        return (
          <HealthCheckPage
            onNavigate={goPage}
            onPrompt={emitPrompt}
            healthScore={healthScore}
            healthStatusText={healthStatusText}
            healthStatusColor={healthStatusColor}
            dimensions={healthDimensions}
            onDimensionsChange={setHealthDimensions}
          />
        )
      default:
        return null
    }
  }

  const getBeijingTime = () => {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Shanghai',
    });

    const parts = formatter.formatToParts(now);
    const p = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '';

    return `${p('year')}-${p('month')}-${p('day')} ${p('hour')}:${p('minute')}:${p('second')}`;
  };

  return (
    <div className="dash">
      <header className="topbar">
        <div className="logo-block">
          <div className="logo-icon">监管</div>
          <div className="logo-text">穿透式监管平台</div>
          <nav className="nav-tabs" aria-label="主导航">
            {TOP_NAV.filter(page => ['home', 'domain', 'func'].includes(page)).map((page) => (
              <div
                key={page}
                className={`ntab ${(page === 'domain' ? isDomainSectionActive : currentPage === page) ? 'active' : ''}`}
                onClick={() => goPage(page, `切换到${PAGE_TITLES[page]}`)}
              >
                {PAGE_TITLES[page]}
              </div>
            ))}
          </nav>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 10, color: '#94a8bc' }}>访问时间：{getBeijingTime()}</span>
          <span className="ba">预警 7</span>
          <span className="br">高风险 3</span>
          <div className="user-tag">
            <div className="user-avatar">总</div>
            <div>
              <div className="user-name">总经理</div>
              <div className="user-role">集团总部</div>
            </div>
          </div>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <div>
            <div className="ss">主导航</div>
            <div className={`si ${currentPage === 'home' ? 'active' : ''}`} onClick={() => goPage('home', '进入首页总览')}>
              <span className="si-icon">◉</span>
              <span>首页总览</span>
            </div>
            <div
              className={`si ${isDomainSectionActive ? 'active' : ''}`}
              onClick={() => {
                if (isDomainSectionActive && isDomainExpanded) {
                  setIsDomainExpanded(false)
                  return
                }
                setIsDomainExpanded(true)
                if (currentPage !== 'domain') {
                  goPage('domain', '进入十大重点领域')
                }
              }}
            >
              <span className="si-icon">◎</span>
              <span>十大重点领域</span>
              <span className={`si-chevron ${isDomainExpanded ? 'open' : ''}`}>▾</span>
            </div>
            {isDomainExpanded &&
              DOMAIN_FOCUS_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className={`si-sub ${item.page && currentPage === item.page ? 'active' : ''} ${item.page ? '' : 'disabled'}`}
                  onClick={() => {
                    if (item.page) {
                      goPage(item.page, `进入${item.label}`)
                    }
                  }}
                >
                  <span className="sdot"></span>
                  <span>{item.label}</span>
                </div>
              ))}
          </div>

          <div>
            <div className="ss">穿透监管问题处置</div>
            <div className={`si ${currentPage === 'issue' && issueTab !== 'stats' ? 'active' : ''}`} onClick={goIssueFollow}>
              <span className="si-icon">◆</span>
              <span>问题跟进穿透</span>
            </div>
            <div className={`si ${currentPage === 'issue' && issueTab === 'stats' ? 'active' : ''}`} onClick={goIssueStats}>
              <span className="si-icon">▤</span>
              <span>问题统计报告</span>
            </div>
          </div>

          <div>
            <div className="ss">监管支撑</div>
            <div className={`si ${currentPage === 'model' ? 'active' : ''}`} onClick={() => goPage('model', '进入模型中心')}>
              <span className="si-icon">⬢</span>
              <span>模型中心</span>
            </div>
            <div className={`si ${currentPage === 'perm' ? 'active' : ''}`} onClick={() => goPage('perm', '进入权限管理')}>
              <span className="si-icon">◍</span>
              <span>权限管理</span>
            </div>
            <div className={`si ${currentPage === 'healthcheck' ? 'active' : ''}`} onClick={() => goPage('healthcheck', '进入穿透监管健康指数')}>
              <span className="si-icon">◔</span>
              <span>健康指数模型</span>
            </div>
            <div className="si disabled" onClick={() => undefined}>
              <span className="si-icon">◌</span>
              <span>数据中心</span>
            </div>
          </div>
        </aside>

        <main className="content">
          <div className="breadcrumb">
            {currentPage === 'home' ? (
              <span className="bc-cur">首页总览</span>
            ) : currentPage === 'procurement' || currentPage === 'accounting' ? (
              <>
                <span className="bc-link" onClick={() => goPage('home')}>首页总览</span>
                <span className="bc-sep">/</span>
                <span className="bc-link" onClick={() => goPage('domain')}>十大领域穿透</span>
                <span className="bc-sep">/</span>
                <span className="bc-cur">{PAGE_TITLES[currentPage]}</span>
              </>
            ) : (
              <>
                <span className="bc-link" onClick={() => goPage('home')}>首页总览</span>
                <span className="bc-sep">/</span>
                <span className="bc-cur">{currentPage === 'domain' ? '十大领域穿透' : currentPage === 'healthcheck' ? '穿透监管健康指数 · 模型模拟器' : PAGE_TITLES[currentPage]}</span>
              </>
            )}
          </div>

          {renderPage()}

          {/* <div className="kc" style={{ marginTop: 12 }}>
            <div className="kt">最近 sendPrompt</div>
            <div className="amain">{promptPreview}</div>
          </div> */}
        </main>
      </div>
    </div>
  )
}

export default App
