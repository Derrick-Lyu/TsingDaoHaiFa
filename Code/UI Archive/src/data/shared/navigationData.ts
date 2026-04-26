export type PortalPage =
  | 'home'
  | 'domain'
  | 'procurement'
  | 'accounting'
  | 'issue'
  | 'func'
  | 'model'
  | 'perm'
  | 'healthcheck'

export type IssueTab = 'suspects' | 'assess' | 'dispatch' | 'rectify' | 'close' | 'stats'
export type ModelTab = 'key11' | 'scene10' | 'modellib' | 'indlib'
export type PermTab = 'config' | 'dispatch' | 'manage' | 'audit'

export const PAGE_TITLES: Record<PortalPage, string> = {
  home: '领导门户',
  domain: '十大重点领域门户',
  procurement: '采购供应链穿透',
  accounting: '财务管理穿透',
  issue: '问题跟进穿透',
  func: '功能门户',
  model: '模型中心',
  perm: '权限管理',
  healthcheck: '穿透监管健康指数',
}

export const ISSUE_TABS: { id: IssueTab; label: string }[] = [
  { id: 'suspects', label: '问题疑点' },
  { id: 'assess', label: '问题评估' },
  { id: 'dispatch', label: '问题分发' },
  { id: 'rectify', label: '问题整改' },
  { id: 'close', label: '问题销号' },
  { id: 'stats', label: '问题统计' },
]

export const MODEL_TABS: { id: ModelTab; label: string }[] = [
  { id: 'key11', label: '11类重点关注领域模型' },
  { id: 'scene10', label: '十大核心领域监管模型' },
  { id: 'modellib', label: '监管场景模型库' },
  // { id: 'indlib', label: '穿透式监管指标库' },
]

export const PERM_TABS: { id: PermTab; label: string }[] = [
  { id: 'config', label: '权限配置' },
  { id: 'dispatch', label: '权限分发' },
  { id: 'manage', label: '权限增删改' },
  { id: 'audit', label: '权限审计日志' },
]
