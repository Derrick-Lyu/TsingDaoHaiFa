import { useEffect, useMemo, useState } from "react";

import { requestJson } from "../api/client";
import { applyTerrorRiskChanges } from "../api/terrorRisk";
import { TablePagination } from "../components/shared/TablePagination";
import { SummaryMetricValue } from "../components/shared/SummaryMetricValue";
import { buildRuleListView } from "../utils/ruleList";
import { filterVisibleRuleConfigRules } from "../utils/ruleConfigRules";

const API_PATH = "/terror-risk/rules";

function makeId(prefix) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeRule(rule) {
  if (!rule) {
    return null;
  }

  return {
    id: rule.id ?? makeId("rule"),
    ruleCode: rule.ruleCode ?? rule.rule_code ?? "",
    ruleName: rule.ruleName ?? rule.rule_name ?? "",
    ruleCategory: rule.ruleCategory ?? rule.rule_category ?? "terror_risk",
    ruleDescription: rule.ruleDescription ?? rule.rule_description ?? "",
    riskLevel: rule.riskLevel ?? rule.risk_level ?? "high",
    enabled:
      typeof (rule.enabled ?? rule.isEnabled ?? rule.is_enabled) === "boolean"
        ? rule.enabled ?? rule.isEnabled ?? rule.is_enabled
        : String(rule.enabled ?? rule.isEnabled ?? rule.is_enabled ?? "true") === "true",
    sortOrder: Number(rule.sortOrder ?? rule.sort_order ?? 0),
    params: (rule.params ?? rule.ruleParams ?? rule.parameters ?? []).map((param) => ({
      paramKey: param.paramKey ?? param.param_key ?? "",
      paramLabel: param.paramLabel ?? param.param_label ?? "",
      paramValue: String(param.paramValue ?? param.param_value ?? ""),
      valueType: param.valueType ?? param.value_type ?? "text",
      unit: param.unit ?? "",
      editable:
        typeof (param.editable ?? param.isEditable) === "boolean"
          ? param.editable ?? param.isEditable
          : String(param.editable ?? param.isEditable ?? "true") === "true",
    })),
  };
}

function buildRuleForm(rule) {
  if (!rule) {
    return {
      id: "",
      ruleCode: "",
      ruleName: "",
      ruleCategory: "terror_risk",
      ruleDescription: "",
      riskLevel: "high",
      enabled: true,
      sortOrder: 0,
      params: [],
    };
  }

  return {
    id: rule.id,
    ruleCode: rule.ruleCode,
    ruleName: rule.ruleName,
    ruleCategory: rule.ruleCategory,
    ruleDescription: rule.ruleDescription,
    riskLevel: rule.riskLevel,
    enabled: rule.enabled,
    sortOrder: rule.sortOrder,
    params: rule.params.map((param) => ({ ...param })),
  };
}

