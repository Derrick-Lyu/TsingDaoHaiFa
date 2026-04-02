from __future__ import annotations

from copy import deepcopy
from uuid import uuid4

from app.engine.terror_risk import detect_terror_risk_alerts, select_typical_case_alerts

SNAPSHOT_DATE = "2026-03-31"

TICKET_TYPE_LABELS = {
    "warning_notice": "风险预警单",
    "risk_tip": "风险提示单",
    "supervision": "风险督办单",
}

TRIGGER_SOURCE_LABELS = {
    "model_threshold": "模型阈值预警",
    "audit_rectification": "审计整改跟踪",
    "leader_instruction": "领导批示",
    "typical_event": "典型事件提醒",
    "trend_change": "风险趋势变化",
    "three_consecutive_warnings": "连续三次预警",
    "rectification_overdue": "整改逾期",
}


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
        {
            "id": "rule-threshold-review",
            "ruleCode": "post_review_threshold_notice",
            "ruleName": "模型阈值回顾预警规则",
            "ruleCategory": "risk_ticket_workflow",
            "ruleDescription": "针对模型阈值异常事项形成事后预警回顾和跟踪说明。",
            "riskLevel": "high",
            "enabled": True,
            "sortOrder": 4,
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
            "id": "rule-leader-warning",
            "ruleCode": "leader_attention_notice",
            "ruleName": "领导批示预警规则",
            "ruleCategory": "risk_ticket_workflow",
            "ruleDescription": "根据领导批示事项发起风险预警单并跟踪处置进展。",
            "riskLevel": "warn",
            "enabled": True,
            "sortOrder": 5,
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
            "id": "rule-audit-rectification",
            "ruleCode": "audit_rectification_notice",
            "ruleName": "审计整改预警规则",
            "ruleCategory": "risk_ticket_workflow",
            "ruleDescription": "针对审计整改问题开展后续预警跟踪与反馈。",
            "riskLevel": "warn",
            "enabled": True,
            "sortOrder": 6,
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
            "id": "rule-trend-tip",
            "ruleCode": "trend_change_notice",
            "ruleName": "风险趋势提示规则",
            "ruleCategory": "risk_ticket_workflow",
            "ruleDescription": "针对二道防线风险管理要求或内外部风险趋势变化发起提示单。",
            "riskLevel": "warn",
            "enabled": True,
            "sortOrder": 7,
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
            "id": "rule-typical-event",
            "ruleCode": "typical_event_notice",
            "ruleName": "典型事件提示规则",
            "ruleCategory": "risk_ticket_workflow",
            "ruleDescription": "对典型风险事件开展系统内普遍提醒和复盘提示。",
            "riskLevel": "warn",
            "enabled": True,
            "sortOrder": 8,
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
            "id": "rule-three-warnings",
            "ruleCode": "three_consecutive_warnings",
            "ruleName": "连续三次预警督办规则",
            "ruleCategory": "risk_ticket_workflow",
            "ruleDescription": "特定监控模型连续三次预警后自动转入督办跟踪。",
            "riskLevel": "high",
            "enabled": True,
            "sortOrder": 9,
            "params": [
                {
                    "paramKey": "warning_threshold",
                    "paramLabel": "连续预警次数阈值",
                    "paramValue": "3",
                    "valueType": "number",
                    "unit": "次",
                    "editable": True,
                }
            ],
        },
        {
            "id": "rule-rectification-overdue",
            "ruleCode": "rectification_overdue_notice",
            "ruleName": "整改逾期督办规则",
            "ruleCategory": "risk_ticket_workflow",
            "ruleDescription": "针对内外部审计整改逾期事项发起督办单并跟踪落实情况。",
            "riskLevel": "high",
            "enabled": True,
            "sortOrder": 10,
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


def _ticket_type_label(ticket_type: str | None) -> str:
    return TICKET_TYPE_LABELS.get(str(ticket_type or ""), "风险预警单")


def _trigger_source_label(trigger_source: str | None) -> str:
    return TRIGGER_SOURCE_LABELS.get(str(trigger_source or ""), "模型阈值预警")


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
            rules=[rule for rule in self.rules if str(rule.get("ruleCategory")) == "terror_risk"],
            blacklist=self.blacklist,
            snapshot_date=SNAPSHOT_DATE,
        )
        self.alerts = alerts
        self.latest_job = latest_job
        self._apply_default_review_assignments()

    def _apply_default_review_assignments(self) -> None:
        for index, alert in enumerate(self.alerts):
            self._ensure_alert_defaults(alert)
            if index == 0:
                alert["ticket_type"] = "warning_notice"
                alert["trigger_source"] = "leader_instruction"
                alert["ticket_title"] = "领导批示预警单"
                alert["ticket_reason"] = "领导要求跟踪重点风险指标"
                alert["ticket_content"] = "请相关单位尽快反馈。"
            elif index == 1:
                alert["ticket_type"] = "risk_tip"
                alert["trigger_source"] = "typical_event"
                alert["ticket_title"] = "典型风险事件提示"
                alert["ticket_reason"] = "对个别单位典型风险事件进行普遍提醒"
                alert["ticket_content"] = "请相关单位阅知并开展自查。"
            elif index == 2:
                alert["ticket_type"] = "supervision"
                alert["trigger_source"] = "three_consecutive_warnings"
                alert["ticket_title"] = "连续三次预警督办单"
                alert["ticket_reason"] = "监控模型连续三次预警"
                alert["ticket_content"] = "请成员单位反馈整改落实情况。"
                alert["continuous_warning_count"] = 3
                alert["deadline_at"] = f"{SNAPSHOT_DATE}T18:00:00+08:00"
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
            alert["dispatch_status"] = "dispatched" if review["assignment_status"] == "assigned" else "pending"
            alert["flow_logs"] = alert.get("flow_logs", [])
        if not any(alert["rule_code"] == "leader_attention_notice" for alert in self.alerts):
            self.alerts.append(
                {
                    "id": "workflow-ticket-leader-001",
                    "alert_no": "RT-20260403-LEADER-001",
                    "ticket_type": "warning_notice",
                    "trigger_source": "leader_instruction",
                    "ticket_title": "领导批示预警单",
                    "ticket_reason": "围绕近期重点风险指标波动开展事后复盘并形成预警跟踪。",
                    "ticket_content": "请相关单位结合指标变化情况补充说明成因、处置安排和后续防控措施。",
                    "rule_code": "leader_attention_notice",
                    "rule_name": "领导批示预警规则",
                    "risk_level": "warn",
                    "alert_status": "open",
                    "dispatch_status": "dispatched",
                    "feedback_status": "submitted",
                    "review_status": "pending",
                    "recheck_status": "pending",
                    "member_unit_code": "HF-HQ-001",
                    "member_unit_name": "集团本部",
                    "payer_name": None,
                    "payer_account": None,
                    "payee_name": None,
                    "payee_account": None,
                    "transaction_date": None,
                    "matched_amount": "0.00万元",
                    "matched_amount_value": 0.0,
                    "matched_count": 0,
                    "deadline_at": f"{SNAPSHOT_DATE}T18:00:00+08:00",
                    "is_overdue": False,
                    "continuous_warning_count": 0,
                    "source_ref_type": "leader_instruction",
                    "source_ref_id": "workflow-leader-001",
                    "evidence_count": 0,
                    "latest_evidence_summary": None,
                    "alert_summary": "领导批示预警单回顾事项",
                    "evidences": [],
                    "related_transactions": [],
                    "review": {
                        "review_status": "pending",
                        "reviewer_name": "",
                        "review_result": "",
                        "review_comment": "",
                        "reviewed_at": None,
                        "assignment_status": "assigned",
                        "assigned_reviewer_name": "风险管理部负责人",
                        "assigned_at": f"{SNAPSHOT_DATE}T09:30:00+08:00",
                    },
                    "feedback": {
                        "feedback_status": "submitted",
                        "feedback_result": "已补充情况说明",
                        "feedback_comment": "已形成指标异动复盘说明。",
                        "operator_name": "集团风险联络员",
                        "feedback_at": f"{SNAPSHOT_DATE}T14:20:00+08:00",
                    },
                    "recheck": {
                        "recheck_status": "pending",
                        "recheck_result": "",
                        "recheck_comment": "",
                        "operator_name": "",
                        "rechecked_at": None,
                    },
                    "ack_records": [],
                    "flow_logs": [
                        {
                            "action_type": "dispatch",
                            "action_result": "已派发",
                            "action_comment": "按领导批示转风险管理部牵头跟踪。",
                            "operator_name": "系统管理员",
                            "created_at": f"{SNAPSHOT_DATE}T09:30:00+08:00",
                        },
                        {
                            "action_type": "feedback",
                            "action_result": "已反馈",
                            "action_comment": "已补充事后说明和后续措施。",
                            "operator_name": "集团风险联络员",
                            "created_at": f"{SNAPSHOT_DATE}T14:20:00+08:00",
                        },
                    ],
                }
            )

    def _ensure_alert_defaults(self, alert: dict[str, object]) -> dict[str, object]:
        alert.setdefault("ticket_type", "warning_notice")
        alert.setdefault("trigger_source", "model_threshold")
        alert.setdefault("ticket_title", str(alert.get("rule_name", "风险预警单")))
        alert.setdefault("ticket_reason", str(alert.get("alert_summary", "")))
        alert.setdefault("ticket_content", str(alert.get("alert_summary", "")))
        alert.setdefault("dispatch_status", "pending")
        alert.setdefault("feedback_status", "pending")
        alert.setdefault("recheck_status", "pending")
        alert.setdefault("deadline_at", None)
        alert.setdefault("is_overdue", False)
        alert.setdefault("continuous_warning_count", 0)
        alert.setdefault("source_ref_type", "detection_job")
        alert.setdefault("source_ref_id", self.latest_job.get("job_no"))
        alert.setdefault("feedback", {
            "feedback_status": "pending",
            "feedback_result": "",
            "feedback_comment": "",
            "operator_name": "",
            "feedback_at": None,
        })
        alert.setdefault("recheck", {
            "recheck_status": "pending",
            "recheck_result": "",
            "recheck_comment": "",
            "operator_name": "",
            "rechecked_at": None,
        })
        alert.setdefault("ack_records", [])
        alert.setdefault("flow_logs", [])
        return alert

    def _serialize_alert_list_item(self, item: dict[str, object]) -> dict[str, object]:
        review = item.get("review", {})
        return {
            "id": item["id"],
            "alert_no": item["alert_no"],
            "ticket_type": item["ticket_type"],
            "ticket_type_label": _ticket_type_label(str(item["ticket_type"])),
            "trigger_source": item["trigger_source"],
            "trigger_source_label": _trigger_source_label(str(item["trigger_source"])),
            "ticket_title": item["ticket_title"],
            "rule_code": item["rule_code"],
            "rule_name": item["rule_name"],
            "risk_level": item["risk_level"],
            "member_unit_code": item["member_unit_code"],
            "member_unit_name": item["member_unit_name"],
            "payer_name": item["payer_name"],
            "payee_name": item["payee_name"],
            "transaction_date": item["transaction_date"],
            "matched_amount": item["matched_amount"],
            "dispatch_status": item["dispatch_status"],
            "feedback_status": item["feedback_status"],
            "review_status": item["review_status"],
            "recheck_status": item["recheck_status"],
            "assignment_status": review.get("assignment_status", "unassigned"),
            "assigned_reviewer_name": review.get("assigned_reviewer_name", ""),
            "assigned_at": review.get("assigned_at"),
            "deadline_at": item["deadline_at"],
            "is_overdue": bool(item["is_overdue"]),
            "continuous_warning_count": int(item["continuous_warning_count"]),
            "evidence_count": item["evidence_count"],
            "alert_summary": item["alert_summary"],
        }

    def _append_flow_log(
        self,
        alert: dict[str, object],
        *,
        action_type: str,
        action_result: str,
        action_comment: str = "",
        operator_name: str = "",
    ) -> None:
        alert.setdefault("flow_logs", []).append(
            {
                "action_type": action_type,
                "action_result": action_result,
                "action_comment": action_comment,
                "operator_name": operator_name,
                "created_at": f"{SNAPSHOT_DATE}T12:00:00+08:00",
            }
        )

    def get_overview(self) -> dict[str, object]:
        summary_blocks = self.get_fund_safety_summary()["summary_blocks"]
        return {
            "page_title": "风险总览",
            "snapshot_date": SNAPSHOT_DATE,
            "risk_cards": [
                {"title": "金融风险", "high": 5, "warn": 4, "hint": 3},
                {"title": "往来款风险", "high": 1, "warn": 3, "hint": 2},
                {"title": "循环贸易风险", "high": 4, "warn": 3, "hint": 2},
                {"title": "资金风险", "high": 2, "warn": len(self.alerts), "hint": 2},
                {"title": "存货风险", "high": 3, "warn": 2, "hint": 2},
                {"title": "固定资产风险", "high": 1, "warn": 1, "hint": 2},
                {"title": "债务风险", "high": 1, "warn": 2, "hint": 1},
                {"title": "税务风险", "high": 1, "warn": 1, "hint": 2},
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
        preserved_non_detection = [
            deepcopy(alert)
            for alert in self.alerts
            if str(alert.get("source_ref_type")) != "detection_job"
        ]
        refreshed = deepcopy(alerts)
        self.latest_job = deepcopy(latest_job)
        self.alerts = refreshed
        self._apply_default_review_assignments()
        self.alerts.extend(preserved_non_detection)
        return deepcopy(self.latest_job)

    def list_terror_alerts(
        self,
        *,
        rule_type: str | None = None,
        risk_level: str | None = None,
        member_unit: str | None = None,
        ticket_type: str | None = None,
        trigger_source: str | None = None,
        dispatch_status: str | None = None,
        feedback_status: str | None = None,
        review_status: str | None = None,
        recheck_status: str | None = None,
        is_overdue: bool | None = None,
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
        if ticket_type:
            items = [item for item in items if item["ticket_type"] == ticket_type]
        if trigger_source:
            items = [item for item in items if item["trigger_source"] == trigger_source]
        if dispatch_status:
            items = [item for item in items if item["dispatch_status"] == dispatch_status]
        if feedback_status:
            items = [item for item in items if item["feedback_status"] == feedback_status]
        if review_status:
            items = [item for item in items if item["review_status"] == review_status]
        if recheck_status:
            items = [item for item in items if item["recheck_status"] == recheck_status]
        if is_overdue is not None:
            items = [item for item in items if bool(item["is_overdue"]) is is_overdue]
        serialized_items = [self._serialize_alert_list_item(item) for item in items]
        return {"total": len(serialized_items), "items": serialized_items}

    def get_terror_alert(self, alert_id: str) -> dict[str, object] | None:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                current = deepcopy(alert)
                self._ensure_alert_defaults(current)
                current["ticket_type_label"] = _ticket_type_label(str(current["ticket_type"]))
                current["trigger_source_label"] = _trigger_source_label(str(current["trigger_source"]))
                return current
        return None

    def create_manual_alert(self, payload: dict[str, object]) -> dict[str, object]:
        ticket_type = str(payload.get("ticket_type", "warning_notice"))
        ticket_id = f"alert-{uuid4()}"
        review_status = "pending"
        alert = {
            "id": ticket_id,
            "alert_no": f"RT-{len(self.alerts) + 1:03d}",
            "ticket_type": ticket_type,
            "trigger_source": str(payload.get("trigger_source", "leader_instruction")),
            "ticket_title": str(payload.get("ticket_title", _ticket_type_label(ticket_type))),
            "ticket_reason": str(payload.get("ticket_reason", "")),
            "ticket_content": str(payload.get("ticket_content", "")),
            "rule_code": str(payload.get("rule_code", "manual_ticket")),
            "rule_name": str(payload.get("rule_name", _ticket_type_label(ticket_type))),
            "risk_level": str(payload.get("risk_level", "warn")),
            "alert_status": "open",
            "dispatch_status": "pending",
            "feedback_status": "pending",
            "review_status": review_status,
            "recheck_status": "pending",
            "member_unit_code": payload.get("member_unit_code"),
            "member_unit_name": str(payload["member_unit_name"]),
            "payer_name": payload.get("payer_name"),
            "payer_account": payload.get("payer_account"),
            "payee_name": payload.get("payee_name"),
            "payee_account": payload.get("payee_account"),
            "transaction_date": payload.get("transaction_date"),
            "matched_amount": str(payload.get("matched_amount", "0.00万元")),
            "matched_amount_value": float(payload.get("matched_amount_value", 0.0)),
            "matched_count": int(payload.get("matched_count", 0)),
            "deadline_at": payload.get("deadline_at"),
            "is_overdue": bool(payload.get("is_overdue", False)),
            "continuous_warning_count": int(payload.get("continuous_warning_count", 0)),
            "source_ref_type": "manual",
            "source_ref_id": ticket_id,
            "evidence_count": int(payload.get("evidence_count", 0)),
            "latest_evidence_summary": payload.get("latest_evidence_summary"),
            "alert_summary": str(payload.get("ticket_content", payload.get("ticket_reason", ""))),
            "evidences": [],
            "related_transactions": [],
            "review": {
                "review_status": review_status,
                "reviewer_name": "",
                "review_result": "",
                "review_comment": "",
                "reviewed_at": None,
                "assignment_status": "unassigned",
                "assigned_reviewer_name": "",
                "assigned_at": None,
            },
            "feedback": {
                "feedback_status": "pending",
                "feedback_result": "",
                "feedback_comment": "",
                "operator_name": "",
                "feedback_at": None,
            },
            "recheck": {
                "recheck_status": "pending",
                "recheck_result": "",
                "recheck_comment": "",
                "operator_name": "",
                "rechecked_at": None,
            },
            "ack_records": [],
            "flow_logs": [],
        }
        self._append_flow_log(
            alert,
            action_type="manual_create",
            action_result=ticket_type,
            action_comment=str(payload.get("ticket_reason", "")),
            operator_name="system",
        )
        self.alerts.insert(0, alert)
        return self.get_terror_alert(ticket_id)

    def assign_alert_reviewer(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                self._ensure_alert_defaults(alert)
                alert["review"] = {
                    **alert["review"],
                    "assignment_status": "assigned",
                    "assigned_reviewer_name": str(payload["assignedReviewerName"]),
                    "assigned_at": f"{SNAPSHOT_DATE}T12:00:00+08:00",
                }
                alert["dispatch_status"] = "dispatched"
                self._append_flow_log(
                    alert,
                    action_type="dispatch",
                    action_result="assigned",
                    action_comment="已派发审核人",
                    operator_name=str(payload["assignedReviewerName"]),
                )
                return self.get_terror_alert(alert_id)
        return None

    def save_review(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                if alert["review"].get("assignment_status") != "assigned":
                    raise ValueError("Alert must be assigned before review")
                alert["review"] = {**alert["review"], **payload, "reviewed_at": f"{SNAPSHOT_DATE}T12:00:00+08:00"}
                alert["review_status"] = str(payload["review_status"])
                self._append_flow_log(
                    alert,
                    action_type="review",
                    action_result=str(payload["review_status"]),
                    action_comment=str(payload.get("review_comment", "")),
                    operator_name=str(payload.get("reviewer_name", "")),
                )
                return self.get_terror_alert(alert_id)
        return None

    def save_feedback(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                self._ensure_alert_defaults(alert)
                alert["feedback"] = {
                    "feedback_status": "submitted",
                    "feedback_result": str(payload.get("feedback_result", "")),
                    "feedback_comment": str(payload.get("feedback_comment", "")),
                    "operator_name": str(payload.get("operator_name", "")),
                    "feedback_at": f"{SNAPSHOT_DATE}T12:00:00+08:00",
                }
                alert["feedback_status"] = "submitted"
                self._append_flow_log(
                    alert,
                    action_type="feedback",
                    action_result="submitted",
                    action_comment=str(payload.get("feedback_comment", "")),
                    operator_name=str(payload.get("operator_name", "")),
                )
                return self.get_terror_alert(alert_id)
        return None

    def save_recheck(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                self._ensure_alert_defaults(alert)
                alert["recheck"] = {
                    "recheck_status": str(payload.get("recheck_status", "pending")),
                    "recheck_result": str(payload.get("recheck_result", "")),
                    "recheck_comment": str(payload.get("recheck_comment", "")),
                    "operator_name": str(payload.get("operator_name", "")),
                    "rechecked_at": f"{SNAPSHOT_DATE}T12:00:00+08:00",
                }
                alert["recheck_status"] = alert["recheck"]["recheck_status"]
                self._append_flow_log(
                    alert,
                    action_type="recheck",
                    action_result=alert["recheck_status"],
                    action_comment=str(payload.get("recheck_comment", "")),
                    operator_name=str(payload.get("operator_name", "")),
                )
                return self.get_terror_alert(alert_id)
        return None

    def save_ack(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                self._ensure_alert_defaults(alert)
                record = {
                    "ack_status": "read",
                    "operator_name": str(payload.get("operator_name", "")),
                    "ack_comment": str(payload.get("ack_comment", "")),
                    "ack_at": f"{SNAPSHOT_DATE}T12:00:00+08:00",
                }
                alert.setdefault("ack_records", []).append(record)
                self._append_flow_log(
                    alert,
                    action_type="ack",
                    action_result="read",
                    action_comment=record["ack_comment"],
                    operator_name=record["operator_name"],
                )
                return self.get_terror_alert(alert_id)
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
