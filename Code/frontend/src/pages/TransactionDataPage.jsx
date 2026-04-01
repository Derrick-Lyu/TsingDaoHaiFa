import { useEffect, useState } from "react";

import { requestJson } from "../api/client";
import { SummaryMetricValue } from "../components/shared/SummaryMetricValue";

const API_PATH = "/terror-risk/transactions";

const INITIAL_FORM = {
  id: "",
  transactionNo: "",
  transactionDate: "",
  batchNo: "",
  memberUnitCode: "",
  memberUnitName: "",
  payerName: "",
  payerAccount: "",
  payeeName: "",
  payeeAccount: "",
  amount: "",
  currency: "CNY",
  payeeType: "organization",
  businessScenario: "",
  transactionCount: 1,
  accountLastActiveDate: "",
  isDormantAccount: false,
  sourceFileName: "",
  sourceRowNo: "",
  remarks: "",
};

function makeId(prefix) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeTransaction(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.id ?? makeId("transaction"),
    transactionNo: item.transactionNo ?? item.transaction_no ?? "",
    transactionDate: item.transactionDate ?? item.transaction_date ?? "",
    batchNo: item.batchNo ?? item.batch_no ?? "",
    memberUnitCode: item.memberUnitCode ?? item.member_unit_code ?? "",
    memberUnitName: item.memberUnitName ?? item.member_unit_name ?? "",
    payerName: item.payerName ?? item.payer_name ?? "",
    payerAccount: item.payerAccount ?? item.payer_account ?? "",
    payeeName: item.payeeName ?? item.payee_name ?? "",
    payeeAccount: item.payeeAccount ?? item.payee_account ?? "",
    amount: Number(item.amount ?? item.amount_yuan ?? 0),
    currency: item.currency ?? "CNY",
    payeeType: item.payeeType ?? item.payee_type ?? "organization",
    businessScenario: item.businessScenario ?? item.business_scenario ?? "",
    transactionCount: Number(item.transactionCount ?? item.transaction_count ?? 1),
    accountLastActiveDate: item.accountLastActiveDate ?? item.account_last_active_date ?? "",
    isDormantAccount:
      typeof (item.isDormantAccount ?? item.is_dormant_account) === "boolean"
        ? item.isDormantAccount ?? item.is_dormant_account
        : String(item.isDormantAccount ?? item.is_dormant_account ?? "false") === "true",
    sourceFileName: item.sourceFileName ?? item.source_file_name ?? "",
    sourceRowNo: item.sourceRowNo ?? item.source_row_no ?? "",
    remarks: item.remarks ?? item.extra_payload?.remarks ?? "",
  };
}

function buildForm(item) {
  return {
    ...INITIAL_FORM,
    ...(item
      ? {
          id: item.id ?? "",
          transactionNo: item.transactionNo ?? "",
          transactionDate: item.transactionDate ?? "",
          batchNo: item.batchNo ?? "",
          memberUnitCode: item.memberUnitCode ?? "",
          memberUnitName: item.memberUnitName ?? "",
          payerName: item.payerName ?? "",
          payerAccount: item.payerAccount ?? "",
          payeeName: item.payeeName ?? "",
          payeeAccount: item.payeeAccount ?? "",
          amount: item.amount ?? "",
          currency: item.currency ?? "CNY",
          payeeType: item.payeeType ?? "organization",
          businessScenario: item.businessScenario ?? "",
          transactionCount: item.transactionCount ?? 1,
          accountLastActiveDate: item.accountLastActiveDate ?? "",
          isDormantAccount: item.isDormantAccount ?? false,
          sourceFileName: item.sourceFileName ?? "",
          sourceRowNo: item.sourceRowNo ?? "",
          remarks: item.remarks ?? "",
        }
      : {}),
  };
}

