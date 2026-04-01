from __future__ import annotations

from copy import deepcopy
from datetime import date, datetime
from uuid import uuid4


SNAPSHOT_DATE = "2026-03-31"
SNAPSHOT_BATCH = "FS-2026-03-31"


def _dt(value: str) -> date:
    return date.fromisoformat(value)


def _iso_now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _format_amount_yuan(amount: float) -> str:
    return f"{amount / 10000:.2f}万元"


def _risk_label(level: str) -> str:
    return {
        "high": "高风险",
        "warn": "预警关注",
        "low": "低风险",
    }.get(level, level)


INITIAL_OVERVIEW = {
    "updatedAt": "2026-03-31 09:00:00",
    "heroNotes": [
        {"label": "资金安全专题", "value": "5个二级主题"},
        {"label": "可点击专题", "value": "1个"},
        {"label": "演示状态", "value": "已接入页面链路"},
    ],
    "fundSafetyEntry": {
        "title": "资金安全",
        "subtitle": "汇总 Sheet[资金安全] 下全部二级主题的 executive 结果",
        "note": "只有涉恐交易风险可点击进入专题页",
        "actionLabel": "进入资金安全总结页",
    },
    "riskCards": [
        {"title": "金融风险", "high": 0, "warn": 2, "hint": 3},
        {"title": "往来款风险", "high": 0, "warn": 2, "hint": 3},
        {"title": "循环贸易风险", "high": 0, "warn": 2, "hint": 3},
        {"title": "资金风险", "high": 2, "warn": 6, "hint": 4},
        {"title": "存货风险", "high": 0, "warn": 2, "hint": 3},
        {"title": "固定资产风险", "high": 0, "warn": 1, "hint": 2},
        {"title": "债务风险", "high": 0, "warn": 2, "hint": 1},
        {"title": "税务风险", "high": 0, "warn": 1, "hint": 2},
    ],
    "pieData": [
        {"name": "高风险", "value": 7, "color": "#e05c5c"},
        {"name": "中风险", "value": 12, "color": "#e8b84b"},
        {"name": "低风险", "value": 6, "color": "#7ab3e0"},
    ],
    "donutData": [
        {"name": "跟进中", "value": 60, "color": "#7ab3e0"},
        {"name": "待处理", "value": 40, "color": "#e05c5c"},
    ],
    "recentRisks": [
        {"org": "海发产城投资示例一", "event": "园区建设款对外支付命中涉恐黑名单"},
        {"org": "海发园区运营示例二", "event": "连续10日同一收款人高频大额支付"},
        {"org": "海发资本管理示例一", "event": "闲置账户恢复交易后异常支付"},
        {"org": "海发产业服务示例三", "event": "同账户对多笔同类交易触发预警"},
        {"org": "海发项目建设示例四", "event": "资金支付金额超过阈值进入复核"},
        {"org": "海发城市更新示例五", "event": "账户名称与黑名单关键字匹配"},
    ],
}

