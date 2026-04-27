import { useEffect, useState } from "react";

import { requestJson } from "../api/client";
import { applyTerrorRiskChanges } from "../api/terrorRisk";
import { SummaryMetricValue } from "../components/shared/SummaryMetricValue";

const API_PATH = "/terror-risk/blacklist";

const EMPTY_FORM = {
  id: "",
  blacklistCode: "",
  blacklistName: "",
  subjectName: "",
  subjectType: "organization",
  matchKeywords: "",
  riskLevel: "high",
  status: "enabled",
  sourceSystem: "",
  effectiveFrom: "",
  effectiveTo: "",
  notes: "",
};

function makeId(prefix) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeBlacklistItem(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.id ?? makeId("blacklist"),
    blacklistCode: item.blacklistCode ?? item.blacklist_code ?? "",
    blacklistName: item.blacklistName ?? item.blacklist_name ?? "",
    subjectName: item.subjectName ?? item.subject_name ?? "",
    subjectType: item.subjectType ?? item.subject_type ?? "organization",
    matchKeywords: Array.isArray(item.matchKeywords ?? item.match_keywords)
      ? item.matchKeywords ?? item.match_keywords
      : typeof (item.matchKeywords ?? item.match_keywords) === "string"
        ? (item.matchKeywords ?? item.match_keywords)
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean)
        : [],
    riskLevel: item.riskLevel ?? item.risk_level ?? "high",
    status: item.status ?? "enabled",
    sourceSystem: item.sourceSystem ?? item.source_system ?? "",
    effectiveFrom: item.effectiveFrom ?? item.effective_from ?? "",
    effectiveTo: item.effectiveTo ?? item.effective_to ?? "",
    notes: item.notes ?? "",
    updatedAt: item.updatedAt ?? item.updated_at ?? "",
  };
}

function buildForm(item) {
  if (!item) {
    return { ...EMPTY_FORM };
  }

  return {
    id: item.id ?? "",
    blacklistCode: item.blacklistCode ?? "",
    blacklistName: item.blacklistName ?? "",
    subjectName: item.subjectName ?? "",
    subjectType: item.subjectType ?? "organization",
    matchKeywords: Array.isArray(item.matchKeywords) ? item.matchKeywords.join(", ") : item.matchKeywords ?? "",
    riskLevel: item.riskLevel ?? "high",
    status: item.status ?? "enabled",
    sourceSystem: item.sourceSystem ?? "",
    effectiveFrom: item.effectiveFrom ?? "",
    effectiveTo: item.effectiveTo ?? "",
    notes: item.notes ?? "",
  };
}

function serializeForm(form) {
  return {
    blacklistCode: form.blacklistCode.trim(),
    blacklistName: form.blacklistName.trim(),
    subjectName: form.subjectName.trim(),
    subjectType: form.subjectType,
    matchKeywords: form.matchKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    riskLevel: form.riskLevel,
    status: form.status,
    sourceSystem: form.sourceSystem.trim(),
    effectiveFrom: form.effectiveFrom || null,
    effectiveTo: form.effectiveTo || null,
    notes: form.notes.trim(),
  };
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

function toneForRisk(riskLevel) {
  if (riskLevel === "high") {
    return { background: "#fff1f0", color: "#c53b32" };
  }

  if (riskLevel === "medium") {
    return { background: "#fff7e7", color: "#bf7b17" };
  }

  return { background: "#eef5ff", color: "#2e5aa6" };
}

function toneForStatus(status) {
  if (status === "enabled") {
    return { background: "#edf8ef", color: "#2f7d47" };
  }

  return { background: "#f3f5f8", color: "#4b5563" };
}

function chipStyle(tone) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 8px",
    borderRadius: 999,
    background: tone.background,
    color: tone.color,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
}

function inputStyle() {
  return {
    border: "1px solid #cfdcec",
    borderRadius: 12,
    padding: "7px 10px",
    font: "inherit",
    fontSize: 13,
    color: "#111827",
    background: "#ffffff",
    width: "100%",
    boxSizing: "border-box",
  };
}

function cardSurfaceStyle() {
  return {
    background: "#ffffff",
    borderRadius: 16,
    border: "1px solid #d8e3ef",
    boxShadow: "0 8px 18px rgba(33, 56, 82, 0.05)",
  };
}

