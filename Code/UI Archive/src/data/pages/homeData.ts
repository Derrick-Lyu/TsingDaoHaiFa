export const HOME_DOMAIN_TREND_LABELS = ['11月', '12月', '1月', '2月', '3月', '4月']

export const HOME_DOMAIN_TREND_VALUES = [31, 33, 30, 35, 38, 41]

export const HOME_RISK_FEED_ITEMS = [
  {
    level: 'r',
    message: 'XX子公司资金占用超限额，金融风险一级预警，涉及金额 3.2亿元',
    time: '10分钟前',
  },
  {
    level: 'r',
    message: '采购供应链发现3家供应商存在同一实控人，疑似围标串标',
    time: '1小时前',
  },
  {
    level: 'r',
    message: 'XX子公司股权代持关系穿透发现最终受益人为关联方高管亲属→穿透',
    time: '1小时前',
  },
  {
    level: 'r',
    message: '境外SPV架构下资金回流路径异常，涉及金额5.6亿元→穿透',
    time: '2小时前',
  },
  {
    level: 'r',
    message: '某二级子公司对外担保余额超净资产50%红线，涉及金额4.3亿元',
    time: '3小时前',
  },
  {
    level: 'a',
    message: '境外XX公司季报逾期未报，已触发合规预警',
    time: '3小时前',
  },
  {
    level: 'a',
    message: '集团应收账款账龄超1年占比达28%，超预警阀值',
    time: '4小时前',
  },
  {
    level: 'a',
    message: '二级子公司对外投资未履行审批流程，涉及8500万元',
    time: '昨日16:42',
  },
  {
    level: 'b',
    message: '会计信息模型检测到某三级子公司凭证异常，涉及2,400万元',
    time: '昨日14:22',
  },
  {
    level: 'a',
    message: '审计整改按期完成率连续两周低于75%，需重点督办',
    time: '昨日09:30',
  },
  {
    level: 'b',
    message: '集团采购集中度预警：前三大供应商占比突破60%',
    time: '昨日08:30',
  },
  {
    level: 'b',
    message: '某子公司商业保理业务底层资产穿透识别异常，涉及金额6700万元→穿透',
    time: '昨日07:30',
  },
]

export const HOME_TODO_ITEMS = [
  {
    level: 'r',
    mark: '!',
    title: '金融风险一级预警待审批',
    desc: 'XX子公司 · 资金占用 · 3.2亿',
    action: '处置 ↗',
    prompt: '生成金融风险一级预警的处置方案和审批建议',
  },
  {
    level: 'r',
    mark: '!',
    title: '供应商关联关系异常上报',
    desc: '采购部门 · 3家供应商 · 待核查',
    action: '穿透 ↗',
    prompt: '对3家同实控人供应商启动关联关系穿透核查',
  },
  {
    level: 'r',
    mark: '!',
    title: '关联交易价格异常核查',
    desc: '三级子公司 · 1800万元 · 穿透中',
    action: '穿透 ↗',
    prompt: '对关联交易进行穿透分析，核查价格异常原因并给出处置建议',
  },
  {
    level: 'r',
    mark: '!',
    title: '股权代持穿透核查专报',
    desc: '最终受益人 · 关联方 · 待定性',
    action: '处置 ↗',
    prompt: '生成股权代持穿透核查专报，明确最终受益人性质并给出处置建议',
  },
  {
    level: 'r',
    mark: '!',
    title: '境外资金回流合规审查',
    desc: 'SPV架构 · 5.6亿 · 跨境',
    action: '处置 ↗',
    prompt: '生成境外资金回流合规审查报告，明确合规风险并给出处置建议',
  },
  {
    level: 'a',
    mark: '▲',
    title: 'Q1监管报告签批',
    desc: '已准备完毕 · 等待总经理签批',
    action: '查阅 ↗',
    prompt: '生成Q1集团风险监管报告摘要并给出签批建议',
  },
  {
    level: 'a',
    mark: '▲',
    title: '会计凭证异常专项审查',
    desc: '三级子公司 · 2,400万 · 待核查',
    action: '穿透 ↗',
    prompt: '会计凭证异常专项审查明细及处置建议',
  },
  {
    level: 'a',
    mark: '▲',
    title: '审计整改逾期项督办',
    desc: '逾期90天以上整改项3条',
    action: '督办 ↗',
    prompt: '生成审计整改逾期项督办清单及责任划分',
  },
  {
    level: 'a',
    mark: '▲',
    title: '超额担保整改方案签批',
    desc: '二级子公司 · 4.3亿 · 限期整改',
    action: '查阅 ↗',
    prompt: '生成超额担保整改方案的审批材料，包括风险分析、整改措施和责任划分',
  },
  {
    level: 'a',
    mark: '▲',
    title: '重大投资补充决策程序',
    desc: '9200万 · 倒查责任',
    action: '穿透 ↗',
    prompt: '对重大投资事项进行穿透分析，梳理决策流程并给出责任划分建议',
  },
]
