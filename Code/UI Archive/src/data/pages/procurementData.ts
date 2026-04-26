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

export const PROCUREMENT_SCENES = [
  { label: '建立项目', value: '51,244', unit: '万元', sub: '245个项目', trend: '同比+1.21% 环比+2.2%', color: '#c0392b' },
  { label: '招标采购', value: '42,986', unit: '万元', sub: '233个项目', trend: '同比+3.31% 环比+2.23%', color: '#c8870e' },
  { label: '合同签订', value: '41,004', unit: '万元', sub: '206份合同', trend: '同比+2.14% 环比+3.11%', color: '#c8870e' },
  { label: '物资到货', value: '37,890', unit: '万元', sub: '150份合同', trend: '同比+2.57% 环比+3.01%', color: '#c8870e' },
  { label: '消耗入账', value: '35,000', unit: '万元', sub: '120份合同', trend: '同比+2.31% 环比+2.98%', color: '#c8870e' },
  { label: '应付情况', value: '244', unit: '万元', sub: '45笔待付', trend: '逾期应付 ↑ +18%', color: '#c0392b', alert: true },
]

export const PROCUREMENT_EMERGENCY_MONITOR = [
  { icon: '异', name: '紧急采购异常率', value: '11', badge: '高风险', valueCls: 'r', badgeCls: 'r' },
  { icon: '一', name: '紧急采购一致率', value: '98', badge: '正常', valueCls: 'g', badgeCls: 'g' },
  { icon: '规', name: '程序规范率', value: '96', badge: '正常', valueCls: 'g', badgeCls: 'g' },
  { icon: '申', name: '申报合理率', value: '97', badge: '正常', valueCls: 'g', badgeCls: 'g' },
]

export const PROCUREMENT_INVENTORY_GAUGES: Array<{
  label: string
  meta: string
  metaAmount?: string
  amountColor?: string
  value: string
  valueCls: 'r' | 'a' | 'g' | 'p' | 'b'
  sub: string
  fillCls: 'r' | 'a' | 'g' | 'p'
  width: number
}> = [
  { label: '虚假入库', meta: '83项', metaAmount: '1088万', amountColor: '#c0392b', value: '4.24%', valueCls: 'r', sub: '虚假入库率', fillCls: 'r', width: 42 },
  { label: '虚假出库', meta: '41项', metaAmount: '1,420万', amountColor: '#c8870e', value: '89.21%', valueCls: 'g', sub: '出库合规率', fillCls: 'g', width: 89 },
  { label: '退库规范', meta: '43条', value: '98.45%', valueCls: 'g', sub: '退库规范率', fillCls: 'g', width: 98 },
  { label: '异常拦截', meta: '544条', value: '96.34%', valueCls: 'g', sub: '异常拦截率', fillCls: 'g', width: 96 },
]

export const PROCUREMENT_SUPPLIER_RELATIONS = [
  {
    name: 'XX贸易有限公司',
    desc: '与YY科技同实控人',
    relation: '同实控人',
    relationCls: 'rp-r',
    amount: '6,800万',
    amountColor: '#c0392b',
    risk: '极高',
    riskCls: 'rp-r',
    action: '穿透↗',
    prompt: '对XX贸易有限公司关联关系进行深度穿透分析',
  },
  {
    name: 'YY科技有限公司',
    desc: '与XX贸易同实控人',
    relation: '同实控人',
    relationCls: 'rp-r',
    amount: '4,200万',
    amountColor: '#c0392b',
    risk: '极高',
    riskCls: 'rp-r',
    action: '穿透↗',
    prompt: '对YY科技有限公司进行关联方穿透分析',
  },
  {
    name: 'ZZ物资供应公司',
    desc: '与XX贸易同注册地址',
    relation: '地址关联',
    relationCls: 'rp-a',
    amount: '3,000万',
    amountColor: '#c8870e',
    risk: '高',
    riskCls: 'rp-a',
    action: '核查↗',
    prompt: '对ZZ物资供应公司进行关联关系核查',
  },
  {
    name: 'AA建材集团',
    desc: '供应商集中度48%',
    relation: '高度依赖',
    relationCls: 'rp-a',
    amount: '1.24亿',
    amountColor: '#c8870e',
    risk: '中',
    riskCls: 'rp-a',
    action: '分析↗',
    prompt: '分析AA建材集团采购集中度风险',
  },
]