function smallLabelStyle() {
  return {
    fontSize: 11,
    color: "#5b6472",
    fontWeight: 700,
    marginBottom: 6,
  };
}

function ActionButton({ variant = "primary", children, type = "button", ...props }) {
  const style = {
    borderRadius: 12,
    padding: "9px 12px",
    font: "inherit",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    border: "1px solid transparent",
  };

  if (variant === "primary") {
    style.background = "#24427c";
    style.color = "white";
    style.borderColor = "#24427c";
  } else if (variant === "secondary") {
    style.background = "#edf3ff";
    style.color = "#24427c";
    style.borderColor = "#cddaf1";
  } else if (variant === "danger") {
    style.background = "#fff7f6";
    style.color = "#b42318";
    style.borderColor = "#f1d3d0";
  } else {
    style.background = "white";
    style.color = "#334155";
    style.borderColor = "#d0dceb";
  }

  return (
    <button type={type} {...props} style={style}>
      {children}
    </button>
  );
}

export function BlacklistConfigPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [selectedId, setSelectedId] = useState(items[0]?.id || "");
  const [draft, setDraft] = useState(buildForm(items[0]));
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const compact = useCompactLayout();

  async function loadBlacklistSnapshot() {
    const data = await requestJson(API_PATH);
    const nextItems = (Array.isArray(data) ? data : [])
      .map(normalizeBlacklistItem)
      .filter(Boolean);
    setItems(nextItems);
    setSelectedId(nextItems[0]?.id || "");
    setDraft(buildForm(nextItems[0] || null));
    setCreating(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadBlacklist() {
      setLoading(true);
      setErrorMessage("");
      try {
        const data = await requestJson(API_PATH);
        const nextItems = (Array.isArray(data) ? data : [])
          .map(normalizeBlacklistItem)
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
          setErrorMessage("名单数据加载失败，当前未显示演示兜底数据。");
          setLoading(false);
        }
      }
    }

    loadBlacklist();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      [item.blacklistName, item.subjectName, item.blacklistCode, item.sourceSystem]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesRisk = riskFilter === "all" || item.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const summary = {
    total: items.length,
    enabled: items.filter((item) => item.status === "enabled").length,
    highRisk: items.filter((item) => item.riskLevel === "high").length,
    keywords: items.reduce((count, item) => count + (item.matchKeywords?.length || 0), 0),
  };

  const selectedItem = items.find((item) => item.id === selectedId) || items[0] || null;

  function selectItem(item) {
    setErrorMessage("");
    setSelectedId(item.id);
    setDraft(buildForm(item));
    setCreating(false);
  }

  function openCreate() {
    setErrorMessage("");
    setSelectedId("");
    setDraft({ ...EMPTY_FORM });
    setCreating(true);
  }

  function cancelDraft() {
    setErrorMessage("");
    if (selectedItem) {
      setDraft(buildForm(selectedItem));
      setCreating(false);
      setSelectedId(selectedItem.id);
      return;
    }

    const first = items[0];
    if (first) {
      setDraft(buildForm(first));
      setSelectedId(first.id);
      setCreating(false);
    }
  }

  function updateDraft(field, value) {
    setErrorMessage("");
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function refreshBlacklist() {
    setApplying(true);
    setErrorMessage("");
    try {
      await applyTerrorRiskChanges();
      await loadBlacklistSnapshot();
    } catch (error) {
      const detail = error?.detail;
      if (detail?.message) {
        setErrorMessage(detail.message);
      } else {
        setErrorMessage("应用变更失败，黑名单未同步到风险单据。");
      }
    } finally {
      setApplying(false);
    }
  }

  async function saveDraft(event) {
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

      const normalized = normalizeBlacklistItem(saved);
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
      setErrorMessage("名单保存失败，数据库未更新，请稍后重试。");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(item) {
    const nextStatus = item.status === "enabled" ? "disabled" : "enabled";
    setErrorMessage("");

    try {
      const saved = await requestJson(`${API_PATH}/${item.id}`, {
        method: "PUT",
        body: serializeForm({
          ...buildForm(item),
          status: nextStatus,
        }),
      });

      const normalized = normalizeBlacklistItem(saved);
      setItems((current) =>
        current.map((row) => (row.id === item.id ? normalized : row)),
      );

      if (selectedId === item.id) {
        setDraft(buildForm(normalized));
      }
    } catch {
      setErrorMessage("名单状态更新失败，数据库未更新。");
    }
  }

  async function removeItem(item) {
    const confirmed = window.confirm(`确认删除黑名单项「${item.blacklistName}」？`);
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
      setErrorMessage("名单删除失败，数据库未更新。");
    }
  }

  return (
    <div style={{ padding: "0 0 8px" }}>
      <div style={pageActionRowStyle}>
        <div style={pageTitleInlineStyle}>
          <div style={pageNameStyle}>黑名单配置</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ActionButton variant="primary" onClick={openCreate}>新增名单项</ActionButton>
          <ActionButton variant="ghost" onClick={refreshBlacklist} disabled={applying}>
            {applying ? "应用中..." : "应用变更"}
          </ActionButton>
        </div>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 14 }}>
        {[
          { label: "名单总数", value: summary.total, tone: { accent: "#2e5aa6", color: "#1f4380" }, note: "已纳入当前专题识别范围" },
          { label: "启用项", value: summary.enabled, tone: { accent: "#2f7d47", color: "#2f7d47" }, note: `停用 ${Math.max(summary.total - summary.enabled, 0)} 项` },
          { label: "高风险项", value: summary.highRisk, tone: { accent: "#c53b32", color: "#c53b32" }, note: "命中后优先触发风险提示" },
          { label: "关键词条目", value: summary.keywords, tone: { accent: "#bf7b17", color: "#bf7b17" }, note: "支撑名称与主体模糊匹配" },
        ].map((metric) => (
          <div key={metric.label} style={summaryCardStyle(metric.tone.accent)}>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{metric.label}</div>
            <SummaryMetricValue value={metric.value} color={metric.tone.color} primaryFontSize={28} unitFontSize={12} />
            <div style={summaryMetricNoteStyle}>{metric.note}</div>
          </div>
        ))}
      </section>

      <section style={{ ...cardSurfaceStyle(), padding: 14, marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={smallLabelStyle()}>搜索</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="按名单名称、主体、编号或来源搜索"
              style={inputStyle()}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={smallLabelStyle()}>状态</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={inputStyle()}>
              <option value="all">全部</option>
              <option value="enabled">启用</option>
              <option value="disabled">停用</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={smallLabelStyle()}>风险等级</span>
            <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} style={inputStyle()}>
              <option value="all">全部</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </label>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0, 1fr)" : "minmax(0, 1.1fr) minmax(340px, 0.9fr)", gap: 14, alignItems: "start" }}>
        <div style={{ ...cardSurfaceStyle(), overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #eef2f7" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>名单列表</div>
            <div style={{ fontSize: 11, color: "#667085", marginTop: 3 }}>
              {loading ? "正在加载..." : `共 ${filteredItems.length} 条结果`}
            </div>
          </div>

          <div style={{ display: "grid", gap: 10, padding: 14, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
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
                    display: "flex",
                    flexDirection: "column",
                    border: `1px solid ${selected ? "#adc0e6" : "#dce5f0"}`,
                    borderRadius: 14,
                    padding: 14,
                    background: selected ? "#f7faff" : "#ffffff",
                    boxShadow: selected ? "inset 0 0 0 1px rgba(36,66,124,0.08)" : "none",
                    cursor: "pointer",
                    minHeight: 220,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", lineHeight: 1.35 }}>{item.blacklistName}</div>
                      <div style={{ marginTop: 4, fontSize: 11, color: "#667085" }}>
                        {item.blacklistCode} · {item.subjectName}
                      </div>
                    </div>
                    <span style={chipStyle(toneForRisk(item.riskLevel))}>{item.riskLevel === "high" ? "高" : item.riskLevel === "medium" ? "中" : "低"}</span>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: "#4b5563", lineHeight: 1.65 }}>
                    <div>关键词：{item.matchKeywords.join(" / ") || "-"}</div>
                    <div style={{ marginTop: 8 }}>备注：{item.notes || "-"}</div>
                    <div style={{ marginTop: 8 }}>更新时间：{item.updatedAt || "-"}</div>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto", paddingTop: 12 }}>
                    <span style={chipStyle(toneForStatus(item.status))}>{item.status === "enabled" ? "启用" : "停用"}</span>
                    <span style={chipStyle({ background: "#f3f4f6", color: "#374151" })}>{item.sourceSystem || "名单来源未填"}</span>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    <ActionButton variant="ghost" onClick={(event) => { event.stopPropagation(); selectItem(item); }}>编辑</ActionButton>
                    <ActionButton
                      variant="secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleStatus(item);
                      }}
                    >
                      {item.status === "enabled" ? "停用" : "启用"}
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeItem(item);
                      }}
                    >
                      删除
                    </ActionButton>
                  </div>
                </div>
              );
            })}

            {!filteredItems.length ? (
              <div style={{ padding: "24px 8px", textAlign: "center", color: "#8a93a3" }}>
                没有匹配的名单数据
              </div>
            ) : null}
          </div>
        </div>

        <form onSubmit={saveDraft} style={{ ...cardSurfaceStyle(), padding: 16, position: "sticky", top: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "#1a3a8f", fontWeight: 700 }}>
                {creating ? "新增名单项" : "当前名单项"}
              </div>
              <h3 style={{ margin: "4px 0 0", fontSize: 20, color: "#111827" }}>
                {draft.blacklistName || "请选择名单"}
              </h3>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <ActionButton variant="ghost" onClick={cancelDraft}>取消</ActionButton>
              <ActionButton variant="primary" type="submit">
                {saving ? "保存中..." : "保存变更"}
              </ActionButton>
            </div>
          </div>

          {errorMessage ? <div style={errorBannerStyle}>{errorMessage}</div> : null}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
            <Field label="名单编号">
              <input value={draft.blacklistCode} onChange={(event) => updateDraft("blacklistCode", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="名单名称">
              <input value={draft.blacklistName} onChange={(event) => updateDraft("blacklistName", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="主体名称">
              <input value={draft.subjectName} onChange={(event) => updateDraft("subjectName", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="主体类型">
              <select value={draft.subjectType} onChange={(event) => updateDraft("subjectType", event.target.value)} style={inputStyle()}>
                <option value="organization">组织机构</option>
                <option value="account">账户</option>
                <option value="person">个人</option>
              </select>
            </Field>
            <Field label="风险等级">
              <select value={draft.riskLevel} onChange={(event) => updateDraft("riskLevel", event.target.value)} style={inputStyle()}>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </Field>
            <Field label="状态">
              <select value={draft.status} onChange={(event) => updateDraft("status", event.target.value)} style={inputStyle()}>
                <option value="enabled">启用</option>
                <option value="disabled">停用</option>
              </select>
            </Field>
            <Field label="生效日期">
              <input type="date" value={draft.effectiveFrom} onChange={(event) => updateDraft("effectiveFrom", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="失效日期">
              <input type="date" value={draft.effectiveTo} onChange={(event) => updateDraft("effectiveTo", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="关键词" hint="多个关键词用英文逗号分隔。">
              <input value={draft.matchKeywords} onChange={(event) => updateDraft("matchKeywords", event.target.value)} style={inputStyle()} />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="名单来源">
                <input value={draft.sourceSystem} onChange={(event) => updateDraft("sourceSystem", event.target.value)} style={inputStyle()} />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="备注">
                <textarea value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} rows={4} style={{ ...inputStyle(), resize: "vertical" }} />
              </Field>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={smallLabelStyle()}>{label}</span>
      {children}
      {hint ? <span style={{ fontSize: 10, color: "#8a93a3", lineHeight: 1.5 }}>{hint}</span> : null}
    </label>
  );
}

function summaryCardStyle(accent) {
  return {
    ...cardSurfaceStyle(),
    minHeight: 112,
    padding: "14px 14px 12px",
    borderRadius: 14,
    borderLeft: `4px solid ${accent}`,
  };
}

const summaryMetricNoteStyle = {
  marginTop: 12,
  fontSize: 11,
  lineHeight: 1.6,
  color: "#7a8798",
};

const pageActionRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 16,
  flexWrap: "wrap",
};

const pageNameStyle = {
  fontSize: 16,
  color: "#173d75",
  fontWeight: 700,
  lineHeight: 1.2,
};

const pageTitleInlineStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const errorBannerStyle = {
  marginBottom: 16,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #f1d3d0",
  background: "#fff7f6",
  color: "#b42318",
  fontSize: 13,
  fontWeight: 700,
};
