from __future__ import annotations

from copy import deepcopy
from uuid import uuid4

from app.engine.terror_risk import detect_terror_risk_alerts, select_typical_case_alerts

SNAPSHOT_DATE = "2026-03-31"


def _build_rules() -> list[dict[str, object]]:
    return [
        {
            "id": "rule-blacklist",
            "ruleCode": "blacklist_hit",
            "ruleName": "黑名单命中规则",
            "ruleCategory": "terror_risk",
            "ruleDescription": "账户或主体命中黑名单",
            "riskLevel": "high",
            "enabled": True,
            "sortOrder": 1,
            "params": [],
        },
        {
            "id": "rule-frequency",
            "ruleCode": "high_frequency_high_amount",
            "ruleName": "高频大额交易规则",
            "ruleCategory": "terror_risk",
            "ruleDescription": "连续窗口内同一收款人高频大额支付",
            "riskLevel": "high",
            "enabled": True,
            "sortOrder": 2,
            "params": [
                {
                    "paramKey": "window_days",
                    "paramLabel": "连续天数窗口",
                    "paramValue": "10",
                    "valueType": "number",
                    "unit": "天",
                    "editable": True,
                },
                {
                    "paramKey": "min_daily_count",
                    "paramLabel": "单日交易次数阈值",
                    "paramValue": "50",
                    "valueType": "number",
                    "unit": "次",
                    "editable": True,
                },
                {
                    "paramKey": "corp_amount_threshold",
                    "paramLabel": "对公金额阈值",
                    "paramValue": "2000000",
                    "valueType": "number",
                    "unit": "元",
                    "editable": True,
                },
                {
                    "paramKey": "personal_amount_threshold",
                    "paramLabel": "对私金额阈值",
                    "paramValue": "500000",
                    "valueType": "number",
                    "unit": "元",
                    "editable": True,
                },
            ],
        },
        {
            "id": "rule-dormant",
            "ruleCode": "dormant_account_abnormal_payment",
            "ruleName": "长期闲置账户异常交易规则",
            "ruleCategory": "terror_risk",
            "ruleDescription": "长期闲置账户在连续窗口内恢复大额交易",
            "riskLevel": "warn",
            "enabled": True,
            "sortOrder": 3,
            "params": [
                {
                    "paramKey": "dormant_days",
                    "paramLabel": "长期闲置账户判定天数",
                    "paramValue": "365",
                    "valueType": "number",
                    "unit": "天",
                    "editable": True,
                },
                {
                    "paramKey": "window_days",
                    "paramLabel": "连续天数窗口",
                    "paramValue": "10",
                    "valueType": "number",
                    "unit": "天",
                    "editable": True,
                },
                {
                    "paramKey": "corp_amount_threshold",
                    "paramLabel": "对公金额阈值",
                    "paramValue": "2000000",
                    "valueType": "number",
                    "unit": "元",
                    "editable": True,
                },
                {
                    "paramKey": "personal_amount_threshold",
                    "paramLabel": "对私金额阈值",
                    "paramValue": "500000",
                    "valueType": "number",
                    "unit": "元",
                    "editable": True,
                },
            ],
        },
    ]


def _build_blacklist() -> list[dict[str, object]]:
    return [
        {
            "id": "blacklist-1",
            "blacklistCode": "BL-001",
            "blacklistName": "涉恐重点名单A",
            "subjectName": "青岛某敏感服务公司",
            "subjectType": "organization",
            "matchKeywords": ["青岛某敏感服务公司"],
            "riskLevel": "high",
            "status": "enabled",
            "sourceSystem": "postgres",
            "effectiveFrom": SNAPSHOT_DATE,
            "effectiveTo": None,
            "notes": "测试黑名单",
            "createdAt": f"{SNAPSHOT_DATE}T09:00:00+08:00",
            "updatedAt": f"{SNAPSHOT_DATE}T09:00:00+08:00",
        }
    ]


