export type ScenarioDomainCard = {
  domain: string
  englishName: string
  modelCount: string
  color: string
  topGradient: string
  icon: string
  iconBg: string
  desc: string
  highRisk: string
  warning: string
  normal: string
  foot: string
  hoverBorderColor: string
  hoverShadow: string
}

export type ScenarioSummary = {
  value: string
  label: string
  color: string
}

export const SCENARIO_DOMAIN_CARDS: ScenarioDomainCard[] = [
  {
    domain: '投资管理',
    englishName: 'Investment Management',
    modelCount: '28',
    color: '#1a3f6f',
    topGradient: 'linear-gradient(90deg,#1a3f6f,#2c5f9e)',
    icon: '📈',
    iconBg: '#eef3fa',
    desc: '涵盖多层架构识别、非主业投资监控、委外研发占比、重大决策合规审查等投资全链条风险场景',
    highRisk: '高风险·7条',
    warning: '预警·8条',
    normal: '正常·3条',
    foot: '4大穿透 · 全链条覆盖',
    hoverBorderColor: '#c5d5e8',
    hoverShadow: '0 8px 24px rgba(26,63,111,.12)',
  },
  {
    domain: '产权管理',
    englishName: 'Property Rights Management',
    modelCount: '24',
    color: '#6c4faa',
    topGradient: 'linear-gradient(90deg,#6c4faa,#8b67cc)',
    icon: '🏛',
    iconBg: '#f0ecfa',
    desc: '涵盖控股不控权、虚假控股、无关多元化投资识别、资产权属核查、股权代持等核心风险场景',
    highRisk: '高风险·5条',
    warning: '预警·6条',
    normal: '正常·3条',
    foot: '全级次穿透 · 主体覆盖',
    hoverBorderColor: '#c9bbe8',
    hoverShadow: '0 8px 24px rgba(108,79,170,.12)',
  },
  {
    domain: '财务管理',
    englishName: 'Financial Management',
    modelCount: '22',
    color: '#0f6e56',
    topGradient: 'linear-gradient(90deg,#0f6e56,#1a9470)',
    icon: '💰',
    iconBg: '#e1f5ee',
    desc: '涵盖靠企吃企、员工大额代付、违规担保、预算执行偏差、现金流异常、融资性贸易等风险场景',
    highRisk: '高风险·9条',
    warning: '预警·8条',
    normal: '正常·5条',
    foot: '全要素穿透 · 资金全链条',
    hoverBorderColor: '#9fe1cb',
    hoverShadow: '0 8px 24px rgba(15,110,86,.12)',
  },
  {
    domain: '会计管理',
    englishName: 'Accounting Management',
    modelCount: '16',
    color: '#6c4faa',
    topGradient: 'linear-gradient(90deg,#6c4faa,#5c3f9a)',
    icon: '📒',
    iconBg: '#f0ecfa',
    desc: '涵盖空转走单、多计运险费、国际业务附加税、摘要缺失、凭证越权审批、拆分入账等核心异常',
    highRisk: '高风险·6条',
    warning: '预警·7条',
    normal: '正常·3条',
    foot: '全要素穿透 · 凭证全覆盖',
    hoverBorderColor: '#c9bbe8',
    hoverShadow: '0 8px 24px rgba(108,79,170,.10)',
  },
  {
    domain: '薪酬管理',
    englishName: 'Compensation Management',
    modelCount: '18',
    color: '#a030a0',
    topGradient: 'linear-gradient(90deg,#a030a0,#c040c0)',
    icon: '👥',
    iconBg: '#fef0f8',
    desc: '涵盖违规津贴检测、编外人员吃空饷、绩效审批合规、薪酬总额超预算、高管薪酬异常等风险场景',
    highRisk: '高风险·3条',
    warning: '预警·6条',
    normal: '正常·3条',
    foot: '全要素穿透 · 人员全链条',
    hoverBorderColor: '#e0b8e0',
    hoverShadow: '0 8px 24px rgba(160,48,160,.10)',
  },
  {
    domain: '金融风险管理',
    englishName: 'Financial Risk Management',
    modelCount: '19',
    color: '#c0392b',
    topGradient: 'linear-gradient(90deg,#c0392b,#e04535)',
    icon: '⚠',
    iconBg: '#fdeded',
    desc: '涵盖过度负债预警、融资性贸易识别、违规资金占用、大额异常交易、资金池异常归集等高风险场景',
    highRisk: '高风险·11条',
    warning: '预警·6条',
    normal: '正常·2条',
    foot: '全链条 · 全要素穿透',
    hoverBorderColor: '#f5c6c6',
    hoverShadow: '0 8px 24px rgba(192,57,43,.12)',
  },
  {
    domain: '采购与供应链管理',
    englishName: 'Procurement & Supply Chain',
    modelCount: '34',
    color: '#c8870e',
    topGradient: 'linear-gradient(90deg,#c8870e,#e0a020)',
    icon: '🛒',
    iconBg: '#fef6e8',
    desc: '涵盖小额采购规避审批、供应商报价规律性、单一来源采购不合理、假外包真派遣、价格不合理识别等全链条场景',
    highRisk: '高风险·8条',
    warning: '预警·9条',
    normal: '正常·4条',
    foot: '全链条穿透 · 供应链全覆盖',
    hoverBorderColor: '#f5dfa0',
    hoverShadow: '0 8px 24px rgba(200,135,14,.12)',
  },
  {
    domain: '境外业务管理',
    englishName: 'Overseas Entity Management',
    modelCount: '23',
    color: '#1060a0',
    topGradient: 'linear-gradient(90deg,#1060a0,#1878c0)',
    icon: '🌐',
    iconBg: '#e8f4fd',
    desc: '涵盖违规挂靠识别、境外机构治理评估、高风险国家地缘风险、境外投资回报监控等核心场景',
    highRisk: '高风险·5条',
    warning: '预警·5条',
    normal: '正常·3条',
    foot: '全级次穿透 · 境外全覆盖',
    hoverBorderColor: '#b0d0f0',
    hoverShadow: '0 8px 24px rgba(16,96,160,.12)',
  },
  {
    domain: '合同管理',
    englishName: 'Contract Management',
    modelCount: '29',
    color: '#707020',
    topGradient: 'linear-gradient(90deg,#707020,#909030)',
    icon: '📄',
    iconBg: '#f5f5e8',
    desc: '涵盖合同审签倒置、执行偏差识别、变更未经审批、合同关键条款缺失、甲乙方关联等风险场景',
    highRisk: '高风险·4条',
    warning: '预警·5条',
    normal: '正常·2条',
    foot: '全过程穿透 · 节点监控',
    hoverBorderColor: '#d8d8a0',
    hoverShadow: '0 8px 24px rgba(112,112,32,.10)',
  },
]

export const SCENARIO_SUMMARY: ScenarioSummary[] = [
  { value: '146', label: '9大领域总模型数', color: '#1a3f6f' },
  { value: '43', label: '高风险场景', color: '#c0392b' },
  { value: '51', label: '预警场景', color: '#c8870e' },
  { value: '31', label: '正常场景', color: '#287a4a' },
  { value: '89.2%', label: '模型覆盖率', color: '#6c4faa' },
]
