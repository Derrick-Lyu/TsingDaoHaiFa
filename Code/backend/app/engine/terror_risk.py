from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from uuid import uuid4

CASE_DOMAIN_ORDER = (
    "blacklist_screening",
    "behavioral_frequency",
    "account_anomaly",
)

RULE_CASE_DOMAINS = {
    "blacklist_hit": "blacklist_screening",
    "high_frequency_high_amount": "behavioral_frequency",
    "dormant_account_abnormal_payment": "account_anomaly",
}

RISK_LEVEL_PRIORITY = {
    "high": 0,
    "warn": 1,
    "low": 2,
}


def detect_terror_risk_alerts(
    *,
    transactions: list[dict[str, object]],
    rules: list[dict[str, object]],
    blacklist: list[dict[str, object]],
    snapshot_date: str,
) -> tuple[list[dict[str, object]], dict[str, object]]:
    enabled_rules = {
        rule["ruleCode"]: rule
        for rule in rules
        if rule.get("enabled") and str(rule.get("ruleCategory", "terror_risk")) == "terror_risk"
    }
    _validate_case_domain_mapping(enabled_rules)

    alerts: list[dict[str, object]] = []

    if "blacklist_hit" in enabled_rules:
        alerts.extend(_detect_blacklist_hits(transactions, blacklist))

    if "high_frequency_high_amount" in enabled_rules:
        alerts.extend(_detect_high_frequency(transactions, enabled_rules["high_frequency_high_amount"]))

    if "dormant_account_abnormal_payment" in enabled_rules:
        alerts.extend(_detect_dormant_account(transactions, enabled_rules["dormant_account_abnormal_payment"]))

    alerts.sort(key=lambda item: (_alert_sort_key(item)[0], item["transaction_date"], item["alert_no"]))
    now = datetime.now()
    latest_job = {
        "job_no": f"JOB-{snapshot_date.replace('-', '')}-{now.strftime('%H%M%S')}",
        "job_status": "succeeded",
        "transaction_count": len(transactions),
        "matched_count": len(alerts),
        "high_risk_count": sum(1 for alert in alerts if alert["risk_level"] == "high"),
        "warning_count": sum(1 for alert in alerts if alert["risk_level"] == "warn"),
        "started_at": now.isoformat(timespec="seconds"),
        "finished_at": now.isoformat(timespec="seconds"),
        "input_snapshot_at": f"{snapshot_date}T09:00:00+08:00",
    }
    return alerts, latest_job


def select_typical_case_alerts(alerts: list[dict[str, object]]) -> list[dict[str, object]]:
    grouped: dict[str, list[dict[str, object]]] = defaultdict(list)
    for alert in alerts:
        domain = RULE_CASE_DOMAINS.get(str(alert["rule_code"]))
        if not domain:
            continue
        grouped[domain].append(alert)

    typical_cases: list[dict[str, object]] = []
    for domain in CASE_DOMAIN_ORDER:
        candidates = grouped.get(domain)
        if not candidates:
            continue
        typical_cases.append(sorted(candidates, key=_alert_sort_key)[0])
    return typical_cases


def _validate_case_domain_mapping(enabled_rules: dict[str, dict[str, object]]) -> None:
    missing = [rule_code for rule_code in enabled_rules if rule_code not in RULE_CASE_DOMAINS]
    if missing:
        raise ValueError(f"Missing case domain mapping for enabled rule(s): {', '.join(sorted(missing))}")


def _params(rule: dict[str, object]) -> dict[str, str]:
    return {item["paramKey"]: item["paramValue"] for item in rule.get("params", [])}


def _format_amount_yuan(amount: float) -> str:
    return f"{amount / 10000:.2f}万元"


def _matched_amount_value(alert: dict[str, object]) -> float:
    if "matched_amount_value" in alert:
        return float(alert["matched_amount_value"])
    matched_amount = str(alert.get("matched_amount", "0")).replace("万元", "")
    return float(matched_amount) * 10000


def _alert_sort_key(alert: dict[str, object]) -> tuple[object, ...]:
    transaction_date = str(alert.get("transaction_date") or "")
    try:
        transaction_ordinal = date.fromisoformat(transaction_date).toordinal()
    except ValueError:
        transaction_ordinal = 0
    return (
        RISK_LEVEL_PRIORITY.get(str(alert.get("risk_level")), 99),
        -int(alert.get("matched_count", 0)),
        -_matched_amount_value(alert),
        -transaction_ordinal,
        str(alert.get("alert_no", "")),
    )