INITIAL_FUND_SAFETY_SUMMARY = {
    "updatedAt": "2026-03-31 09:00:00",
    "summaryTitle": "资金安全 executive summary",
    "summaryNote": "页面仅展示各二级主题的核心结果与一句风险结论，其中涉恐交易风险可进入专题链路。",
    "heroMetrics": [
        {"label": "二级主题数", "value": "5"},
        {"label": "高风险主题", "value": "1"},
        {"label": "可点击专题", "value": "1"},
    ],
    "topics": [
        {
            "topicCode": "fund_safety_terror_risk",
            "topicName": "资金安全",
            "secondaryTopicName": "资金违规支付-涉恐交易风险",
            "summaryTitle": "涉恐交易风险监测",
            "coreMetrics": [
                {"label": "预警总数", "value": "18笔"},
                {"label": "高风险命中", "value": "7笔"},
                {"label": "命中黑名单", "value": "4笔"},
            ],
            "riskConclusion": "海发产城与海发园区相关对公支付中出现黑名单命中与连续高频支付，建议优先核查园区配套、工程分包和影视文化服务对手方。",
            "riskLevel": "高风险",
            "isClickable": True,
            "targetPageKey": "terror_risk_topic",
            "dataSnapshotDate": SNAPSHOT_DATE,
        },
        {
            "topicCode": "fund_safety_investment_risk",
            "topicName": "资金安全",
            "secondaryTopicName": "对外投资交易管理风险",
            "summaryTitle": "投资交易合规监测",
            "coreMetrics": [
                {"label": "投资项目数", "value": "12个"},
                {"label": "穿透核查异常", "value": "2个"},
                {"label": "重点跟踪项目", "value": "3个"},
            ],
            "riskConclusion": "海发资本相关投资链条整体可控，但个别项目的尽调与出资后资料回传不完整，建议补齐穿透资料。",
            "riskLevel": "关注",
            "isClickable": False,
            "targetPageKey": None,
            "dataSnapshotDate": SNAPSHOT_DATE,
        },
        {
            "topicCode": "fund_safety_bank_deposit_risk",
            "topicName": "资金安全",
            "secondaryTopicName": "资金存放安全风险",
            "summaryTitle": "账户与资金存放监测",
            "coreMetrics": [
                {"label": "监管账户数", "value": "18个"},
                {"label": "超合作范围开户", "value": "1个"},
                {"label": "资金归集异常", "value": "0个"},
            ],
            "riskConclusion": "资金归集总体稳定，但仍存在1个示例账户落在合作银行范围边界，适合在领导汇报中强调可视、可查、可纠偏。",
            "riskLevel": "预警",
            "isClickable": False,
            "targetPageKey": None,
            "dataSnapshotDate": SNAPSHOT_DATE,
        },
        {
            "topicCode": "fund_safety_ar_growth_risk",
            "topicName": "资金安全",
            "secondaryTopicName": "两金压降风险-应收账款增幅",
            "summaryTitle": "应收账款压降监测",
            "coreMetrics": [
                {"label": "应收账款余额", "value": "3280万元"},
                {"label": "同比增幅", "value": "1.8%"},
                {"label": "重点项目", "value": "2个"},
            ],
            "riskConclusion": "园区开发和工程配套相关项目的回款节奏较稳，增幅未明显偏离收入增幅，但存在局部项目回款延后。",
            "riskLevel": "低风险",
            "isClickable": False,
            "targetPageKey": None,
            "dataSnapshotDate": SNAPSHOT_DATE,
        },
        {
            "topicCode": "fund_safety_cross_client_transfer_risk",
            "topicName": "资金安全",
            "secondaryTopicName": "集团客户账户间划拨风险-政企客户转账资金跨客户使用",
            "summaryTitle": "跨客户资金认领监测",
            "coreMetrics": [
                {"label": "跨客户样例", "value": "6起"},
                {"label": "异常认领", "value": "1起"},
                {"label": "人工复核", "value": "4起"},
            ],
            "riskConclusion": "政企资金跨客户认领在样例数据中出现1起异常，适合用来说明系统能够识别并留痕复杂资金流转。",
            "riskLevel": "关注",
            "isClickable": False,
            "targetPageKey": None,
            "dataSnapshotDate": SNAPSHOT_DATE,
        },
    ],
}

INITIAL_BLACKLIST = [
    {
        "id": "blacklist-1",
        "blacklistCode": "BL-001",
        "blacklistName": "青岛西海岸某工程建设有限公司",
        "subjectName": "青岛西海岸某工程建设有限公司",
        "subjectType": "organization",
        "matchKeywords": ["青岛西海岸某工程建设有限公司", "工程建设有限公司结算户"],
        "riskLevel": "high",
        "status": "enabled",
        "sourceSystem": "示例涉恐/合规黑名单",
        "effectiveFrom": "2025-01-01",
        "effectiveTo": "",
        "notes": "与海发园区工程配套类支付链路同名命中示例。",
        "createdAt": "2026-03-31 09:00:00",
        "updatedAt": "2026-03-31 09:00:00",
    },
    {
        "id": "blacklist-2",
        "blacklistCode": "BL-002",
        "blacklistName": "青岛某园区配套服务有限公司",
        "subjectName": "青岛某园区配套服务有限公司",
        "subjectType": "organization",
        "matchKeywords": ["青岛某园区配套服务有限公司", "园区配套服务有限公司"],
        "riskLevel": "high",
        "status": "enabled",
        "sourceSystem": "示例涉恐/合规黑名单",
        "effectiveFrom": "2025-01-01",
        "effectiveTo": "",
        "notes": "用于演示高频支付链路中的黑名单命中。",
        "createdAt": "2026-03-31 09:00:00",
        "updatedAt": "2026-03-31 09:00:00",
    },
    {
        "id": "blacklist-3",
        "blacklistCode": "BL-003",
        "blacklistName": "青岛某影视文化配套服务有限公司",
        "subjectName": "青岛某影视文化配套服务有限公司",
        "subjectType": "organization",
        "matchKeywords": ["青岛某影视文化配套服务有限公司", "影视文化配套服务有限公司"],
        "riskLevel": "medium",
        "status": "enabled",
        "sourceSystem": "示例涉恐/合规黑名单",
        "effectiveFrom": "2025-01-01",
        "effectiveTo": "",
        "notes": "用于演示园区文化配套类交易命中。",
        "createdAt": "2026-03-31 09:00:00",
        "updatedAt": "2026-03-31 09:00:00",
    },
    {
        "id": "blacklist-4",
        "blacklistCode": "BL-004",
        "blacklistName": "青岛某供应链结算服务有限公司",
        "subjectName": "青岛某供应链结算服务有限公司",
        "subjectType": "organization",
        "matchKeywords": ["青岛某供应链结算服务有限公司", "供应链结算服务有限公司"],
        "riskLevel": "medium",
        "status": "enabled",
        "sourceSystem": "示例涉恐/合规黑名单",
        "effectiveFrom": "2025-01-01",
        "effectiveTo": "",
        "notes": "用于演示资本管理与供应链支付链路命中。",
        "createdAt": "2026-03-31 09:00:00",
        "updatedAt": "2026-03-31 09:00:00",
    },
    {
        "id": "blacklist-5",
        "blacklistCode": "BL-005",
        "blacklistName": "青岛某基金服务有限公司",
        "subjectName": "青岛某基金服务有限公司",
        "subjectType": "organization",
        "matchKeywords": ["青岛某基金服务有限公司", "基金服务有限公司"],
        "riskLevel": "medium",
        "status": "enabled",
        "sourceSystem": "示例涉恐/合规黑名单",
        "effectiveFrom": "2025-01-01",
        "effectiveTo": "",
        "notes": "用于演示资本运作场景中的名单匹配。",
        "createdAt": "2026-03-31 09:00:00",
        "updatedAt": "2026-03-31 09:00:00",
    },
]

