export type MajorModelIcon =
  | 'holdingNoControl'
  | 'fakeControl'
  | 'multiLayer'
  | 'unrelatedDiversification'
  | 'affiliationViolation'
  | 'rentSeeking'
  | 'circularBilling'
  | 'tradeFinancing'
  | 'excessiveDebt'
  | 'overseasRisk'
  | 'financialDisorder'

export type MajorModelItem = {
  domain: string
  name: string
  bg: string
  badge: string
  badgeBg: string
  badgeColor: string
  badgeBorder: string
  desc: string
  prompt: string
  icon: MajorModelIcon
}

export const MAJOR_MODELS: MajorModelItem[] = [
  {
    domain: '投资管理',
    name: '控股不控权',
    bg: '#c0392b',
    badge: '预警模型',
    badgeBg: '#fdeded',
    badgeColor: '#c0392b',
    badgeBorder: '#f5c6c6',
    desc: '检查持股比例超50%但实际治理控制不足的被投资企业，比对董事会席位、高管任免、财务审批等关键控制要素。',
    prompt: '详细解读控股不控权风险识别模型：对于持股比例超50%但实际治理、经营管理、核心资源控制未能实现有效控制的被投资企业，识别逻辑、关键判断标准和预警规则',
    icon: 'holdingNoControl',
  },
  {
    domain: '投资管理',
    name: '虚假控股',
    bg: '#c0392b',
    badge: '预警模型',
    badgeBg: '#fdeded',
    badgeColor: '#c0392b',
    badgeBorder: '#f5c6c6',
    desc: '比对工商登记股权信息与产权数据，检查持股低于50%但已纳入并表范围的法人单位，评估财务数据合理性。',
    prompt: '详细解读虚假控股风险识别模型：比对工商登记股权信息与产权数据，检查持股低于50%但已并表的法人单位，识别逻辑和预警规则',
    icon: 'fakeControl',
  },
  {
    domain: '投资管理',
    name: '多层架构',
    bg: '#1a3f6f',
    badge: '分析模型',
    badgeBg: '#eef3fa',
    badgeColor: '#1a3f6f',
    badgeBorder: '#c5d5e8',
    desc: '识别并表范围内产权层级6级及以上法人企业，筛查链条过长的结构性风险，识别连续三年亏损、资不抵债企业。',
    prompt: '详细解读多层架构风险识别模型：识别并表范围内产权层级6级及以上法人企业，筛查连续亏损、资不抵债企业清单',
    icon: 'multiLayer',
  },
  {
    domain: '投资管理',
    name: '无关多元',
    bg: '#b07d10',
    badge: '预警模型',
    badgeBg: '#fef6e8',
    badgeColor: '#b07d10',
    badgeBorder: '#f5dfa0',
    desc: '定义集团核心主业，自动比对新设或已投资企业经营范围，识别房地产、装备制造、旅行社等非主营业务无关多元化投资风险。',
    prompt: '详细解读无关多元风险识别模型：定义集团核心主业范围，自动比对投资企业经营范围，识别房地产、服装等非主营业务无关多元化投资风险',
    icon: 'unrelatedDiversification',
  },
  {
    domain: '产权管理',
    name: '违规挂靠',
    bg: '#1060a0',
    badge: '预警模型',
    badgeBg: '#fdeded',
    badgeColor: '#c0392b',
    badgeBorder: '#f5c6c6',
    desc: '比对工商登记信息与产权系统，识别名称含集团字样但不在产权管理范围内的单位，核查往来款项挂账记录与资金结算流水。',
    prompt: '详细解读违规挂靠风险识别模型：通过比对工商登记与产权系统，识别名称含集团字样但股权归属不明的单位，核查往来款项与资金流水',
    icon: 'affiliationViolation',
  },
  {
    domain: '财务管理',
    name: '靠企吃企',
    bg: '#7b2c2c',
    badge: '预警模型',
    badgeBg: '#fdeded',
    badgeColor: '#c0392b',
    badgeBorder: '#f5c6c6',
    desc: '识别利用职权或关联关系变相侵占企业资产的行为，包括员工大额代付费用、违规发放津贴补贴、临时工“吃空饷”等风险场景。',
    prompt: '详细解读靠企吃企风险识别模型：识别利用职权、关联关系或信息不对称从事利益输送、变相侵占企业资产的行为，包括员工大额代付费用、违规担保等',
    icon: 'rentSeeking',
  },
  {
    domain: '会计管理',
    name: '空转走单',
    bg: '#6c4faa',
    badge: '分析模型',
    badgeBg: '#f0ecfa',
    badgeColor: '#6c4faa',
    badgeBorder: '#c9bbe8',
    desc: '识别无实物流转的虚假贸易交易，比对合同、发票、收付款和物资出入库记录的一致性，检测资金空转、循环采购等异常模式。',
    prompt: '详细解读空转走单风险识别模型：识别无实物流转的虚假贸易交易、循环采购、合同与发票不一致等资金空转走单风险',
    icon: 'circularBilling',
  },
  {
    domain: '金融风险管理',
    name: '融资性贸易',
    bg: '#0f6e56',
    badge: '预警模型',
    badgeBg: '#fdeded',
    badgeColor: '#c0392b',
    badgeBorder: '#f5c6c6',
    desc: '识别以贸易为名实为融资的业务模式，检测贸易净额入账异常、预付账款激增、应收账款异常挂账和无商业实质的循环交易。',
    prompt: '详细解读融资性贸易风险识别模型：识别以贸易为名实为融资的业务，包括贸易净额入账异常、预付账款激增、应收账款异常挂账等特征',
    icon: 'tradeFinancing',
  },
  {
    domain: '财务管理',
    name: '过度负债',
    bg: '#c05010',
    badge: '预警模型',
    badgeBg: '#fdeded',
    badgeColor: '#c0392b',
    badgeBorder: '#f5c6c6',
    desc: '分级检查并表范围内资产负债率超警戒线65%、超管控线70%及100%以上资不抵债企业，按季度输出分类风险单位清单。',
    prompt: '详细解读过度负债风险识别模型：分级检查并表范围内资产负债率超65%警戒线、超70%管控线及资不抵债企业，分类输出风险单位清单',
    icon: 'excessiveDebt',
  },
  {
    domain: '境外单位管理',
    name: '境外业务风险',
    bg: '#185fa5',
    badge: '预警模型',
    badgeBg: '#e8f4fd',
    badgeColor: '#1060a0',
    badgeBorder: '#b5d4f4',
    desc: '识别境外业务中的地缘政治风险、税法合规风险、资金外汇风险，核查境外机构覆盖率、跨境异常资金交易和合规培训缺失情况。',
    prompt: '详细解读境外业务风险识别模型：识别境外业务的地缘政治风险、外汇汇率风险、税务合规风险及境外单位违规挂靠等综合风险',
    icon: 'overseasRisk',
  },
  {
    domain: '财务管理',
    name: '财务金融乱象',
    bg: '#3d6080',
    badge: '预警模型',
    badgeBg: '#edf2f7',
    badgeColor: '#3d6080',
    badgeBorder: '#c5d5e8',
    desc: '识别大额跨期费用与收入调节、违规担保、违规融资、资金池违规运作等财务金融领域系统性乱象，穿透至原始凭证和业务合同。',
    prompt: '详细解读财务金融乱象风险识别模型：识别大额跨期费用调节、违规担保、违规融资、资金池违规运作等财务金融领域系统性风险',
    icon: 'financialDisorder',
  },
]