def _make_alert(
    *,
    rule_code: str,
    rule_name: str,
    risk_level: str,
    member_unit_code: str,
    member_unit_name: str,
    payer_name: str,
    payer_account: str,
    payee_name: str,
    payee_account: str,
    transaction_date: str,
    matched_amount_value: float,
    matched_count: int,
    alert_summary: str,
    evidences: list[dict[str, object]],
    related_transactions: list[dict[str, object]],
    latest_evidence_summary: str,
) -> dict[str, object]:
    alert_id = str(uuid4())
    alert_suffix = uuid4().hex[:12].upper()
    return {
        "id": alert_id,
        "alert_no": f"TA-{transaction_date.replace('-', '')}-{alert_suffix}",
        "rule_code": rule_code,
        "rule_name": rule_name,
        "risk_level": risk_level,
        "alert_status": "open",
        "review_status": "pending",
        "member_unit_code": member_unit_code,
        "member_unit_name": member_unit_name,
        "payer_name": payer_name,
        "payer_account": payer_account,
        "payee_name": payee_name,
        "payee_account": payee_account,
        "transaction_date": transaction_date,
        "matched_amount": _format_amount_yuan(matched_amount_value),
        "matched_amount_value": matched_amount_value,
        "matched_count": matched_count,
        "evidence_count": len(evidences),
        "latest_evidence_summary": latest_evidence_summary,
        "alert_summary": alert_summary,
        "evidences": evidences,
        "review": {
            "review_status": "pending",
            "reviewer_name": "",
            "review_result": "",
            "review_comment": "",
            "reviewed_at": None,
        },
        "related_transactions": related_transactions,
    }


