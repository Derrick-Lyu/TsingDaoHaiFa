export const penetrationOverview = [
  {
    id: "level",
    title: "全级次穿透",
    subjects: [
      { label: "高风险主体", value: 28 },
      { label: "中风险主体", value: 46 },
      { label: "低风险主体", value: 72 },
    ],
    businessStats: [
      { label: "高风险业务", value: 182 },
      { label: "中风险业务", value: 356 },
      { label: "低风险业务", value: 742 },
    ],
  },
  {
    id: "chain",
    title: "全链条穿透",
    subjects: [
      { label: "高风险主体", value: 31 },
      { label: "中风险主体", value: 52 },
      { label: "低风险主体", value: 68 },
    ],
    businessStats: [
      { label: "高风险业务", value: 214 },
      { label: "中风险业务", value: 332 },
      { label: "低风险业务", value: 649 },
    ],
  },
  {
    id: "process",
    title: "全过程穿透",
    subjects: [
      { label: "高风险主体", value: 26 },
      { label: "中风险主体", value: 44 },
      { label: "低风险主体", value: 74 },
    ],
    businessStats: [
      { label: "高风险业务", value: 196 },
      { label: "中风险业务", value: 388 },
      { label: "低风险业务", value: 750 },
    ],
  },
  {
    id: "factor",
    title: "全要素穿透",
    subjects: [
      { label: "高风险主体", value: 29 },
      { label: "中风险主体", value: 49 },
      { label: "低风险主体", value: 79 },
    ],
    businessStats: [
      { label: "高风险业务", value: 208 },
      { label: "中风险业务", value: 391 },
      { label: "低风险业务", value: 813 },
    ],
  },
];

export const domainPenetrations = [
  { id: "invest", title: "投资穿透", count: 132, score: 82, theme: "blue" },
  { id: "property", title: "产权穿透", count: 96, score: 79, theme: "teal" },
  { id: "finance", title: "财务穿透", count: 108, score: 84, theme: "purple" },
  { id: "account", title: "会计穿透", count: 87, score: 76, theme: "orange" },
  { id: "salary", title: "薪酬穿透", count: 64, score: 73, theme: "pink" },
  { id: "banking", title: "金融风险穿透", count: 91, score: 81, theme: "blue" },
  { id: "defense", title: "军品业务穿透", count: 52, score: 78, theme: "teal" },
  { id: "supply", title: "采购与供应链穿透", count: 116, score: 80, theme: "purple" },
  { id: "overseas", title: "境外单位穿透", count: 43, score: 69, theme: "orange" },
  { id: "contract", title: "合同穿透", count: 75, score: 74, theme: "pink" },
];

export const riskHandlingStats = [
  { id: "all", label: "三单总量", value: 1680 },
  { id: "processing", label: "处理中", value: 465 },
  { id: "overdue", label: "超时未处理", value: 414 },
  { id: "rate", label: "处置率", value: "72.32%" },
];

export const riskHandlingTrend = [
  { company: "湖北公司", volume: 40, rate: 88 },
  { company: "山西公司", volume: 40, rate: 80 },
  { company: "四川公司", volume: 38, rate: 82 },
  { company: "福建公司", volume: 36, rate: 60 },
  { company: "内蒙古公司", volume: 30, rate: 92 },
];

export const modelEntries = [
  { id: "open", title: "模型开放社区", icon: "◎", tone: "green" },
  { id: "history", title: "模型维护历史", icon: "◍", tone: "orange" },
  { id: "summary", title: "模型汇总", icon: "◉", tone: "pink" },
];
