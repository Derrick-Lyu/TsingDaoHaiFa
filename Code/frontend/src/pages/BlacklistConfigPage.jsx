import { useEffect, useState } from "react";

import { requestJson } from "../api/client";

const API_PATH = "/api/terror-risk/blacklist";

const FALLBACK_BLACKLIST = [
  {
    id: "blacklist-1",
    blacklistCode: "BL-001",
    blacklistName: "青岛西海岸某工程建设有限公司",
    subjectName: "青岛西海岸某工程建设有限公司",
    subjectType: "organization",
    matchKeywords: ["青岛西海岸某工程建设有限公司", "工程建设有限公司结算户"],
    riskLevel: "high",
    status: "enabled",
    sourceSystem: "海发风控名单来源",
    effectiveFrom: "2025-01-01",
    effectiveTo: "",
    notes: "与海发园区工程配套类支付链路同名命中。",
    createdAt: "2026-03-31 09:00:00",
    updatedAt: "2026-03-31 09:00:00",
  },
  {
    id: "blacklist-2",
    blacklistCode: "BL-002",
    blacklistName: "青岛某园区配套服务有限公司",
    subjectName: "青岛某园区配套服务有限公司",
    subjectType: "organization",
    matchKeywords: ["青岛某园区配套服务有限公司", "园区配套服务有限公司"],
    riskLevel: "high",
    status: "enabled",
    sourceSystem: "海发风控名单来源",
    effectiveFrom: "2025-01-01",
    effectiveTo: "",
    notes: "用于高频支付链路中的黑名单命中。",
    createdAt: "2026-03-31 09:00:00",
    updatedAt: "2026-03-31 09:00:00",
  },
  {
    id: "blacklist-3",
    blacklistCode: "BL-003",
    blacklistName: "青岛某影视文化配套服务有限公司",
    subjectName: "青岛某影视文化配套服务有限公司",
    subjectType: "organization",
    matchKeywords: ["青岛某影视文化配套服务有限公司", "影视文化配套服务有限公司"],
    riskLevel: "medium",
    status: "enabled",
    sourceSystem: "海发风控名单来源",
    effectiveFrom: "2025-01-01",
    effectiveTo: "",
    notes: "用于园区文化配套类交易命中。",
    createdAt: "2026-03-31 09:00:00",
    updatedAt: "2026-03-31 09:00:00",
  },
  {
    id: "blacklist-4",
    blacklistCode: "BL-004",
    blacklistName: "青岛某供应链结算服务有限公司",
    subjectName: "青岛某供应链结算服务有限公司",
    subjectType: "organization",
    matchKeywords: ["青岛某供应链结算服务有限公司", "供应链结算服务有限公司"],
    riskLevel: "medium",
    status: "enabled",
    sourceSystem: "海发风控名单来源",
    effectiveFrom: "2025-01-01",
    effectiveTo: "",
    notes: "用于资本管理与供应链支付链路命中。",
    createdAt: "2026-03-31 09:00:00",
    updatedAt: "2026-03-31 09:00:00",
  },
  {
    id: "blacklist-5",
    blacklistCode: "BL-005",
    blacklistName: "青岛某基金服务有限公司",
    subjectName: "青岛某基金服务有限公司",
    subjectType: "organization",
    matchKeywords: ["青岛某基金服务有限公司", "基金服务有限公司"],
    riskLevel: "medium",
    status: "enabled",
    sourceSystem: "海发风控名单来源",
    effectiveFrom: "2025-01-01",
    effectiveTo: "",
    notes: "用于资本运作场景中的名单匹配。",
    createdAt: "2026-03-31 09:00:00",
    updatedAt: "2026-03-31 09:00:00",
  },
];

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
    return { background: "#fdecec", color: "#c03838" };
  }

  if (riskLevel === "medium") {
    return { background: "#fff4e5", color: "#b45309" };
  }

  return { background: "#e8f1ff", color: "#1a3a8f" };
}

