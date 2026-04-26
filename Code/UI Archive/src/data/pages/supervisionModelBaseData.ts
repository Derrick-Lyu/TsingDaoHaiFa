export type DomainTone = {
  border: string
  badgeBg: string
  badgeColor: string
}

export const DOMAIN_TONES: Record<string, DomainTone> = {
  投资管理: { border: '#1a3f6f', badgeBg: '#eef3fa', badgeColor: '#1a3f6f' },
  会计管理: { border: '#6c4faa', badgeBg: '#f0ecfa', badgeColor: '#6c4faa' },
  '采购与供应链管理': { border: '#b07d10', badgeBg: '#fef6e8', badgeColor: '#b07d10' },
  财务管理: { border: '#0f6e56', badgeBg: '#e1f5ee', badgeColor: '#0f6e56' },
  产权管理: { border: '#c05010', badgeBg: '#fdf0e8', badgeColor: '#c05010' },
  金融风险管理: { border: '#c0392b', badgeBg: '#fdeded', badgeColor: '#c0392b' },
  薪酬管理: { border: '#a030a0', badgeBg: '#fef0f8', badgeColor: '#a030a0' },
  合同管理: { border: '#707020', badgeBg: '#f5f5e8', badgeColor: '#707020' },
  境外单位管理: { border: '#1060a0', badgeBg: '#e8f4fd', badgeColor: '#1060a0' },
  其他类别: { border: '#4a6480', badgeBg: '#f0f4f8', badgeColor: '#4a6480' },
}

export const DEFAULT_TONE: DomainTone = { border: '#1a3f6f', badgeBg: '#eef3fa', badgeColor: '#1a3f6f' }
