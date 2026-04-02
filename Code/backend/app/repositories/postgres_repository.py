from __future__ import annotations

from contextlib import contextmanager
import json

from app.engine.terror_risk import select_typical_case_alerts

SNAPSHOT_DATE = "2026-03-31"
TICKET_TYPE_LABELS = {
    "warning_notice": "风险预警单",
    "risk_tip": "风险提示单",
    "supervision": "风险督办单",
}
TRIGGER_SOURCE_LABELS = {
    "model_threshold": "模型阈值预警",
    "audit_rectification": "审计整改跟踪",
    "leader_instruction": "领导指定",
    "typical_event": "典型事件提醒",
    "trend_change": "风险趋势变化",
    "three_consecutive_warnings": "连续三次预警",
    "rectification_overdue": "整改逾期",
}


class PostgresRepository:
    def __init__(self, database_url: str) -> None:
        self.database_url = database_url

    @contextmanager
    def _connection(self):
        import psycopg
        from psycopg.rows import dict_row

        with psycopg.connect(self.database_url, row_factory=dict_row) as conn:
            yield conn

    def _ticket_type_label(self, ticket_type: str | None) -> str:
        return TICKET_TYPE_LABELS.get(str(ticket_type or ""), "风险预警单")

    def _trigger_source_label(self, trigger_source: str | None) -> str:
        return TRIGGER_SOURCE_LABELS.get(str(trigger_source or ""), "模型阈值预警")

    def _ensure_ticket_payload(self, extra_payload: dict[str, object] | None) -> dict[str, object]:
        payload = dict(extra_payload or {})
        payload.setdefault("ticket_type", "warning_notice")
        payload.setdefault("trigger_source", "model_threshold")
        payload.setdefault("ticket_title", "")
        payload.setdefault("ticket_reason", "")
        payload.setdefault("ticket_content", "")
        payload.setdefault("dispatch_status", "pending")
        payload.setdefault("feedback_status", "pending")
        payload.setdefault("recheck_status", "pending")
        payload.setdefault("deadline_at", None)
        payload.setdefault("is_overdue", False)
        payload.setdefault("continuous_warning_count", 0)
        payload.setdefault("source_ref_type", "detection_job")
        payload.setdefault("source_ref_id", None)
        payload.setdefault("feedback", {
            "feedback_status": "pending",
            "feedback_result": "",
            "feedback_comment": "",
            "operator_name": "",
            "feedback_at": None,
        })
        payload.setdefault("recheck", {
            "recheck_status": "pending",
            "recheck_result": "",
            "recheck_comment": "",
            "operator_name": "",
            "rechecked_at": None,
        })
        payload.setdefault("ack_records", [])
        payload.setdefault("flow_logs", [])
        payload.setdefault("related_transactions", [])
        return payload

    def get_overview(self) -> dict[str, object]:
        summary_blocks = self.get_fund_safety_summary()["summary_blocks"]
        topic_rows = [
            {
                "org": row["secondary_topic_name"],
                "event": row["risk_conclusion"],
            }
            for row in summary_blocks[:6]
        ]
        high_count = sum(
            1
            for row in summary_blocks
            if str(row["risk_level"]).lower() in {"high", "高风险"}
        )
        return {
            "page_title": "风险总览",
            "snapshot_date": max(
                (row["data_snapshot_date"] for row in summary_blocks if row["data_snapshot_date"]),
                default="2026-03-31",
            ),
            "risk_cards": [
                {"title": "金融风险", "high": 0, "warn": 2, "hint": 3},
                {"title": "往来款风险", "high": 0, "warn": 2, "hint": 3},
                {"title": "循环贸易风险", "high": 0, "warn": 2, "hint": 3},
                {"title": "资金风险", "high": high_count, "warn": len(summary_blocks), "hint": max(1, len(summary_blocks) // 2)},
                {"title": "存货风险", "high": 0, "warn": 2, "hint": 3},
                {"title": "固定资产风险", "high": 0, "warn": 1, "hint": 2},
                {"title": "债务风险", "high": 0, "warn": 2, "hint": 1},
                {"title": "税务风险", "high": 0, "warn": 1, "hint": 2},
            ],
            "recent_risks": topic_rows,
            "fund_safety_focus": {
                "page_key": "fund_safety",
                "title": "资金安全",
                "summary": "汇总 Sheet[资金安全] 下全部二级主题的 executive 结果",
            },
            "pie_data": [
                {"name": "高风险", "value": high_count or 1, "color": "#e05c5c"},
                {"name": "中风险", "value": max(len(summary_blocks) - high_count, 1), "color": "#e8b84b"},
                {"name": "低风险", "value": 1, "color": "#7ab3e0"},
            ],
            "donut_data": [
                {"name": "跟进中", "value": 60, "color": "#7ab3e0"},
                {"name": "待处理", "value": 40, "color": "#e05c5c"},
            ],
        }

    def get_fund_safety_summary(self) -> dict[str, object]:
        with self._connection() as conn:
            rows = conn.execute(
                """
                SELECT
                  topic_code,
                  topic_name,
                  secondary_topic_name,
                  summary_title,
                  core_metrics,
                  risk_conclusion,
                  risk_level,
                  is_clickable,
                  target_page_key,
                  data_snapshot_date,
                  display_order
                FROM fund_safety_topic_summaries
                ORDER BY display_order
                """
            ).fetchall()
        snapshot = max((row["data_snapshot_date"] for row in rows if row["data_snapshot_date"]), default="2026-03-31")
        return {
            "page_title": "资金安全",
            "snapshot_date": str(snapshot),
            "summary_blocks": [
                {
                    "topic_code": row["topic_code"],
                    "topic_name": row["topic_name"],
                    "secondary_topic_name": row["secondary_topic_name"],
                    "summary_title": row["summary_title"],
                    "core_metrics": self._core_metrics_to_dict(row["core_metrics"]),
                    "risk_conclusion": row["risk_conclusion"],
                    "risk_level": row["risk_level"],
                    "is_clickable": row["is_clickable"],
                    "target_page_key": row["target_page_key"],
                    "data_snapshot_date": str(row["data_snapshot_date"]) if row["data_snapshot_date"] else None,
                    "display_order": row["display_order"],
                }
                for row in rows
            ],
        }

    def list_blacklist(self) -> list[dict[str, object]]:
        with self._connection() as conn:
            rows = conn.execute(
                """
                SELECT id, blacklist_code, blacklist_name, subject_name, subject_type,
                       match_keywords, risk_level, status, source_system,
                       effective_from, effective_to, notes, created_at, updated_at
                FROM terror_blacklist
                ORDER BY updated_at DESC, blacklist_code
                """
            ).fetchall()
        return [
            {
                "id": str(row["id"]),
                "blacklistCode": row["blacklist_code"],
                "blacklistName": row["blacklist_name"],
                "subjectName": row["subject_name"],
                "subjectType": row["subject_type"],
                "matchKeywords": row["match_keywords"] or [],
                "riskLevel": row["risk_level"],
                "status": row["status"],
                "sourceSystem": row["source_system"],
                "effectiveFrom": str(row["effective_from"]) if row["effective_from"] else None,
                "effectiveTo": str(row["effective_to"]) if row["effective_to"] else None,
                "notes": row["notes"],
                "createdAt": row["created_at"].isoformat() if row["created_at"] else None,
                "updatedAt": row["updated_at"].isoformat() if row["updated_at"] else None,
            }
            for row in rows
        ]

    def create_blacklist(self, payload: dict[str, object]) -> dict[str, object]:
        with self._connection() as conn:
            row = conn.execute(
                """
                INSERT INTO terror_blacklist (
                  blacklist_code, blacklist_name, subject_name, subject_type,
                  match_keywords, risk_level, status, source_system, effective_from,
                  effective_to, notes, created_by, updated_by
                )
                VALUES (%(blacklistCode)s, %(blacklistName)s, %(subjectName)s, %(subjectType)s,
                        %(matchKeywords)s, %(riskLevel)s, %(status)s, %(sourceSystem)s,
                        %(effectiveFrom)s, %(effectiveTo)s, %(notes)s, 'api', 'api')
                RETURNING id
                """,
                payload,
            ).fetchone()
            conn.commit()
        return self._find_blacklist(str(row["id"]))

    def update_blacklist(self, item_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        with self._connection() as conn:
            result = conn.execute(
                """
                UPDATE terror_blacklist
                SET blacklist_code = %(blacklistCode)s,
                    blacklist_name = %(blacklistName)s,
                    subject_name = %(subjectName)s,
                    subject_type = %(subjectType)s,
                    match_keywords = %(matchKeywords)s,
                    risk_level = %(riskLevel)s,
                    status = %(status)s,
                    source_system = %(sourceSystem)s,
                    effective_from = %(effectiveFrom)s,
                    effective_to = %(effectiveTo)s,
                    notes = %(notes)s,
                    updated_by = 'api'
                WHERE id = %(id)s::uuid
                RETURNING id
                """,
                {**payload, "id": item_id},
            ).fetchone()
            conn.commit()
        if not result:
            return None
        return self._find_blacklist(item_id)

    def delete_blacklist(self, item_id: str) -> bool:
        with self._connection() as conn:
            result = conn.execute(
                "DELETE FROM terror_blacklist WHERE id = %s::uuid",
                (item_id,),
            )
            conn.commit()
        return result.rowcount > 0

    def _find_blacklist(self, item_id: str) -> dict[str, object] | None:
        return next((row for row in self.list_blacklist() if row["id"] == item_id), None)

    def list_rules(self) -> list[dict[str, object]]:
        with self._connection() as conn:
            rules = conn.execute(
                """
                SELECT id, rule_code, rule_name, rule_category, rule_description,
                       risk_level, enabled, sort_order
                FROM terror_rules
                ORDER BY sort_order
                """
            ).fetchall()
            params = conn.execute(
                """
                SELECT rule_id, param_key, param_label, param_value, value_type, unit, editable, sort_order
                FROM terror_rule_params
                ORDER BY sort_order
                """
            ).fetchall()
        params_by_rule: dict[str, list[dict[str, object]]] = {}
        for row in params:
            params_by_rule.setdefault(str(row["rule_id"]), []).append(
                {
                    "paramKey": row["param_key"],
                    "paramLabel": row["param_label"],
                    "paramValue": row["param_value"],
                    "valueType": row["value_type"],
                    "unit": row["unit"] or "",
                    "editable": row["editable"],
                }
            )
        return [
            {
                "id": str(rule["id"]),
                "ruleCode": rule["rule_code"],
                "ruleName": rule["rule_name"],
                "ruleCategory": rule["rule_category"],
                "ruleDescription": rule["rule_description"],
                "riskLevel": rule["risk_level"],
                "enabled": rule["enabled"],
                "sortOrder": rule["sort_order"],
                "params": params_by_rule.get(str(rule["id"]), []),
            }
            for rule in rules
        ]

    def update_rule(self, rule_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        with self._connection() as conn:
            result = conn.execute(
                """
                UPDATE terror_rules
                SET rule_code = %(ruleCode)s,
                    rule_name = %(ruleName)s,
                    rule_category = %(ruleCategory)s,
                    rule_description = %(ruleDescription)s,
                    risk_level = %(riskLevel)s,
                    enabled = %(enabled)s,
                    sort_order = %(sortOrder)s,
                    updated_by = 'api'
                WHERE id = %(id)s::uuid
                RETURNING id
                """,
                {**payload, "id": rule_id},
            ).fetchone()
            if not result:
                conn.rollback()
                return None
            conn.execute("DELETE FROM terror_rule_params WHERE rule_id = %s::uuid", (rule_id,))
            for index, param in enumerate(payload.get("params", []), start=1):
                conn.execute(
                    """
                    INSERT INTO terror_rule_params (
                      rule_id, param_key, param_label, param_value, value_type, unit, editable, sort_order
                    )
                    VALUES (%s::uuid, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        rule_id,
                        param["paramKey"],
                        param["paramLabel"],
                        param["paramValue"],
                        param["valueType"],
                        param.get("unit"),
                        param["editable"],
                        index,
                    ),
                )
            conn.commit()
        return next((row for row in self.list_rules() if row["id"] == rule_id), None)

    def list_transactions(self) -> list[dict[str, object]]:
        with self._connection() as conn:
            rows = conn.execute(
                """
                SELECT id, transaction_no, transaction_date, batch_no, member_unit_code, member_unit_name,
                       payer_name, payer_account, payee_name, payee_account, amount, currency,
                       payee_type, business_scenario, transaction_count, account_last_active_date,
                       is_dormant_account, source_file_name, source_row_no, extra_payload
                FROM payment_transactions
                ORDER BY transaction_date DESC, transaction_no DESC
                """
            ).fetchall()
        return [
            {
                "id": str(row["id"]),
                "transactionNo": row["transaction_no"],
                "transactionDate": str(row["transaction_date"]),
                "batchNo": row["batch_no"],
                "memberUnitCode": row["member_unit_code"],
                "memberUnitName": row["member_unit_name"],
                "payerName": row["payer_name"],
                "payerAccount": row["payer_account"],
                "payeeName": row["payee_name"],
                "payeeAccount": row["payee_account"],
                "amount": float(row["amount"]),
                "currency": row["currency"],
                "payeeType": row["payee_type"],
                "businessScenario": row["business_scenario"],
                "transactionCount": row["transaction_count"],
                "accountLastActiveDate": str(row["account_last_active_date"]) if row["account_last_active_date"] else None,
                "isDormantAccount": row["is_dormant_account"],
                "sourceFileName": row["source_file_name"],
                "sourceRowNo": row["source_row_no"],
                "remarks": (row["extra_payload"] or {}).get("remarks", ""),
            }
            for row in rows
        ]

    def create_transaction(self, payload: dict[str, object]) -> dict[str, object]:
        extra_payload = {"remarks": payload.get("remarks", "")}
        with self._connection() as conn:
            inserted = conn.execute(
                """
                INSERT INTO payment_transactions (
                  transaction_no, transaction_date, batch_no, member_unit_code, member_unit_name,
                  payer_name, payer_account, payee_name, payee_account, amount, currency,
                  payee_type, business_scenario, transaction_count, account_last_active_date,
                  is_dormant_account, source_file_name, source_row_no, extra_payload
                )
                VALUES (
                  %(transactionNo)s, %(transactionDate)s, %(batchNo)s, %(memberUnitCode)s, %(memberUnitName)s,
                  %(payerName)s, %(payerAccount)s, %(payeeName)s, %(payeeAccount)s, %(amount)s, %(currency)s,
                  %(payeeType)s, %(businessScenario)s, %(transactionCount)s, %(accountLastActiveDate)s,
                  %(isDormantAccount)s, %(sourceFileName)s, %(sourceRowNo)s, %(extra_payload)s::jsonb
                )
                RETURNING id
                """,
                {**payload, "extra_payload": json.dumps(extra_payload)},
            ).fetchone()
            conn.commit()
        inserted_id = str(inserted["id"])
        return next((row for row in self.list_transactions() if row["id"] == inserted_id), None)

    def update_transaction(self, item_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        extra_payload = {"remarks": payload.get("remarks", "")}
        with self._connection() as conn:
            result = conn.execute(
                """
                UPDATE payment_transactions
                SET transaction_no = %(transactionNo)s,
                    transaction_date = %(transactionDate)s,
                    batch_no = %(batchNo)s,
                    member_unit_code = %(memberUnitCode)s,
                    member_unit_name = %(memberUnitName)s,
                    payer_name = %(payerName)s,
                    payer_account = %(payerAccount)s,
                    payee_name = %(payeeName)s,
                    payee_account = %(payeeAccount)s,
                    amount = %(amount)s,
                    currency = %(currency)s,
                    payee_type = %(payeeType)s,
                    business_scenario = %(businessScenario)s,
                    transaction_count = %(transactionCount)s,
                    account_last_active_date = %(accountLastActiveDate)s,
                    is_dormant_account = %(isDormantAccount)s,
                    source_file_name = %(sourceFileName)s,
                    source_row_no = %(sourceRowNo)s,
                    extra_payload = %(extra_payload)s::jsonb
                WHERE id = %(id)s::uuid
                RETURNING id
                """,
                {**payload, "id": item_id, "extra_payload": json.dumps(extra_payload)},
            ).fetchone()
            conn.commit()
        if not result:
            return None
        return next((row for row in self.list_transactions() if row["id"] == item_id), None)

    def delete_transaction(self, item_id: str) -> bool:
        with self._connection() as conn:
            result = conn.execute(
                "DELETE FROM payment_transactions WHERE id = %s::uuid",
                (item_id,),
            )
            conn.commit()
        return result.rowcount > 0

    def save_alerts(self, alerts: list[dict[str, object]], latest_job: dict[str, object]) -> dict[str, object]:
        with self._connection() as conn:
            rule_rows = conn.execute(
                "SELECT id, rule_code FROM terror_rules"
            ).fetchall()
            rule_id_by_code = {row["rule_code"]: str(row["id"]) for row in rule_rows}
            preserved_manual_rows = conn.execute(
                """
                SELECT a.id, a.alert_no, a.extra_payload, ar.review_status, ar.assignment_status,
                       ar.assigned_reviewer_name, ar.assigned_at, ar.reviewer_name, ar.review_result,
                       ar.review_comment, ar.reviewed_at
                FROM terror_alerts a
                LEFT JOIN terror_alert_reviews ar ON ar.alert_id = a.id
                """
            ).fetchall()
            preserved_manual = []
            for row in preserved_manual_rows:
                payload = self._ensure_ticket_payload(self._json_to_object(row["extra_payload"]))
                if payload.get("source_ref_type") == "manual":
                    preserved_manual.append(
                        {
                            "alert_no": row["alert_no"],
                            "extra_payload": payload,
                            "review": {
                                "review_status": row["review_status"] or "pending",
                                "assignment_status": row["assignment_status"] or "unassigned",
                                "assigned_reviewer_name": row["assigned_reviewer_name"],
                                "assigned_at": row["assigned_at"],
                                "reviewer_name": row["reviewer_name"],
                                "review_result": row["review_result"],
                                "review_comment": row["review_comment"],
                                "reviewed_at": row["reviewed_at"],
                            },
                        }
                    )
            job_row = conn.execute(
                """
                INSERT INTO terror_detection_jobs (
                  job_no, job_status, triggered_by, started_at, finished_at, input_snapshot_at,
                  transaction_count, matched_count, high_risk_count, warning_count, summary
                )
                VALUES (%s, %s, 'api', %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                RETURNING id
                """,
                (
                    latest_job["job_no"],
                    latest_job["job_status"],
                    latest_job["started_at"],
                    latest_job["finished_at"],
                    latest_job["input_snapshot_at"],
                    latest_job["transaction_count"],
                    latest_job["matched_count"],
                    latest_job["high_risk_count"],
                    latest_job["warning_count"],
                    json.dumps(latest_job),
                ),
            ).fetchone()
            conn.execute("DELETE FROM terror_alert_reviews")
            conn.execute("DELETE FROM terror_alert_evidences")
            conn.execute("DELETE FROM terror_alerts")
            for alert in alerts:
                extra_payload = self._ensure_ticket_payload(
                    {"related_transactions": alert["related_transactions"]}
                )
                alert_row = conn.execute(
                    """
                    INSERT INTO terror_alerts (
                      alert_no, job_id, rule_id, rule_code, rule_name, risk_level, alert_status, review_status,
                      member_unit_code, member_unit_name, payer_name, payer_account, payee_name, payee_account,
                      transaction_date, matched_amount, matched_count, evidence_count, latest_evidence_summary,
                      alert_summary, extra_payload
                    )
                    VALUES (
                      %s, %s::uuid, %s::uuid, %s, %s, %s, %s, %s,
                      %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb
                    )
                    RETURNING id
                    """,
                    (
                        alert["alert_no"],
                        str(job_row["id"]),
                        rule_id_by_code.get(alert["rule_code"]),
                        alert["rule_code"],
                        alert["rule_name"],
                        alert["risk_level"],
                        alert["alert_status"],
                        alert["review_status"],
                        alert["member_unit_code"],
                        alert["member_unit_name"],
                        alert["payer_name"],
                        alert["payer_account"],
                        alert["payee_name"],
                        alert["payee_account"],
                        alert["transaction_date"],
                        alert["matched_amount_value"],
                        alert["matched_count"],
                        alert["evidence_count"],
                        alert["latest_evidence_summary"],
                        alert["alert_summary"],
                        json.dumps(extra_payload),
                    ),
                ).fetchone()
                for evidence in alert["evidences"]:
                    conn.execute(
                        """
                        INSERT INTO terror_alert_evidences (
                          alert_id, evidence_type, evidence_title, evidence_detail, evidence_payload, evidence_order
                        )
                        VALUES (%s::uuid, %s, %s, %s, %s::jsonb, %s)
                        """,
                        (
                            str(alert_row["id"]),
                            evidence["evidence_type"],
                            evidence["evidence_title"],
                            evidence["evidence_detail"],
                            json.dumps(evidence["evidence_payload"]),
                            evidence["evidence_order"],
                        ),
                    )
                conn.execute(
                    """
                    INSERT INTO terror_alert_reviews (
                      alert_id, review_status, assignment_status, assigned_reviewer_name, assigned_at,
                      reviewer_name, review_result, review_comment
                    )
                    VALUES (%s::uuid, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        str(alert_row["id"]),
                        alert["review"]["review_status"],
                        alert["review"].get("assignment_status", "unassigned"),
                        alert["review"].get("assigned_reviewer_name") or None,
                        alert["review"].get("assigned_at"),
                        alert["review"]["reviewer_name"],
                        alert["review"]["review_result"],
                        alert["review"]["review_comment"],
                    ),
                )
            for item in preserved_manual:
                alert_row = conn.execute(
                    """
                    INSERT INTO terror_alerts (
                      alert_no, job_id, rule_id, rule_code, rule_name, risk_level, alert_status, review_status,
                      member_unit_code, member_unit_name, payer_name, payer_account, payee_name, payee_account,
                      transaction_date, matched_amount, matched_count, evidence_count, latest_evidence_summary,
                      alert_summary, extra_payload
                    )
                    VALUES (
                      %s, %s::uuid, NULL, %s, %s, %s, 'open', %s,
                      NULL, %s, NULL, NULL, NULL, NULL, NULL, %s, %s, %s, NULL, %s, %s::jsonb
                    )
                    RETURNING id
                    """,
                    (
                        item["alert_no"],
                        str(job_row["id"]),
                        "manual_ticket",
                        item["extra_payload"].get("ticket_title") or "手工单据",
                        "warn",
                        item["review"]["review_status"],
                        item["extra_payload"].get("ticket_title") or "手工单据",
                        0,
                        0,
                        0,
                        item["extra_payload"].get("ticket_content") or item["extra_payload"].get("ticket_reason") or "",
                        json.dumps(item["extra_payload"]),
                    ),
                ).fetchone()
                conn.execute(
                    """
                    INSERT INTO terror_alert_reviews (
                      alert_id, review_status, assignment_status, assigned_reviewer_name, assigned_at,
                      reviewer_name, review_result, review_comment, reviewed_at
                    )
                    VALUES (%s::uuid, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        str(alert_row["id"]),
                        item["review"]["review_status"],
                        item["review"]["assignment_status"],
                        item["review"]["assigned_reviewer_name"],
                        item["review"]["assigned_at"],
                        item["review"]["reviewer_name"],
                        item["review"]["review_result"],
                        item["review"]["review_comment"],
                        item["review"]["reviewed_at"],
                    ),
                )
            self._refresh_summary_from_alerts(conn, alerts, latest_job)
            conn.commit()
        return latest_job

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
        clauses = []
        params: list[object] = []
        if rule_type:
            clauses.append("a.rule_code ILIKE %s")
            params.append(f"%{rule_type}%")
        if risk_level:
            clauses.append("a.risk_level = %s")
            params.append(risk_level)
        if member_unit:
            clauses.append("(a.member_unit_name ILIKE %s OR COALESCE(a.member_unit_code,'') ILIKE %s)")
            params.extend([f"%{member_unit}%", f"%{member_unit}%"])
        where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        with self._connection() as conn:
            rows = conn.execute(
                f"""
                SELECT a.id, a.alert_no, a.rule_code, a.rule_name, a.risk_level, a.member_unit_code,
                       a.member_unit_name, a.payer_name, a.payee_name, a.transaction_date, a.matched_amount,
                       a.review_status, ar.assignment_status, ar.assigned_reviewer_name, ar.assigned_at,
                       a.evidence_count, a.alert_summary, a.extra_payload
                FROM terror_alerts a
                LEFT JOIN terror_alert_reviews ar ON ar.alert_id = a.id
                {where_sql}
                ORDER BY a.created_at DESC, a.alert_no DESC
                """,
                params,
            ).fetchall()
        items = []
        for row in rows:
            payload = self._ensure_ticket_payload(self._json_to_object(row["extra_payload"]))
            item = {
                "id": str(row["id"]),
                "alert_no": row["alert_no"],
                "ticket_type": payload["ticket_type"],
                "ticket_type_label": self._ticket_type_label(str(payload["ticket_type"])),
                "trigger_source": payload["trigger_source"],
                "trigger_source_label": self._trigger_source_label(str(payload["trigger_source"])),
                "ticket_title": payload["ticket_title"],
                "rule_code": row["rule_code"],
                "rule_name": row["rule_name"],
                "risk_level": row["risk_level"],
                "member_unit_code": row["member_unit_code"],
                "member_unit_name": row["member_unit_name"],
                "payer_name": row["payer_name"],
                "payee_name": row["payee_name"],
                "transaction_date": str(row["transaction_date"]) if row["transaction_date"] else None,
                "matched_amount": f"{float(row['matched_amount']) / 10000:.2f}万元",
                "dispatch_status": payload["dispatch_status"],
                "feedback_status": payload["feedback_status"],
                "review_status": row["review_status"],
                "recheck_status": payload["recheck_status"],
                "assignment_status": row["assignment_status"] or "unassigned",
                "assigned_reviewer_name": row["assigned_reviewer_name"],
                "assigned_at": row["assigned_at"].isoformat() if row["assigned_at"] else None,
                "deadline_at": payload["deadline_at"],
                "is_overdue": bool(payload["is_overdue"]),
                "continuous_warning_count": int(payload["continuous_warning_count"]),
                "evidence_count": row["evidence_count"],
                "alert_summary": row["alert_summary"],
            }
            if ticket_type and item["ticket_type"] != ticket_type:
                continue
            if trigger_source and item["trigger_source"] != trigger_source:
                continue
            if dispatch_status and item["dispatch_status"] != dispatch_status:
                continue
            if feedback_status and item["feedback_status"] != feedback_status:
                continue
            if review_status and item["review_status"] != review_status:
                continue
            if recheck_status and item["recheck_status"] != recheck_status:
                continue
            if is_overdue is not None and item["is_overdue"] is not is_overdue:
                continue
            items.append(item)
        return {"total": len(items), "items": items}

    def get_terror_alert(self, alert_id: str) -> dict[str, object] | None:
        with self._connection() as conn:
            alert = conn.execute(
                """
                SELECT id, alert_no, rule_code, rule_name, risk_level, alert_status, review_status,
                       member_unit_code, member_unit_name, payer_name, payer_account, payee_name, payee_account,
                       transaction_date, matched_amount, matched_count, evidence_count, latest_evidence_summary,
                       alert_summary, extra_payload
                FROM terror_alerts
                WHERE id = %s::uuid
                """,
                (alert_id,),
            ).fetchone()
            if not alert:
                return None
            evidences = conn.execute(
                """
                SELECT evidence_type, evidence_title, evidence_detail, evidence_payload, evidence_order
                FROM terror_alert_evidences
                WHERE alert_id = %s::uuid
                ORDER BY evidence_order
                """,
                (alert_id,),
            ).fetchall()
            review = conn.execute(
                """
                SELECT review_status, assignment_status, assigned_reviewer_name, assigned_at,
                       reviewer_name, review_result, review_comment, reviewed_at
                FROM terror_alert_reviews
                WHERE alert_id = %s::uuid
                """,
                (alert_id,),
            ).fetchone()
        extra_payload = self._ensure_ticket_payload(self._json_to_object(alert["extra_payload"]))
        return {
            "id": str(alert["id"]),
            "alert_no": alert["alert_no"],
            "ticket_type": extra_payload.get("ticket_type", "warning_notice"),
            "ticket_type_label": self._ticket_type_label(str(extra_payload.get("ticket_type"))),
            "trigger_source": extra_payload.get("trigger_source"),
            "trigger_source_label": self._trigger_source_label(str(extra_payload.get("trigger_source"))),
            "ticket_title": extra_payload.get("ticket_title"),
            "ticket_reason": extra_payload.get("ticket_reason"),
            "ticket_content": extra_payload.get("ticket_content"),
            "rule_code": alert["rule_code"],
            "rule_name": alert["rule_name"],
            "risk_level": alert["risk_level"],
            "alert_status": alert["alert_status"],
            "dispatch_status": extra_payload.get("dispatch_status", "pending"),
            "feedback_status": extra_payload.get("feedback_status", "pending"),
            "review_status": alert["review_status"],
            "recheck_status": extra_payload.get("recheck_status", "pending"),
            "member_unit_code": alert["member_unit_code"],
            "member_unit_name": alert["member_unit_name"],
            "payer_name": alert["payer_name"],
            "payer_account": alert["payer_account"],
            "payee_name": alert["payee_name"],
            "payee_account": alert["payee_account"],
            "transaction_date": str(alert["transaction_date"]) if alert["transaction_date"] else None,
            "matched_amount": f"{float(alert['matched_amount']) / 10000:.2f}万元",
            "matched_count": alert["matched_count"],
            "deadline_at": extra_payload.get("deadline_at"),
            "is_overdue": bool(extra_payload.get("is_overdue", False)),
            "continuous_warning_count": int(extra_payload.get("continuous_warning_count", 0)),
            "source_ref_type": extra_payload.get("source_ref_type"),
            "source_ref_id": extra_payload.get("source_ref_id"),
            "evidence_count": alert["evidence_count"],
            "latest_evidence_summary": alert["latest_evidence_summary"],
            "alert_summary": alert["alert_summary"],
            "evidences": [
                {
                    "evidence_type": row["evidence_type"],
                    "evidence_title": row["evidence_title"],
                    "evidence_detail": row["evidence_detail"],
                    "evidence_payload": row["evidence_payload"] or {},
                    "evidence_order": row["evidence_order"],
                }
                for row in evidences
            ],
            "review": {
                "review_status": review["review_status"] if review else "pending",
                "assignment_status": review["assignment_status"] if review else "unassigned",
                "assigned_reviewer_name": review["assigned_reviewer_name"] if review else "",
                "assigned_at": review["assigned_at"].isoformat() if review and review["assigned_at"] else None,
                "reviewer_name": review["reviewer_name"] if review else "",
                "review_result": review["review_result"] if review else "",
                "review_comment": review["review_comment"] if review else "",
                "reviewed_at": review["reviewed_at"].isoformat() if review and review["reviewed_at"] else None,
            },
            "feedback": extra_payload.get("feedback", {
                "feedback_status": "pending",
                "feedback_result": "",
                "feedback_comment": "",
                "operator_name": "",
                "feedback_at": None,
            }),
            "recheck": extra_payload.get("recheck", {
                "recheck_status": "pending",
                "recheck_result": "",
                "recheck_comment": "",
                "operator_name": "",
                "rechecked_at": None,
            }),
            "ack_records": extra_payload.get("ack_records", []),
            "flow_logs": extra_payload.get("flow_logs", []),
            "related_transactions": extra_payload.get("related_transactions", []),
        }

    def assign_alert_reviewer(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        with self._connection() as conn:
            result = conn.execute(
                """
                UPDATE terror_alert_reviews
                SET assignment_status = 'assigned',
                    assigned_reviewer_name = %(assigned_reviewer_name)s,
                    assigned_at = now(),
                    updated_by = 'api'
                WHERE alert_id = %(alert_id)s::uuid
                RETURNING alert_id
                """,
                {
                    "alert_id": alert_id,
                    "assigned_reviewer_name": payload["assignedReviewerName"],
                },
            ).fetchone()
            conn.commit()
        if not result:
            return None
        self._append_flow_log(
            alert_id,
            action_type="dispatch",
            action_result="assigned",
            action_comment="已派发审核人",
            operator_name=str(payload["assignedReviewerName"]),
        )
        self._update_ticket_payload(
            alert_id,
            {"dispatch_status": "dispatched"},
        )
        return self.get_terror_alert(alert_id)

    def create_manual_alert(self, payload: dict[str, object]) -> dict[str, object]:
        extra_payload = self._ensure_ticket_payload(
            {
                "ticket_type": payload.get("ticket_type", "warning_notice"),
                "trigger_source": payload.get("trigger_source", "leader_instruction"),
                "ticket_title": payload.get("ticket_title", ""),
                "ticket_reason": payload.get("ticket_reason", ""),
                "ticket_content": payload.get("ticket_content", ""),
                "dispatch_status": "pending",
                "feedback_status": "pending",
                "recheck_status": "pending",
                "deadline_at": payload.get("deadline_at"),
                "is_overdue": payload.get("is_overdue", False),
                "continuous_warning_count": payload.get("continuous_warning_count", 0),
                "source_ref_type": "manual",
                "source_ref_id": None,
                "related_transactions": [],
            }
        )
        with self._connection() as conn:
            row = conn.execute(
                """
                INSERT INTO terror_alerts (
                  alert_no, job_id, rule_id, rule_code, rule_name, risk_level, alert_status, review_status,
                  member_unit_code, member_unit_name, payer_name, payer_account, payee_name, payee_account,
                  transaction_date, matched_amount, matched_count, evidence_count, latest_evidence_summary,
                  alert_summary, extra_payload
                )
                VALUES (
                  CONCAT('RT-', to_char(now(), 'YYYYMMDDHH24MISSMS')),
                  (
                    SELECT id
                    FROM terror_detection_jobs
                    ORDER BY created_at DESC
                    LIMIT 1
                  ),
                  (
                    SELECT id
                    FROM terror_rules
                    WHERE rule_code = %(rule_code)s
                    ORDER BY sort_order, created_at
                    LIMIT 1
                  ),
                  %(rule_code)s,
                  %(rule_name)s,
                  %(risk_level)s,
                  'open',
                  'pending',
                  %(member_unit_code)s,
                  %(member_unit_name)s,
                  NULL,
                  NULL,
                  NULL,
                  NULL,
                  NULL,
                  0,
                  0,
                  0,
                  NULL,
                  %(alert_summary)s,
                  %(extra_payload)s::jsonb
                )
                RETURNING id
                """,
                {
                    "rule_code": payload.get("rule_code", "blacklist_hit"),
                    "rule_name": payload.get("ticket_title") or self._ticket_type_label(str(payload.get("ticket_type"))),
                    "risk_level": payload.get("risk_level", "warn"),
                    "member_unit_code": payload.get("member_unit_code"),
                    "member_unit_name": payload["member_unit_name"],
                    "alert_summary": payload.get("ticket_content") or payload.get("ticket_reason") or "",
                    "extra_payload": json.dumps(extra_payload),
                },
            ).fetchone()
            conn.execute(
                """
                INSERT INTO terror_alert_reviews (
                  alert_id, review_status, assignment_status, created_by, updated_by
                )
                VALUES (%s::uuid, 'pending', 'unassigned', 'api', 'api')
                """,
                (str(row["id"]),),
            )
            conn.commit()
        self._append_flow_log(
            str(row["id"]),
            action_type="manual_create",
            action_result=str(extra_payload["ticket_type"]),
            action_comment=str(extra_payload["ticket_reason"]),
            operator_name="system",
        )
        return self.get_terror_alert(str(row["id"]))

    def save_review(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        with self._connection() as conn:
            result = conn.execute(
                """
                UPDATE terror_alert_reviews
                SET review_status = %(review_status)s,
                    reviewer_name = %(reviewer_name)s,
                    review_result = %(review_result)s,
                    review_comment = %(review_comment)s,
                    reviewed_at = now(),
                    updated_by = 'api'
                WHERE alert_id = %(alert_id)s::uuid
                  AND assignment_status = 'assigned'
                RETURNING alert_id
                """,
                {**payload, "alert_id": alert_id},
            ).fetchone()
            if result:
                conn.execute(
                    """
                    UPDATE terror_alerts
                    SET review_status = %(review_status)s
                    WHERE id = %(alert_id)s::uuid
                    """,
                    {**payload, "alert_id": alert_id},
                )
            conn.commit()
        if not result:
            return None
        self._append_flow_log(
            alert_id,
            action_type="review",
            action_result=str(payload.get("review_status", "pending")),
            action_comment=str(payload.get("review_comment", "")),
            operator_name=str(payload.get("reviewer_name", "")),
        )
        return self.get_terror_alert(alert_id)

    def save_feedback(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        current = self.get_terror_alert(alert_id)
        if current is None:
            return None
        feedback = {
            "feedback_status": str(payload.get("feedback_status", "submitted")),
            "feedback_result": str(payload.get("feedback_result", "")),
            "feedback_comment": str(payload.get("feedback_comment", "")),
            "operator_name": str(payload.get("operator_name", "")),
            "feedback_at": "now",
        }
        self._update_ticket_payload(alert_id, {"feedback": feedback, "feedback_status": feedback["feedback_status"]})
        self._append_flow_log(
            alert_id,
            action_type="feedback",
            action_result=feedback["feedback_status"],
            action_comment=feedback["feedback_comment"],
            operator_name=feedback["operator_name"],
        )
        return self.get_terror_alert(alert_id)

    def save_recheck(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        current = self.get_terror_alert(alert_id)
        if current is None:
            return None
        recheck = {
            "recheck_status": str(payload.get("recheck_status", "pending")),
            "recheck_result": str(payload.get("recheck_result", "")),
            "recheck_comment": str(payload.get("recheck_comment", "")),
            "operator_name": str(payload.get("operator_name", "")),
            "rechecked_at": "now",
        }
        self._update_ticket_payload(alert_id, {"recheck": recheck, "recheck_status": recheck["recheck_status"]})
        self._append_flow_log(
            alert_id,
            action_type="recheck",
            action_result=recheck["recheck_status"],
            action_comment=recheck["recheck_comment"],
            operator_name=recheck["operator_name"],
        )
        return self.get_terror_alert(alert_id)

    def save_ack(self, alert_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        current = self.get_terror_alert(alert_id)
        if current is None:
            return None
        ack_records = list(current.get("ack_records", []))
        ack_record = {
            "ack_status": "read",
            "operator_name": str(payload.get("operator_name", "")),
            "ack_comment": str(payload.get("ack_comment", "")),
            "ack_at": "now",
        }
        ack_records.append(ack_record)
        self._update_ticket_payload(alert_id, {"ack_records": ack_records})
        self._append_flow_log(
            alert_id,
            action_type="ack",
            action_result="read",
            action_comment=ack_record["ack_comment"],
            operator_name=ack_record["operator_name"],
        )
        return self.get_terror_alert(alert_id)

    def _update_ticket_payload(self, alert_id: str, updates: dict[str, object]) -> None:
        with self._connection() as conn:
            row = conn.execute(
                "SELECT extra_payload FROM terror_alerts WHERE id = %s::uuid",
                (alert_id,),
            ).fetchone()
            if not row:
                return
            payload = self._ensure_ticket_payload(self._json_to_object(row["extra_payload"]))
            payload.update(updates)
            conn.execute(
                """
                UPDATE terror_alerts
                SET extra_payload = %s::jsonb
                WHERE id = %s::uuid
                """,
                (json.dumps(payload), alert_id),
            )
            conn.commit()

    def _append_flow_log(
        self,
        alert_id: str,
        *,
        action_type: str,
        action_result: str,
        action_comment: str = "",
        operator_name: str = "",
    ) -> None:
        with self._connection() as conn:
            row = conn.execute(
                "SELECT extra_payload FROM terror_alerts WHERE id = %s::uuid",
                (alert_id,),
            ).fetchone()
            if not row:
                return
            payload = self._ensure_ticket_payload(self._json_to_object(row["extra_payload"]))
            flow_logs = list(payload.get("flow_logs", []))
            flow_logs.append(
                {
                    "action_type": action_type,
                    "action_result": action_result,
                    "action_comment": action_comment,
                    "operator_name": operator_name,
                    "created_at": "now",
                }
            )
            payload["flow_logs"] = flow_logs
            conn.execute(
                "UPDATE terror_alerts SET extra_payload = %s::jsonb WHERE id = %s::uuid",
                (json.dumps(payload), alert_id),
            )
            conn.commit()

    def get_terror_risk_topic(self) -> dict[str, object]:
        alerts_payload = self.list_terror_alerts()["items"]
        with self._connection() as conn:
            latest_job = conn.execute(
                """
                SELECT job_no, job_status, transaction_count, matched_count, high_risk_count,
                       warning_count, started_at, finished_at, input_snapshot_at
                FROM terror_detection_jobs
                ORDER BY created_at DESC
                LIMIT 1
                """
            ).fetchone()
        amounts = sum(float(item["matched_amount"].replace("万元", "")) for item in alerts_payload)
        top_entities: dict[str, dict[str, object]] = {}
        top_accounts: dict[str, dict[str, object]] = {}
        trend: dict[str, int] = {}
        for item in alerts_payload:
            trend[item["transaction_date"]] = trend.get(item["transaction_date"], 0) + 1
            for bucket, key in ((top_entities, item["member_unit_name"]), (top_accounts, item["payee_name"])):
                row = bucket.setdefault(key, {"name": key, "count": 0, "amount": 0.0, "risk_level": item["risk_level"]})
                row["count"] += 1
                row["amount"] += float(item["matched_amount"].replace("万元", ""))
                if item["risk_level"] == "high":
                    row["risk_level"] = "high"
        def _ranking(data):
            return [
                {
                    "name": row["name"],
                    "count": row["count"],
                    "amount": f"{row['amount']:.2f}万元",
                    "risk_level": row["risk_level"],
                }
                for row in sorted(data.values(), key=lambda x: (-x["count"], -x["amount"]))[:5]
            ]
        return {
            "page_title": "涉恐交易风险",
            "snapshot_date": SNAPSHOT_DATE,
            "kpis": {
                "alert_count": str(len(alerts_payload)),
                "high_risk_count": str(sum(1 for item in alerts_payload if item["risk_level"] == "high")),
                "involved_units": str(len({item["member_unit_name"] for item in alerts_payload})),
                "involved_amount": f"{amounts:.2f}万元",
                "blacklist_hit_count": str(sum(1 for item in alerts_payload if item["rule_code"] == "blacklist_hit")),
            },
            "trend": [{"date": key, "value": trend[key]} for key in sorted(trend)],
            "top_entities": _ranking(top_entities),
            "top_accounts": _ranking(top_accounts),
            "typical_cases": [
                {
                    "id": item["id"],
                    "title": {
                        "blacklist_hit": "黑名单直接命中",
                        "high_frequency_high_amount": "高频大额交易",
                        "dormant_account_abnormal_payment": "长期闲置账户异常交易",
                    }.get(item["rule_code"], item["rule_name"]),
                    "summary": item["alert_summary"],
                    "risk_level": item["risk_level"],
                    "alert_no": item["alert_no"],
                }
                for item in select_typical_case_alerts(alerts_payload)
            ],
            "latest_job": {
                "job_no": latest_job["job_no"] if latest_job else None,
                "job_status": latest_job["job_status"] if latest_job else "idle",
                "transaction_count": latest_job["transaction_count"] if latest_job else 0,
                "matched_count": latest_job["matched_count"] if latest_job else 0,
                "high_risk_count": latest_job["high_risk_count"] if latest_job else 0,
                "warning_count": latest_job["warning_count"] if latest_job else 0,
                "started_at": latest_job["started_at"].isoformat() if latest_job and latest_job["started_at"] else None,
                "finished_at": latest_job["finished_at"].isoformat() if latest_job and latest_job["finished_at"] else None,
                "input_snapshot_at": latest_job["input_snapshot_at"].isoformat() if latest_job and latest_job["input_snapshot_at"] else None,
            },
        }

    def _refresh_summary_from_alerts(self, conn, alerts: list[dict[str, object]], latest_job: dict[str, object]) -> None:
        alert_count = len(alerts)
        high_risk_count = sum(1 for alert in alerts if alert["risk_level"] == "high")
        blacklist_hit_count = sum(1 for alert in alerts if alert["rule_code"] == "blacklist_hit")
        risk_level = "high" if high_risk_count else "low"
        risk_conclusion = (
            "海发产城与海发园区相关对公支付中出现黑名单命中与连续高频支付，建议优先核查园区配套、工程分包和影视文化服务对手方。"
            if alert_count
            else "当前未识别到涉恐交易风险，系统可继续使用最新交易数据执行更新计算。"
        )
        input_snapshot_at = latest_job.get("input_snapshot_at") or f"{SNAPSHOT_DATE}T09:00:00+08:00"
        snapshot_date = str(input_snapshot_at).split("T", 1)[0]
        core_metrics = [
            {"label": "预警总数", "value": alert_count, "unit": "笔"},
            {"label": "高风险命中", "value": high_risk_count, "unit": "笔"},
            {"label": "命中黑名单", "value": blacklist_hit_count, "unit": "笔"},
        ]
        conn.execute(
            """
            UPDATE fund_safety_topic_summaries
            SET core_metrics = %s::jsonb,
                risk_conclusion = %s,
                risk_level = %s,
                data_snapshot_date = %s::date,
                updated_at = now()
            WHERE topic_code = 'fund_safety_terror_risk'
            """,
            (json.dumps(core_metrics), risk_conclusion, risk_level, snapshot_date),
        )

    @staticmethod
    def _json_to_object(value: object) -> dict[str, object]:
        if isinstance(value, dict):
            return value
        if isinstance(value, str):
            try:
                decoded = json.loads(value)
            except json.JSONDecodeError:
                return {}
            return decoded if isinstance(decoded, dict) else {}
        return {}

    @staticmethod
    def _core_metrics_to_dict(core_metrics: object) -> dict[str, str]:
        if isinstance(core_metrics, dict):
            return {str(key): str(value) for key, value in core_metrics.items()}
        if isinstance(core_metrics, list):
            result = {}
            for item in core_metrics:
                if isinstance(item, dict) and "label" in item and "value" in item:
                    unit = str(item.get("unit") or "")
                    value = str(item["value"])
                    result[str(item["label"])] = f"{value}{unit}" if unit else value
            return result
        return {}
