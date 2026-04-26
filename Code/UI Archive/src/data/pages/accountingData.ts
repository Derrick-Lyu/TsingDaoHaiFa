export type StatItem = {
  value: string
  label: string
  sub: string
  valueCls: 'r' | 'a' | 'g' | 'p' | 'b'
  subColor: string
}

export type ModuleRisk = {
  icon: string
  iconCls: 'r' | 'a' | 'g' | 'p'
  name: string
  value: string
  valueCls: 'r' | 'a' | 'g' | 'p' | 'b'
  badge: string
  badgeCls: 'r' | 'a' | 'g'
}

export type VoucherGauge = {
  label: string
  meta: string
  amount: string
  amountColor: string
  value: string
  valueCls: 'r' | 'a' | 'g'
  fillCls: 'r' | 'a' | 'g'
  width: number
}

export type KeyRisk = {
  title: string
  titleColor: string
  desc: string
  entity: string
  amount: string
  amountColor: string
  risk: string
  riskCls: 'rp-r' | 'rp-a' | 'rp-g'
  action: string
  prompt: string
}

export type OverdueBand = {
  label: string
  value: string
  width: number
  color: string
}

export type TimelineItem = {
  time: string
  lineCls: 'r' | 'a' | 'b' | 'g' | 'p'
  title: string
  desc: string
  amount?: string
  tail?: string
}

export type PolicyRow = {
  clause: string
  text: string
  status: string
  statusColor: string
  sideText: string
  bg: string
  border: string
  action: string
  prompt?: string
}

export type RectifyItem = {
  ratio: string
  color: string
  label: string
  sub: string
}

export type ModelHit = {
  level: 'H' | 'M'
  levelColor: string
  bg: string
  borderColor: string
  title: string
  desc: string
  action: string
  prompt?: string
  onAction?: 'model'
}

export type ModelTrend = {
  month: string
  trigger: string
  hitCount: string
  amount: string
  amountColor: string
  hitRate: string
  hitRateColor: string
  highlight?: boolean
}

export const ACCOUNTING_SUMMARY_STATS: StatItem[] = [
  { value: '47', label: '异常凭证数', sub: '涉及金额2,400万 · 本月新增', valueCls: 'r', subColor: '#c0392b' },
  { value: '1,240', label: '待核销发票', sub: '超期90天 · 312张', valueCls: 'a', subColor: '#c8870e' },
  { value: '97.8%', label: '报表合规率', sub: '↑ 较上季+1.1%', valueCls: 'g', subColor: '#287a4a' },
  { value: '98.3%', label: '凭证核准率', sub: '目标≥99% · 待提升', valueCls: 'p', subColor: '#6c4faa' },
  { value: '12', label: '资产权属不清', sub: '账面价值8.6亿', valueCls: 'r', subColor: '#c0392b' },
  { value: '23', label: '过度负债主体', sub: '资产负债率>80%', valueCls: 'a', subColor: '#c8870e' },
  { value: '96.1%', label: '费用合规报销率', sub: '↑ 持续改善', valueCls: 'g', subColor: '#287a4a' },
  { value: '99.2%', label: '往来账款清理率', sub: '↑ 较上年+2.3%', valueCls: 'g', subColor: '#287a4a' },
]

export const ACCOUNTING_MODULE_RISKS: ModuleRisk[] = [
  { icon: '核', iconCls: 'r', name: '会计核算合规率', value: '98.3', valueCls: 'p', badge: '达标', badgeCls: 'g' },
  { icon: '预', iconCls: 'a', name: '全面预算执行率', value: '87.4', valueCls: 'a', badge: '偏低', badgeCls: 'a' },
  { icon: '资', iconCls: 'r', name: '资产管理规范率', value: '91.2', valueCls: 'r', badge: '待整改', badgeCls: 'r' },
  { icon: '税', iconCls: 'g', name: '税务申报合规率', value: '99.6', valueCls: 'g', badge: '正常', badgeCls: 'g' },
  { icon: '费', iconCls: 'a', name: '费用报销合规率', value: '96.1', valueCls: 'a', badge: '关注', badgeCls: 'a' },
  { icon: '往', iconCls: 'g', name: '往来账款清理率', value: '99.2', valueCls: 'g', badge: '正常', badgeCls: 'g' },
]

export const ACCOUNTING_VOUCHER_GAUGES: VoucherGauge[] = [
  { label: '摘要缺失', meta: '18笔', amount: '720万', amountColor: '#c0392b', value: '38.3%', valueCls: 'r', fillCls: 'r', width: 38 },
  { label: '越权审批', meta: '12笔', amount: '860万', amountColor: '#c0392b', value: '25.5%', valueCls: 'r', fillCls: 'r', width: 26 },
  { label: '拆分入账', meta: '9笔', amount: '540万', amountColor: '#c8870e', value: '19.1%', valueCls: 'a', fillCls: 'a', width: 19 },
  { label: '科目错误', meta: '8笔', amount: '280万', amountColor: '#c8870e', value: '17.0%', valueCls: 'a', fillCls: 'a', width: 17 },
]