INITIAL_RULES = [
    {
        "id": "rule-blacklist",
        "ruleCode": "blacklist_hit",
        "ruleName": "黑名单命中规则",
        "ruleCategory": "terror_risk",
        "ruleDescription": "任意一方账户名称存在于黑名单中则命中。",
        "riskLevel": "high",
        "enabled": True,
        "sortOrder": 1,
        "params": [
            {
                "paramKey": "enabled",
                "paramLabel": "规则启用",
                "paramValue": "true",
                "valueType": "boolean",
                "unit": "",
                "editable": True,
            }
        ],
    },
    {
        "id": "rule-frequency",
        "ruleCode": "high_frequency_high_amount",
        "ruleName": "高频大额交易规则",
        "ruleCategory": "terror_risk",
        "ruleDescription": "连续10日内同一收款人单日交易次数超过阈值且金额超过阈值则命中。",
        "riskLevel": "high",
        "enabled": True,
        "sortOrder": 2,
        "params": [
            {"paramKey": "window_days", "paramLabel": "连续天数窗口", "paramValue": "10", "valueType": "number", "unit": "天", "editable": True},
            {"paramKey": "min_daily_count", "paramLabel": "单日交易次数阈值", "paramValue": "50", "valueType": "number", "unit": "次", "editable": True},
            {"paramKey": "corp_amount_threshold", "paramLabel": "对公金额阈值", "paramValue": "2000000", "valueType": "number", "unit": "元", "editable": True},
            {"paramKey": "personal_amount_threshold", "paramLabel": "对私金额阈值", "paramValue": "500000", "valueType": "number", "unit": "元", "editable": True},
        ],
    },
    {
        "id": "rule-dormant",
        "ruleCode": "dormant_account_abnormal_payment",
        "ruleName": "长期闲置账户异常交易规则",
        "ruleCategory": "terror_risk",
        "ruleDescription": "超过1年未交易账户在连续10日内对同一收款人发生异常支付且金额超过阈值则命中。",
        "riskLevel": "high",
        "enabled": True,
        "sortOrder": 3,
        "params": [
            {"paramKey": "dormant_days", "paramLabel": "长期闲置账户判定天数", "paramValue": "365", "valueType": "number", "unit": "天", "editable": True},
            {"paramKey": "window_days", "paramLabel": "连续天数窗口", "paramValue": "10", "valueType": "number", "unit": "天", "editable": True},
            {"paramKey": "corp_amount_threshold", "paramLabel": "对公金额阈值", "paramValue": "2000000", "valueType": "number", "unit": "元", "editable": True},
            {"paramKey": "personal_amount_threshold", "paramLabel": "对私金额阈值", "paramValue": "500000", "valueType": "number", "unit": "元", "editable": True},
        ],
    },
]

