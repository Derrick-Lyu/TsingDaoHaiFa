import { PERM_TABS, type PermTab } from '../../data/shared/navigationData'

type PermPageProps = {
  permTab: PermTab
  onTabChange: (tab: PermTab) => void
  onPrompt: (text: string) => void
}

export function PermPage({ permTab, onTabChange, onPrompt }: PermPageProps) {
  return (
    <section>
      <div className="prm-tabs">
        {PERM_TABS.map((tab) => (
          <div key={tab.id} className={`prm-tab ${permTab === tab.id ? 'active' : ''}`} onClick={() => onTabChange(tab.id)}>
            {tab.label}
          </div>
        ))}
      </div>

      <div className={`prm-panel ${permTab === 'config' ? 'active' : ''}`}>
        <div className="role-matrix">
          <table className="role-tbl">
            <thead>
              <tr>
                <th>角色</th>
                <th>领导门户</th>
                <th>穿透分析</th>
                <th>模型中心</th>
                <th>权限管理</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>集团管理员</td>
                <td><span className="perm-dot perm-y">✓</span></td>
                <td><span className="perm-dot perm-y">✓</span></td>
                <td><span className="perm-dot perm-y">✓</span></td>
                <td><span className="perm-dot perm-y">✓</span></td>
              </tr>
              <tr>
                <td>监管专员</td>
                <td><span className="perm-dot perm-y">✓</span></td>
                <td><span className="perm-dot perm-y">✓</span></td>
                <td><span className="perm-dot perm-a">△</span></td>
                <td><span className="perm-dot perm-n">•</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={`prm-panel ${permTab === 'dispatch' ? 'active' : ''}`}>
        <div className="usr-grid">
          <div className="usr-card" onClick={() => onPrompt('分发权限给监管专员')}>
            <div className="usr-hd">
              <div className="usr-av" style={{ background: '#eef3fa', color: '#1a3f6f' }}>李</div>
              <div>
                <div className="usr-name">李晨</div>
                <div className="usr-dept">监管中心</div>
              </div>
            </div>
            <div className="usr-perms">
              <span className="perm-tag pt-full">领导门户</span>
              <span className="perm-tag pt-read">模型查看</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`prm-panel ${permTab === 'manage' ? 'active' : ''}`}>
        <div className="mid-card">
          <div className="sec blue">权限增删改</div>
          <div className="pf-row">
            <div className="pf-label">角色模板</div>
            <div className="pf-val">监管专员模板（只读+分析）</div>
            <div className="pf-toggle">
              <button className="ptog on" onClick={() => onPrompt('开启监管专员模型下载权限')}>开启</button>
              <button className="ptog off" onClick={() => onPrompt('关闭监管专员模型下载权限')}>关闭</button>
            </div>
          </div>
        </div>
      </div>

      <div className={`prm-panel ${permTab === 'audit' ? 'active' : ''}`}>
        <div className="mid-card">
          <div className="sec amber">审计日志</div>
          <div className="audit-row">
            <div className="audit-icon mod">✎</div>
            <div className="audit-body">
              <div className="audit-title">调整“监管专员”模型下载权限</div>
              <div className="audit-meta">操作人：集团管理员</div>
            </div>
            <div className="audit-time">2026-04-17 10:18</div>
          </div>
        </div>
      </div>
    </section>
  )
}