export const ACCOUNTING_KEY_RISKS: KeyRisk[] = [
  {
    title: '资产权属不清',
    titleColor: '#c0392b',
    desc: '账实不符12项',
    entity: '8家子公司',
    amount: '8.6亿',
    amountColor: '#c0392b',
    risk: '待整改',
    riskCls: 'rp-r',
    action: '核查↗',
    prompt: '对资产权属不清问题进行穿透分析，制定账实核查和确权方案',
  },
  {
    title: '过度负债',
    titleColor: '#c0392b',
    desc: '负债率>80%',
    entity: '23家主体',
    amount: '涉债4,100万',
    amountColor: '#c0392b',
    risk: '高风险',
    riskCls: 'rp-r',
    action: '分析↗',
    prompt: '分析23家过度负债主体的成因和债务重组方案',
  },
  {
    title: '贸易业务净额入账',
    titleColor: '#c8870e',
    desc: '影响报表真实性',
    entity: '3家子公司',
    amount: '1,240万',
    amountColor: '#c8870e',
    risk: '预警',
    riskCls: 'rp-a',
    action: '核查↗',
    prompt: '对贸易业务净额入账问题进行核查，评估对财务报表的影响',
  },
  {
    title: '违规担保',
    titleColor: '#c8870e',
    desc: '未履行审批',
    entity: '5家主体',
    amount: '3,800万',
    amountColor: '#c8870e',
    risk: '预警',
    riskCls: 'rp-a',
    action: '穿透↗',
    prompt: '对违规担保行为进行穿透核查，评估法律风险和整改路径',
  },
  {
    title: '费用报销超标',
    titleColor: '#287a4a',
    desc: '超预算3.9%',
    entity: '12个部门',
    amount: '468万',
    amountColor: '#287a4a',
    risk: '轻微',
    riskCls: 'rp-g',
    action: '优化↗',
    prompt: '分析费用报销超标原因，建议预算控制改进措施',
  },
]

export const ACCOUNTING_OVERDUE_BANDS: OverdueBand[] = [
  { label: '30天以内', value: '75%', width: 75, color: '#287a4a' },
  { label: '30-90天', value: '18%', width: 18, color: '#c8870e' },
  { label: '90天以上', value: '7%', width: 7, color: '#c0392b' },
]

export const ACCOUNTING_TIMELINE: TimelineItem[] = [
  {
    time: '昨日 14:22',
    lineCls: 'r',
    title: '凭证越权审批一级预警',
    desc: '某三级子公司12笔凭证发现越权审批，财务总监越权签批，涉及金额 ',
    amount: '860万元',
    tail: '，已冻结相关凭证',
  },
  {
    time: '昨日 10:15',
    lineCls: 'r',
    title: '资产权属不清专项预警',
    desc: '8家子公司12项固定资产账实不符，账面价值合计 ',
    amount: '8.6亿元',
    tail: '，部分资产已无法核实实际位置',
  },
  {
    time: '3天前',
    lineCls: 'a',
    title: '贸易业务净额入账异常',
    desc: '3家子公司将应以总额法入账的贸易业务采用净额法，影响营业收入虚减 ',
    amount: '1,240万元',
    tail: '，已要求更正',
  },
  {
    time: '上周',
    lineCls: 'a',
    title: '过度负债主体压降进展',
    desc: '23家资产负债率>80%的主体中，本季度成功压降5家至警戒线以下，剩余18家制定压降方案推进中',
  },
  {
    time: '上周',
    lineCls: 'b',
    title: '全面预算执行率专项分析',
    desc: 'Q1预算执行率87.4%，低于目标值92%，主要原因为投资项目延期，已启动预算调整审批流程',
  },
]

export const ACCOUNTING_POLICY_ROWS: PolicyRow[] = [
  {
    clause: '第17条',
    text: '资产权属清晰化',
    status: '未达标',
    statusColor: '#c0392b',
    sideText: '12项未确权',
    bg: '#fdeded',
    border: '#c0392b',
    action: '整改↗',
    prompt: '针对国资委2号文第17条资产权属清晰化要求，制定账实核查和确权方案',
  },
  {
    clause: '第18条',
    text: '过度负债压降',
    status: '进行中',
    statusColor: '#c0392b',
    sideText: '18家待压降',
    bg: '#fdeded',
    border: '#c0392b',
    action: '方案↗',
    prompt: '针对18家过度负债主体制定差异化压降方案，对标国资委2号文第18条',
  },
  {
    clause: '第19条',
    text: '会计核算规范化',
    status: '部分达标',
    statusColor: '#c8870e',
    sideText: '凭证异常47笔',
    bg: '#fef6e8',
    border: '#c8870e',
    action: '整改↗',
    prompt: '针对47笔异常凭证，结合国资委2号文第19条要求制定会计核算整改方案',
  },
  {
    clause: '第20条',
    text: '全面预算管理',
    status: '执行偏低',
    statusColor: '#c8870e',
    sideText: '执行率87.4%',
    bg: '#fef6e8',
    border: '#c8870e',
    action: '分析↗',
    prompt: '分析Q1预算执行率偏低87.4%的原因，给出预算管理改进和动态调整方案',
  },
  {
    clause: '第21条',
    text: '税务合规管理',
    status: '达标',
    statusColor: '#287a4a',
    sideText: '合规率99.6%',
    bg: '#eaf5ee',
    border: '#287a4a',
    action: '持续监控',
  },
]