function serializeForm(form) {
  return {
    transactionNo: form.transactionNo.trim(),
    transactionDate: form.transactionDate || null,
    batchNo: form.batchNo.trim(),
    memberUnitCode: form.memberUnitCode.trim(),
    memberUnitName: form.memberUnitName.trim(),
    payerName: form.payerName.trim(),
    payerAccount: form.payerAccount.trim(),
    payeeName: form.payeeName.trim(),
    payeeAccount: form.payeeAccount.trim(),
    amount: Number(form.amount || 0),
    currency: form.currency,
    payeeType: form.payeeType,
    businessScenario: form.businessScenario.trim(),
    transactionCount: Number(form.transactionCount || 1),
    accountLastActiveDate: form.accountLastActiveDate || null,
    isDormantAccount: form.isDormantAccount,
    sourceFileName: form.sourceFileName.trim(),
    sourceRowNo: form.sourceRowNo === "" ? null : Number(form.sourceRowNo),
    extraPayload: {
      remarks: form.remarks.trim(),
    },
  };
}

function formatAmount(amount) {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function useCompactLayout(maxWidth = 960) {
  const [compact, setCompact] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth <= maxWidth;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const handleChange = (event) => setCompact(event.matches);

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [maxWidth]);

  return compact;
}

function inputStyle() {
  return {
    border: "1px solid #d7e0ea",
    borderRadius: 12,
    padding: "11px 14px",
    font: "inherit",
    color: "#111827",
    background: "#fbfcfe",
    width: "100%",
    boxSizing: "border-box",
  };
}

function surfaceStyle() {
  return {
    background: "white",
    borderRadius: 18,
    border: "1px solid #edf1f7",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
  };
}

function chipStyle(tone) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    background: tone.background,
    color: tone.color,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
}

function smallLabelStyle() {
  return {
    fontSize: 12,
    color: "#5b6472",
    fontWeight: 700,
    marginBottom: 6,
  };
}

function toneForType(payeeType) {
  if (payeeType === "person") {
    return { background: "#fff4e5", color: "#b45309" };
  }
  if (payeeType === "account") {
    return { background: "#eef4ff", color: "#1a3a8f" };
  }
  return { background: "#e8f5ef", color: "#0f7a3e" };
}

function toneForDormant(isDormantAccount) {
  if (isDormantAccount) {
    return { background: "#fdecec", color: "#c03838" };
  }
  return { background: "#e8f5ef", color: "#0f7a3e" };
}

function buttonStyle(variant = "ghost") {
  const style = {
    borderRadius: 12,
    padding: "10px 14px",
    font: "inherit",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    border: "1px solid transparent",
  };

  if (variant === "primary") {
    style.background = "#1a3a8f";
    style.color = "white";
    style.boxShadow = "0 8px 18px rgba(26,58,143,0.18)";
  } else if (variant === "secondary") {
    style.background = "#eef4ff";
    style.color = "#1a3a8f";
    style.borderColor = "#d8e6ff";
  } else if (variant === "danger") {
    style.background = "#fff5f5";
    style.color = "#b42318";
    style.borderColor = "#ffd5d5";
  } else {
    style.background = "white";
    style.color = "#334155";
    style.borderColor = "#d8e1ee";
  }

  return style;
}

