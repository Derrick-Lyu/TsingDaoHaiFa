import type { PortalPage } from './navigationData'

export type DomainRiskCard = {
  name: string
  level: 'hi' | 'mi' | 'lo' | 'na'
  levelLabel: string
  count: string
  trend: string
  trendClass: 'up' | 'dn' | 'fl' | ''
  prompt: string
  page?: PortalPage
}

export const domainCards: DomainRiskCard[] = [
  {
    name: '投资管理',
    level: 'mi',
    levelLabel: '中风险',
    count: '3',
    trend: '↑ +2',
    trendClass: 'up',
    prompt: '展开投资管理风险领域的详细穿透分析',
  },
  {
    name: '产权管理',
    level: 'lo',
    levelLabel: '低风险',
    count: '2',
    trend: '↓ -1',
    trendClass: 'dn',
    prompt: '展开产权管理风险领域的详细穿透分析',
  },
  {
    name: '财务管理',
    level: 'mi',
    levelLabel: '中风险',
    count: '3',
    trend: '↑ +3',
    trendClass: 'up',
    prompt: '展开财务管理风险领域的详细穿透分析',
    page: 'accounting',
  },
  {
    name: '会计管理',
    level: 'lo',
    levelLabel: '低风险',
    count: '1',
    trend: '↓ -1',
    trendClass: 'dn',
    prompt: '进入会计信息穿透页并查看异常凭证',
  },
  {
    name: '薪酬管理',
    level: 'lo',
    levelLabel: '低风险',
    count: '1',
    trend: '↓ -2',
    trendClass: 'dn',
    prompt: '展开薪酬管理风险领域的详细穿透分析',
  },
  {
    name: '金融风险',
    level: 'hi',
    levelLabel: '高风险',
    count: '8',
    trend: '↑ +2',
    trendClass: 'up',
    prompt: '展开金融风险领域的详细穿透分析',
  },
  {
    name: '采购供应链',
    level: 'hi',
    levelLabel: '高风险',
    count: '6',
    trend: '↑ +1',
    trendClass: 'up',
    prompt: '进入采购供应链穿透页并展开风险明细',
    page: 'procurement',
  },
  {
    name: '境外业务',
    level: 'mi',
    levelLabel: '中风险',
    count: '4',
    trend: '→ 持平',
    trendClass: 'fl',
    prompt: '展开境外单位风险领域的详细穿透分析',
  },
  {
    name: '合同管理',
    level: 'mi',
    levelLabel: '中风险',
    count: '4',
    trend: '↓ -1',
    trendClass: 'dn',
    prompt: '展开合同管理风险领域的详细穿透分析',
  },
  {
    name: '军品业务',
    level: 'na',
    levelLabel: '',
    count: '',
    trend: '',
    trendClass: '',
    prompt: '',
  },
  
  
  
  
  
]
