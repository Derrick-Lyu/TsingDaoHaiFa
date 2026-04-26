export const ISSUE_STATUS_LABELS = ['待处置', '整改中', '已销号']

export const ISSUE_STATUS_VALUES = [23, 12, 98]

export const ISSUE_CLOSURE_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月']

export const ISSUE_CLOSURE_VALUES = [11, 13, 14, 17, 19, 22]

export const ISSUE_SUSPECTS = [
  {
    id: 'Q-2026-031',
    source: '采购模型',
    title: '同实控人供应商疑似围标串标',
    desc: '3家供应商报价规律性高度一致，涉及采购金额1.4亿元。',
    domain: '采购与供应链',
    cls: 'a',
    date: '2026-04-16',
  },
  {
    id: 'Q-2026-027',
    source: '资金模型',
    title: '疑似违规资金占用',
    desc: '子公司出现非经营性资金占用，单笔超5000万元。',
    domain: '金融风险',
    cls: 'r',
    date: '2026-04-14',
  },
]