export function TransactionDataPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [payeeTypeFilter, setPayeeTypeFilter] = useState("all");
  const [dormantFilter, setDormantFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(items[0]?.id || "");
  const [draft, setDraft] = useState(buildForm(items[0]));
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const compact = useCompactLayout();

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      setLoading(true);
      setErrorMessage("");
      try {
        const data = await requestJson(API_PATH);
        const nextItems = (Array.isArray(data) ? data : [])
          .map(normalizeTransaction)
          .filter(Boolean);

        if (!cancelled) {
          setItems(nextItems);
          setSelectedId(nextItems[0]?.id || "");
          setDraft(buildForm(nextItems[0] || null));
          setCreating(false);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setSelectedId("");
          setDraft(buildForm(null));
          setCreating(false);
          setErrorMessage("交易数据加载失败，当前未显示演示兜底数据。");
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      [item.transactionNo, item.memberUnitName, item.payeeName, item.businessScenario, item.batchNo]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
    const matchesPayeeType = payeeTypeFilter === "all" || item.payeeType === payeeTypeFilter;
    const matchesDormant =
      dormantFilter === "all" ||
      (dormantFilter === "yes" ? item.isDormantAccount : !item.isDormantAccount);

    return matchesSearch && matchesPayeeType && matchesDormant;
  });

  const summary = {
    total: items.length,
    totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
    dormantCount: items.filter((item) => item.isDormantAccount).length,
    counterparties: new Set(items.map((item) => item.payeeName).filter(Boolean)).size,
  };

  const selectedItem = items.find((item) => item.id === selectedId) || items[0] || null;

  function updateForm(field, value) {
    setErrorMessage("");
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function selectItem(item) {
    setErrorMessage("");
    setSelectedId(item.id);
    setDraft(buildForm(item));
    setCreating(false);
  }

  function openCreate() {
    setErrorMessage("");
    setSelectedId("");
    setDraft({ ...INITIAL_FORM });
    setCreating(true);
  }

  function cancelDraft() {
    setErrorMessage("");
    if (selectedItem) {
      setSelectedId(selectedItem.id);
      setDraft(buildForm(selectedItem));
      setCreating(false);
      return;
    }

    const first = items[0];
    if (first) {
      setSelectedId(first.id);
      setDraft(buildForm(first));
      setCreating(false);
    }
  }

  async function refreshTransactions() {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await requestJson(API_PATH);
      const nextItems = (Array.isArray(data) ? data : []).map(normalizeTransaction).filter(Boolean);
      setItems(nextItems);
      setSelectedId(nextItems[0]?.id || "");
      setDraft(buildForm(nextItems[0] || null));
      setCreating(false);
    } catch {
      setItems([]);
      setSelectedId("");
      setDraft(buildForm(null));
      setCreating(false);
      setErrorMessage("交易数据刷新失败，当前未显示演示兜底数据。");
    } finally {
      setLoading(false);
    }
  }

  async function saveTransaction(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const payload = serializeForm(draft);
      const endpoint = draft.id ? `${API_PATH}/${draft.id}` : API_PATH;
      const method = draft.id ? "PUT" : "POST";

      const saved = await requestJson(endpoint, {
        method,
        body: payload,
      });

      const normalized = normalizeTransaction(saved);
      setItems((current) => {
        const exists = current.some((item) => item.id === normalized.id);
        if (exists) {
          return current.map((item) => (item.id === normalized.id ? normalized : item));
        }
        return [normalized, ...current];
      });
      setSelectedId(normalized.id);
      setDraft(buildForm(normalized));
      setCreating(false);
    } catch {
      setErrorMessage("交易保存失败，数据库未更新，请稍后重试。");
    } finally {
      setSaving(false);
    }
  }

  async function removeTransaction(item) {
    const confirmed = window.confirm(`确认删除交易流水「${item.transactionNo}」？`);
    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    try {
      await requestJson(`${API_PATH}/${item.id}`, {
        method: "DELETE",
      });

      setItems((current) => current.filter((row) => row.id !== item.id));
      setSelectedId((current) => {
        if (current !== item.id) {
          return current;
        }
        return items.find((row) => row.id !== item.id)?.id || "";
      });

      const nextSelected = items.find((row) => row.id !== item.id);
      setDraft(buildForm(nextSelected || null));
      setCreating(false);
    } catch {
      setErrorMessage("交易删除失败，数据库未更新。");
    }
  }

  return (
    <div style={{ padding: "0 24px 24px", background: "linear-gradient(180deg, #f8fafc 0%, #f5f7fa 100%)" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <button type="button" onClick={openCreate} style={buttonStyle("primary")}>新增样例记录</button>
        <button type="button" onClick={refreshTransactions} style={buttonStyle("ghost")}>刷新数据</button>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
        {[
          { label: "交易记录", value: summary.total, tone: { background: "#eef4ff", color: "#1a3a8f" } },
          { label: "总金额", value: `${formatAmount(summary.totalAmount)} 元`, tone: { background: "#e8f5ef", color: "#0f7a3e" } },
          { label: "闲置账户", value: summary.dormantCount, tone: { background: "#fdecec", color: "#c03838" } },
          { label: "主要对手方", value: summary.counterparties, tone: { background: "#f3f4f6", color: "#374151" } },
        ].map((metric) => (
          <div key={metric.label} style={{ ...surfaceStyle(), padding: 16 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{metric.label}</div>
            <div style={summaryMetricValueStyle(metric.tone)}>
              <SummaryMetricValue value={metric.value} color={metric.tone.color} primaryFontSize={30} unitFontSize={13} />
            </div>
          </div>
        ))}
      </section>

      <section style={{ ...surfaceStyle(), padding: 18, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={smallLabelStyle()}>搜索</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="按交易编号、成员单位、对手方或场景搜索"
              style={inputStyle()}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={smallLabelStyle()}>对手类型</span>
            <select value={payeeTypeFilter} onChange={(event) => setPayeeTypeFilter(event.target.value)} style={inputStyle()}>
              <option value="all">全部</option>
              <option value="organization">对公</option>
              <option value="person">对私</option>
              <option value="account">账户</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={smallLabelStyle()}>闲置账户</span>
            <select value={dormantFilter} onChange={(event) => setDormantFilter(event.target.value)} style={inputStyle()}>
              <option value="all">全部</option>
              <option value="yes">是</option>
              <option value="no">否</option>
            </select>
          </label>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0, 1fr)" : "minmax(0, 1.08fr) minmax(360px, 0.92fr)", gap: 16, alignItems: "start" }}>
        <div style={{ ...surfaceStyle(), overflow: "hidden" }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #eef2f7" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>交易列表</div>
            <div style={{ fontSize: 12, color: "#667085", marginTop: 4 }}>
              {loading ? "正在加载..." : `共 ${filteredItems.length} 条结果`}
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, padding: 16, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            {filteredItems.map((item) => {
              const selected = item.id === selectedId;
              return (
                <div
                  key={item.id}
                  onClick={() => selectItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectItem(item);
                    }
                  }}
                  style={{
                    textAlign: "left",
                    border: `1px solid ${selected ? "#b6cbff" : "#e7edf5"}`,
                    borderRadius: 18,
                    padding: 16,
                    background: selected ? "#f8fbff" : "#fbfdff",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", lineHeight: 1.35 }}>{item.transactionNo}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "#667085" }}>
                        {item.transactionDate} · {item.memberUnitName}
                      </div>
                    </div>
                    <span style={chipStyle(toneForType(item.payeeType))}>{item.payeeType === "person" ? "对私" : item.payeeType === "account" ? "账户" : "对公"}</span>
                  </div>

                  <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900, color: "#b42318" }}>
                    {formatAmount(item.amount)} 元
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    <span style={chipStyle(toneForDormant(item.isDormantAccount))}>{item.isDormantAccount ? "闲置" : "正常"}</span>
                    <span style={chipStyle({ background: "#f3f4f6", color: "#374151" })}>批次 {item.batchNo || "-"}</span>
                    <span style={chipStyle({ background: "#eef4ff", color: "#1a3a8f" })}>次数 {item.transactionCount}</span>
                  </div>

                  <div style={{ marginTop: 12, fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                    <div>对手方：{item.payeeName}</div>
                    <div style={{ marginTop: 6 }}>场景：{item.businessScenario}</div>
                    <div style={{ marginTop: 6 }}>备注：{item.remarks || "-"}</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                    <button type="button" onClick={(event) => { event.stopPropagation(); selectItem(item); }} style={buttonStyle("ghost")}>编辑</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); removeTransaction(item); }} style={buttonStyle("danger")}>删除</button>
                  </div>
                </div>
              );
            })}

            {!filteredItems.length ? (
              <div style={{ padding: "24px 8px", textAlign: "center", color: "#8a93a3" }}>
                没有匹配的交易数据
              </div>
            ) : null}
          </div>
        </div>

        <form onSubmit={saveTransaction} style={{ ...surfaceStyle(), padding: 20, position: "sticky", top: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, color: "#1a3a8f", fontWeight: 700 }}>
                {creating ? "新增样例记录" : "当前样例记录"}
              </div>
              <h3 style={{ margin: "6px 0 0", fontSize: 24, color: "#111827" }}>
                {draft.transactionNo || "请选择交易"}
              </h3>
              <div style={{ marginTop: 8, fontSize: 12, color: "#667085" }}>
                {draft.transactionDate || "-"} · {draft.memberUnitName || "-"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={cancelDraft} style={buttonStyle("ghost")}>取消</button>
              <button type="submit" style={buttonStyle("primary")}>{saving ? "保存中..." : "保存变更"}</button>
            </div>
          </div>

          {errorMessage ? <div style={errorBannerStyle}>{errorMessage}</div> : null}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
            <Field label="交易编号">
              <input value={draft.transactionNo} onChange={(event) => updateForm("transactionNo", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="交易日期">
              <input type="date" value={draft.transactionDate} onChange={(event) => updateForm("transactionDate", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="数据批次">
              <input value={draft.batchNo} onChange={(event) => updateForm("batchNo", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="成员单位名称">
              <input value={draft.memberUnitName} onChange={(event) => updateForm("memberUnitName", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="付款方名称">
              <input value={draft.payerName} onChange={(event) => updateForm("payerName", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="付款方账号">
              <input value={draft.payerAccount} onChange={(event) => updateForm("payerAccount", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="收款方名称">
              <input value={draft.payeeName} onChange={(event) => updateForm("payeeName", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="收款方账号">
              <input value={draft.payeeAccount} onChange={(event) => updateForm("payeeAccount", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="金额">
              <input type="number" value={draft.amount} onChange={(event) => updateForm("amount", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="币种">
              <select value={draft.currency} onChange={(event) => updateForm("currency", event.target.value)} style={inputStyle()}>
                <option value="CNY">CNY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </Field>
            <Field label="对手类型">
              <select value={draft.payeeType} onChange={(event) => updateForm("payeeType", event.target.value)} style={inputStyle()}>
                <option value="organization">对公</option>
                <option value="person">对私</option>
                <option value="account">账户</option>
              </select>
            </Field>
            <Field label="交易次数">
              <input type="number" value={draft.transactionCount} onChange={(event) => updateForm("transactionCount", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="账户最近活跃日期">
              <input type="date" value={draft.accountLastActiveDate} onChange={(event) => updateForm("accountLastActiveDate", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="闲置账户">
              <select value={draft.isDormantAccount ? "true" : "false"} onChange={(event) => updateForm("isDormantAccount", event.target.value === "true")} style={inputStyle()}>
                <option value="false">否</option>
                <option value="true">是</option>
              </select>
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="业务场景">
                <input value={draft.businessScenario} onChange={(event) => updateForm("businessScenario", event.target.value)} style={inputStyle()} />
              </Field>
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 16, border: "1px solid #e9eef5", padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937", marginBottom: 14 }}>辅助信息</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <Field label="来源文件">
                <input value={draft.sourceFileName} onChange={(event) => updateForm("sourceFileName", event.target.value)} style={inputStyle()} />
              </Field>
              <Field label="来源行号">
                <input type="number" value={draft.sourceRowNo} onChange={(event) => updateForm("sourceRowNo", event.target.value)} style={inputStyle()} />
              </Field>
            </div>
          </div>

          <Field label="备注">
            <textarea value={draft.remarks} onChange={(event) => updateForm("remarks", event.target.value)} rows={4} style={{ ...inputStyle(), resize: "vertical" }} />
          </Field>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={smallLabelStyle()}>{label}</span>
      {children}
    </label>
  );
}

function summaryMetricValueStyle(tone) {
  return {
    display: "flex",
    alignItems: "stretch",
    minHeight: 74,
    padding: "10px 12px",
    borderRadius: 16,
    background: tone.background,
  };
}

const errorBannerStyle = {
  marginBottom: 16,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #ffd5d5",
  background: "#fff5f5",
  color: "#b42318",
  fontSize: 13,
  fontWeight: 700,
};