def _build_transactions() -> list[dict[str, object]]:
    transactions = [
        {
            "id": "tx-blacklist-1",
            "transactionNo": "TX-BL-001",
            "transactionDate": "2026-03-28",
            "batchNo": "FS-20260331",
            "memberUnitCode": "HF-CITY-001",
            "memberUnitName": "青岛海发城市更新有限公司",
            "payerName": "青岛海发城市更新有限公司",
            "payerAccount": "622202600001",
            "payeeName": "青岛某敏感服务公司",
            "payeeAccount": "942700000101",
            "amount": 880000,
            "currency": "CNY",
            "payeeType": "organization",
            "businessScenario": "财务公司网银支付",
            "transactionCount": 1,
            "accountLastActiveDate": "2026-03-20",
            "isDormantAccount": False,
            "sourceFileName": "seed.xlsx",
            "sourceRowNo": 1,
            "remarks": "黑名单命中样例",
        },
        {
            "id": "tx-blacklist-2",
            "transactionNo": "TX-BL-002",
            "transactionDate": "2026-03-31",
            "batchNo": "FS-20260331",
            "memberUnitCode": "HF-CITY-001",
            "memberUnitName": "青岛海发城市更新有限公司",
            "payerName": "青岛海发城市更新有限公司",
            "payerAccount": "622202600001",
            "payeeName": "青岛某敏感服务公司",
            "payeeAccount": "942700000101",
            "amount": 920000,
            "currency": "CNY",
            "payeeType": "organization",
            "businessScenario": "财务公司网银支付",
            "transactionCount": 1,
            "accountLastActiveDate": "2026-03-20",
            "isDormantAccount": False,
            "sourceFileName": "seed.xlsx",
            "sourceRowNo": 2,
            "remarks": "黑名单命中样例",
        },
    ]

    for day in range(1, 11):
        transactions.append(
            {
                "id": f"tx-frequency-{day}",
                "transactionNo": f"TX-FQ-{day:03d}",
                "transactionDate": f"2026-03-{day:02d}",
                "batchNo": "FS-20260331",
                "memberUnitCode": "HF-PARK-001",
                "memberUnitName": "青岛海发园区运营有限公司",
                "payerName": "青岛海发园区运营有限公司",
                "payerAccount": "622202600002",
                "payeeName": "青岛某园区配套工程服务有限公司",
                "payeeAccount": "942700000102",
                "amount": 40000,
                "currency": "CNY",
                "payeeType": "organization",
                "businessScenario": "财务公司网银支付",
                "transactionCount": 60,
                "accountLastActiveDate": "2026-02-20",
                "isDormantAccount": False,
                "sourceFileName": "seed.xlsx",
                "sourceRowNo": 100 + day,
                "remarks": "高频大额样例",
            }
        )

    for day in range(12, 22):
        transactions.append(
            {
                "id": f"tx-dormant-{day}",
                "transactionNo": f"TX-DR-{day:03d}",
                "transactionDate": f"2026-03-{day:02d}",
                "batchNo": "FS-20260331",
                "memberUnitCode": "HF-CAP-001",
                "memberUnitName": "青岛海发资本管理有限公司",
                "payerName": "青岛海发资本管理有限公司",
                "payerAccount": "622202600003",
                "payeeName": "青岛某文化传播有限公司",
                "payeeAccount": "942700000103",
                "amount": 30000,
                "currency": "CNY",
                "payeeType": "organization",
                "businessScenario": "财务公司网银支付",
                "transactionCount": 8,
                "accountLastActiveDate": "2025-03-01",
                "isDormantAccount": True,
                "sourceFileName": "seed.xlsx",
                "sourceRowNo": 200 + day,
                "remarks": "长期闲置账户样例",
            }
        )

    return transactions


def _format_amount_yuan(amount_value: float) -> str:
    return f"{amount_value / 10000:.2f}万元"