function serializeRule(form) {
  return {
    ruleCode: form.ruleCode.trim(),
    ruleName: form.ruleName.trim(),
    ruleCategory: form.ruleCategory,
    ruleDescription: form.ruleDescription.trim(),
    riskLevel: form.riskLevel,
    enabled: form.enabled,
    sortOrder: Number(form.sortOrder),
    params: form.params.map((param) => ({
      paramKey: param.paramKey,
      paramLabel: param.paramLabel,
      paramValue: String(param.paramValue),
      valueType: param.valueType,
      unit: param.unit,
      editable: param.editable,
    })),
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

function tone(riskLevel) {
  if (riskLevel === "high") {
    return { background: "#fff1f0", color: "#c53b32" };
  }
  if (riskLevel === "medium") {
    return { background: "#fff7e7", color: "#bf7b17" };
  }
  return { background: "#eef5ff", color: "#2e5aa6" };
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

function surfaceStyle() {
  return {
    background: "#ffffff",
    borderRadius: 16,
    border: "1px solid #d8e3ef",
    boxShadow: "0 8px 18px rgba(33, 56, 82, 0.05)",
  };
}

function chipStyle(color) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 8px",
    borderRadius: 999,
    background: color.background,
    color: color.color,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
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

function buttonStyle(variant = "ghost") {
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
  } else {
    style.background = "white";
    style.color = "#334155";
    style.borderColor = "#d0dceb";
  }

  return style;
}

export function RuleConfigPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [form, setForm] = useState(buildRuleForm(null));
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const compact = useCompactLayout();

  async function loadRulesSnapshot() {
    const data = await requestJson(API_PATH);
    const nextRules = filterVisibleRuleConfigRules(Array.isArray(data) ? data : []).map(normalizeRule).filter(Boolean);
    setRules(nextRules);
    const next = nextRules[0] || null;
    setSelectedRuleId(next?.id || "");
    setForm(buildRuleForm(next));
    setCurrentPage(1);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadRules() {
      setLoading(true);
      setErrorMessage("");
      try {
        const data = await requestJson(API_PATH);
        const nextRules = filterVisibleRuleConfigRules(Array.isArray(data) ? data : []).map(normalizeRule).filter(Boolean);
        if (!cancelled) {
          setRules(nextRules);
          const next = nextRules[0] || null;
          setSelectedRuleId(next?.id || "");
          setForm(buildRuleForm(next));
          setCurrentPage(1);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRules([]);
          setSelectedRuleId("");
          setForm(buildRuleForm(null));
          setCurrentPage(1);
          setErrorMessage("规则数据加载失败，当前未显示演示兜底数据。");
          setLoading(false);
        }
      }
    }

    loadRules();

    return () => {
      cancelled = true;
    };
  }, []);

  const listView = useMemo(
    () => buildRuleListView(rules, { currentPage, pageSize }),
    [rules, currentPage, pageSize],
  );

  const summary = {
    total: rules.length,
    enabled: rules.filter((rule) => rule.enabled).length,
    editableParams: rules.reduce((count, rule) => count + rule.params.filter((param) => param.editable).length, 0),
    highRisk: rules.filter((rule) => rule.riskLevel === "high").length,
  };

  function updateForm(field, value) {
    setErrorMessage("");
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateParam(paramKey, field, value) {
    setErrorMessage("");
    setForm((current) => ({
      ...current,
      params: current.params.map((param) =>
        param.paramKey === paramKey ? { ...param, [field]: value } : param,
      ),
    }));
  }

  function selectRule(rule) {
    setErrorMessage("");
    setSelectedRuleId(rule.id);
    setForm(buildRuleForm(rule));
  }

  async function refreshRules() {
    setApplying(true);
    setErrorMessage("");
    try {
      await applyTerrorRiskChanges();
      await loadRulesSnapshot();
    } catch (error) {
      const detail = error?.detail;
      if (detail?.message) {
        setErrorMessage(detail.message);
      } else {
        setErrorMessage("应用变更失败，规则未同步到风险单据。");
      }
    } finally {
      setApplying(false);
    }
  }

  async function saveRule(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const payload = serializeRule(form);
      const saved = await requestJson(`${API_PATH}/${form.id}`, {
        method: "PUT",
        body: payload,
      });

      const normalized = normalizeRule(saved);
      setRules((current) =>
        current.map((rule) => (rule.id === normalized.id ? normalized : rule)),
      );
      setSelectedRuleId(normalized.id);
      setForm(buildRuleForm(normalized));
      setCurrentPage(1);
    } catch {
      setErrorMessage("规则保存失败，数据库未更新，请稍后重试。");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRuleEnabled(rule) {
    const nextRule = { ...rule, enabled: !rule.enabled };
    setErrorMessage("");

    try {
      const saved = await requestJson(`${API_PATH}/${rule.id}`, {
        method: "PUT",
        body: serializeRule({
          ...buildRuleForm(rule),
          enabled: nextRule.enabled,
        }),
      });

      const normalized = normalizeRule(saved);
      setRules((current) =>
        current.map((item) => (item.id === normalized.id ? normalized : item)),
      );
      if (selectedRuleId === rule.id) {
        setForm(buildRuleForm(normalized));
      }
      setCurrentPage(1);
    } catch {
      setErrorMessage("规则状态更新失败，数据库未更新。");
    }
  }

  return (
    <div style={{ padding: "0 0 8px" }}>
      <div style={pageActionRowStyle}>
        <div style={pageTitleInlineStyle}>
          <div style={pageNameStyle}>规则配置</div>
        </div>
        <button type="button" onClick={refreshRules} disabled={applying} style={buttonStyle("ghost")}>
          {applying ? "应用中..." : "应用变更"}
        </button>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 14 }}>
        {[
          { label: "规则总数", value: summary.total, tone: { accent: "#2e5aa6", color: "#1f4380" }, note: "当前专题可配置识别规则" },
          { label: "启用规则", value: summary.enabled, tone: { accent: "#2f7d47", color: "#2f7d47" }, note: `停用 ${Math.max(summary.total - summary.enabled, 0)} 条` },
          { label: "可编辑参数", value: summary.editableParams, tone: { accent: "#bf7b17", color: "#bf7b17" }, note: "支持按专题口径动态调整" },
          { label: "高风险规则", value: summary.highRisk, tone: { accent: "#c53b32", color: "#c53b32" }, note: "优先影响风险识别结果" },
        ].map((metric) => (
          <div key={metric.label} style={summaryCardStyle(metric.tone.accent)}>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{metric.label}</div>
            <SummaryMetricValue value={metric.value} color={metric.tone.color} primaryFontSize={28} unitFontSize={12} />
            <div style={summaryMetricNoteStyle}>{metric.note}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0, 1fr)" : "minmax(0, 1fr) minmax(0, 1fr)", gap: 16, alignItems: compact ? "start" : "stretch" }}>
        <div style={{ ...surfaceStyle(), overflow: "hidden", display: "flex", flexDirection: "column", minHeight: compact ? "auto" : "100%" }}>
          <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #eef2f7" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>规则列表</div>
            <div style={{ fontSize: 11, color: "#667085", marginTop: 3 }}>
              {loading ? "正在加载..." : "点击规则进入编辑"}
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <div style={{ display: "grid", gap: 10, padding: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", minWidth: compact ? "auto" : 520 }}>
              {listView.visibleItems.map((rule) => {
                const selected = rule.id === selectedRuleId;
                return (
                  <div
                    key={rule.id}
                    onClick={() => selectRule(rule)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectRule(rule);
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
                    minHeight: 176,
                  }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", lineHeight: 1.35 }}>{rule.ruleName}</div>
                      <div style={{ fontSize: 11, color: "#667085", marginTop: 4 }}>用于当前专题识别</div>
                      </div>
                      <span style={chipStyle(tone(rule.riskLevel))}>{rule.riskLevel === "high" ? "高" : rule.riskLevel === "medium" ? "中" : "低"}</span>
                    </div>

                    <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.65, marginTop: 10 }}>
                      {rule.ruleDescription}
                    </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto", paddingTop: 12 }}>
                    <span style={chipStyle(rule.enabled ? { background: "#e8f5ef", color: "#0f7a3e" } : { background: "#f3f4f6", color: "#4b5563" })}>
                      {rule.enabled ? "启用中" : "已停用"}
                    </span>
                      <span style={chipStyle({ background: "#f3f4f6", color: "#374151" })}>{rule.params.length} 个参数</span>
                      <span style={chipStyle({ background: "#eef4ff", color: "#1a3a8f" })}>排序 {rule.sortOrder}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <TablePagination
            currentPage={listView.pagination.currentPage}
            pageSize={listView.pagination.pageSize}
            totalPages={listView.pagination.totalPages}
            totalItems={listView.pagination.totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>

        <form onSubmit={saveRule} style={{ ...surfaceStyle(), padding: 16, position: "sticky", top: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "#1a3a8f", fontWeight: 700 }}>当前规则</div>
              <h3 style={{ margin: "4px 0 0", fontSize: 20, color: "#111827" }}>{form.ruleName || "请选择规则"}</h3>
              <div style={{ marginTop: 6, fontSize: 11, color: "#667085" }}>当前调整会在重新识别后反映到专题结果</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => toggleRuleEnabled(form)} style={buttonStyle(form.enabled ? "secondary" : "primary")}>
                {form.enabled ? "停用规则" : "启用规则"}
              </button>
              <button type="submit" style={buttonStyle("primary")}>
                {saving ? "保存中..." : "保存变更"}
              </button>
            </div>
          </div>

          {errorMessage ? <div style={errorBannerStyle}>{errorMessage}</div> : null}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
            <Field label="规则名称">
              <input value={form.ruleName} onChange={(event) => updateForm("ruleName", event.target.value)} style={inputStyle()} />
            </Field>
            <Field label="风险等级">
              <select value={form.riskLevel} onChange={(event) => updateForm("riskLevel", event.target.value)} style={inputStyle()}>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </Field>
            <Field label="启用状态">
              <select value={form.enabled ? "true" : "false"} onChange={(event) => updateForm("enabled", event.target.value === "true")} style={inputStyle()}>
                <option value="true">启用</option>
                <option value="false">停用</option>
              </select>
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="规则描述">
                <textarea value={form.ruleDescription} onChange={(event) => updateForm("ruleDescription", event.target.value)} rows={4} style={{ ...inputStyle(), resize: "vertical" }} />
              </Field>
            </div>
          </div>

          <div style={{ background: "#f7f9fc", borderRadius: 16, border: "1px solid #dde6f0", padding: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937", marginBottom: 14 }}>规则参数</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {form.params.map((param) => (
                <Field key={param.paramKey} label={param.paramLabel} hint={param.unit ? `单位：${param.unit}` : "可编辑参数"}>
                  {param.valueType === "boolean" ? (
                    <select value={String(param.paramValue)} onChange={(event) => updateParam(param.paramKey, "paramValue", event.target.value)} style={inputStyle()}>
                      <option value="true">启用</option>
                      <option value="false">停用</option>
                    </select>
                  ) : (
                    <input type={param.valueType === "number" ? "number" : "text"} value={param.paramValue} onChange={(event) => updateParam(param.paramKey, "paramValue", event.target.value)} style={inputStyle()} />
                  )}
                </Field>
              ))}
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
    ...surfaceStyle(),
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
