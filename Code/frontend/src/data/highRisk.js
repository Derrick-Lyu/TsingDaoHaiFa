export const companyPromptData = [
{ name: "青岛啤酒集团", pct: 39.5 },
{ name: "海信集团控股股份公司", pct: 16.67 },
{ name: "山东能源集团齐鲁云商公司", pct: 16.2 },
{ name: "青岛港董家口液体化工码头有限公司", pct: 15.4 },
{ name: "山东省港口集团有限公司", pct: 12.1 },
{ name: "青岛港国际股份有限公司", pct: 11.58 },
{ name: "中建港航局集团", pct: 10.23 },
{ name: "中铁十四局集团市政工程分公司", pct: 8.91 },
{ name: "中铁十局集团青岛工程有限公司", pct: 7.89 },
{ name: "青岛西海岸公用事业集团能源供热有限公司", pct: 6.9 },
{ name: "青岛源发工程项目管理咨询有限公司", pct: 6.06 },
{ name: "交通银行青岛分行", pct: 5.73 },
{ name: "国家开发银行青岛分行", pct: 5.1 },
{ name: "京东健康", pct: 5.17 },
{ name: "德拓信息", pct: 5 },
{ name: "青岛城市传媒", pct: 4.35 },
{ name: "青岛西海岸新区海洋控股集团有限公司", pct: 4.3 },
{ name: "青岛国信发展（集团）有限责任公司", pct: 4 }
];

export const highRiskGridTemplate = "repeat(9, minmax(0, 1fr))";

export const highRiskHeaders = [
  { label: "金融风险",   col: "1 / 2" },
  { label: "往来款风险", col: "2 / 4" },
  { label: "循环贸易",   col: "4 / 5" },
  { label: "存货风险",   col: "5 / 6" },
  { label: "固定风险",   col: "6 / 7" },
  { label: "资金风险",   col: "7 / 8" },
  { label: "债务风险",   col: "8 / 9" },
  { label: "税务风险",   col: "9 / 10" },
];

export const highRiskMatrixRows = [
  {
    cells: [
      { column: 1, label: "市场风险",        count: 1  },
      { column: 2, label: "应付账款风险",    count: 70 },
      { column: 3, label: "其他应收/应付款风险", count: 6 },
      { column: 4, label: "疑似循环贸易",    count: 20 },
      { column: 5, label: "存货管理风险",    count: 2  },
      { column: 6, label: "在建工程风险",    count: 4  },
      { column: 7, label: "银行账户资金风险",count: 2  },
      { column: 8, label: "高负债风险",      count: 6  },
      { column: 9, label: "税务风险",        count: 2  },
    ],
  },
  {
    cells: [
      { column: 1, label: "金融信用风险",    count: 0  },
      { column: 2, label: "应收账款风险",    count: 49 },
      { column: 3, label: "合同资产风险",    count: 2  },
      { column: 7, label: "公共服务资金风险",  count: 10 },
      { column: 8, label: "债务结构风险",    count: 2  },
    ],
  },
  {
    cells: [
      { column: 1, label: "金融监管风险",    count: 0  },
      { column: 2, label: "预付账款风险",    count: 2  },
      { column: 3, label: "债权债务关联",    count: 7  },
      { column: 7, label: "资金流动性风险",  count: 2  },
      { column: 8, label: "担保代偿风险",    count: 7  },
    ],
  },
  {
    cells: [
      { column: 1, label: "衍生品操作风险",  count: 0  },
      { column: 2, label: "预收账款/合同负债风险", count: 2 },
      { column: 3, label: "科研项目风险",    count: 2  },
    ],
  },
];