INITIAL_TRANSACTIONS = [
    {
        "id": "tx-1",
        "transactionNo": "TX-20260328-001",
        "transactionDate": "2026-03-28",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CITY-001",
        "memberUnitName": "青岛海发城市更新有限公司",
        "payerName": "青岛海发城市更新有限公司",
        "payerAccount": "622202600001",
        "payeeName": "青岛某项目管理咨询有限公司",
        "payeeAccount": "942700000101",
        "amount": 380000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 1,
        "accountLastActiveDate": "2026-03-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1,
        "remarks": "正常项目咨询付款样例。",
    },
    {
        "id": "tx-2",
        "transactionNo": "TX-20260329-001",
        "transactionDate": "2026-03-29",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CAP-001",
        "memberUnitName": "青岛海发资本管理有限公司",
        "payerName": "青岛海发资本管理有限公司",
        "payerAccount": "622202600002",
        "payeeName": "山东某高端装备供应链有限公司",
        "payeeAccount": "942700000102",
        "amount": 760000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 1,
        "accountLastActiveDate": "2026-03-18",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 2,
        "remarks": "正常设备采购样例。",
    },
    {
        "id": "tx-3",
        "transactionNo": "TX-20260330-001",
        "transactionDate": "2026-03-30",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-SVC-001",
        "memberUnitName": "青岛海发产业服务有限公司",
        "payerName": "青岛海发产业服务有限公司",
        "payerAccount": "622202600003",
        "payeeName": "青岛某数据服务有限公司",
        "payeeAccount": "942700000103",
        "amount": 120000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 1,
        "accountLastActiveDate": "2026-03-25",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 3,
        "remarks": "正常产业服务支出样例。",
    },
    {
        "id": "tx-4",
        "transactionNo": "TX-20260304-001",
        "transactionDate": "2026-03-04",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-PARK-001",
        "memberUnitName": "青岛海发园区运营有限公司",
        "payerName": "青岛海发园区运营有限公司",
        "payerAccount": "622202600010",
        "payeeName": "青岛西海岸某工程建设有限公司",
        "payeeAccount": "942700000201",
        "amount": 860000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 1,
        "accountLastActiveDate": "2026-03-02",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 4,
        "remarks": "黑名单命中样例，匹配园区工程类对手方。",
    },
    {
        "id": "tx-5",
        "transactionNo": "TX-20260312-001",
        "transactionDate": "2026-03-12",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CAP-002",
        "memberUnitName": "青岛海发资本管理有限公司",
        "payerName": "青岛海发资本管理有限公司",
        "payerAccount": "622202600011",
        "payeeName": "青岛某基金服务有限公司",
        "payeeAccount": "942700000202",
        "amount": 1240000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 1,
        "accountLastActiveDate": "2026-03-10",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 5,
        "remarks": "黑名单命中样例，匹配资本运作服务对手方。",
    },
    {
        "id": "tx-6",
        "transactionNo": "TX-20260318-001",
        "transactionDate": "2026-03-18",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-SVC-002",
        "memberUnitName": "青岛海发产业服务有限公司",
        "payerName": "青岛海发产业服务有限公司",
        "payerAccount": "622202600012",
        "payeeName": "青岛某供应链结算服务有限公司",
        "payeeAccount": "942700000203",
        "amount": 730000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 1,
        "accountLastActiveDate": "2026-03-16",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 6,
        "remarks": "黑名单命中样例，匹配供应链结算服务对手方。",
    },
    {
        "id": "tx-7",
        "transactionNo": "HF-20260301-01",
        "transactionDate": "2026-03-01",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CTI-002",
        "memberUnitName": "青岛海发产城投资有限公司",
        "payerName": "青岛海发产城投资有限公司",
        "payerAccount": "622202600020",
        "payeeName": "青岛某园区配套服务有限公司",
        "payeeAccount": "942700000301",
        "amount": 50000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 51,
        "accountLastActiveDate": "2026-02-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1001,
        "remarks": "连续10日同一收款人高频高额支付样例。",
    },
    {
        "id": "tx-8",
        "transactionNo": "HF-20260302-01",
        "transactionDate": "2026-03-02",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CTI-002",
        "memberUnitName": "青岛海发产城投资有限公司",
        "payerName": "青岛海发产城投资有限公司",
        "payerAccount": "622202600020",
        "payeeName": "青岛某园区配套服务有限公司",
        "payeeAccount": "942700000301",
        "amount": 50000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 51,
        "accountLastActiveDate": "2026-02-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1002,
        "remarks": "连续10日同一收款人高频高额支付样例。",
    },
    {
        "id": "tx-9",
        "transactionNo": "HF-20260303-01",
        "transactionDate": "2026-03-03",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CTI-002",
        "memberUnitName": "青岛海发产城投资有限公司",
        "payerName": "青岛海发产城投资有限公司",
        "payerAccount": "622202600020",
        "payeeName": "青岛某园区配套服务有限公司",
        "payeeAccount": "942700000301",
        "amount": 50000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 51,
        "accountLastActiveDate": "2026-02-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1003,
        "remarks": "连续10日同一收款人高频高额支付样例。",
    },
    {
        "id": "tx-10",
        "transactionNo": "HF-20260304-01",
        "transactionDate": "2026-03-04",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CTI-002",
        "memberUnitName": "青岛海发产城投资有限公司",
        "payerName": "青岛海发产城投资有限公司",
        "payerAccount": "622202600020",
        "payeeName": "青岛某园区配套服务有限公司",
        "payeeAccount": "942700000301",
        "amount": 50000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 51,
        "accountLastActiveDate": "2026-02-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1004,
        "remarks": "连续10日同一收款人高频高额支付样例。",
    },
    {
        "id": "tx-11",
        "transactionNo": "HF-20260305-01",
        "transactionDate": "2026-03-05",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CTI-002",
        "memberUnitName": "青岛海发产城投资有限公司",
        "payerName": "青岛海发产城投资有限公司",
        "payerAccount": "622202600020",
        "payeeName": "青岛某园区配套服务有限公司",
        "payeeAccount": "942700000301",
        "amount": 50000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 51,
        "accountLastActiveDate": "2026-02-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1005,
        "remarks": "连续10日同一收款人高频高额支付样例。",
    },
    {
        "id": "tx-12",
        "transactionNo": "HF-20260306-01",
        "transactionDate": "2026-03-06",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CTI-002",
        "memberUnitName": "青岛海发产城投资有限公司",
        "payerName": "青岛海发产城投资有限公司",
        "payerAccount": "622202600020",
        "payeeName": "青岛某园区配套服务有限公司",
        "payeeAccount": "942700000301",
        "amount": 50000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 51,
        "accountLastActiveDate": "2026-02-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1006,
        "remarks": "连续10日同一收款人高频高额支付样例。",
    },
    {
        "id": "tx-13",
        "transactionNo": "HF-20260307-01",
        "transactionDate": "2026-03-07",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CTI-002",
        "memberUnitName": "青岛海发产城投资有限公司",
        "payerName": "青岛海发产城投资有限公司",
        "payerAccount": "622202600020",
        "payeeName": "青岛某园区配套服务有限公司",
        "payeeAccount": "942700000301",
        "amount": 50000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 51,
        "accountLastActiveDate": "2026-02-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1007,
        "remarks": "连续10日同一收款人高频高额支付样例。",
    },
    {
        "id": "tx-14",
        "transactionNo": "HF-20260308-01",
        "transactionDate": "2026-03-08",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CTI-002",
        "memberUnitName": "青岛海发产城投资有限公司",
        "payerName": "青岛海发产城投资有限公司",
        "payerAccount": "622202600020",
        "payeeName": "青岛某园区配套服务有限公司",
        "payeeAccount": "942700000301",
        "amount": 50000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 51,
        "accountLastActiveDate": "2026-02-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1008,
        "remarks": "连续10日同一收款人高频高额支付样例。",
    },
    {
        "id": "tx-15",
        "transactionNo": "HF-20260309-01",
        "transactionDate": "2026-03-09",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CTI-002",
        "memberUnitName": "青岛海发产城投资有限公司",
        "payerName": "青岛海发产城投资有限公司",
        "payerAccount": "622202600020",
        "payeeName": "青岛某园区配套服务有限公司",
        "payeeAccount": "942700000301",
        "amount": 50000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 51,
        "accountLastActiveDate": "2026-02-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1009,
        "remarks": "连续10日同一收款人高频高额支付样例。",
    },
    {
        "id": "tx-16",
        "transactionNo": "HF-20260310-01",
        "transactionDate": "2026-03-10",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-CTI-002",
        "memberUnitName": "青岛海发产城投资有限公司",
        "payerName": "青岛海发产城投资有限公司",
        "payerAccount": "622202600020",
        "payeeName": "青岛某园区配套服务有限公司",
        "payeeAccount": "942700000301",
        "amount": 50000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 51,
        "accountLastActiveDate": "2026-02-20",
        "isDormantAccount": False,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 1010,
        "remarks": "连续10日同一收款人高频高额支付样例。",
    },
    {
        "id": "tx-17",
        "transactionNo": "DA-20260301-01",
        "transactionDate": "2026-03-01",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-PARK-002",
        "memberUnitName": "青岛海发园区运营有限公司",
        "payerName": "青岛海发园区运营有限公司",
        "payerAccount": "622202600030",
        "payeeName": "青岛某影视文化配套服务有限公司",
        "payeeAccount": "942700000401",
        "amount": 120000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 4,
        "accountLastActiveDate": "2024-02-20",
        "isDormantAccount": True,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 3001,
        "remarks": "长期闲置账户异常支付样例。",
    },
    {
        "id": "tx-18",
        "transactionNo": "DA-20260302-01",
        "transactionDate": "2026-03-02",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-PARK-002",
        "memberUnitName": "青岛海发园区运营有限公司",
        "payerName": "青岛海发园区运营有限公司",
        "payerAccount": "622202600030",
        "payeeName": "青岛某影视文化配套服务有限公司",
        "payeeAccount": "942700000401",
        "amount": 120000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 4,
        "accountLastActiveDate": "2024-02-20",
        "isDormantAccount": True,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 3002,
        "remarks": "长期闲置账户异常支付样例。",
    },
    {
        "id": "tx-19",
        "transactionNo": "DA-20260303-01",
        "transactionDate": "2026-03-03",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-PARK-002",
        "memberUnitName": "青岛海发园区运营有限公司",
        "payerName": "青岛海发园区运营有限公司",
        "payerAccount": "622202600030",
        "payeeName": "青岛某影视文化配套服务有限公司",
        "payeeAccount": "942700000401",
        "amount": 120000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 4,
        "accountLastActiveDate": "2024-02-20",
        "isDormantAccount": True,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 3003,
        "remarks": "长期闲置账户异常支付样例。",
    },
    {
        "id": "tx-20",
        "transactionNo": "DA-20260304-01",
        "transactionDate": "2026-03-04",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-PARK-002",
        "memberUnitName": "青岛海发园区运营有限公司",
        "payerName": "青岛海发园区运营有限公司",
        "payerAccount": "622202600030",
        "payeeName": "青岛某影视文化配套服务有限公司",
        "payeeAccount": "942700000401",
        "amount": 120000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 4,
        "accountLastActiveDate": "2024-02-20",
        "isDormantAccount": True,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 3004,
        "remarks": "长期闲置账户异常支付样例。",
    },
    {
        "id": "tx-21",
        "transactionNo": "DA-20260305-01",
        "transactionDate": "2026-03-05",
        "batchNo": SNAPSHOT_BATCH,
        "memberUnitCode": "HF-PARK-002",
        "memberUnitName": "青岛海发园区运营有限公司",
        "payerName": "青岛海发园区运营有限公司",
        "payerAccount": "622202600030",
        "payeeName": "青岛某影视文化配套服务有限公司",
        "payeeAccount": "942700000401",
        "amount": 120000,
        "currency": "CNY",
        "payeeType": "organization",
        "businessScenario": "财务公司网银支付",
        "transactionCount": 4,
        "accountLastActiveDate": "2024-02-20",
        "isDormantAccount": True,
        "sourceFileName": "fund_safety_demo_batch_20260331.xlsx",
        "sourceRowNo": 3005,
        "remarks": "长期闲置账户异常支付样例。",
    },
]