export const PROCUREMENT_TIMELINE: Array<{
  time: string
  lineCls: 'r' | 'a' | 'g' | 'b' | 'p'
  title: string
  desc: string
  amount?: string
  tail?: string
}> = [
  {
    time: '今日 08:45',
    lineCls: 'r',
    title: '供应商实控人关联关系一级预警',
    desc: '三家供应商穿透发现同一实控人，涉及合同 ',
    amount: '1.4亿元',
    tail: '，疑似围标串标',
  },
  {
    time: '昨日 16:20',
    lineCls: 'r',
    title: '虚假入库数据异常增长',
    desc: '本月虚假入库率4.24%，较上月上升1.8个百分点，涉及金额 ',
    amount: '105万元',
    tail: '',
  },
  {
    time: '昨日 09:10',
    lineCls: 'a',
    title: '紧急采购异常率超阈值',
    desc: '本月紧急采购异常率11%，超过国资委2号文要求的8%上限',
  },
]

export const PROCUREMENT_POLICY_ROWS = [
  {
    clause: '第十七条',
    text: '关联供应商识别与披露',
    status: '未达标',
    statusColor: '#c0392b',
    sideText: '3家未披露',
    bg: '#fdeded',
    border: '#c0392b',
    action: '整改↗',
    prompt: '针对国资委2号文第17条关联供应商披露要求，制定整改方案',
  },
  {
    clause: '第十七条',
    text: '紧急采购比例控制',
    status: '超限',
    statusColor: '#c0392b',
    sideText: '11% vs 8%',
    bg: '#fdeded',
    border: '#c0392b',
    action: '分析↗',
    prompt: '针对紧急采购比例超限制定压降方案',
  },
  {
    clause: '第十七条',
    text: '供应商集中度管控',
    status: '预警',
    statusColor: '#c8870e',
    sideText: '41.2% vs 35%',
    bg: '#fef6e8',
    border: '#c8870e',
    action: '方案↗',
    prompt: '制定分散化采购方案降低供应商集中度',
  },
  {
    clause: '第十七条',
    text: '招标程序合规性',
    status: '达标',
    statusColor: '#287a4a',
    sideText: '合规率96%',
    bg: '#eaf5ee',
    border: '#287a4a',
    action: '持续监控',
  },
]

export const PROCUREMENT_MODEL_HITS: ModelHit[] = [
  {
    level: 'H',
    levelColor: '#c0392b',
    bg: '#fdeded',
    borderColor: '#c0392b',
    title: '供应商报价呈规律性',
    desc: '命中3家供应商 · 等差报价 · 涉及金额1.4亿',
    action: '模型详情↗',
    onAction: 'model',
  },
  {
    level: 'H',
    levelColor: '#c0392b',
    bg: '#fdeded',
    borderColor: '#c0392b',
    title: '小额采购规避合同审批',
    desc: '本月命中127笔 · 累计金额382万 · 较上月↑23%',
    action: '穿透↗',
    prompt: '查看小额采购规避合同审批模型本月127笔命中明细，分析规律并提出管控方案',
  },
  {
    level: 'H',
    levelColor: '#c0392b',
    bg: '#fdeded',
    borderColor: '#c0392b',
    title: '单一来源采购不合理',
    desc: '命中18个项目 · 理由不充分 · 涉及金额3,840万',
    action: '穿透↗',
    prompt: '对18个单一来源采购不合理项目进行穿透核查，评估供应商背景和决策合规性',
  },
  {
    level: 'M',
    levelColor: '#c8870e',
    bg: '#fef6e8',
    borderColor: '#c8870e',
    title: '采购需求申请审批不规范',
    desc: '命中43笔 · 审批层级不足 · 涉及7个部门',
    action: '穿透↗',
    prompt: '对43笔审批不规范采购申请进行穿透，识别责任部门和主要负责人',
  },
  {
    level: 'M',
    levelColor: '#c8870e',
    bg: '#fef6e8',
    borderColor: '#c8870e',
    title: '采购价格不合理识别',
    desc: '命中12个物料 · 单价偏离超50% · 涉及金额720万',
    action: '穿透↗',
    prompt: '对12个采购价格严重偏离物料进行深度穿透，分析价格成因和供应商关联关系',
  },
  // {
  //   level: 'M',
  //   levelColor: '#c8870e',
  //   bg: '#fef6e8',
  //   borderColor: '#c8870e',
  //   title: '“假外包、真派遣”识别',
  //   desc: '命中4家供应商 · 8份合同存在派遣特征',
  //   action: '穿透↗',
  //   prompt: '对4家疑似假外包真派遣供应商进行劳动合规穿透，评估法律风险和整改路径',
  // },
]

export const PROCUREMENT_MODEL_TOP5 = [
  { rank: '1', name: '小额采购规避审批', width: '100%', count: '127', color: '#c0392b' },
  { rank: '2', name: '采购审批不规范', width: '68%', count: '86', color: '#c8870e' },
  { rank: '3', name: '单一来源不合理', width: '56%', count: '71', color: '#c8870e' },
  { rank: '4', name: '采购价格不合理', width: '47%', count: '60', color: '#1a3f6f' },
  { rank: '5', name: '报价规律性检测', width: '36%', count: '46', color: '#287a4a' },
]
