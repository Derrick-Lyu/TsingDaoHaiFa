import { BarRiskChart } from '../charts/BarRiskChart'
import { DoughnutRiskChart } from '../charts/DoughnutRiskChart'
import { ISSUE_TABS, type IssueTab } from '../../data/shared/navigationData'
import {
  ISSUE_CLOSURE_LABELS,
  ISSUE_CLOSURE_VALUES,
  ISSUE_STATUS_LABELS,
  ISSUE_STATUS_VALUES,
  ISSUE_SUSPECTS,
} from '../../data/pages/issueData'

type IssuePageProps = {
  issueTab: IssueTab
  onTabChange: (tab: IssueTab) => void
  onPrompt: (text: string) => void
}


export function IssuePage({ issueTab, onTabChange, onPrompt }: IssuePageProps) {
  return (
    <section>
      <div className="iss-topbar">
        <div className="iss-title-block">
          <div className="iss-icon">📌</div>
          <div>
            <div className="iss-main-title">问题跟进穿透</div>
            <div className="iss-sub-title">疑点识别、评估分发、整改销号一体化闭环</div>
          </div>
        </div>
        <div className="iss-stat-bar">
          <div className="iss-stat">
            <div className="iss-sv" style={{ color: '#c0392b' }}>23</div>
            <div className="iss-sl">待处置</div>
          </div>
          <div className="iss-stat">
            <div className="iss-sv" style={{ color: '#c8870e' }}>12</div>
            <div className="iss-sl">整改中</div>
          </div>
          <div className="iss-stat">
            <div className="iss-sv" style={{ color: '#287a4a' }}>98</div>
            <div className="iss-sl">已销号</div>
          </div>
        </div>
      </div>

      <div className="mid-grid2">
        <div className="mid-card">
          <div className="sec blue">问题状态分布</div>
          <div className="chart-wrap">
            <DoughnutRiskChart
              labels={ISSUE_STATUS_LABELS}
              values={ISSUE_STATUS_VALUES}
              colors={['#c0392b', '#c8870e', '#287a4a']}
            />
          </div>
        </div>
        <div className="mid-card">
          <div className="sec blue">月度销号趋势</div>
          <div className="chart-wrap">
            <BarRiskChart labels={ISSUE_CLOSURE_LABELS} values={ISSUE_CLOSURE_VALUES} color="#1a3f6f" />
          </div>
        </div>
      </div>

      <div className="iss-tabs">
        {ISSUE_TABS.map((tab) => (
          <div key={tab.id} className={`iss-tab ${issueTab === tab.id ? 'active' : ''}`} onClick={() => onTabChange(tab.id)}>
            <span className="iss-tab-icon">◉</span>
            {tab.label}
            <span className="iss-tab-badge">{tab.id === 'suspects' ? 23 : tab.id === 'rectify' ? 12 : 6}</span>
          </div>
        ))}
      </div>

      <div className={`iss-panel ${issueTab === 'suspects' ? 'active' : ''}`}>
        <div className="sus-grid">
          {ISSUE_SUSPECTS.map((item) => (
            <div key={item.id} className={`sus-card ${item.cls}`} onClick={() => onPrompt(`查看问题 ${item.id}`)}>
              <div className="sus-top">
                <span className="sus-id">{item.id}</span>
                <span className="sus-source">{item.source}</span>
              </div>
              <div className="sus-title">{item.title}</div>
              <div className="sus-desc">{item.desc}</div>
              <div className="sus-footer">
                <span className={`sus-domain ${item.cls}`}>{item.domain}</span>
                <span className="sus-date">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {issueTab !== 'suspects' ? (
        <div className="iss-table-wrap">
          <table className="iss-table">
            <thead>
              <tr>
                <th>事项</th>
                <th>责任单位</th>
                <th>当前状态</th>
                <th>截止时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>采购异常核查</td>
                <td>供应链管理部</td>
                <td>{ISSUE_TABS.find((item) => item.id === issueTab)?.label}</td>
                <td>2026-04-22</td>
                <td>
                  <span className="pierce-link" onClick={() => onPrompt('查看采购异常核查详情')}>查看详情</span>
                </td>
              </tr>
              <tr>
                <td>资金占用整改</td>
                <td>财务部</td>
                <td>{ISSUE_TABS.find((item) => item.id === issueTab)?.label}</td>
                <td>2026-04-25</td>
                <td>
                  <span className="pierce-link" onClick={() => onPrompt('查看资金占用整改进度')}>查看详情</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