function toneForStatus(status) {
  if (status === "enabled") {
    return { background: "#e8f5ef", color: "#0f7a3e" };
  }

  return { background: "#f3f4f6", color: "#4b5563" };
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

function cardSurfaceStyle() {
  return {
    background: "white",
    borderRadius: 18,
    border: "1px solid #edf1f7",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
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

function ActionButton({ variant = "primary", children, type = "button", ...props }) {
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

  return (
    <button type={type} {...props} style={style}>
      {children}
    </button>
  );
}

export function BlacklistConfigPage() {
  const [items, setItems] = useState(FALLBACK_BLACKLIST.map(normalizeBlacklistItem).filter(Boolean));
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(items[0]?.id || "");
  const [draft, setDraft] = useState(buildForm(items[0]));
  const [creating, setCreating] = useState(false);
  const compact = useCompactLayout();

  useEffect(() => {
    let cancelled = false;

    async function loadBlacklist() {
      setLoading(true);
      const data = await requestJson(API_PATH, { fallback: FALLBACK_BLACKLIST });
      const nextItems = (Array.isArray(data) ? data : FALLBACK_BLACKLIST)
        .map(normalizeBlacklistItem)
        .filter(Boolean);

      if (!cancelled) {
        setItems(nextItems);
        setSelectedId(nextItems[0]?.id || "");
        setDraft(buildForm(nextItems[0] || null));
        setCreating(false);
        setLoading(false);
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
    setSelectedId(item.id);
    setDraft(buildForm(item));
    setCreating(false);
  }

  function openCreate() {
    setSelectedId("");
    setDraft({ ...EMPTY_FORM });
    setCreating(true);
  }

  function cancelDraft() {
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
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function refreshBlacklist() {
    setLoading(true);
    const data = await requestJson(API_PATH, { fallback: FALLBACK_BLACKLIST });
    const nextItems = (Array.isArray(data) ? data : FALLBACK_BLACKLIST)
      .map(normalizeBlacklistItem)
      .filter(Boolean);
    setItems(nextItems);
    setSelectedId(nextItems[0]?.id || "");
    setDraft(buildForm(nextItems[0] || null));
    setCreating(false);
    setLoading(false);
  }

  async function saveDraft(event) {
    event.preventDefault();
    setSaving(true);

    const payload = serializeForm(draft);
    const endpoint = draft.id ? `${API_PATH}/${draft.id}` : API_PATH;
    const method = draft.id ? "PUT" : "POST";
    const fallbackRecord = {
      ...payload,
      id: draft.id || makeId("blacklist"),
      createdAt: draft.id ? undefined : "2026-03-31 09:00:00",
      updatedAt: "2026-03-31 09:00:00",
    };

    const saved = await requestJson(endpoint, {
      method,
      body: payload,
      fallback: fallbackRecord,
    });

    const normalized = normalizeBlacklistItem(saved ?? fallbackRecord);
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
    setSaving(false);
  }

  async function toggleStatus(item) {
    const nextStatus = item.status === "enabled" ? "disabled" : "enabled";
    const updated = { ...item, status: nextStatus };

    const saved = await requestJson(`${API_PATH}/${item.id}`, {
      method: "PUT",
      body: serializeForm({
        ...buildForm(item),
        status: nextStatus,
      }),
      fallback: updated,
    });

    const normalized = normalizeBlacklistItem(saved ?? updated);
    setItems((current) =>
      current.map((row) => (row.id === item.id ? normalized : row)),
    );

    if (selectedId === item.id) {
      setDraft(buildForm(normalized));
    }
  }

  async function removeItem(item) {
    const confirmed = window.confirm(`确认删除黑名单项「${item.blacklistName}」？`);
    if (!confirmed) {
      return;
    }

    await requestJson(`${API_PATH}/${item.id}`, {
      method: "DELETE",
      fallback: null,
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
  }

  return (
    <div style={{ padding: "0 24px 24px", background: "linear-gradient(180deg, #f8fafc 0%, #f5f7fa 100%)" }}>
      <section style={{ ...cardSurfaceStyle(), padding: 22, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "#1a3a8f", fontWeight: 700 }}>名单维护</div>
            <h2 style={{ margin: "6px 0 10px", fontSize: 28, color: "#0f172a" }}>黑名单配置</h2>
            <div style={{ color: "#4f5a6a", lineHeight: 1.7, maxWidth: 760 }}>
              维护命中主体、关键词和启停状态，名单调整后可直接参与重新识别。
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ActionButton variant="primary" onClick={openCreate}>新增名单项</ActionButton>
            <ActionButton variant="ghost" onClick={refreshBlacklist}>刷新数据</ActionButton>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 16 }}>
        {[
          { label: "名单总数", value: summary.total, tone: { background: "#eef4ff", color: "#1a3a8f" } },
          { label: "启用项", value: summary.enabled, tone: { background: "#e8f5ef", color: "#0f7a3e" } },
          { label: "高风险项", value: summary.highRisk, tone: { background: "#fdecec", color: "#c03838" } },
          { label: "关键词条目", value: summary.keywords, tone: { background: "#fff4e5", color: "#b45309" } },
        ].map((metric) => (
          <div key={metric.label} style={{ ...cardSurfaceStyle(), padding: 16 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{metric.label}</div>
            <div style={chipStyle(metric.tone)}>{metric.value}</div>
          </div>
        ))}
      </section>

      <section style={{ ...cardSurfaceStyle(), padding: 18, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
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

      <section style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0, 1fr)" : "minmax(0, 1.1fr) minmax(360px, 0.9fr)", gap: 16, alignItems: "start" }}>
        <div style={{ ...cardSurfaceStyle(), overflow: "hidden" }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #eef2f7" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>名单列表</div>
            <div style={{ fontSize: 12, color: "#667085", marginTop: 4 }}>
              {loading ? "正在加载..." : `共 ${filteredItems.length} 条结果`}
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, padding: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
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
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", lineHeight: 1.35 }}>{item.blacklistName}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "#667085" }}>
                        {item.blacklistCode} · {item.subjectName}
                      </div>
                    </div>
                    <span style={chipStyle(toneForRisk(item.riskLevel))}>{item.riskLevel === "high" ? "高" : item.riskLevel === "medium" ? "中" : "低"}</span>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    <span style={chipStyle(toneForStatus(item.status))}>{item.status === "enabled" ? "启用" : "停用"}</span>
                    <span style={chipStyle({ background: "#f3f4f6", color: "#374151" })}>{item.sourceSystem || "名单来源未填"}</span>
                  </div>

                  <div style={{ marginTop: 12, fontSize: 13, color: "#4b5563", lineHeight: 1.7 }}>
                    <div>关键词：{item.matchKeywords.join(" / ") || "-"}</div>
                    <div style={{ marginTop: 8 }}>备注：{item.notes || "-"}</div>
                    <div style={{ marginTop: 8 }}>更新时间：{item.updatedAt || "-"}</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
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

        <form onSubmit={saveDraft} style={{ ...cardSurfaceStyle(), padding: 20, position: "sticky", top: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, color: "#1a3a8f", fontWeight: 700 }}>
                {creating ? "新增名单项" : "当前名单项"}
              </div>
              <h3 style={{ margin: "6px 0 0", fontSize: 24, color: "#111827" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
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
      {hint ? <span style={{ fontSize: 11, color: "#8a93a3", lineHeight: 1.5 }}>{hint}</span> : null}
    </label>
  );
}
