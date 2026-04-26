import type { MouseEvent } from 'react'
import type { IssueTab, ModelTab, PermTab, PortalPage } from '../../data/shared/navigationData'

type FuncPageProps = {
  onNavigate: (page: PortalPage, prompt?: string) => void
  onPrompt: (text: string) => void
  onIssueTabChange?: (tab: IssueTab) => void
  onModelTabChange?: (tab: ModelTab) => void
  onPermTabChange?: (tab: PermTab) => void
}

export function FuncPage({
  onNavigate,
  onPrompt,
  onIssueTabChange,
  onModelTabChange,
  onPermTabChange,
}: FuncPageProps) {
  const stop = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  const goIssueTab = (tab: IssueTab, prompt: string) => {
    onIssueTabChange?.(tab)
    onNavigate('issue', prompt)
  }

  const goModelTab = (tab: ModelTab, prompt: string) => {
    onModelTabChange?.(tab)
    onNavigate('model', prompt)
  }

  const goPermTab = (tab: PermTab, prompt: string) => {
    onPermTabChange?.(tab)
    onNavigate('perm', prompt)
  }

  return (
    <div className="fp-wrap">
      <div className="fp-header">
        <div className="fp-title">穿透式监管 · 功能门户</div>
        <div className="fp-sub">集团全级次监管功能导航 · 点击模块进入对应功能</div>
      </div>

      <div className="fp-grid">

        <div className="fp-card teal" onClick={() => onNavigate('domain', '进入十大重点领域画像')}>
          <div className="fp-icon-wrap teal">⬡</div>
          <div className="fp-card-title">十大重点领域穿透</div>
          <div className="fp-card-desc">
            对标国资委2号文十大监管领域
            <br />
            已建采购供应链、财务管理穿透屏
          </div>
          <div className="fp-tags">
            <span className="fp-tag teal" onClick={(event) => { stop(event); onPrompt('展开投资管理领域详细穿透分析') }}>投资管理</span>
            <span className="fp-tag teal" onClick={(event) => { stop(event); onPrompt('展开产权管理领域详细穿透分析') }}>产权管理</span>
            <span className="fp-tag amber" onClick={(event) => { stop(event); onNavigate('accounting', '进入会计信息穿透') }}>财务管理</span>
            <span className="fp-tag purple" onClick={(event) => { stop(event); onPrompt('展开会计信息领域详细穿透分析') }}>会计管理</span>
            <span className="fp-tag teal" onClick={(event) => { stop(event); onPrompt('展开薪酬管理领域详细穿透分析') }}>薪酬管理</span>
            <span className="fp-tag red" onClick={(event) => { stop(event); onPrompt('展开金融风险领域详细穿透分析') }}>金融风险</span>
            <span className="fp-tag amber" onClick={(event) => { stop(event); onNavigate('procurement', '进入采购供应链') }}>采购供应链</span>
            <span className="fp-tag amber" onClick={(event) => { stop(event); onPrompt('展开境外单位领域详细穿透分析') }}>境外业务</span>
            <span className="fp-tag teal" onClick={(event) => { stop(event); onPrompt('展开合同管理领域详细穿透分析') }}>合同管理</span>
            <span className="fp-tag teal" onClick={(event) => { stop(event); onPrompt('展开军品业务领域详细穿透分析') }}>军品业务</span>
          </div>
        </div>

        <div className="fp-card amber" onClick={() => onNavigate('issue', '进入穿透监管问题处置')}>
          <div className="fp-icon-wrap amber">⚑</div>
          <div className="fp-card-title">穿透监管问题处置</div>
          <div className="fp-card-desc">
            问题全生命周期闭环管理
            <br />
            当前预警47条 · 整改完成率72.3%
          </div>
          <div className="fp-divider">
            <span className="fp-step" onClick={(event) => { stop(event); goIssueTab('suspects', '进入问题疑点') }}>问题疑点</span>
            <span className="fp-arrow">→</span>
            <span className="fp-step" onClick={(event) => { stop(event); goIssueTab('assess', '进入问题评估') }}>问题评估</span>
            <span className="fp-arrow">→</span>
            <span className="fp-step" onClick={(event) => { stop(event); goIssueTab('dispatch', '进入问题分发') }}>问题分发</span>
          </div>
          <div className="fp-divider">
            <span className="fp-step" onClick={(event) => { stop(event); goIssueTab('rectify', '进入问题整改') }}>问题整改</span>
            <span className="fp-arrow">→</span>
            <span className="fp-step" onClick={(event) => { stop(event); goIssueTab('close', '进入问题销号') }}>问题销号</span>
            <span className="fp-arrow">→</span>
            <span className="fp-step" onClick={(event) => { stop(event); goIssueTab('stats', '进入问题统计报告') }}>问题统计</span>
          </div>
        </div>

        <div className="fp-card purple" onClick={() => onNavigate('model', '进入模型中心')}>
          <div className="fp-icon-wrap purple">⬡</div>
          <div className="fp-card-title">模型中心</div>
          <div className="fp-card-desc">
            132个监管模型 · 覆盖率89.2%
            <br />
            支持场景配置、规则优化与效果评估
          </div>
          <div className="fp-tags">
            <span className="fp-tag purple" onClick={(event) => { stop(event); goModelTab('key11', '进入11个重点领域模型'); onPrompt('查看11个重点领域监管模型清单，包含模型说明、覆盖范围和当前运行状态') }}>11类重点关注领域模型</span>
            <span className="fp-tag purple" onClick={(event) => { stop(event); goModelTab('scene10', '进入核心监管场景模型') }}>十大重点领域模型</span>
            <span className="fp-tag purple" onClick={(event) => { stop(event); goModelTab('modellib', '进入监管场景模型库') }}>监管场景模型库</span>
          </div>
        </div>

        <div className="fp-card slate perm-card" onClick={() => onNavigate('perm', '进入权限管理')}>
          <div className="fp-icon-wrap slate">🔐</div>
          <div className="fp-card-title">权限管理</div>
          <div className="fp-card-desc">
            穿透式监管权限配置与分发
            <br />
            角色矩阵 · 数据权限 · 审批授权
          </div>
          <div className="fp-tags">
            <span className="fp-tag slate" onClick={(event) => { stop(event); goPermTab('config', '进入权限配置') }}>权限配置</span>
            <span className="fp-tag slate" onClick={(event) => { stop(event); goPermTab('dispatch', '进入权限分发') }}>权限分发</span>
            <span className="fp-tag slate" onClick={(event) => { stop(event); goPermTab('manage', '进入权限增删改') }}>增删改查</span>
            <span className="fp-tag slate" onClick={(event) => { stop(event); goPermTab('audit', '进入权限审计') }}>权限审计</span>
          </div>
        </div>

        <div className="fp-card slate" onClick={() => onPrompt('查看数据中心总览，包含业务、财务、审计、公司治理四大数据集') }>
          <div className="fp-icon-wrap slate">⊟</div>
          <div className="fp-card-title">数据中心</div>
          <div className="fp-card-desc">
            四大数据集全量接入
            <br />
            业务 · 财务 · 审计 · 公司治理
          </div>
          <div className="fp-tags">
            <span className="fp-tag slate" onClick={(event) => { stop(event); onPrompt('查看业务数据集概览，包含数据来源、更新频率、覆盖范围和数据质量报告') }}>业务数据集</span>
            <span className="fp-tag slate" onClick={(event) => { stop(event); onPrompt('查看财务数据集概览，包含凭证、发票、报表、预算等数据情况') }}>财务数据集</span>
            <span className="fp-tag slate" onClick={(event) => { stop(event); onPrompt('查看审计数据集概览，包含审计发现、整改跟踪和历史报告数据') }}>审计数据集</span>
            <span className="fp-tag slate" onClick={(event) => { stop(event); onPrompt('查看公司治理数据集，包含股权结构、法人治理、董事会决策等数据') }}>公司治理数据集</span>
          </div>
        </div>

        <div className="fp-card" style={{ background: '#f8fafc', borderStyle: 'dashed', cursor: 'default' }}>
          <div className="fp-icon-wrap" style={{ background: '#f0f4f8', fontSize: 28 }}>↗</div>
          <div className="fp-card-title" style={{ color: '#6b84a0' }}>快捷穿透入口</div>
          <div className="fp-card-desc" style={{ color: '#b0bec8' }}>
            已建穿透屏直接进入
            <br />
            一键跳转核心分析页面
          </div>
          <div className="fp-tags" style={{ flexDirection: 'column', width: '100%', gap: 6 }}>
            <button onClick={() => onNavigate('home', '进入领导门户')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: '#fff', border: '1px solid #dde4ec', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: '#1a3f6f', fontWeight: 500 }}>⊞ 领导门户 · 集团总览</button>
            <button onClick={() => onNavigate('procurement', '进入采购供应链穿透屏')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: '#fff', border: '1px solid #f5dfa0', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: '#b07d10', fontWeight: 500 }}>购 采购供应链穿透屏 →</button>
            <button onClick={() => onNavigate('accounting', '进入会计信息穿透屏')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: '#fff', border: '1px solid #c9bbe8', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: '#6c4faa', fontWeight: 500 }}>账 会计信息穿透屏 →</button>
            <button onClick={() => goIssueTab('suspects', '进入问题跟进穿透页')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: '#fef6e8', border: '1px solid #f5dfa0', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: '#b07d10', fontWeight: 500 }}>⚑ 问题跟进穿透页 →</button>
            <button onClick={() => goPermTab('config', '进入权限管理配置页')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: '#edf2f7', border: '1px solid #c5d5e8', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: '#3d6080', fontWeight: 500 }}>🔐 权限管理配置页 →</button>
            <button onClick={() => goModelTab('key11', '进入模型中心穿透页')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: '#f0ecfa', border: '1px solid #c9bbe8', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: '#6c4faa', fontWeight: 500 }}>⬡ 模型中心穿透页 →</button>
            {/* <button onClick={() => onPrompt('生成本月集团穿透式监管工作综合报告，涵盖四大穿透、十大领域、问题处置全情况')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: '#eef3fa', border: '1px solid #c5d5e8', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: '#1a3f6f', fontWeight: 500 }}>≡ 生成综合监管报告 ↗</button> */}
          </div>
        </div>
      </div>

      {/* <div className="fp-bottom-bar">
        <div className="fp-stat">
          <div className="fp-stat-val" style={{ color: '#1a3f6f' }}>274</div>
          <div className="fp-stat-lbl">监控主体数</div>
        </div>
        <div className="fp-stat">
          <div className="fp-stat-val" style={{ color: '#c0392b' }}>47</div>
          <div className="fp-stat-lbl">本月预警问题</div>
        </div>
        <div className="fp-stat">
          <div className="fp-stat-val" style={{ color: '#287a4a' }}>72.3%</div>
          <div className="fp-stat-lbl">问题整改完成率</div>
        </div>
        <div className="fp-stat">
          <div className="fp-stat-val" style={{ color: '#6c4faa' }}>132</div>
          <div className="fp-stat-lbl">运行中监管模型</div>
        </div>
        <div className="fp-stat">
          <div className="fp-stat-val" style={{ color: '#1a3f6f' }}>89.2%</div>
          <div className="fp-stat-lbl">模型监控覆盖率</div>
        </div>
        <div className="fp-stat">
          <div className="fp-stat-val" style={{ color: '#c8870e' }}>2.8天</div>
          <div className="fp-stat-lbl">平均问题处置时长</div>
        </div>
        <div className="fp-stat">
          <div className="fp-stat-val" style={{ color: '#287a4a' }}>1,214</div>
          <div className="fp-stat-lbl">累计已销号问题</div>
        </div>
        <div style={{ display: 'flex', gap: 8, paddingLeft: 20 }}>
          <button onClick={() => onNavigate('home', '返回领导门户')} style={{ fontSize: 11, padding: '7px 16px', background: '#f5f8fc', border: '1px solid #dde4ec', borderRadius: 6, cursor: 'pointer', color: '#6b84a0' }}>返回领导门户</button>
          <button onClick={() => onPrompt('生成本月集团穿透式监管工作综合报告，涵盖四大穿透、十大领域、问题处置全情况')} style={{ fontSize: 11, padding: '7px 16px', background: '#1a3f6f', border: '1px solid #1a3f6f', borderRadius: 6, cursor: 'pointer', color: '#fff' }}>生成综合报告 ↗</button>
          <button onClick={() => onNavigate('model', '进入模型中心')} style={{ fontSize: 11, padding: '7px 16px', background: '#f0ecfa', border: '1px solid #c9bbe8', borderRadius: 6, cursor: 'pointer', color: '#6c4faa' }}>模型中心 →</button>
        </div>
      </div> */}
    </div>
  )
}