class FakePostgresRepository:
    def __init__(self) -> None:
        self.blacklist = _build_blacklist()
        self.rules = _build_rules()
        self.transactions = _build_transactions()
        self.alerts: list[dict[str, object]] = []
        self.latest_job = {
            "job_no": None,
            "job_status": "idle",
            "transaction_count": 0,
            "matched_count": 0,
            "high_risk_count": 0,
            "warning_count": 0,
            "started_at": None,
            "finished_at": None,
            "input_snapshot_at": None,
        }
        self._run_detection()

    def _run_detection(self) -> None:
        alerts, latest_job = detect_terror_risk_alerts(
            transactions=self.transactions,
            rules=self.rules,
            blacklist=self.blacklist,
            snapshot_date=SNAPSHOT_DATE,
        )
        self.alerts = alerts
        self.latest_job = latest_job
        self._apply_default_review_assignments()

    def _apply_default_review_assignments(self) -> None:
        for index, alert in enumerate(self.alerts):
            default_review = {
                "review_status": "pending",
                "reviewer_name": "",
                "review_result": "",
                "review_comment": "",
                "reviewed_at": None,
                "assignment_status": "unassigned",
                "assigned_reviewer_name": "",
                "assigned_at": None,
            }
            review = {**default_review, **alert.get("review", {})}
            if index == 1:
                review["assignment_status"] = "assigned"
                review["assigned_reviewer_name"] = "风控专员A"
                review["assigned_at"] = f"{SNAPSHOT_DATE}T10:00:00+08:00"
            elif index == 2:
                review["assignment_status"] = "assigned"
                review["assigned_reviewer_name"] = "风控专员B"
                review["assigned_at"] = f"{SNAPSHOT_DATE}T11:00:00+08:00"
                review["review_status"] = "reviewed"
                review["reviewer_name"] = "风控专员B"
                review["review_result"] = "确认异常"
                review["review_comment"] = "已进入后续处置"
                review["reviewed_at"] = f"{SNAPSHOT_DATE}T12:00:00+08:00"

            alert["review"] = review
            alert["review_status"] = review["review_status"]

    def get_overview(self) -> dict[str, object]:
        summary_blocks = self.get_fund_safety_summary()["summary_blocks"]
        return {
            "page_title": "风险总览",
            "snapshot_date": SNAPSHOT_DATE,
            "risk_cards": [
                {"title": "金融风险", "high": 0, "warn": 2, "hint": 3},
                {"title": "往来款风险", "high": 0, "warn": 2, "hint": 3},
                {"title": "循环贸易风险", "high": 0, "warn": 2, "hint": 3},
                {"title": "资金风险", "high": sum(1 for alert in self.alerts if alert["risk_level"] == "high"), "warn": len(self.alerts), "hint": 2},
                {"title": "存货风险", "high": 0, "warn": 2, "hint": 3},
                {"title": "固定资产风险", "high": 0, "warn": 1, "hint": 2},
                {"title": "债务风险", "high": 0, "warn": 2, "hint": 1},
                {"title": "税务风险", "high": 0, "warn": 1, "hint": 2},
            ],
            "recent_risks": [
                {"org": block["secondary_topic_name"], "event": block["risk_conclusion"]}
                for block in summary_blocks[:5]
            ],
            "fund_safety_focus": {
                "page_key": "fund_safety",
                "title": "资金安全",
                "summary": "汇总 Sheet[资金安全] 下全部二级主题的 executive 结果",
            },
            "pie_data": [
                {"name": "高风险", "value": 1, "color": "#e05c5c"},
                {"name": "中风险", "value": 3, "color": "#e8b84b"},
                {"name": "低风险", "value": 1, "color": "#7ab3e0"},
            ],
            "donut_data": [
                {"name": "跟进中", "value": 60, "color": "#7ab3e0"},
                {"name": "待处理", "value": 40, "color": "#e05c5c"},
            ],
        }

    def get_fund_safety_summary(self) -> dict[str, object]:
        return {
            "page_title": "资金安全",
            "snapshot_date": SNAPSHOT_DATE,
            "summary_blocks": [
                {
                    "topic_code": "fund_safety_terror_risk",
                    "topic_name": "资金安全",
                    "secondary_topic_name": "资金违规支付-涉恐交易风险",
                    "summary_title": "涉恐交易风险",
                    "core_metrics": {
                        "预警总数": f"{len(self.alerts)}笔",
                        "高风险命中": f"{sum(1 for alert in self.alerts if alert['risk_level'] == 'high')}笔",
                        "命中黑名单": f"{sum(1 for alert in self.alerts if alert['rule_code'] == 'blacklist_hit')}笔",
                    },
                    "risk_conclusion": "存在涉恐交易风险线索，建议优先核查高风险支付链路。",
                    "risk_level": "高风险" if any(alert["risk_level"] == "high" for alert in self.alerts) else "低风险",
                    "is_clickable": True,
                    "target_page_key": "terror_risk_topic",
                    "data_snapshot_date": SNAPSHOT_DATE,
                    "display_order": 1,
                },
                {
                    "topic_code": "fund_safety_investment_risk",
                    "topic_name": "资金安全",
                    "secondary_topic_name": "投资风险",
                    "summary_title": "投资风险",
                    "core_metrics": {"风险项目": "2个"},
                    "risk_conclusion": "整体可控。",
                    "risk_level": "关注",
                    "is_clickable": False,
                    "target_page_key": None,
                    "data_snapshot_date": SNAPSHOT_DATE,
                    "display_order": 2,
                },
                {
                    "topic_code": "fund_safety_bank_deposit_risk",
                    "topic_name": "资金安全",
                    "secondary_topic_name": "银行存款风险",
                    "summary_title": "银行存款风险",
                    "core_metrics": {"异常账户": "1个"},
                    "risk_conclusion": "需关注边界账户。",
                    "risk_level": "预警",
                    "is_clickable": False,
                    "target_page_key": None,
                    "data_snapshot_date": SNAPSHOT_DATE,
                    "display_order": 3,
                },
                {
                    "topic_code": "fund_safety_ar_growth_risk",
                    "topic_name": "资金安全",
                    "secondary_topic_name": "应收增长风险",
                    "summary_title": "应收增长风险",
                    "core_metrics": {"延迟项目": "1个"},
                    "risk_conclusion": "局部项目回款延后。",
                    "risk_level": "低风险",
                    "is_clickable": False,
                    "target_page_key": None,
                    "data_snapshot_date": SNAPSHOT_DATE,
                    "display_order": 4,
                },
                {
                    "topic_code": "fund_safety_cross_client_transfer_risk",
                    "topic_name": "资金安全",
                    "secondary_topic_name": "跨客户划转风险",
                    "summary_title": "跨客户划转风险",
                    "core_metrics": {"异常划转": "1笔"},
                    "risk_conclusion": "样例中存在复杂流转。",
                    "risk_level": "关注",
                    "is_clickable": False,
                    "target_page_key": None,
                    "data_snapshot_date": SNAPSHOT_DATE,
                    "display_order": 5,
                },
            ],
        }

    def list_blacklist(self) -> list[dict[str, object]]:
        return deepcopy(self.blacklist)

    def create_blacklist(self, payload: dict[str, object]) -> dict[str, object]:
        item = {
            "id": f"blacklist-{uuid4()}",
            **payload,
            "createdAt": f"{SNAPSHOT_DATE}T09:00:00+08:00",
            "updatedAt": f"{SNAPSHOT_DATE}T09:00:00+08:00",
        }
        self.blacklist.insert(0, item)
        return deepcopy(item)

    def update_blacklist(self, item_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for index, item in enumerate(self.blacklist):
            if item["id"] == item_id:
                self.blacklist[index] = {**item, **payload, "id": item_id}
                return deepcopy(self.blacklist[index])
        return None

    def delete_blacklist(self, item_id: str) -> bool:
        before = len(self.blacklist)
        self.blacklist = [item for item in self.blacklist if item["id"] != item_id]
        return len(self.blacklist) != before

    def list_rules(self) -> list[dict[str, object]]:
        return deepcopy(self.rules)

    def update_rule(self, rule_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for index, rule in enumerate(self.rules):
            if rule["id"] == rule_id:
                self.rules[index] = {**payload, "id": rule_id}
                return deepcopy(self.rules[index])
        return None

    def list_transactions(self) -> list[dict[str, object]]:
        return deepcopy(self.transactions)

    def create_transaction(self, payload: dict[str, object]) -> dict[str, object]:
        item = {"id": f"tx-{uuid4()}", **payload}
        self.transactions.insert(0, item)
        return deepcopy(item)

    def update_transaction(self, item_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for index, item in enumerate(self.transactions):
            if item["id"] == item_id:
                self.transactions[index] = {**item, **payload, "id": item_id}
                return deepcopy(self.transactions[index])
        return None

    def delete_transaction(self, item_id: str) -> bool:
        before = len(self.transactions)
        self.transactions = [item for item in self.transactions if item["id"] != item_id]
        return len(self.transactions) != before

    def save_alerts(self, alerts: list[dict[str, object]], latest_job: dict[str, object]) -> dict[str, object]:
        self.alerts = deepcopy(alerts)
        self.latest_job = deepcopy(latest_job)
        return deepcopy(self.latest_job)

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
        serialized_items = []
        for item in items:
            review = item.get("review", {})
            serialized_items.append(
                {
                    "id": item["id"],
                    "alert_no": item["alert_no"],
                    "rule_code": item["rule_code"],
                    "rule_name": item["rule_name"],
                    "risk_level": item["risk_level"],
                    "member_unit_code": item["member_unit_code"],
                    "member_unit_name": item["member_unit_name"],
                    "payer_name": item["payer_name"],
                    "payee_name": item["payee_name"],
                    "transaction_date": item["transaction_date"],
                    "matched_amount": item["matched_amount"],
                    "review_status": item["review_status"],
                    "assignment_status": review.get("assignment_status", "unassigned"),
                    "assigned_reviewer_name": review.get("assigned_reviewer_name", ""),
                    "assigned_at": review.get("assigned_at"),
                    "evidence_count": item["evidence_count"],
                    "alert_summary": item["alert_summary"],
                }
            )
        return {"total": len(serialized_items), "items": serialized_items}

    def get_terror_alert(self, alert_id: str) -> dict[str, object] | None:
        return next((deepcopy(alert) for alert in self.alerts if alert["id"] == alert_id), None)

    def assign_alert_reviewer(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                alert["review"] = {
                    **alert["review"],
                    "assignment_status": "assigned",
                    "assigned_reviewer_name": str(payload["assignedReviewerName"]),
                    "assigned_at": f"{SNAPSHOT_DATE}T12:00:00+08:00",
                }
                return deepcopy(alert)
        return None

    def save_review(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                if alert["review"].get("assignment_status") != "assigned":
                    raise ValueError("Alert must be assigned before review")
                alert["review"] = {**alert["review"], **payload, "reviewed_at": f"{SNAPSHOT_DATE}T12:00:00+08:00"}
                alert["review_status"] = str(payload["review_status"])
                return deepcopy(alert)
        return None

    def get_terror_risk_topic(self) -> dict[str, object]:
        amounts = sum(float(alert["matched_amount_value"]) for alert in self.alerts)
        trend_map: dict[str, int] = {}
        for alert in self.alerts:
            tx_date = str(alert["transaction_date"])
            trend_map[tx_date] = trend_map.get(tx_date, 0) + 1
        return {
            "page_title": "涉恐交易风险",
            "snapshot_date": SNAPSHOT_DATE,
            "kpis": {
                "alert_count": str(len(self.alerts)),
                "high_risk_count": str(sum(1 for alert in self.alerts if alert["risk_level"] == "high")),
                "involved_units": str(len({alert["member_unit_name"] for alert in self.alerts})),
                "involved_amount": _format_amount_yuan(amounts),
                "blacklist_hit_count": str(sum(1 for alert in self.alerts if alert["rule_code"] == "blacklist_hit")),
            },
            "trend": [{"date": key, "value": trend_map[key]} for key in sorted(trend_map)],
            "top_entities": [],
            "top_accounts": [],
            "typical_cases": [
                {
                    "id": alert["id"],
                    "title": {
                        "blacklist_hit": "黑名单直接命中",
                        "high_frequency_high_amount": "高频大额交易",
                        "dormant_account_abnormal_payment": "长期闲置账户异常交易",
                    }.get(str(alert["rule_code"]), str(alert["rule_name"])),
                    "summary": alert["alert_summary"],
                    "risk_level": alert["risk_level"],
                    "alert_no": alert["alert_no"],
                }
                for alert in select_typical_case_alerts(self.alerts)
            ],
            "latest_job": deepcopy(self.latest_job),
        }