def _normalize_related_transactions(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    return [
        {
            "transaction_no": row["transactionNo"],
            "transaction_date": row["transactionDate"],
            "amount": _format_amount_yuan(float(row["amount"]) * int(row.get("transactionCount", 1))),
            "payer_name": row["payerName"],
            "payee_name": row["payeeName"],
            "business_scenario": row["businessScenario"],
        }
        for row in rows
    ]


def _windowed_rows(
    rows: list[dict[str, object]],
    *,
    window_days: int,
    predicate,
) -> list[dict[str, object]]:
    qualified = [row for row in sorted(rows, key=lambda item: str(item["transactionDate"])) if predicate(row)]
    best_rows: list[dict[str, object]] = []
    left = 0
    for right in range(len(qualified)):
        right_date = date.fromisoformat(str(qualified[right]["transactionDate"]))
        while left <= right:
            left_date = date.fromisoformat(str(qualified[left]["transactionDate"]))
            if (right_date - left_date).days < window_days:
                break
            left += 1
        window = qualified[left:right + 1]
        if len(window) > len(best_rows):
            best_rows = window
    return best_rows


def _detect_blacklist_hits(
    transactions: list[dict[str, object]],
    blacklist: list[dict[str, object]],
) -> list[dict[str, object]]:
    grouped_matches: dict[
        tuple[str, str, str, str, str, str],
        dict[str, object],
    ] = {}
    for tx in transactions:
        tx_names = f"{tx['payerName']} {tx['payeeName']}"
        for item in blacklist:
            if item.get("status") != "enabled":
                continue
            keywords = item.get("matchKeywords") or [item["subjectName"]]
            matched_keyword = next((keyword for keyword in keywords if keyword in tx_names), None)
            if not matched_keyword:
                continue
            group_key = (
                str(tx["memberUnitCode"]),
                str(tx["memberUnitName"]),
                str(tx["payerName"]),
                str(tx["payerAccount"]),
                str(tx["payeeName"]),
                str(item["blacklistName"]),
            )
            grouped = grouped_matches.setdefault(
                group_key,
                {
                    "blacklist_name": str(item["blacklistName"]),
                    "matched_keywords": set(),
                    "risk_level": "high" if item.get("riskLevel") == "high" else "warn",
                    "rows": [],
                },
            )
            grouped["matched_keywords"].add(matched_keyword)
            if item.get("riskLevel") == "high":
                grouped["risk_level"] = "high"
            grouped["rows"].append(tx)
            break
    alerts: list[dict[str, object]] = []
    for (
        member_unit_code,
        member_unit_name,
        payer_name,
        payer_account,
        payee_name,
        blacklist_name,
    ), grouped in grouped_matches.items():
        rows = sorted(grouped["rows"], key=lambda row: str(row["transactionDate"]))
        latest_tx = rows[-1]
        total_amount = sum(float(row["amount"]) * int(row.get("transactionCount", 1)) for row in rows)
        matched_count = sum(int(row.get("transactionCount", 1)) for row in rows)
        keywords = sorted(grouped["matched_keywords"])
        evidences = [
            {
                "evidence_type": "blacklist_match",
                "evidence_title": "账户名称命中黑名单",
                "evidence_detail": f"交易对手名称命中黑名单：{blacklist_name}；关键字：{'、'.join(keywords)}。",
                "evidence_payload": {
                    "matched_keywords": keywords,
                    "blacklist_name": blacklist_name,
                },
                "evidence_order": 1,
            },
            {
                "evidence_type": "amount",
                "evidence_title": "关联交易汇总",
                "evidence_detail": f"关联交易 {len(rows)} 笔，累计金额 {_format_amount_yuan(total_amount)}。",
                "evidence_payload": {
                    "transaction_rows": len(rows),
                    "transaction_count": matched_count,
                    "amount": _format_amount_yuan(total_amount),
                },
                "evidence_order": 2,
            },
        ]
        alerts.append(
            _make_alert(
                rule_code="blacklist_hit",
                rule_name="黑名单命中规则",
                risk_level=str(grouped["risk_level"]),
                member_unit_code=member_unit_code,
                member_unit_name=member_unit_name,
                payer_name=payer_name,
                payer_account=payer_account,
                payee_name=payee_name,
                payee_account=str(latest_tx["payeeAccount"]),
                transaction_date=str(latest_tx["transactionDate"]),
                matched_amount_value=total_amount,
                matched_count=matched_count,
                alert_summary="付款账户或交易对手与黑名单关键字命中，系统按成员单位与对手方聚合生成风险预警。",
                evidences=evidences,
                related_transactions=_normalize_related_transactions(rows),
                latest_evidence_summary="账户名称命中黑名单并已聚合关联交易。",
            )
        )
    return alerts


def _detect_high_frequency(
    transactions: list[dict[str, object]],
    rule: dict[str, object],
) -> list[dict[str, object]]:
    params = _params(rule)
    window_days = int(params.get("window_days", "10"))
    min_daily_count = int(params.get("min_daily_count", "50"))
    corp_threshold = float(params.get("corp_amount_threshold", "2000000"))
    personal_threshold = float(params.get("personal_amount_threshold", "500000"))
    grouped: dict[tuple[str, str, str], list[dict[str, object]]] = defaultdict(list)
    for tx in transactions:
        grouped[(str(tx["memberUnitCode"]), str(tx["memberUnitName"]), str(tx["payeeName"]))].append(tx)

    alerts: list[dict[str, object]] = []
    for (_, member_unit_name, payee_name), rows in grouped.items():
        qualifying = _windowed_rows(
            rows,
            window_days=window_days,
            predicate=lambda row: int(row.get("transactionCount", 1)) > min_daily_count,
        )
        if not qualifying:
            continue
        threshold = corp_threshold if str(rows[0].get("payeeType", "organization")) == "organization" else personal_threshold
        total_amount = sum(float(row["amount"]) * int(row.get("transactionCount", 1)) for row in qualifying)
        if total_amount <= threshold:
            continue
        latest_tx = max(qualifying, key=lambda row: str(row["transactionDate"]))
        evidences = [
            {
                "evidence_type": "frequency",
                "evidence_title": "连续窗口高频交易",
                "evidence_detail": f"同一收款人在连续 {window_days} 日窗口内单日交易次数均超过 {min_daily_count} 次。",
                "evidence_payload": {
                    "window_days": window_days,
                    "days": len(qualifying),
                    "max_daily_count": max(int(row.get("transactionCount", 1)) for row in qualifying),
                },
                "evidence_order": 1,
            },
            {
                "evidence_type": "amount",
                "evidence_title": "累计金额超过阈值",
                "evidence_detail": f"窗口累计金额达到 {_format_amount_yuan(total_amount)}，超过阈值 {_format_amount_yuan(threshold)}。",
                "evidence_payload": {
                    "amount": _format_amount_yuan(total_amount),
                    "threshold": _format_amount_yuan(threshold),
                },
                "evidence_order": 2,
            },
        ]
        alerts.append(
            _make_alert(
                rule_code="high_frequency_high_amount",
                rule_name="高频大额交易规则",
                risk_level="high",
                member_unit_code=str(latest_tx["memberUnitCode"]),
                member_unit_name=member_unit_name,
                payer_name=str(latest_tx["payerName"]),
                payer_account=str(latest_tx["payerAccount"]),
                payee_name=payee_name,
                payee_account=str(latest_tx["payeeAccount"]),
                transaction_date=str(latest_tx["transactionDate"]),
                matched_amount_value=total_amount,
                matched_count=sum(int(row.get("transactionCount", 1)) for row in qualifying),
                alert_summary=f"连续 {window_days} 日内同一收款人单日交易次数超阈值，且累计金额超过限定标准。",
                evidences=evidences,
                related_transactions=_normalize_related_transactions(qualifying),
                latest_evidence_summary=f"连续 {window_days} 日窗口内同一收款人高频高额支付。",
            )
        )
    return alerts


def _detect_dormant_account(
    transactions: list[dict[str, object]],
    rule: dict[str, object],
) -> list[dict[str, object]]:
    params = _params(rule)
    dormant_days_threshold = int(params.get("dormant_days", "365"))
    window_days = int(params.get("window_days", "10"))
    corp_threshold = float(params.get("corp_amount_threshold", "2000000"))
    personal_threshold = float(params.get("personal_amount_threshold", "500000"))
    dormant_rows = [tx for tx in transactions if bool(tx.get("isDormantAccount")) and tx.get("accountLastActiveDate")]
    grouped: dict[tuple[str, str], list[dict[str, object]]] = defaultdict(list)
    for tx in dormant_rows:
        grouped[(str(tx["memberUnitCode"]), str(tx["payeeName"]))].append(tx)

    alerts: list[dict[str, object]] = []
    for (_, payee_name), rows in grouped.items():
        qualifying = _windowed_rows(
            rows,
            window_days=window_days,
            predicate=lambda row: (
                date.fromisoformat(str(row["transactionDate"])) -
                date.fromisoformat(str(row["accountLastActiveDate"]))
            ).days > dormant_days_threshold,
        )
        if not qualifying:
            continue
        threshold = corp_threshold if str(rows[0].get("payeeType", "organization")) == "organization" else personal_threshold
        total_amount = sum(float(row["amount"]) * int(row.get("transactionCount", 1)) for row in qualifying)
        if total_amount <= threshold:
            continue
        latest_tx = max(qualifying, key=lambda row: str(row["transactionDate"]))
        dormant_days = (
            date.fromisoformat(str(latest_tx["transactionDate"])) -
            date.fromisoformat(str(latest_tx["accountLastActiveDate"]))
        ).days
        evidences = [
            {
                "evidence_type": "dormant_account",
                "evidence_title": "长期闲置账户恢复交易",
                "evidence_detail": f"账户闲置 {dormant_days} 天后重新发生支付，满足超过 {dormant_days_threshold} 天条件。",
                "evidence_payload": {
                    "dormant_days": dormant_days,
                    "threshold_days": dormant_days_threshold,
                },
                "evidence_order": 1,
            },
            {
                "evidence_type": "amount",
                "evidence_title": "窗口累计金额超过阈值",
                "evidence_detail": f"连续 {window_days} 日窗口累计金额达到 {_format_amount_yuan(total_amount)}，超过阈值 {_format_amount_yuan(threshold)}。",
                "evidence_payload": {
                    "window_days": window_days,
                    "amount": _format_amount_yuan(total_amount),
                    "threshold": _format_amount_yuan(threshold),
                },
                "evidence_order": 2,
            },
        ]
        alerts.append(
            _make_alert(
                rule_code="dormant_account_abnormal_payment",
                rule_name="长期闲置账户异常交易规则",
                risk_level="warn",
                member_unit_code=str(latest_tx["memberUnitCode"]),
                member_unit_name=str(latest_tx["memberUnitName"]),
                payer_name=str(latest_tx["payerName"]),
                payer_account=str(latest_tx["payerAccount"]),
                payee_name=payee_name,
                payee_account=str(latest_tx["payeeAccount"]),
                transaction_date=str(latest_tx["transactionDate"]),
                matched_amount_value=total_amount,
                matched_count=sum(int(row.get("transactionCount", 1)) for row in qualifying),
                alert_summary=f"闲置超过 {dormant_days_threshold} 天账户重新发生交易，且连续 {window_days} 日内金额达到阈值。",
                evidences=evidences,
                related_transactions=_normalize_related_transactions(qualifying),
                latest_evidence_summary=f"长期闲置账户在连续 {window_days} 日窗口内恢复异常支付。",
            )
        )
    return alerts