export const ACCOUNTING_RECTIFY_PROGRESS: RectifyItem[] = [
  { ratio: '0/2', color: '#c0392b', label: '未启动', sub: '资产确权整改' },
  { ratio: '3/5', color: '#c8870e', label: '进行中', sub: '负债压降·凭证整改' },
  { ratio: '3/3', color: '#287a4a', label: '已完成', sub: '税务·发票·往来账' },
  { ratio: '6/10', color: '#6c4faa', label: '总完成率', sub: '60% · 稳步推进' },
]

export const ACCOUNTING_MODEL_HITS: ModelHit[] = [
  {
    level: 'H',
    levelColor: '#c0392b',
    bg: '#fdeded',
    borderColor: '#c0392b',
    title: '凭证越权审批检测',
    desc: '命中12笔 · 涉及金额860万 · 财务总监越权签批',
    action: '模型详情↗',
    onAction: 'model',
  },
  {
    level: 'H',
    levelColor: '#c0392b',
    bg: '#fdeded',
    borderColor: '#c0392b',
    title: '空转走单风险识别',
    desc: '命中7笔贸易业务 · 合同发票不一致 · 涉及2,400万',
    action: '穿透↗',
    prompt: '对7笔空转走单风险业务进行全链条穿透，核查资金流向和实物流转情况',
  },
  {
    level: 'H',
    levelColor: '#c0392b',
    bg: '#fdeded',
    borderColor: '#c0392b',
    title: '异常冲销凭证检测',
    desc: '命中18笔 · 跨期冲销 · 疑似调节利润',
    action: '穿透↗',
    prompt: '对18笔异常冲销凭证进行穿透分析，评估是否存在利润操纵行为',
  },
  {
    level: 'M',
    levelColor: '#c8870e',
    bg: '#fef6e8',
    borderColor: '#c8870e',
    title: '多计运输保险费',
    desc: '命中34份合同 · 多计运险费合计68万',
    action: '穿透↗',
    prompt: '对34份多计运输保险费合同进行穿透核查，计算实际多计金额并制定追偿方案',
  },
  {
    level: 'M',
    levelColor: '#c8870e',
    bg: '#fef6e8',
    borderColor: '#c8870e',
    title: '国际业务附加税多结算',
    desc: '命中6家境内企业 · 无义务仍列支附加税 · 涉及24万',
    action: '穿透↗',
    prompt: '对6家国际业务附加税多结算企业进行穿透核查，追缴多列支税款并规范操作流程',
  },
  {
    level: 'M',
    levelColor: '#c8870e',
    bg: '#fef6e8',
    borderColor: '#c8870e',
    title: '手工凭证比例超标',
    desc: '3家子公司比例超30% · 最高达42% · 核算风险高',
    action: '穿透↗',
    prompt: '对手工凭证比例超标的3家子公司进行专项审计，评估核算质量和内控风险',
  },
]

export const ACCOUNTING_MODEL_TREND: ModelTrend[] = [
  { month: '11月', trigger: '2,840', hitCount: '31', amount: '1,820万', amountColor: '#c8870e', hitRate: '72.4%', hitRateColor: '#287a4a' },
  { month: '12月', trigger: '3,012', hitCount: '38', amount: '2,140万', amountColor: '#c8870e', hitRate: '74.1%', hitRateColor: '#287a4a' },
  { month: '1月', trigger: '2,990', hitCount: '35', amount: '1,960万', amountColor: '#c8870e', hitRate: '75.3%', hitRateColor: '#287a4a' },
  { month: '2月', trigger: '3,124', hitCount: '42', amount: '2,680万', amountColor: '#c8870e', hitRate: '76.8%', hitRateColor: '#c8870e' },
  { month: '3月', trigger: '3,247', hitCount: '40', amount: '2,510万', amountColor: '#c8870e', hitRate: '76.6%', hitRateColor: '#c8870e' },
  { month: '4月', trigger: '3,847', hitCount: '47', amount: '3,352万', amountColor: '#c0392b', hitRate: '78.9%', hitRateColor: '#6c4faa', highlight: true },
]