class DemoRepository:
    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self.overview = deepcopy(INITIAL_OVERVIEW)
        self.fund_safety_summary = deepcopy(INITIAL_FUND_SAFETY_SUMMARY)
        self.blacklist = deepcopy(INITIAL_BLACKLIST)
        self.rules = deepcopy(INITIAL_RULES)
        self.transactions = deepcopy(INITIAL_TRANSACTIONS)
        self.alerts: list[dict[str, object]] = []
        self.latest_job = {
            "job_no": "JOB-20260331-000",
            "job_status": "idle",
            "transaction_count": len(self.transactions),
            "matched_count": 0,
            "high_risk_count": 0,
            "warning_count": 0,
            "started_at": None,
            "finished_at": None,
            "input_snapshot_at": f"{SNAPSHOT_DATE}T09:00:00+08:00",
        }
        from app.engine.terror_risk import detect_terror_risk_alerts

        alerts, latest_job = detect_terror_risk_alerts(
            transactions=self.transactions,
            rules=self.rules,
            blacklist=self.blacklist,
            snapshot_date=SNAPSHOT_DATE,
        )
        self.save_alerts(alerts, latest_job)

    def get_overview(self) -> dict[str, object]:
        return {
            "page_title": "风险总览",
            "snapshot_date": SNAPSHOT_DATE,
            "risk_cards": deepcopy(self.overview["riskCards"]),
            "recent_risks": deepcopy(self.overview["recentRisks"]),
            "fund_safety_focus": {
                "page_key": "fund_safety",
                "title": self.overview["fundSafetyEntry"]["title"],
                "summary": self.overview["fundSafetyEntry"]["subtitle"],
            },
            "pie_data": deepcopy(self.overview["pieData"]),
            "donut_data": deepcopy(self.overview["donutData"]),
        }

    def get_fund_safety_summary(self) -> dict[str, object]:
        return {
            "page_title": "资金安全",
            "snapshot_date": SNAPSHOT_DATE,
            "summary_blocks": [
                {
                    "topic_code": item["topicCode"],
                    "topic_name": item["topicName"],
                    "secondary_topic_name": item["secondaryTopicName"],
                    "summary_title": item["summaryTitle"],
                    "core_metrics": {metric["label"]: metric["value"] for metric in item["coreMetrics"]},
                    "risk_conclusion": item["riskConclusion"],
                    "risk_level": item["riskLevel"],
                    "is_clickable": item["isClickable"],
                    "target_page_key": item["targetPageKey"],
                    "data_snapshot_date": item["dataSnapshotDate"],
                    "display_order": index + 1,
                }
                for index, item in enumerate(self.fund_safety_summary["topics"])
            ],
        }

    def list_blacklist(self) -> list[dict[str, object]]:
        return deepcopy(self.blacklist)

    def create_blacklist(self, payload: dict[str, object]) -> dict[str, object]:
        now = _iso_now()
        item = {
            "id": str(uuid4()),
            "createdAt": now,
            "updatedAt": now,
            **payload,
        }
        self.blacklist.insert(0, item)
        return deepcopy(item)

    def update_blacklist(self, item_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for index, item in enumerate(self.blacklist):
            if item["id"] == item_id:
                updated = {**item, **payload, "id": item_id, "updatedAt": _iso_now()}
                self.blacklist[index] = updated
                return deepcopy(updated)
        return None

    def delete_blacklist(self, item_id: str) -> bool:
        before = len(self.blacklist)
        self.blacklist = [item for item in self.blacklist if item["id"] != item_id]
        return len(self.blacklist) != before

    def list_rules(self) -> list[dict[str, object]]:
        return deepcopy(sorted(self.rules, key=lambda item: item["sortOrder"]))

    def update_rule(self, rule_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for index, item in enumerate(self.rules):
            if item["id"] == rule_id:
                updated = {**item, **payload, "id": rule_id}
                self.rules[index] = updated
                return deepcopy(updated)
        return None

    def list_transactions(self) -> list[dict[str, object]]:
        return deepcopy(sorted(self.transactions, key=lambda item: item["transactionDate"], reverse=True))

    def create_transaction(self, payload: dict[str, object]) -> dict[str, object]:
        item = {
            "id": str(uuid4()),
            **payload,
        }
        self.transactions.insert(0, item)
        return deepcopy(item)

    def update_transaction(self, item_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for index, item in enumerate(self.transactions):
            if item["id"] == item_id:
                updated = {**item, **payload, "id": item_id}
                self.transactions[index] = updated
                return deepcopy(updated)
        return None

    def delete_transaction(self, item_id: str) -> bool:
        before = len(self.transactions)
        self.transactions = [item for item in self.transactions if item["id"] != item_id]
        return len(self.transactions) != before

    def save_alerts(self, alerts: list[dict[str, object]], latest_job: dict[str, object]) -> dict[str, object]:
        self.alerts = alerts
        self.latest_job = latest_job
        self._refresh_summary_from_alerts()
        self._refresh_overview_from_alerts()
        return deepcopy(latest_job)

    def list_terror_alerts(
        self,
        *,
        rule_type: str | None = None,
        risk_level: str | None = None,
        member_unit: str | None = None,
    ) -> dict[str, object]:
        items = deepcopy(self.alerts)
        if rule_type:
            items = [item for item in items if rule_type.lower() in str(item["rule_code"]).lower()]
        if risk_level:
            items = [item for item in items if item["risk_level"] == risk_level]
        if member_unit:
            items = [
                item
                for item in items
                if member_unit.lower() in str(item["member_unit_name"]).lower()
                or member_unit.lower() in str(item["member_unit_code"]).lower()
            ]
        items.sort(key=lambda item: (item["risk_level"] != "high", item["transaction_date"]), reverse=False)
        return {"total": len(items), "items": items}

    def get_terror_alert(self, alert_id: str) -> dict[str, object] | None:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                return deepcopy(alert)
        return None

    def save_review(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for index, alert in enumerate(self.alerts):
            if alert["id"] == alert_id:
                review = {
                    **alert["review"],
                    **payload,
                    "reviewed_at": _iso_now(),
                }
                updated = {
                    **alert,
                    "review_status": review["review_status"],
                    "review": review,
                }
                self.alerts[index] = updated
                return deepcopy(updated)
        return None

    def get_terror_risk_topic(self) -> dict[str, object]:
        alerts = deepcopy(self.alerts)
        trend_map: dict[str, int] = {}
        entity_map: dict[str, dict[str, object]] = {}
        account_map: dict[str, dict[str, object]] = {}
        for alert in alerts:
            tx_date = str(alert["transaction_date"])
            trend_map[tx_date] = trend_map.get(tx_date, 0) + 1
            self._accumulate_rank(entity_map, str(alert["member_unit_name"]), alert)
            self._accumulate_rank(account_map, str(alert["payee_name"]), alert)

        typical_cases = []
        for alert in sorted(alerts, key=lambda item: (item["risk_level"] != "high", item["matched_count"] * -1)):
            title = {
                "blacklist_hit": "黑名单直接命中",
                "high_frequency_high_amount": "高频大额交易",
                "dormant_account_abnormal_payment": "长期闲置账户异常交易",
            }.get(str(alert["rule_code"]), alert["rule_name"])
            typical_cases.append(
                {
                    "id": alert["id"],
                    "title": title,
                    "summary": alert["alert_summary"],
                    "risk_level": alert["risk_level"],
                    "alert_no": alert["alert_no"],
                }
            )
        topic = {
            "page_title": "涉恐交易风险",
            "snapshot_date": SNAPSHOT_DATE,
            "kpis": {
                "alert_count": str(len(alerts)),
                "high_risk_count": str(sum(1 for alert in alerts if alert["risk_level"] == "high")),
                "involved_units": str(len({alert["member_unit_name"] for alert in alerts})),
                "involved_amount": _format_amount_yuan(sum(float(alert["matched_amount_value"]) for alert in alerts)),
                "blacklist_hit_count": str(sum(1 for alert in alerts if alert["rule_code"] == "blacklist_hit")),
            },
            "trend": [{"date": key, "value": trend_map[key]} for key in sorted(trend_map)],
            "top_entities": self._build_rankings(entity_map),
            "top_accounts": self._build_rankings(account_map),
            "typical_cases": typical_cases[:3],
            "latest_job": deepcopy(self.latest_job),
        }
        return topic

    def _accumulate_rank(self, bucket: dict[str, dict[str, object]], name: str, alert: dict[str, object]) -> None:
        existing = bucket.setdefault(
            name,
            {"name": name, "count": 0, "amount_value": 0.0, "risk_level": "low"},
        )
        existing["count"] += int(alert["matched_count"])
        existing["amount_value"] += float(alert["matched_amount_value"])
        if alert["risk_level"] == "high":
            existing["risk_level"] = "high"
        elif existing["risk_level"] != "high":
            existing["risk_level"] = "warn"

    def _build_rankings(self, bucket: dict[str, dict[str, object]]) -> list[dict[str, object]]:
        rows = sorted(bucket.values(), key=lambda item: (-item["count"], -item["amount_value"], item["name"]))
        return [
            {
                "name": row["name"],
                "count": row["count"],
                "amount": _format_amount_yuan(row["amount_value"]),
                "risk_level": row["risk_level"],
            }
            for row in rows[:5]
        ]

    def _refresh_summary_from_alerts(self) -> None:
        alerts = self.alerts
        terror_metrics = [
            {"label": "预警总数", "value": f"{len(alerts)}笔"},
            {"label": "高风险命中", "value": f"{sum(1 for alert in alerts if alert['risk_level'] == 'high')}笔"},
            {"label": "命中黑名单", "value": f"{sum(1 for alert in alerts if alert['rule_code'] == 'blacklist_hit')}笔"},
        ]
        terror_topic = self.fund_safety_summary["topics"][0]
        terror_topic["coreMetrics"] = terror_metrics
        terror_topic["riskConclusion"] = (
            "海发产城与海发园区相关对公支付中出现黑名单命中与连续高频支付，建议优先核查园区配套、工程分包和影视文化服务对手方。"
            if alerts
            else "当前未识别到涉恐交易风险，系统可继续使用最新交易数据执行更新计算。"
        )
        terror_topic["riskLevel"] = "高风险" if any(alert["risk_level"] == "high" for alert in alerts) else "低风险"

    def _refresh_overview_from_alerts(self) -> None:
        count = len(self.alerts)
        self.overview["recentRisks"] = [
            {"org": alert["member_unit_name"], "event": alert["alert_summary"]}
            for alert in self.alerts[:6]
        ]
        for card in self.overview["riskCards"]:
            if card["title"] == "资金风险":
                card["high"] = sum(1 for alert in self.alerts if alert["risk_level"] == "high")
                card["warn"] = count
                card["hint"] = max(count // 2, 1 if count else 0)


demo_repository = DemoRepository()


def reset_demo_repository() -> None:
    demo_repository.reset()
