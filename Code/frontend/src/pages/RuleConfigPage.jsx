import { useEffect, useState } from "react";

import { requestJson } from "../api/client";
import { SummaryMetricValue } from "../components/shared/SummaryMetricValue";

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
    return { background: "#fdecec", color: "#c03838" };
  }
  if (riskLevel === "medium") {
    return { background: "#fff4e5", color: "#b45309" };
  }
  return { background: "#e8f1ff", color: "#1a3a8f" };
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

function chipStyle(color) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    background: color.background,
    color: color.color,
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
  } else {
    style.background = "white";
    style.color = "#334155";
    style.borderColor = "#d8e1ee";
  }

  return style;
}

export function RuleConfigPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [form, setForm] = useState(buildRuleForm(null));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const compact = useCompactLayout();

  useEffect(() => {
    let cancelled = false;

    async function loadRules() {
      setLoading(true);
      setErrorMessage("");
      try {
        const data = await requestJson(API_PATH);
        const nextRules = (Array.isArray(data) ? data : []).map(normalizeRule).filter(Boolean);

        if (!cancelled) {
          setRules(nextRules);
          const next = nextRules[0] || null;
          setSelectedRuleId(next?.id || "");
          setForm(buildRuleForm(next));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRules([]);
          setSelectedRuleId("");
          setForm(buildRuleForm(null));
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
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await requestJson(API_PATH);
      const nextRules = (Array.isArray(data) ? data : []).map(normalizeRule).filter(Boolean);
      setRules(nextRules);
      const next = nextRules[0] || null;
      setSelectedRuleId(next?.id || "");
      setForm(buildRuleForm(next));
    } catch {
      setRules([]);
      setSelectedRuleId("");
      setForm(buildRuleForm(null));
      setErrorMessage("规则数据刷新失败，当前未显示演示兜底数据。");
    } finally {
      setLoading(false);
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
    } catch {
      setErrorMessage("规则状态更新失败，数据库未更新。");
    }
  }

  return (
    <div style={{ padding: "0 24px 24px", background: "linear-gradient(180deg, #f8fafc 0%, #f5f7fa 100%)" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <button type="button" onClick={refreshRules} style={buttonStyle("ghost")}>刷新数据</button>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 16 }}>
        {[
          { label: "规则总数", value: summary.total, tone: { background: "#eef4ff", color: "#1a3a8f" } },
          { label: "启用规则", value: summary.enabled, tone: { background: "#e8f5ef", color: "#0f7a3e" } },
          { label: "可编辑参数", value: summary.editableParams, tone: { background: "#fff4e5", color: "#b45309" } },
          { label: "高风险规则", value: summary.highRisk, tone: { background: "#fdecec", color: "#c03838" } },
        ].map((metric) => (
          <div key={metric.label} style={{ ...surfaceStyle(), padding: 16 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{metric.label}</div>
            <div style={summaryMetricValueStyle(metric.tone)}>
              <SummaryMetricValue value={metric.value} color={metric.tone.color} primaryFontSize={30} unitFontSize={13} />
            </div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0, 1fr)" : "minmax(0, 1.05fr) minmax(360px, 0.95fr)", gap: 16, alignItems: "start" }}>
        <div style={{ ...surfaceStyle(), overflow: "hidden" }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #eef2f7" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>规则列表</div>
            <div style={{ fontSize: 12, color: "#667085", marginTop: 4 }}>
              {loading ? "正在加载..." : "点击规则进入编辑"}
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, padding: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {rules.map((rule) => {
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
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", lineHeight: 1.35 }}>{rule.ruleName}</div>
                    <div style={{ fontSize: 12, color: "#667085", marginTop: 6 }}>用于当前专题识别</div>
                    </div>
                    <span style={chipStyle(tone(rule.riskLevel))}>{rule.riskLevel === "high" ? "高" : rule.riskLevel === "medium" ? "中" : "低"}</span>
                  </div>

                  <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.7, marginTop: 12 }}>
                    {rule.ruleDescription}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
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

        <form onSubmit={saveRule} style={{ ...surfaceStyle(), padding: 20, position: "sticky", top: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, color: "#1a3a8f", fontWeight: 700 }}>当前规则</div>
              <h3 style={{ margin: "6px 0 0", fontSize: 24, color: "#111827" }}>{form.ruleName || "请选择规则"}</h3>
              <div style={{ marginTop: 8, fontSize: 12, color: "#667085" }}>当前调整会在重新识别后反映到专题结果</div>
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

          <div style={{ background: "#f8fafc", borderRadius: 16, border: "1px solid #e9eef5", padding: 18 }}>
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
      {hint ? <span style={{ fontSize: 11, color: "#8a93a3", lineHeight: 1.5 }}>{hint}</span> : null}
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
